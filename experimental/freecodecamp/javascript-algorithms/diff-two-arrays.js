// https://www.freecodecamp.com/challenges/diff-two-arrays
function diffArray(arr1, arr2) {
  var
    new_arr2 = arr2.slice(0),

    new_arr1 = arr1.filter(function(e) {
      var i = new_arr2.indexOf(e);

      // not found
      if (i === -1)
        return true;

      // found
      else {
        new_arr2.splice(i, 1); // remove from array 2
        return false; // remove from array 1 via filter
      }
    });

  return new_arr1.concat(new_arr2);
}

diffArray([1, 2, 3, 5], [1, 2, 3, 4, 5]);