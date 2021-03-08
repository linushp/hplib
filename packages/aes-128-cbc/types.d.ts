export type ArrayBufferType = ArrayBuffer | Buffer;

export declare class Aes128CBC {
  public constructor(keyHexStr: string, ivStr: string);

  public encrypt(data: ArrayBufferType): Promise<ArrayBufferType>;

  public decrypt(data: ArrayBufferType): Promise<ArrayBufferType>;
}
