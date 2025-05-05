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

function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

class Aes128CBC {
  constructor(keyHexStr, ivStr) {
    this._key = hex2Uint8Array(keyHexStr || 'fc3cef4b7676028bc201cdc3e80e0f5f');
    this._iv = hex2Uint8Array(ivStr || 'aa4981fa858f0a51b45c410d623222a4');
    this._algorithm = { name: 'AES-CBC', iv: this._iv };
  }

  async importKey() {
    if (!this._importKey_) {
      this._importKey_ = await window.crypto.subtle.importKey(
        'raw',
        this._key,
        this._algorithm.name,
        false,
        ['encrypt', 'decrypt']
      );
    }
    return this._importKey_;
  }

  async encrypt(arrayBuffer) {
    const key = await this.importKey();
    return window.crypto.subtle.encrypt(this._algorithm, key, arrayBuffer);
  }

  async decrypt(encryptedDataArrayBuffer) {
    const key = await this.importKey();
    return window.crypto.subtle.decrypt(this._algorithm, key, encryptedDataArrayBuffer);
  }

  async encrypt_utf8_base64(utf8Str) {
    const inputBuffer = new TextEncoder().encode(utf8Str);
    const outputBuffer = await this.encrypt(inputBuffer);
    return arrayBufferToBase64(outputBuffer);
  }

  async decrypt_base64_utf8(base64) {
    const inputBuffer = base64ToArrayBuffer(base64);
    const outputBuffer = await this.decrypt(inputBuffer);
    return new TextDecoder().decode(new Uint8Array(outputBuffer));
  }

  async time_encrypt_utf8_base64(utf8Str) {
    const c = Math.floor(Math.random() * 1000);
    const t = Math.floor(Math.random() * 1000);
    const json = JSON.stringify({ t, s: utf8Str, c });
    return this.encrypt_utf8_base64(json);
  }

  async time_decrypt_base64_utf8(base64) {
    const json = await this.decrypt_base64_utf8(base64);
    const obj = JSON.parse(json);
    if (!obj.s) {
      throw new Error('time_decrypt_base64_utf8解析失败');
    }
    return obj.s;
  }
}


if (typeof module !== "undefined") {
  module.exports = {
    Aes128CBC: Aes128CBC
  };
} else if (typeof window !== "undefined") {
  window.Aes128CBC = Aes128CBC;
}
