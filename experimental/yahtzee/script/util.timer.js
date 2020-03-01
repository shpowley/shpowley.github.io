/*
  replacement for setTimeout()/setInterval() using of requestAnimationFrame()
  re-written as an timer "object" from the original in ""../js/web.timer.js"
  - https://gist.github.com/joelambert/1002116
*/
var TIMER = {
  create: function() {
    var _handle, _interval;

    function _fnCommon(fn, delay) {
      if (requestAnimationFrame) {
        var
          start = new Date().getTime(),
          current,

          fnLoop = function() {
            current = new Date().getTime();

            if (current - start >= delay) {
              start = current;
              fn();

              if (!_interval) {
                _handle = null;
                return;
              }
            }

            // controls stopping the timer early
            if (_handle) {
              _handle = requestAnimationFrame(fnLoop);
            }
          };

        _handle = requestAnimationFrame(fnLoop);
      }
      else if (_interval) {
        _handle = setInterval(fn, delay);
      }
      else {
        _handle = setTimeout(fn, delay);
      }
    }

    function _intervalRequest(fn, delay) {
      _interval = true;
      _fnCommon(fn, delay);
    }

    function _timeoutRequest(fn, delay) {
      _interval = false;
      _fnCommon(fn, delay);
    }

    function _clear() {
      if (cancelAnimationFrame)
        cancelAnimationFrame(_handle);
      else if (_interval)
        clearInterval(_handle);
      else
        clearTimeout(_handle);

      _handle = null;
    }

    /* main "constructor" */
    var _obj = function() {
      this.intervalRequest = _intervalRequest;
      this.timeoutRequest = _timeoutRequest;
      this.clear = _clear;
    };

    return new _obj();
  }
};