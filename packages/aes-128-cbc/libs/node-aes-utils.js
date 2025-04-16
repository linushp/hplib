var crypto = require("crypto");

function hex2Uint8Array(hexStr) {
  const arr = new Uint8Array(Math.floor(hexStr.length / 2));
  let arrIndex = 0;
  for (let i = 0; i < hexStr.length; i = i + 2) {
    const a = hexStr[i];
    const b = hexStr[i + 1] || 0;
    arr[arrIndex] = parseInt(a + b, 16);
    arrIndex++;
  }
  return arr;
}

class Aes128CBC {
  constructor(keyHexStr, ivStr) {
    this._key = hex2Uint8Array(keyHexStr || "e3f9d86f1c2e834ef5bd7f25f51da093");
    this._iv = hex2Uint8Array(ivStr || "808ce75f6ea37c071fe8075887717594");
  }


  
  encrypt(data: Buffer): Buffer {
    const cipher = crypto.createCipheriv("aes-128-cbc", this._key, this._iv);
    let encrypted = Buffer.alloc(0);
    const chunkSize = 1024;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      encrypted = Buffer.concat([encrypted, cipher.update(chunk)]);
    }
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted;
  }

  decrypt(encryptedData: Buffer): Buffer {
    const decipher = crypto.createDecipheriv("aes-128-cbc", this._key, this._iv);

    let decrypted = Buffer.alloc(0);
    const chunkSize = 1024;
    for (let i = 0; i < encryptedData.length; i += chunkSize) {
      const chunk = encryptedData.slice(i, i + chunkSize);
      decrypted = Buffer.concat([decrypted, decipher.update(chunk)]);
    }
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted;
  }

  encrypt_utf8_base64(utf8Str: string): string {
    const inputBuffer = Buffer.from(utf8Str, 'utf8');
    const outputBuffer = this.encrypt(inputBuffer);
    return outputBuffer.toString('base64');
  }

  decrypt_base64_utf8(base64: string): string {
    const inputBuffer = Buffer.from(base64, 'base64');
    const outputBuffer = this.decrypt(inputBuffer);
    return outputBuffer.toString('utf8');
  }

  
}

module.exports = {
  Aes128CBC: Aes128CBC
};
