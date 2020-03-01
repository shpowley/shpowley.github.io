/**
 * version 0.1
 *
 * - 2016-02-16: initial version
 */

 /* global navigator localStorage */
var
  UTIL = (function() {
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
      return (_isNumber(n) && n === (n | 0));
    }

    // not really accurate..
    function _isMobile() {
      return /android|opera mini/i.test(navigator.userAgent);
    }

    // check if variable is a number
    function _isNumber(n) {
      return (!isNaN(n));
    }

    // http://stackoverflow.com/a/24398129
    function _pad(s, width, pad_char, left_justify) {
      if (_isInteger(width)) {
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

    // faster equivalent to "Math.round(n)"
    function _round(n) {
      return (n + 0.5) | 0;
    }

    // splits uri and return base + file name
    function _splitURI(uri) {
      var
        obj = {
          base: null,
          file: null
        };


      if (uri && typeof(uri) === "string" && uri.length > 0) {
        var
          split_index = uri.lastIndexOf("/") + 1;

        obj.base = uri.slice(0, split_index);
        obj.file = uri.slice(split_index);
      }

      return obj;
    }

    // http://phrogz.net/js/string_to_number.html
    function _toInteger(n) {
      switch(typeof(n)) {
        case "string":
          n = n - 0;

        case "number":
          if (!isFinite(n) || _isInteger(n)) return n;
          else return _floor(n);

        default:
          return n;
      }
    }

    var
      _STORAGE = (function() {
        function _clear(ID) {
          if (_isSupported())
            localStorage.clear(ID);
        }

        function _get(ID) {
          if (_isSupported()) {
            var s = localStorage.getItem(ID);

            if (typeof(s) === "string")
              return JSON.parse(s);
          }

          return null;
        }

        function _isSupported() {
          var
            x = "STORAGE TEST";

          if (!_IS_SUPPORTED) {
            try {
              localStorage.setItem(x, x);
              localStorage.removeItem(x);
              _IS_SUPPORTED = true;
            }
            catch(e) {
              _IS_SUPPORTED = false;
            }
          }

          return _IS_SUPPORTED;
        }

        function _set(ID, data) {
          if (_isSupported())
            localStorage.setItem(ID, JSON.stringify(data));
        }

        /* PRIVATE */
        var
          _IS_SUPPORTED = null;

        /* PUBLIC */
        return {
          clear: _clear,
          isSupported: _isSupported,
          get: _get,
          set: _set
        };
      })();

    return {
      STORAGE: _STORAGE,

      floor: _floor,
      getRandom: _getRandom,
      isInteger: _isInteger,
      isMobile: _isMobile,
      isNumber: _isNumber,
      pad: _pad,
      round: _round,
      splitURI: _splitURI,
      toInteger: _toInteger
    };
  })();