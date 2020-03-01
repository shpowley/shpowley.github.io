// https://www.freecodecamp.com/challenges/pairwise
function pairwise(arr, arg) {
  var
    arr_pairs = [];

    return arr.reduce(
      (acc, e, index, arr) => {
        var
          n = 0,
          index_match = 0;

        if (arr_pairs.indexOf(index) === -1) {
          n = arg - e;

          while (index_match > -1) {
            index_match = arr.indexOf(n, index_match + 1);

            if (index_match > -1 && index !== index_match) {
              if (arr_pairs.indexOf(index_match) === -1) {
                arr_pairs.push(index);
                arr_pairs.push(index_match);

                return acc + index + index_match;
              }
            }
          }
        }

        return acc;
      },

      0
    );
}

pairwise([1,4,2,3,0,5], 7);
