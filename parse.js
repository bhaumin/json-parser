
var parseJSON = function(json) {
  // if (json === 'null') {
  //   return null;
  // }

  if (!_isValidJSON(json)) {
    throw new SyntaxError('Invalid json');
  }

  if (_isObjectStart(json[0])) {
    return _parseObject(json, 0).result;
  }

  if (_isArrayStart(json[0])) {
    return _parseArray(json, 0).result;
  }

  return _nonStringValueOf(json);
};

var _isValidJSON = function(json) {
  // Determine if the json is valid
  const openers = new Set(['{', '[']);
  const closers = new Set(['}', ']']);
  const openersToClosers = {
    '{': '}',
    '[': ']'
  };

  const openersStack = [];
  let prevChar = null;

  for (let char of json) {
    if (openers.has(char)) {
      openersStack.push(char);
    } else if (closers.has(char)) {
      if (openersStack.length === 0 || openersToClosers[openersStack.pop()] !== char) {
        return false;
      }
    } else if (openersStack.length > 0 && char === '"') {
      // Special handling for double quotes
      // If they are escaped, then ignore them
      if (prevChar !== '\\') {
        if (openersStack.length > 0 && openersStack[openersStack.length - 1] === char) {
          openersStack.pop();
        } else {
          openersStack.push(char);
        }
      }
    }

    prevChar = char;
  }

  return openersStack.length === 0;
};

var _parseObject = function(json, startIndex) {
  if (json[startIndex] !== '{') {
    return null;
  }

  const resultObj = {};

  let index = startIndex + 1;
  let lastKey, lastStr, lastVal;

  while (!_isObjectEnd(json[index])) {
    if (_isObjectStart(json[index])) {
      const { result: nestedObj, nextIndex } = _parseObject(json, index);
      resultObj[lastKey] = nestedObj;
      index = nextIndex;
    } else if (_isArrayStart(json[index])) {
      const { result: nestedArr, nextIndex } = _parseArray(json, index);
      resultObj[lastKey] = nestedArr;
      index = nextIndex;
    } else if (_isKeyValDelimiter(json[index])) {
      lastKey = lastStr;
      lastStr = undefined;
      index++;
    } else if (_isPairDelimiter(json[index])) {
      const valToSet = _chooseField(lastStr, lastVal);
      if (valToSet !== undefined) {
        resultObj[lastKey] = valToSet;
        lastStr = undefined;
        lastVal = undefined;
      }
      index++;
    } else if (_isDoubleQuote(json[index])) {
      const { result, nextIndex } = _parseString(json, index);
      lastStr = result;
      index = nextIndex;
    } else if (!_isSpace(json[index])) {
      const { result, nextIndex } = _parseNonString(json, index);
      lastVal = result;
      index = nextIndex;
    } else {
      index++;
    }
  }

  // This handles the single/last pair with simple value in an object
  const valToSet = _chooseField(lastStr, lastVal);
  if (valToSet !== undefined) {
    resultObj[lastKey] = valToSet;
  }

  return { 'result': resultObj, 'nextIndex': index + 1};
};

var _parseArray = function(json, startIndex) {
  if (json[startIndex] !== '[') {
    return null;
  }

  const resultArr = [];

  let index = startIndex + 1;
  let lastStr, lastVal;

  while (!_isArrayEnd(json[index])) {
    if (_isObjectStart(json[index])) {
      const { result: nestedObj, nextIndex } = _parseObject(json, index);
      resultArr.push(nestedObj);
      index = nextIndex;
    } else if (_isArrayStart(json[index])) {
      const { result: nestedArr, nextIndex } = _parseArray(json, index);
      resultArr.push(nestedArr);
      index = nextIndex;
    } else if (_isElemDelimiter(json[index])) {
      const elemToSet = _chooseField(lastStr, lastVal);
      if (elemToSet !== undefined) {
        resultArr.push(elemToSet);
        // unset them
        lastStr = undefined;
        lastVal = undefined;
      }
      index++;
    } else if (_isDoubleQuote(json[index])) {
      const { result, nextIndex } = _parseString(json, index);
      lastStr = result;
      index = nextIndex;
    } else if (!_isSpace(json[index])) {
      const { result, nextIndex } = _parseNonString(json, index);
      lastVal = result;
      index = nextIndex;
    } else {
      index++;
    }
  }

  // This handles the single/last element with simple value in an array
  const elemToSet = _chooseField(lastStr, lastVal);
  if (elemToSet !== undefined) {
    resultArr.push(elemToSet);
  }

  return { 'result': resultArr, 'nextIndex': index + 1};
};

var _chooseField = function(field1, field2) {
  if (field1 !== undefined) {
    return field1;
  } else if (field2 !== undefined) {
    return field2;
  } else {
    return undefined;
  }
};

var _parseString = function(json, startIndex) {
  if (json[startIndex] !== '"') {
    return null;
  }

  const charBuffer = [];
  let index = startIndex + 1;

  while (!_isDoubleQuote(json[index]) || _isDoubleQuoteEscaped(json, index)) {
    if (!_isBackSlash(json[index]) || _isBackSlashEscaped(json, index)) {
      charBuffer.push(json[index]);
    }
    _isBackSlashEscaped(json, index) ? index += 2 : index++;
  }

  return { 'result': charBuffer.join(''), 'nextIndex': index + 1};
};

var _parseNonString = function(json, startIndex) {
  const charBuffer = [];
  let index = startIndex;

  while (!_isNonStringEnd(json[index])) {
    charBuffer.push(json[index]);
    index++;
  }

  return { 'result': _nonStringValueOf(charBuffer.join('')), 'nextIndex': index};
};

var _nonStringValueOf = function(str) {
  if (str === 'null') {
    return null;
  } else if (str.toLowerCase() === 'true') {
    return true;
  } else if (str.toLowerCase() === 'false') {
    return false;
  } else {
    return Number(str);
  }
};

var _isObjectStart = function(char) {
  return char === '{';
};

var _isObjectEnd = function(char) {
  return char === '}';
};

var _isKeyValDelimiter = function(char) {
  return char === ':';
};

var _isPairDelimiter = function(char) {
  return char === ',';
};

var _isArrayStart = function(char) {
  return char === '[';
};

var _isArrayEnd = function(char) {
  return char === ']';
};

var _isElemDelimiter = function(char) {
  return char === ',';
};

var _isDoubleQuote = function(char) {
  return char === '"';
};

var _isBackSlash = function(char) {
  return char === '\\';
};

var _isSpace = function(char) {
  return [' ', '\r', '\n', '\t'].indexOf(char) >= 0;
};

var _isNonStringEnd = function(char) {
  return [',', ']', '}', ' '].indexOf(char) >= 0;
};

var _isDoubleQuoteEscaped = function(json, currentIndex) {
  return currentIndex > 0 && json[currentIndex] === '"' && json[currentIndex - 1] === '\\';
};

var _isBackSlashEscaped = function(json, currentIndex) {
  return currentIndex < (json.length - 1) && json[currentIndex] === '\\' && json[currentIndex + 1] === '\\';
};


export default parseJSON;
