// https://www.freecodecamp.com/challenges/smallest-common-multiple
function smallestCommons(arr) {
  var
    i, l,
    smallest_common_multiple = 0,
    multiples_found = false,
    arr_seed = [];

  // start with larger # to create range of starting number array "sets" that will contain multiples; these #'s are from high to low
  if (arr[0] < arr[1]) {
    i = arr[1];
    l = arr[0];
  }
  else {
    i = arr[0];
    l = arr[1];
  }

  for (; i >= l; i--) {
    arr_seed.push(i);
  }

  while (true) {
    smallest_common_multiple += arr_seed[0];

    // check smallest common multiple
    for (i = 1, l = arr_seed.length; i < l; i++) {
      if (arr_seed[i] > 1) {
        multiples_found = smallest_common_multiple % arr_seed[i] === 0;

        if (!multiples_found)
          break;
      }
    }

    if (multiples_found)
      break;
  }

  return smallest_common_multiple;
}

smallestCommons([1,5]);
