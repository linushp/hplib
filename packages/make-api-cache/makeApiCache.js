class EventEmitter {
    constructor() {
        this.events = {};
    }
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }
    off(event, listener) {
        if (!this.events[event])
            return;
        this.events[event] = this.events[event].filter(l => l !== listener);
    }
    emit(event, ...args) {
        if (!this.events[event])
            return;
        this.events[event].forEach(listener => listener(...args));
    }
}
class Observable {
    constructor() {
        this.next = (obj) => {
            try {
                this.observableBus.emit(this.eventName, obj);
            }
            catch (e) {
                console.error('Observable next', e);
            }
        };
        this.error = (e) => {
            try {
                this.observableBus.emit(this.eventName, { error: e });
            }
            catch (e2) {
                console.error('Observable error', e2);
            }
        };
        this.subscribe = (fn) => {
            this.observableBus.on(this.eventName, fn);
        };
        this.unsubscribe = (fn) => {
            this.observableBus.off(this.eventName, fn);
        };
        this.eventName = `EE_Observable`;
        this.observableBus = new EventEmitter();
    }
}
class ObservableApiStorage extends EventEmitter {
    constructor() {
        super(...arguments);
        this.requestCount = 0;
        this.responseCount = 0;
    }
}
function makeApiCache(cacheName = 'make-api-cache', defaultConfig) {
    const localforage = defaultConfig === null || defaultConfig === void 0 ? void 0 : defaultConfig.localforage;
    if (!localforage) {
        throw new Error("参数localforage不能为空");
    }
    const localforageInstance = localforage.createInstance({
        name: cacheName
    });
    const DEFAULT_DELAY_MS = 1000 * 10;
    const DEFAULT_KEEP_MS = 1000 * 60 * 60;
    const DEFAULT_CONFIG = {
        keepMs: DEFAULT_KEEP_MS,
        delayMs: DEFAULT_DELAY_MS,
        nameAsCacheKey: false,
    };
    if (defaultConfig) {
        Object.assign(DEFAULT_CONFIG, defaultConfig);
    }
    const REQUEST_CACHE_MAP = {};
    function sendRequestCache(fn, args, cacheKey) {
        if (REQUEST_CACHE_MAP[cacheKey]) {
            return REQUEST_CACHE_MAP[cacheKey];
        }
        REQUEST_CACHE_MAP[cacheKey] = new Promise((resolve, reject) => {
            fn(...args).then((res) => {
                REQUEST_CACHE_MAP[cacheKey] = null;
                resolve(res);
            }, (e) => {
                REQUEST_CACHE_MAP[cacheKey] = null;
                reject(e);
            });
        });
        return REQUEST_CACHE_MAP[cacheKey];
    }
    function createOnePromiseApiItem(fn, fnName, itemCfg, toCacheKey) {
        return async (...args) => {
            const cacheKey = await toCacheKey(fnName, itemCfg, args);
            return sendRequestCache(fn, args, cacheKey);
        };
    }
    function createCachedApiItem(fn, fnName, itemCfg, toCacheKey) {
        return async (...args) => {
            const delayMs = itemCfg.delayMs || DEFAULT_DELAY_MS;
            const { keepMs } = itemCfg;
            if (!keepMs) {
                return fn(...args);
            }
            const cacheKey = await toCacheKey(fnName, itemCfg, args);
            let cacheObject = await localforageInstance.getItem(cacheKey);
            const sendRequest = async () => {
                try {
                    const res = await sendRequestCache(fn, args, cacheKey);
                    if (res && res.success) {
                        cacheObject = { time: Date.now(), res };
                        await localforageInstance.setItem(cacheKey, cacheObject);
                    }
                    return Promise.resolve(res);
                }
                catch (e) {
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
    const createObservableApiItem = (fn, fnName, itemCfg, toCacheKey) => {
        return (...args) => {
            const newObservable = new Observable();
            (async () => {
                const cacheKey = await toCacheKey(fnName, itemCfg, args);
                const delayMs = itemCfg.delayMs || DEFAULT_DELAY_MS;
                const { keepMs } = itemCfg;
                let cacheObject = await localforageInstance.getItem(cacheKey);
                const sendRequest = async () => {
                    try {
                        const res = await sendRequestCache(fn, args, cacheKey);
                        if (keepMs && res && res.success) {
                            cacheObject = { time: Date.now(), res };
                            await localforageInstance.setItem(cacheKey, cacheObject);
                        }
                        newObservable.next(res);
                    }
                    catch (e) {
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
                }
                else {
                    sendRequest();
                }
            })();
            return newObservable;
        };
    };
    function toItemCfg(cfg0, fnName) {
        if (!cfg0 || !cfg0[fnName]) {
            return { ...DEFAULT_CONFIG };
        }
        return Object.assign({ ...DEFAULT_CONFIG }, cfg0[fnName]);
    }
    const createCachedApi = (service, cfg0, toCacheKey) => {
        const cachedService = {};
        const fnNames = Object.keys(service);
        for (let i = 0; i < fnNames.length; i++) {
            const fnName = fnNames[i];
            const fn = service[fnName];
            const itemCfg = toItemCfg(cfg0, fnName);
            cachedService[fnName] = createCachedApiItem(fn, fnName, itemCfg, toCacheKey);
        }
        return cachedService;
    };
    const createObservableApi = (service, cfg0, toCacheKey) => {
        const ntfService = {};
        const fnNames = Object.keys(service);
        for (let i = 0; i < fnNames.length; i++) {
            const fnName = fnNames[i];
            const fn = service[fnName];
            const itemCfg = toItemCfg(cfg0, fnName);
            ntfService[fnName] = createObservableApiItem(fn, fnName, itemCfg, toCacheKey);
        }
        return ntfService;
    };
    const createOnePromiseApi = (service, cfg0, toCacheKey) => {
        const cachedService = {};
        const fnNames = Object.keys(service);
        for (let i = 0; i < fnNames.length; i++) {
            const fnName = fnNames[i];
            const fn = service[fnName];
            const itemCfg = toItemCfg(cfg0, fnName);
            cachedService[fnName] = createOnePromiseApiItem(fn, fnName, itemCfg, toCacheKey);
        }
        return cachedService;
    };
    /**
     * 创建一个React Hook，但它本身不依赖React
     * @param observableService
     * @param useRef
     * @param useEffect
     */
    function createObservableHook(observableService, { useRef, useEffect }) {
        return function useObservableService(fnName, params, callbackFn, isNeedRequest) {
            // 参数不会变
            const argsRef = useRef({ fnName, params, callbackFn });
            argsRef.current = { fnName, params, callbackFn };
            useEffect(() => {
                // 特殊情况下，可以强制不需要请求。避免hook非要执行的情况
                if (isNeedRequest === false) {
                    return;
                }
                const argsObj = argsRef.current;
                const observable = observableService[argsObj.fnName](argsObj.params);
                const callback = (res) => {
                    try {
                        argsObj.callbackFn(res);
                    }
                    catch (e) {
                        console.error('useObservableService', argsObj.fnName, e);
                    }
                };
                observable.subscribe(callback);
                return () => {
                    observable.unsubscribe(callback);
                };
            }, [isNeedRequest]);
        };
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
