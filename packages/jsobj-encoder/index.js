(function() {
  function toBase64(str) {
    //nodejs
    if (typeof Buffer !== "undefined" && typeof window === "undefined") {
      return Buffer.from(str).toString("base64");
    }
    //browser
    return btoa(str);
  }

  function fromBase64(str2) {
    //nodejs
    if (typeof Buffer !== "undefined" && typeof window === "undefined") {
      return Buffer.from(str2, "base64").toString();
    }
    //browser
    return atob(str2);
  }

  function encodeObject(obj) {
    return toBase64(encodeURIComponent(JSON.stringify(obj))).replace(/=+$/gm, "");
  }

  function fixBase64(x) {
    const ccc = x.length % 4;
    if (ccc === 3) {
      return `${x}=`;
    }
    if (ccc === 2) {
      return `${x}==`;
    }
    if (ccc === 1) {
      return `${x}===`;
    }
    return x;
  }

  function decodeObject(str) {
    let base64 = fixBase64(str);
    let json = fromBase64(base64);
    json = decodeURIComponent(json);
    return JSON.parse(json);
  }

  var jsobjEncoder = {
    encodeObject: encodeObject,
    decodeObject: decodeObject
  };

  jsobjEncoder["__esModule"] = true;
  jsobjEncoder["default"] = jsobjEncoder;

  if (typeof module !== "undefined") {
    module.exports = jsobjEncoder;
  }

  if (typeof window !== "undefined") {
    window.jsobjEncoder = jsobjEncoder;
  }
})();
