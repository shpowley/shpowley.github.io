// https://www.freecodecamp.com/challenges/falsy-bouncer
function bouncer(arr) {
  return arr.filter(function(element) {
    if (element)
      return element;
  });
}

bouncer([7, "ate", "", false, 9]);
