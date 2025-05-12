declare class EventEmitter {
    private events;
    on(event: string, listener: Function): void;
    off(event: string, listener: Function): void;
    emit(event: string, ...args: any[]): void;
}
declare class Observable {
    private readonly eventName;
    private observableBus;
    constructor();
    next: (obj: any) => void;
    error: (e: any) => void;
    subscribe: (fn: Function) => void;
    unsubscribe: (fn: Function) => void;
}
declare class ObservableApiStorage extends EventEmitter {
    requestCount: number;
    responseCount: number;
}
interface Config {
    keepMs?: number;
    delayMs?: number;
    nameAsCacheKey?: boolean;
    localforage?: any;
}
interface Service {
    [key: string]: (...args: any[]) => Promise<any>;
}
type ToCacheKey = (fnName: string, itemCfg: Config, args: any[]) => string | Promise<string>;
type IUseObservableServiceFunc = (fnName: string, params: any, callbackFn: any, isNeedRequest?: boolean) => void;
interface ApiCacheReturn {
    createObservableApi: (service: Service, cfg0: Config | undefined, toCacheKey: ToCacheKey) => Record<string, (...args: any[]) => Observable>;
    createCachedApi: (service: Service, cfg0: Config | undefined, toCacheKey: ToCacheKey) => Service;
    createOnePromiseApi: (service: Service, cfg0: Config | undefined, toCacheKey: ToCacheKey) => Service;
    createObservableHook: (observableService: any, React: any) => IUseObservableServiceFunc;
    OBSERVABLE_API_STORAGE: ObservableApiStorage;
}
declare function makeApiCache(cacheName?: string, defaultConfig?: Config): ApiCacheReturn;
export default makeApiCache;
