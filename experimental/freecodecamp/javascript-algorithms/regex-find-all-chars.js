// https://www.freecodecamp.com/challenges/mutations
function mutation(arr) {
  var
    search_string = arr[0],
    source_string = arr[1],
    pattern;

  for (var i = 0, l = source_string.length; i < l; i++) {
    pattern = new RegExp(source_string[i], "i");

    if (!pattern.test(search_string))
      return false;
  }

  return true;
}


mutation(["hello", "He"]);