// https://www.freecodecamp.com/challenges/sum-all-odd-fibonacci-numbers
function sumFibs(num) {
  var
    next = 0,
    i = 1,
    arr = [1, 1];

  // build array containing fibonacci numbers less than "num"
  while (true) {
    next = arr[i] + arr[i - 1];

    if (next <= num) {
      arr.push(next);
      i++;
    }
    else
      break;
  }

  // sum only "odd" fibonacci numbers in the array (ES6 notation)
  return arr.reduce((acc, e) => e % 2 === 0 ? acc : acc + e);
  // sum = arr.reduce(function(acc, e) {
  //   return e % 2 === 0 ? acc : acc + e;
  // });
}

sumFibs(4);
