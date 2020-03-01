// https://www.freecodecamp.com/challenges/symmetric-difference
// - exact same as basic solution **
function sym(args) {
    var
      arr = [];

    for (var i = 0, l = arguments.length; i < l; i++) {
      arr.push(arguments[i].slice(0));
    }

    arr = arr.reduce((arr1, arr2) => {
      var
        symmetric_difference = [];

      arr1.forEach(e => {
        if (arr2.indexOf(e) === -1 && symmetric_difference.indexOf(e) === -1)
          symmetric_difference.push(e);
      });

      arr2.forEach(e => {
        if (arr1.indexOf(e) === -1 && symmetric_difference.indexOf(e) === -1)
          symmetric_difference.push(e);
      });

      return symmetric_difference;
    });

    return arr;
}

sym([1, 2, 3], [5, 2, 1, 4]);