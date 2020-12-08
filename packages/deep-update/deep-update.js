function deepUpdate(obj, keyArr, value) {
    if (keyArr.length > 0) {
        var key0 = keyArr[0];
        var value0 = obj[key0];
        var obj2 = {};
        obj2[key0] = deepUpdate(value0, keyArr.slice(1), value);
        return Object.assign({}, obj, obj2);
    }
    return value;
}


// Adds compatibility for ES modules
deepUpdate.deepUpdate = deepUpdate;

module.exports = deepUpdate;