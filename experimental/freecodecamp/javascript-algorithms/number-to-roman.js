// NOTE: 5000 IS V WITH AN OVERLINE SYMBOL AND 4000 WOULD BE IV WITH AN OVERLINE

// https://www.freecodecamp.com/challenges/roman-numeral-converter
// - max number is 3999
var
  roman_num_lookup = {
    0: "",

    1: "I",
    2: "II",
    3: "III",
    4: "IV",
    5: "V",
    6: "VI",
    7: "VII",
    8: "VIII",
    9: "IX",

    10: "X",
    20: "XX",
    30: "XXX",
    40: "XL",
    50: "L",
    60: "LX",
    70: "LXX",
    80: "LXXX",
    90: "XC",

    100: "C",
    200: "CC",
    300: "CCC",
    400: "CD",
    500: "D",
    600: "DC",
    700: "DCC",
    800: "DCCC",
    900: "CM",

    1000: "M",
    2000: "MM",
    3000: "MMM"
  };

function convertToRoman(num) {
  var
    // break number into array of digits
    array_digits = num.toString().split(""),
    roman_num = "";

  for (var i = 0, l = array_digits.length; i < l; i++) {
    roman_num += roman_num_lookup[array_digits[i] * Math.pow(10, l - 1 - i)].toString();
  }

  return roman_num;
}

convertToRoman(36);