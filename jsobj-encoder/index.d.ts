declare namespace jsobjEncoder {
    function encodeObject(obj: string | object): string

    function decodeObject(str: string): object | string
}


export declare function encodeObject(obj: string | object): string

export declare function decodeObject(str: string): object | string

export default jsobjEncoder;