/**
 * animation-specific timer
 */

/* global UTIL */
var
  ANIMATION_TIMER = (function() {
    function _animationInit(timestamp) {
      ANIMATION_TIMER.timestamp = _timer_start = _frame_start = timestamp;
      _requestAnimationFrame(_animationTest);
    }

    // _isTriggered() / _isComplete() automatically handles new animation requests and canceling
    function _animationTest(timestamp) {
      ANIMATION_TIMER.timestamp = timestamp;

      if (_isTriggered(timestamp)) {
        // ANIMATION_TIMER.trigger_count++;
        _callback_trigger();

        if (_isComplete(timestamp))
          _callback_complete();
      }
    }

    // PUBLIC function
    // - request animation timer to stop
    // - useful as a external public function to stop INFINITE run duration
    function _cancelAnimationFrame() {
      window.cancelAnimationFrame ? window.cancelAnimationFrame(_animation_handle) :
      window.webkitCancelAnimationFrame ? window.webkitCancelAnimationFrame(_animation_handle) :
      window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(_animation_handle) :
      window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(_animation_handle) :
      window.msCancelRequestAnimationFrame ? window.msCancelRequestAnimationFrame(_animation_handle) :
      window.oCancelRequestAnimationFrame	? window.oCancelRequestAnimationFrame(_animation_handle) : null;

      _animation_handle = null;
    }

    // returns TRUE if the timer is complete
    function _isComplete(timestamp) {
      ANIMATION_TIMER.elapsed = timestamp - _timer_start;

      if (_timer_duration === Infinity || ANIMATION_TIMER.elapsed < _timer_duration + _tolerance) {
        _frame_start = timestamp;
        ANIMATION_TIMER.FPS_actual = Math.round(1000 / ANIMATION_TIMER.delta);

        return false;
      }
      else {
        _cancelAnimationFrame();

        return true;
      }
    }

    function _isRunning() {
      return _animation_handle !== null;
    }

    // returns TRUE if a new frame has been triggered
    function _isTriggered(timestamp) {
      _requestAnimationFrame(_animationTest);
      ANIMATION_TIMER.delta = timestamp - _frame_start;

      return (ANIMATION_TIMER.delta >= _FPS_delay - _tolerance || ANIMATION_TIMER.delta >= _FPS_delay + _tolerance);
    }

    function _requestAnimationFrame(fn_animation) {
      return _animation_handle = window.requestAnimationFrame(fn_animation) ||
        window.webkitRequestAnimationFrame(fn_animation) ||
        window.mozRequestAnimationFrame(fn_animation) ||
        window.msRequestAnimationFrame(fn_animation) ||
        window.oRequestAnimationFrame(fn_animation);
    }

    // PUBLIC function
    // - runs a "requestAnimationFrame" timer for a specific duration
    // - callback_trigger_fn: callback function for each "frame" trigger
    // - callback_complete_fn: callback function for animation timer completion
    // - duration_ms: duration for the timer in ms; use js Infinity for continuous
    // - fps: OPTIONAL requested FPS for timer; use FPS constants
    function _run(callback_trigger_fn, callback_complete_fn, duration_ms, fps) {
      if (duration_ms && duration_ms === Infinity || (UTIL.isInteger(duration_ms) && duration_ms > 0)) {
        _timer_duration = duration_ms;
        _FPS = (fps && UTIL.isInteger(fps) && fps > 0) ? fps : ANIMATION_TIMER.FPS_30;
        _FPS_delay = 1000 / _FPS;
        // ANIMATION_TIMER.trigger_count = 0;
        _callback_trigger = callback_trigger_fn;
        _callback_complete = callback_complete_fn;

        _requestAnimationFrame(_animationInit);

        return true;
      }

      console.warn("duration_ms parameter must be a positive integer or INFINITY");
      return false;
    }

    function _stop() {
      _cancelAnimationFrame();
      _callback_complete();
    }

    var
      // animation
      _animation_handle = null,

      // callback functions
      _callback_trigger = null,
      _callback_complete = null,

      // FPS control
      _FPS = null,
      _FPS_delay = null,

      // tolerance for timing comparisons
      _tolerance = 0.01,

      // stats
      _timer_start = null,
      _timer_duration = null, // desired run duration (milliseconds)

      // single frame
      _frame_start = null;

    return {
      // constants
      FPS_60: 60,
      FPS_30: 30,
      FPS_20: 20,
      FPS_15: 15,

      FPS_actual: 0,
      delta: 0, // single frame delta time
      elapsed: 0,
      timestamp: 0, // current time - invalid until 1st requestAnimationFrame()
      // trigger_count: 0,

      isRunning: _isRunning,
      run: _run,
      stop: _stop
    };
  })();