class EventEmitter {
    private events: Record<string, Function[]> = {};

    on(event: string, listener: Function): void {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    off(event: string, listener: Function): void {
        if (!this.events[event]) return;

        this.events[event] = this.events[event].filter(l => l !== listener);
    }

    emit(event: string, ...args: any[]): void {
        if (!this.events[event]) return;

        this.events[event].forEach(listener => listener(...args));
    }
}

class Observable {
    private readonly eventName: string;
    private observableBus: EventEmitter;

    constructor() {
        this.eventName = `EE_Observable`;
        this.observableBus = new EventEmitter();
    }

    next = (obj: any): void => {
        try {
            this.observableBus.emit(this.eventName, obj);
        } catch (e) {
            console.error('Observable next', e);
        }
    }

    error = (e: any): void => {
        try {
            this.observableBus.emit(this.eventName, { error: e });
        } catch (e2) {
            console.error('Observable error', e2);
        }
    }

    subscribe = (fn: Function): void => {
        this.observableBus.on(this.eventName, fn);
    }

    unsubscribe = (fn: Function): void => {
        this.observableBus.off(this.eventName, fn);
    }
}

class ObservableApiStorage extends EventEmitter {
    public requestCount: number = 0;
    public responseCount: number = 0;
}

interface Config {
    keepMs?: number;
    delayMs?: number;
    nameAsCacheKey?: boolean;
    localforage?: any; // // import * as localforage from 'localforage';
}

interface Service {
    [key: string]: (...args: any[]) => Promise<any>;
}

type ToCacheKey = (fnName: string, itemCfg: Config, args: any[]) => string | Promise<string>;
type IUseObservableServiceFunc = (fnName:string, params:any, callbackFn: any, isNeedRequest?: boolean) => void;

interface ApiCacheReturn {
    createObservableApi: (service: Service, cfg0: Config | undefined, toCacheKey: ToCacheKey) => Record<string, (...args: any[]) => Observable>;
    createCachedApi: (service: Service, cfg0: Config | undefined, toCacheKey: ToCacheKey) => Service;
    createOnePromiseApi: (service: Service, cfg0: Config | undefined, toCacheKey: ToCacheKey) => Service;
    createObservableHook: (observableService: any, React: any) => IUseObservableServiceFunc;
    OBSERVABLE_API_STORAGE: ObservableApiStorage;
}


function makeApiCache(cacheName: string = 'make-api-cache', defaultConfig?: Config): ApiCacheReturn {
    const localforage = defaultConfig?.localforage;
    if (!localforage) {
        throw new Error("参数localforage不能为空")
    }
    const localforageInstance: any = localforage.createInstance({
        name: cacheName
    });

    const DEFAULT_DELAY_MS = 1000 * 10;
    const DEFAULT_KEEP_MS = 1000 * 60 * 60;

    const DEFAULT_CONFIG: Config = {
        keepMs: DEFAULT_KEEP_MS,
        delayMs: DEFAULT_DELAY_MS,
        nameAsCacheKey: false,
    };

    if (defaultConfig) {
        Object.assign(DEFAULT_CONFIG, defaultConfig);
    }

    const REQUEST_CACHE_MAP: Record<string, Promise<any> | null> = {};

    function sendRequestCache(fn: Function, args: any[], cacheKey: string): Promise<any> {
        if (REQUEST_CACHE_MAP[cacheKey]) {
            return REQUEST_CACHE_MAP[cacheKey]!;
        }
        REQUEST_CACHE_MAP[cacheKey] = new Promise((resolve, reject) => {
            fn(...args).then((res: any) => {
                REQUEST_CACHE_MAP[cacheKey] = null;
                resolve(res);
            }, (e: any) => {
                REQUEST_CACHE_MAP[cacheKey] = null;
                reject(e);
            });
        });
        return REQUEST_CACHE_MAP[cacheKey]!;
    }


    function createOnePromiseApiItem(fn: Function,
                                     fnName: string,
                                     itemCfg: Config,
                                     toCacheKey: ToCacheKey) {
        return async (...args: any[]): Promise<any> => {
            const cacheKey = await toCacheKey(fnName, itemCfg, args);
            return sendRequestCache(fn, args, cacheKey);
        }
    }


    function createCachedApiItem(
        fn: Function,
        fnName: string,
        itemCfg: Config,
        toCacheKey: ToCacheKey
    ) {
        return async (...args: any[]): Promise<any> => {
            const delayMs = itemCfg.delayMs || DEFAULT_DELAY_MS;
            const { keepMs } = itemCfg;

            if (!keepMs) {
                return fn(...args);
            }

            const cacheKey =  await toCacheKey(fnName, itemCfg, args);

            let cacheObject = await localforageInstance.getItem(cacheKey);

            const sendRequest = async (): Promise<any> => {
                try {
                    const res = await sendRequestCache(fn, args, cacheKey);
                    if (res && res.success) {
                        cacheObject = { time: Date.now(), res };
                        await localforageInstance.setItem(cacheKey, cacheObject);
                    }
                    return Promise.resolve(res);
                } catch (e) {
                    return Promise.reject(e);
                }
            };

            if (cacheObject && cacheObject.time && (cacheObject.time + keepMs > Date.now())) {
                setTimeout(() => {
                    sendRequest();
                }, delayMs);

                return Promise.resolve(cacheObject.res);
            }

            return sendRequest();
        };
    }



    const OBSERVABLE_API_STORAGE = new ObservableApiStorage();

    const createObservableApiItem = (
        fn: Function,
        fnName: string,
        itemCfg: Config,
        toCacheKey: ToCacheKey
    ) => {
        return (...args: any[]): Observable => {

            const newObservable = new Observable();

            (async () => {
                const cacheKey = await toCacheKey(fnName, itemCfg, args);

                const delayMs = itemCfg.delayMs || DEFAULT_DELAY_MS;
                const { keepMs } = itemCfg;

                let cacheObject = await localforageInstance.getItem(cacheKey);

                const sendRequest = async (): Promise<void> => {
                    try {
                        const res = await sendRequestCache(fn, args, cacheKey);

                        if (keepMs && res && res.success) {
                            cacheObject = { time: Date.now(), res };
                            await localforageInstance.setItem(cacheKey, cacheObject);
                        }
                        newObservable.next(res);
                    } catch (e) {
                        newObservable.error(e);
                    }

                    OBSERVABLE_API_STORAGE.responseCount++;
                    OBSERVABLE_API_STORAGE.emit('onChange', OBSERVABLE_API_STORAGE);
                };

                OBSERVABLE_API_STORAGE.requestCount++;
                OBSERVABLE_API_STORAGE.emit('onChange', OBSERVABLE_API_STORAGE);

                if (keepMs && cacheObject && cacheObject.time && (cacheObject.time + keepMs > Date.now())) {
                    newObservable.next(cacheObject.res);
                    setTimeout(() => {
                        sendRequest();
                    }, delayMs);
                } else {
                    sendRequest();
                }
            })();

            return newObservable;
        }
    }

    function toItemCfg(cfg0: Config | any, fnName: string): Config {
        if (!cfg0 || !cfg0[fnName]) {
            return { ...DEFAULT_CONFIG };
        }
        return Object.assign({ ...DEFAULT_CONFIG }, cfg0[fnName]);
    }

    const createCachedApi = (service: Service, cfg0: Config | undefined, toCacheKey: ToCacheKey) => {
        const cachedService: Service = {};
        const fnNames = Object.keys(service);
        for (let i = 0; i < fnNames.length; i++) {
            const fnName = fnNames[i];
            const fn = service[fnName];
            const itemCfg = toItemCfg(cfg0, fnName);
            cachedService[fnName] = createCachedApiItem(fn, fnName, itemCfg, toCacheKey);
        }
        return cachedService;
    }

    const createObservableApi = (service: Service, cfg0: Config | undefined, toCacheKey: ToCacheKey) => {
        const ntfService: Record<string, (...args: any[]) => Observable> = {};
        const fnNames = Object.keys(service);
        for (let i = 0; i < fnNames.length; i++) {
            const fnName = fnNames[i];
            const fn = service[fnName];
            const itemCfg = toItemCfg(cfg0, fnName);
            ntfService[fnName] = createObservableApiItem(fn, fnName, itemCfg, toCacheKey);
        }
        return ntfService;
    }

    const createOnePromiseApi = (service: Service, cfg0: Config | undefined, toCacheKey: ToCacheKey) => {
        const cachedService: Service = {};
        const fnNames = Object.keys(service);
        for (let i = 0; i < fnNames.length; i++) {
            const fnName = fnNames[i];
            const fn = service[fnName];
            const itemCfg = toItemCfg(cfg0, fnName);
            cachedService[fnName] = createOnePromiseApiItem(fn, fnName, itemCfg, toCacheKey);
        }
        return cachedService;
    }


    /**
     * 创建一个React Hook，但它本身不依赖React
     * @param observableService
     * @param useRef
     * @param useEffect
     */
    function createObservableHook(observableService: any, { useRef, useEffect }: any): IUseObservableServiceFunc {
        return function useObservableService(fnName: string, params: any, callbackFn: any, isNeedRequest?: boolean) {
            // 参数不会变
            const argsRef = useRef({fnName, params, callbackFn})
            argsRef.current = {fnName, params, callbackFn}

            useEffect(() => {


                // 特殊情况下，可以强制不需要请求。避免hook非要执行的情况
                if (isNeedRequest === false) {
                    return;
                }

                const argsObj = argsRef.current
                const observable = observableService[argsObj.fnName](argsObj.params)
                const callback = (res: any) => {
                    try {
                        argsObj.callbackFn(res)
                    } catch (e) {
                        console.error('useObservableService', argsObj.fnName, e)
                    }
                }
                observable.subscribe(callback)
                return () => {
                    observable.unsubscribe(callback)
                }
            }, [isNeedRequest])
        }
    }


    return {
        createObservableHook,
        createObservableApi,
        createCachedApi,
        createOnePromiseApi,
        OBSERVABLE_API_STORAGE
    };
}

export default makeApiCache;
