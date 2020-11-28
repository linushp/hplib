function getPrefixClassNames(prefixCls) {
  function withPrefix(name, isWithPrefix) {
    if (!isWithPrefix) {
      return name;
    }
    if (name.startsWith("-")) {
      return prefixCls + name;
    }
    return prefixCls + "-" + name;
  }

  return function classNames(names, isWithPrefix) {
    if (typeof isWithPrefix === "undefined") {
      isWithPrefix = true;
    }

    if (typeof names === "string") {
      return withPrefix(names, isWithPrefix);
    }

    if (Object.prototype.toString.call(names) === "[object Array]") {
      var arr = [];
      for (var i = 0; i < names.length; i++) {
        var name = names[i];
        arr.push(withPrefix(name, isWithPrefix));
      }
      return arr.join(" ");
    }

    if (typeof names === "object") {
      var arr2 = [];
      var nameKeys = Object.keys(names);
      for (let i = 0; i < nameKeys.length; i++) {
        var nameKey = nameKeys[i];
        var nameValue = names[nameKey];
        if (nameValue === true) {
          arr2.push(withPrefix(nameKey, isWithPrefix));
        }
      }
      return arr2.join(" ");
    }

    return "";
  };
}

module.exports = {
  getPrefixClassNames
};
