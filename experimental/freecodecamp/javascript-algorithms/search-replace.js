// https://www.freecodecamp.com/challenges/search-and-replace
function myReplace(str, before, after) {
  if (/^[A-Z]/.test(before) && /^[a-z]/.test(after))
    after = after[0].toUpperCase() + after.slice(1);

  return str.replace(before, after);
}

myReplace("A quick brown fox jumped over the lazy dog", "jumped", "leaped");
