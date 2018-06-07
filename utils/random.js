exports.randomIndex = function(array) {
    let idx = Math.floor(Math.random()*array.length);
    return idx;
};


exports.randomKey = function(object) {
    let keys = Object.keys(object);
    let idx = exports.randomIndex(keys);
    return keys[idx];
};

