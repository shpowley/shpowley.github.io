// https://www.freecodecamp.com/challenges/caesars-cipher
function rot13(str) { // LBH QVQ VG!
  var
    char_code = 0,
    char_code_N = "N".charCodeAt(0),
    arr_str = str.split("");

  for (var i = 0, l = arr_str.length; i < l; i++) {
    if (/[A-Z]/.test(arr_str[i])) {
      char_code = arr_str[i].charCodeAt(0);
      arr_str[i] = char_code < char_code_N ? String.fromCharCode(char_code + 13) : String.fromCharCode(char_code - 13);
    }
  }

  return arr_str.join("");
}

// Change the inputs below to test
rot13("SERR PBQR PNZC");
