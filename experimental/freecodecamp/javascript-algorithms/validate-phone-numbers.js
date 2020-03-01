// https://www.freecodecamp.com/challenges/validate-us-telephone-numbers
function telephoneCheck(str) {
  var
    regex_digits = /\d/g,
    phone_length = str.match(regex_digits).length,
    regex_phone;

  if (str.indexOf("(") > -1 && str.indexOf(")") > -1)
    regex_phone = /^[1]?[ ]?[(][\d]{3}[)][ -]?[\d]{3}[ -]?[\d]{4}$/;
  else
    regex_phone = /^[1]?[ ]?[\d]{3}[- ]?[\d]{3}[ -]?[\d]{4}$/;

  return phone_length === 10 || phone_length === 11 ? regex_phone.test(str) : false;
}

telephoneCheck("555-555-5555");
