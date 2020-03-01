/* commonly used javascript prototypes */
var
  $id = document.getElementById.bind(document),
  $CSS = document.querySelectorAll.bind(document),
  $class = document.getElementsByClassName.bind(document),
  $tag = document.getElementsByTagName.bind(document),
  $css = document.querySelector.bind(document);

Element.prototype.on = Element.prototype.addEventListener;
Element.prototype.$css = Element.prototype.querySelector;

// Element.prototype.$id = Element.prototype.getElementById;  // this won't work..
// $card = svgDOM.getElementById.bind(svgDOM);                // (workaround) svg dom or other subelement


/* set css */
document.body.setAttribute("class", "dead_center");


/* how to handle window resize triggered 2x */
var resizeTimer; /* fixes multiple window.resize event triggered */

function init() {
  /*
   * window.resize event is triggered at leat 2x in all browsers
   * - workaround using setTimeout() / clearTimeout()
   *   that basically ignores all but the last resize event
   */
  window.onresize = function() {
    if (resizeTimer) {
      clearTimeout(resizeTimer);
    }

    resizeTimer = setTimeout(resizeWindowHandler, 50);
  };
}

function resizeWindowHandler() {
  // code here
}


/* optional and default args */
function scale(_scale, _fullwindow, _fullscreen) {
  /*
   * handles default arguments
   * - http://stackoverflow.com/a/9363769 (same as this code + required args)
   */
  switch (arguments.length) {
    case 0:
      _scale = CANVAS.scale_factor;
    case 1:
      _fullwindow = false;
    case 2:
      _fullscreen = false;
  }
}


/* new point object - example; syntax: var x = new POINT(3, 4); */
var POINT = function(x, y) {
  var _tag = "POINT.create()";

  if (!x || typeof(x) != "number") {
    throw _err(x);
  }

  if (!y || typeof(y) != "number") {
    throw _err(y);
  }

  // error helper - invalid parameters
  function _err(p) {
    return _tag + ": invalid parameter \"" + p + "\"";
  }

  function _toString() {
    return "POINT object: (" + this.x + ", " + this.y + ")";
  }

  var _point = function() {
    this.x = x;
    this.y = y;
  };

  _point.prototype.toString = _toString;

  return new _point();
};


/* pre-loading images */
// http://perishablepress.com/3-ways-preload-images-css-javascript-ajax/ (javascript method 1)
var images = [];

function preload() {
  for (var i = 0, l = arguments.length; i < l; i++) {
    images[i] = new Image();
    images[i].src = arguments[i];
  }
}

preload("image-001.jpg", "image-002.jpg", "image-003.jpg");


/* replacement for setInterval/setTimeout using requestAnimationFrame */
// https://gist.github.com/joelambert/1002116
// http://creativejs.com/resources/requestanimationframe/
window.requestInterval = function(fn, delay) {
  if (
    !window.requestAnimationFrame &&
    !window.webkitRequestAnimationFrame &&
    !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
    !window.oRequestAnimationFrame &&
    !window.msRequestAnimationFrame
  ) return window.setInterval(fn, delay);

  var start = new Date().getTime();
  var handle;

  function loop() {
    var current = new Date().getTime();
    var delta = current - start;

    if (delta >= delay) {
      fn.call();
      start = new Date().getTime();
    }

    handle = window.requestAnimationFrame(loop);
  }

  handle = window.requestAnimationFrame(loop);

  return handle;
};

window.clearRequestInterval = function(handle) {
  window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value) :
  window.webkitCancelAnimationFrame ? window.webkitCancelAnimationFrame(handle.value) :
  window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value) : /* Support for legacy API */
  window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value) :
  window.oCancelRequestAnimationFrame	? window.oCancelRequestAnimationFrame(handle.value) :
  window.msCancelRequestAnimationFrame ? window.msCancelRequestAnimationFrame(handle.value) :
  clearInterval(handle);
};