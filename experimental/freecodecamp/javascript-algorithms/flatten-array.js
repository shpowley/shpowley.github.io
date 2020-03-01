// https://www.freecodecamp.com/challenges/steamroller
// - code from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce?v=example
function steamrollArray(arr) {
  return arr.reduce(
    function(acc, e) {
      return acc.concat(Array.isArray(e) ? steamrollArray(e) : e);
    },

    []
  );
}

steamrollArray([1, [2], [3, [[4]]]]);
