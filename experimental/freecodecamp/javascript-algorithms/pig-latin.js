// https://www.freecodecamp.com/challenges/pig-latin
function translatePigLatin(str) {
  var
    vowels = /[aeiou]/i;

  // test the first character is a vowel (use "-way")
  if (vowels.test(str[0]))
    return str + "way";

  // ..or consonant (use "-ay")
  else {
    // find end of consonant cluster
    for (var i = 1, l = str.length; i < l; i++) {
      if (vowels.test(str[i]))
        return str.slice(i) + str.slice(0, i) +  "ay";
    }

    return str + "ay";
  }
}

translatePigLatin("consonant");