// https://www.freecodecamp.com/challenges/spinal-tap-case
function spinalCase(str) {
  str = str[0].toLowerCase() + str.slice(1);
  str = str.replace(/[ _]/g, "-");
  str = str.replace(/([a-z])([A-Z])/g, "$1-$2");
  str = str.toLowerCase();

  return str;
}

spinalCase("This Is Spinal Tap");
