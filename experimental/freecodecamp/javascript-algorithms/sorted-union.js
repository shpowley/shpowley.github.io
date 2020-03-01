// https://www.freecodecamp.com/challenges/sorted-union
function uniteUnique(arr) {
  var
    i, l, match_index,
    arr_unique = arr.slice(0);

  // merge all argument arrays
  for (i = 1, l = arguments.length; i < l; i++) {
    arr_unique = arr_unique.concat(arguments[i]);
  }

  // eliminate duplicates
  for (i = 0; i < arr_unique.length; i++) {
    match_index = -1;

    while (match_index !== i) {
      match_index = arr_unique.lastIndexOf(arr_unique[i]);

      if (match_index !== i)
        arr_unique.splice(match_index, 1);
    }
  }

  return arr_unique;
}

uniteUnique([1, 3, 2], [5, 2, 1, 4], [2, 1]);
