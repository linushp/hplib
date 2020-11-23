export interface DebouncedFuncs {
    flush(): void;

    cancel(): void;

    clear(): void;
}

export declare function debounce(
    func: Function,
    wait?: number,
    immediate?: boolean
): Function & DebouncedFuncs;