// https://www.freecodecamp.com/challenges/everything-be-true
function truthCheck(collection, pre) {
  return collection.every(e => e.hasOwnProperty(pre) ? e[pre] : false);
}

truthCheck([{"user": "Tinky-Winky", "sex": "male"}, {"user": "Dipsy", "sex": "male"}, {"user": "Laa-Laa", "sex": "female"}, {"user": "Po", "sex": "female"}], "sex");
