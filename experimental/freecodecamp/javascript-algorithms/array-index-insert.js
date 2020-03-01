// https://www.freecodecamp.com/challenges/where-do-i-belong
function getIndexToIns(arr, num) {
  var
    insert_index = -1;

  arr.sort(function(a, b) {
    if (a < b)
      return -1;

    else if (a > b)
      return 1;

    return 0;
  });

  for (var i = 0, l = arr.length; i < l; i++) {
    if (arr[i] >= num) {
      insert_index = i;
      break;
    }
  }

  return insert_index === -1 ? arr.length : insert_index;
}

getIndexToIns([5, 3, 20, 3], 5);
