// https://www.freecodecamp.com/challenges/sum-all-numbers-in-a-range
function sumAll(arr) {
  var
    new_arr = [];

  // NOTE: NOT THE MOST EFFICIENT HAVING TO CONSTRUCT A NEW ARRAY, BUT MEETS CRITERIA OF USING .MIN .MAX .REDUCE
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
  for (var i = Math.min.apply(null, arr), l = Math.max.apply(null, arr); i <= l; i++) {
    new_arr.push(i);
  }

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce?v=example
  return new_arr.reduce(function(acc, n) {
    return acc + n;
  }, 0);
}

sumAll([1, 4]);
