/*
 * Replacements for setTimeout()/setInterval() using of requestAnimationFrame()
 * where possible for better performance - https://gist.github.com/joelambert/1002116
 */
var TIMER = {
  intervalClear: function(handle) {
    window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value) :
    window.webkitCancelAnimationFrame ? window.webkitCancelAnimationFrame(handle.value) :
    window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value) : /* Support for legacy API */
    window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value) :
    window.oCancelRequestAnimationFrame	? window.oCancelRequestAnimationFrame(handle.value) :
    window.msCancelRequestAnimationFrame ? window.msCancelRequestAnimationFrame(handle.value) :
    clearInterval(handle);
  },

  intervalRequest: function(fn, delay) {
    if (
      !window.requestAnimationFrame &&
      !window.webkitRequestAnimationFrame &&
      !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
      !window.oRequestAnimationFrame &&
      !window.msRequestAnimationFrame
    ) return window.setInterval(fn, delay);

    var start = new Date().getTime();
    var handle = TIMER.requestAnimationFrame(_loop);

    function _loop() {
      var current = new Date().getTime();

      if (current - start >= delay) {
        start = current;
        fn();
        // start = new Date().getTime();
      }

      handle = TIMER.requestAnimationFrame(_loop);
    }

    return handle;
  },

  /* requestAnimationFrame wih graceful fallback */
  requestAnimationFrame: function(callback) {
    return window.requestAnimationFrame(callback) ||
      window.webkitRequestAnimationFrame(callback) ||
      window.mozRequestAnimationFrame(callback) ||
      window.oRequestAnimationFrame(callback) ||
      window.msRequestAnimationFrame(callback) ||
      function(callback) {
        window.setTimeout(callback, 1000 / 60);
      };
  },

  timeoutRequest: function(fn, delay) {
    if (
      !window.requestAnimationFrame &&
      !window.webkitRequestAnimationFrame &&
      !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
      !window.oRequestAnimationFrame && !window.msRequestAnimationFrame
    ) return window.setTimeout(fn, delay);

    var start = new Date().getTime();
    var handle = TIMER.requestAnimationFrame(_loop);

    function _loop() {
      var current = new Date().getTime();

      current - start >= delay ? fn() : handle = TIMER.requestAnimationFrame(_loop);
    }

    return handle;
  },

  timeoutClear: function(handle) {
    window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value) :
    window.webkitCancelAnimationFrame ? window.webkitCancelAnimationFrame(handle.value) :
    window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value) :
    window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value) :
    window.oCancelRequestAnimationFrame	? window.oCancelRequestAnimationFrame(handle.value) :
    window.msCancelRequestAnimationFrame ? window.msCancelRequestAnimationFrame(handle.value) :
    clearTimeout(handle);
  }
};