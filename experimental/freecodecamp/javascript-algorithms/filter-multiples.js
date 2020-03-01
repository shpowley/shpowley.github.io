// https://www.freecodecamp.com/challenges/seek-and-destroy
function destroyer(arr) {
  var
    filter_number;

  function _helper(n) {
    return n !== filter_number;
  }

  for (var i = 1, l = arguments.length; i < l; i++) {
    filter_number = arguments[i];

    arr = arr.filter(_helper);
  }

  return arr;
}

destroyer([1, 2, 3, 1, 2, 3], 2, 3);
