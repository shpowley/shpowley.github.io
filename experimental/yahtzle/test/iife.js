/**
 * IIFE
 * - http://benalman.com/news/2010/11/immediately-invoked-function-expression/
 * - http://stackoverflow.com/a/4508588
 */
var
  YAHTZLE = (function() {
    var
      _UTIL = (function() {
        // faster equivalent to "Math.floor(n)"
        function _floor(n) {
          return n | 0;
        }

        // get a random integer between min/max inclusive
        function _getRandom(min, max) {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        // check if variable is an integer
        function _isInteger(n) {
          return (!isNaN(n) && n === (n | 0));
        }

        // http://stackoverflow.com/a/24398129
        function _pad(s, width, pad_char, left_justify) {
          if (_UTIL.isInteger(width)) {
            var padding;

            if (typeof(pad_char) !== "string" || pad_char.length > 1)
              pad_char = ' ';

            if (s === null || s === undefined)
              s = "X";
            else if (typeof(s) !== "string")
              s = s.toString();

            padding = Array(width + 1 - s.length).join(pad_char);

            if (left_justify === true)
              return s + padding;
            else
              return padding + s;
          }
          else
            return s;
        }

        // http://phrogz.net/js/string_to_number.html
        function _toInteger(n) {
          switch(typeof(n)) {
            case "string":
              n = n - 0;

            case "number":
              if (!isFinite(n) || _UTIL.isInteger(n)) return n;
              else return _UTIL.floor(n);

            default:
              return n;
          }
        }

        function _fnTest() {
          return YAHTZLE.UTIL.getRandom(10, 20);
        }

        return {
          floor: _floor,
          getRandom: _getRandom,
          isInteger: _isInteger,
          pad: _pad,
          toInteger: _toInteger,
          fnTest: _fnTest
        };
      })();

    return {
      UTIL: _UTIL
    };
  })(),

  TESTOBJ = (function() {
    var
      _COUNT_A = 0;

    function _getCountA() {
      return this.COUNT++;
    }

    function _getCountB() {
      return _COUNT_A++;
    }

    return {
      COUNT: 0,
      getCountA: _getCountA,
      getCountB: _getCountB
    };
  })();

window.addEventListener("load", function() {
  console.log("IIFE test");
  console.log("random #: " + YAHTZLE.UTIL.fnTest());
  console.log("Count A = " + TESTOBJ.COUNT);
  console.log("Count A = " + TESTOBJ.getCountA());
  console.log("Count A = " + TESTOBJ.COUNT);
  console.log("Count B = " + TESTOBJ.getCountB());
  console.log("Count A = " + TESTOBJ.COUNT);
});