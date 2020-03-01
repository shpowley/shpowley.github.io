// https://www.freecodecamp.com/challenges/arguments-optional
function addTogether() {
  var
    arg_0 = arguments[0];

  if (typeof(arg_0) === "number") {
    if (arguments.length === 2 && typeof(arguments[1]) === "number")
      return arguments[0] + arguments[1];

    else if (arguments.length === 1)
      return function (n) {
        return typeof(n) === "number" ? arg_0 + n : undefined;
      };
  }

  return undefined;
}

addTogether(2,3);
