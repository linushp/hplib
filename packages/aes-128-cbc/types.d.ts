
export declare class Aes128CBC {
  public constructor(keyHexStr?: string, ivStr?: string);

  public encrypt(data: ArrayBuffer): Promise<ArrayBuffer>;
  public decrypt(data: ArrayBuffer): Promise<ArrayBuffer>;

  public encrypt_utf8_base64(data: string): Promise<string>;
  public decrypt_base64_utf8(data: string): Promise<string>;

  public time_encrypt_utf8_base64(data: string): Promise<string>;
  public time_decrypt_base64_utf8(data: string): Promise<string>;

}
