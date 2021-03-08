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
    this._cryptoKeyPromise = this.importSecretKey(this._key);
    this._iv = hex2Uint8Array(ivStr || "808ce75f6ea37c071fe8075887717594");
  }

  importSecretKey(rawKey) {
    return window.crypto.subtle.importKey("raw", rawKey, "AES-CBC", true, ["encrypt", "decrypt"]);
  }

  async encrypt(data) {
    const cryptoKey = await this._cryptoKeyPromise;
    return window.crypto.subtle.encrypt(
      {
        iv: this._iv,
        name: "AES-CBC"
      },
      cryptoKey,
      data
    );
  }

  async decrypt(data) {
    const cryptoKey = await this._cryptoKeyPromise;
    return window.crypto.subtle.decrypt(
      {
        iv: this._iv,
        name: "AES-CBC"
      },
      cryptoKey,
      data
    );
  }
}

if (typeof module !== "undefined") {
  module.exports = {
    Aes128CBC: Aes128CBC
  };
} else if (typeof window !== "undefined") {
  window.Aes128CBC = Aes128CBC;
}
