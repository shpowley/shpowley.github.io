/*
  replacement for setTimeout()/setInterval() using of requestAnimationFrame()
  re-written as a timer "object"
  - https://gist.github.com/joelambert/1002116
*/
var TIMER = {
  create: function() {
    var
      _fnTrigger,  // stores intermediary loop function
      _frameCancel = window.cancelAnimationFrame,
      _frameRequest = window.requestAnimationFrame,
      _handle,  // timer handle
      _isRunning = false,
      _iteration = 0, // loop iteration counter
      _repeat,  // boolean: T = interval timer, F = 1-shot
      _timerTriggered = false; // boolean: timer triggered

    function _clear() {
      _frameCancel(_handle);
      clearInterval(_handle);
      clearTimeout(_handle);

      _handle = null;
      _isRunning = false;
    }

    function _fnCommon(fn, delay, count) {
      _fnTrigger = null;
      _iteration = 0;
      _timerTriggered = false;
      _isRunning = true;

      // local to this function
      function limitCheck() {
        if (count && _iteration >= count)
          _clear();
      }

      // use animationFrame for interval & timeout
      if (_frameRequest) {
        var
          start = new Date().getTime(),
          current;

        _fnTrigger = function() {
          current = new Date().getTime();

          if (current - start >= delay) {
            start = current;
            _iteration++;
            _timerTriggered = true;

            if (!_repeat) {
              _isRunning = false;
            }

            fn();
            limitCheck();

            if (!_repeat) {
              _handle = null;
              return;
            }
          }

          // controls stopping the timer early
          if (_handle) {
            _handle = _frameRequest(_fnTrigger);
          }
        };

        _handle = _frameRequest(_fnTrigger);
      }

      // use setInterval
      else if (_repeat) {
        _fnTrigger = function() {
          _iteration++;
          _timerTriggered = true;
          fn();
          limitCheck();
        };

        _handle = setInterval(_fnTrigger, delay);
      }

      // use setTimeout
      else {
        _fnTrigger = function() {
          _iteration++;
          _timerTriggered = true;
          _isRunning = false;
          fn();
        };

        _handle = setTimeout(_fnTrigger, delay);
      }
    }

    function _getIteration() {
      return _iteration;
    }

    /**
     * fn:    callback function
     * delay: amount of time (ms) before firing callback
     * count: OPTIONAL, number of iterations
     */
    function _interval(fn, delay, count) {
      _repeat = true;
      _fnCommon(fn, delay, count);
    }

    function _running() {
      return _isRunning;
    }

    function _timeout(fn, delay) {
      _repeat = false;
      _fnCommon(fn, delay);
    }

    function _triggered() {
      return _timerTriggered;
    }


    /*** OBJECT INSTANCE ***/

    /** CONSTRUCTOR **/
    var Timer = function() {
    };

    Timer.prototype.clear = _clear;
    Timer.prototype.getIteration = _getIteration;
    Timer.prototype.interval = _interval;
    Timer.prototype.running = _running;
    Timer.prototype.timeout = _timeout;
    Timer.prototype.triggered = _triggered;

    return new Timer();
  }
};