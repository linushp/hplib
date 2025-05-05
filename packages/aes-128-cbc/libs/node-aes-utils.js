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
function arrayBufferToBase64(arrayBuffer) {
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}
class Aes128CBC {
  constructor(keyHexStr, ivStr) {
    this._key = hex2Uint8Array(keyHexStr || 'fc3cef4b7676028bc201cdc3e80e0f5f');
    this._iv = hex2Uint8Array(ivStr || 'aa4981fa858f0a51b45c410d623222a4');
  }
  encrypt(arrayBuffer) {
    const buffer = Buffer.from(arrayBuffer);
    const cipher = crypto.createCipheriv('aes-128-cbc', this._key, this._iv);
    let encrypted = Buffer.alloc(0);
    const chunkSize = 1024;
    for (let i = 0; i < buffer.length; i += chunkSize) {
      const chunk = buffer.slice(i, i + chunkSize);
      encrypted = Buffer.concat([encrypted, cipher.update(chunk)]);
    }
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted;
  }
  decrypt(encryptedDataArrayBuffer) {
    const decipher = crypto.createDecipheriv('aes-128-cbc', this._key, this._iv);
    const encryptedData = Buffer.from(encryptedDataArrayBuffer);
    let decrypted = Buffer.alloc(0);
    const chunkSize = 1024;
    for (let i = 0; i < encryptedData.length; i += chunkSize) {
      const chunk = encryptedData.slice(i, i + chunkSize);
      decrypted = Buffer.concat([decrypted, decipher.update(chunk)]);
    }
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted;
  }
  encrypt_utf8_base64(utf8Str) {
    const inputBuffer = Buffer.from(utf8Str, 'utf8');
    const outputBuffer = this.encrypt(inputBuffer);
    return arrayBufferToBase64(outputBuffer);
  }
  decrypt_base64_utf8(base64) {
    const inputBuffer = Buffer.from(base64, 'base64');
    const outputBuffer0 = this.decrypt(inputBuffer);
    const outputBuffer = new Uint8Array(outputBuffer0);
    return new TextDecoder().decode(outputBuffer);
  }
  time_encrypt_utf8_base64(utf8Str) {
    const c = Math.floor(Math.random() * 1000);
    const t = Math.floor(Math.random() * 1000);
    const json = JSON.stringify({ t, s: utf8Str, c });
    return this.encrypt_utf8_base64(json);
  }
  time_decrypt_base64_utf8(base64) {
    const json = this.decrypt_base64_utf8(base64);
    const obj = JSON.parse(json);
    if (!obj.s) {
      throw new Error('time_decrypt_base64_utf8解析失败');
    }
    return obj.s;
  }
}

module.exports = {
  Aes128CBC: Aes128CBC
};
