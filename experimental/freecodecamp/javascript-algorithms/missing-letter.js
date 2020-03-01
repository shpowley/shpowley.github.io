// https://www.freecodecamp.com/challenges/missing-letters
function fearNotLetter(str) {
  var
    first_letter = str.charCodeAt(0);

  for (var i = 1, l = str.length; i < l; i++) {
    if (str.charCodeAt(i) != first_letter + i)
      return String.fromCharCode(first_letter + i);
  }

  return undefined;
}

fearNotLetter("abce");
