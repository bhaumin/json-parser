
var stringifyJSON = function(obj) {
  // your code goes here
  if (obj === null) {
    return 'null';
  }

  let str = '';

  if (_isArray(obj)) {
    str += '[';

    for (let index = 0; index < obj.length; index++) {
      const item = obj[index];

      if (_isUndefined(item) || _isFunction(item)) {
        str += null;
      } else {
        if (item !== null && (_isObject(item) || _isArray(item))) {
          str += stringifyJSON(item);
        } else {
          str += _wrapper(item);
        }
      }

      if (index < obj.length - 1) {
        str += ',';
      }
    }

    str += ']';

  } else if (_isObject(obj)) {

    str += '{';
    const objKeys = Object.keys(obj);

    for (let index = 0; index < objKeys.length; index++) {
      const key = objKeys[index];
      const item = obj[key];

      if (_isUndefined(item) || _isFunction(item)) {
        continue;
      }

      str += _wrapper(key) + ':';

      if (item !== null && (_isObject(item) || _isArray(item))) {
        str += stringifyJSON(item);
      } else {
        str += _wrapper(item);
      }

      if (index < objKeys.length - 1) {
        str += ',';
      }
    }

    str += '}';

  } else {
    str += _wrapper(obj);
  }

  return str;
};

/* Helper functions */
const _wrapper = function(val) {
  return typeof(val) === 'string' ? '"' + val + '"' : val;
};

const _isObject = function(item) {
  return typeof(item) === 'object';
};

const _isArray = function(item) {
  return Array.isArray(item);
};

const _isFunction = function(item) {
  return typeof(item) === 'function';
};

const _isUndefined = function(item) {
  return typeof(item) === 'undefined';
};

export default stringifyJSON;
