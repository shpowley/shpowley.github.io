// https://www.freecodecamp.com/challenges/no-repeats-please
var
  regex_repeat = /(.)\1{1}/;

// perm function from stackoverflow - https://stackoverflow.com/a/41068709
function perm(a){
  var r = [[a[0]]],
      t = [],
      s = [],
      i = 1, j = 0, k = 0, l = 0,
      la = 0, lr = 0, lrj = 0;

  if (a.length <= 1)
    return r;

  for (i = 1, la = a.length; i < la; i++){
    for (j = 0, lr = r.length; j < lr; j++){
      r[j].push(a[i]);
      t.push(r[j]);

      for(k = 1, lrj = r[j].length; k < lrj; k++){
        for (l = 0; l < lrj; l++)
          s[l] = r[j][(k+l) % lrj];

        t[t.length] = s;
        s = [];
      }
    }

    r = t;
    t = [];
  }

  return r;
}

function permAlone(str) {
  return perm(str.split("")).reduce(
    (acc, e) => regex_repeat.test(e.join("")) ? acc : acc + 1, 0
  );
}

permAlone('aab');
