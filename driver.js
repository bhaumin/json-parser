import _ from 'lodash';
import fixtures from './fixtures.js';
import parse from './parse.js';
import stringify from './stringify.js';

const {
  stringifiableObjects,
  unstringifiableValues,
  parseableStrings,
  unparseableStrings
} = fixtures;

let inputCount, matchCount;

inputCount = stringifiableObjects.length;
matchCount = 0;
stringifiableObjects.forEach(inp => {
  const expected = JSON.stringify(inp);
  const actual = stringify(inp);
  const isMatch = expected === actual;
  if (!isMatch) {
    console.log('FAIL.. Stringify Error!');
    console.log('Input:\n', inp);
  } else {
    matchCount++;
  }
});

console.log(`stringify valid inputs - passed ${matchCount} of ${inputCount} tests!`);


inputCount = unstringifiableValues.length;
matchCount = 0;
unstringifiableValues.forEach(inp => {
  const expected = JSON.stringify(inp);
  const actual = stringify(inp);
  const isMatch = expected === actual;
  if (!isMatch) {
    console.log('FAIL.. Stringify Error!');
    console.log('Input:\n', inp);
  } else {
    matchCount++;
  }
});

console.log(`stringify invalid inputs - passed ${matchCount} of ${inputCount} tests!`);


inputCount = parseableStrings.length;
matchCount = 0;
parseableStrings.forEach(inp => {
  const expected = JSON.parse(inp);
  const actual = parse(inp);
  const isMatch = _.isEqual(expected, actual);
  if (!isMatch) {
    console.log('FAIL.. Parse Error!');
    console.log('Input:\n', inp);
  } else {
    matchCount++;
  }
});

console.log(`parse valid inputs - passed ${matchCount} of ${inputCount} tests!`);


inputCount = unparseableStrings.length;
matchCount = 0;
unparseableStrings.forEach(inp => {
  try {
    const actual = parse(inp);
    console.log('FAIL.. Didn\'t throw error!');
    console.log('Input:\n', inp);
  } catch (error) {
    matchCount++;
  }
});

console.log(`parse invalid inputs - passed ${matchCount} of ${inputCount} tests!`);

