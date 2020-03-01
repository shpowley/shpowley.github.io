/**
 * wobble animation links:
 * - http://www.cssreset.com/css3-webkit-animation-shake-links/
 * - http://ianlunn.github.io/Hover/
 * - http://www.rocketmill.co.uk/using-css3-animations-engage-users
 * - http://www.jeremycookson.com/top-10-css-hover-effects/ (item 7)
 * - https://coveloping.com/tools/css-animation-generator
 *
 * animation:
 * * https://css-tricks.com/snippets/css/keyframe-animation-syntax/
 * * http://24ways.org/2012/flashless-animation/
 * - simultaneous: http://stackoverflow.com/questions/26986129/play-multiple-css-animations-at-the-same-time
 * - ok explanations: http://blog.papersapp.com/easy-css-animations/
 *
 * alter animation keyframes w/ javascript
 * * http://stackoverflow.com/questions/10342494/set-webkit-keyframes-values-using-javascript-variable
 *  - fiddle (copy): http://jsfiddle.net/shpowley/4gq2k1xo/
 * - https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet (NOTE: CSSStyleSheet: insertRule / deleteRule vs CSSKeyframesRule: appendRule)
 * - http://davidwalsh.name/add-rules-stylesheets
 *
 * accelerometer:
 * - http://www.albertosarullo.com/blog/javascript-accelerometer-demo-source
 * - https://developers.google.com/web/fundamentals/device-access/device-orientation/dev-motion?hl=en
 * - http://www.html5rocks.com/en/tutorials/device/orientation/
 *
 * cross-browser event prefix
 * - http://www.sitepoint.com/css3-animation-javascript-event-handlers/
 *
 * other:
 * - http://www.mosync.com/
 * - https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Using_CSS_transitions#Using_transitions_to_make_JavaScript_functionality_smooth
 */

 /**
  * TODO:
  * - small shake.. use pause instead similar to svg-sprites.js
  * - accelerometer
  *   - acceleration+gravity (NOTE: only accelerationIncludingGravity appears to work for chrome / moto g device..)
  *     - only store the 1st acceleration+gravity readings as a baseline
  *     - trigger on threshold changes from baseline value
  *   - test out acceleration, rotation on other devices & mobile browsers
  */

Element.prototype.on = Element.prototype.addEventListener;

var
  motionTimer,
  imageNode, // dom reference to svg image
  initialized = false,

  ACCELEROMETER = {
    x: 0,
    y: 0,
    z: 0,

    noise: 0.35,
    delay: 100,
    initialized: false,

    triggered: function(a) {
      // return (Math.abs(this.x - a.x) >= this.noise || Math.abs(this.y - a.y) >= this.noise || Math.abs(this.z - a.z) >= this.noise);
      return (Math.abs(this.x - a.x) >= this.noise || Math.abs(this.y - a.y) >= this.noise);
    },

    update: function(a) {
      this.x = a.x;
      this.y = a.y;
      this.z = a.z;
    },

    log: function() {
      console.log("acceleration: [" + this.x + ", " + this.y + ", " + this.z + "]");
    }
  };

function touchHandler() {
  console.log("TOUCH");

  if (initialized) {
    imageNode.classList.toggle("pause");
    //imageNode.classList.toggle("wobble");
  }
  else {
    imageNode.classList.add("shake");
    // imageNode.classList.add("wobble");
    initialized = true;
  }
}

function shakeEnd(e) {
  // imageNode.removeAttribute("class");
  console.log("ANIMATION END");
  console.log(e);
}

function motionHandler(e) {
  var a = e.accelerationIncludingGravity;

  if (ACCELEROMETER.initialized) {
    if (!motionTimer.running() && ACCELEROMETER.triggered(a)) {
      ACCELEROMETER.update(a);
      ACCELEROMETER.log();

      imageNode.style.left = -Math.round(ACCELEROMETER.x * 4.0) + "px";
      imageNode.style.top = Math.round(ACCELEROMETER.y * 8.0) + "px";

      motionTimer.timeout(function() {
        // TODO - trigger code here
        // clearTimeout(motionTimer);
        // motionTimer = null;
      }, ACCELEROMETER.delay);
    }
  }
  else {
    ACCELEROMETER.update(a);
    ACCELEROMETER.log();
    ACCELEROMETER.initialized = true;
  }



  // ACCELEROMETER.update(a); // update all the time?
  // ACCELEROMETER.log();

  /*
  if (!motionTimer && ACCELEROMETER.triggered(a)) {
    ACCELEROMETER.update(a); // update all the time?
    ACCELEROMETER.log();


    // var x = parseInt(imageNode.style.left);


    imageNode.style.left = Math.round(ACCELEROMETER.x * 4.0) + "px";
    imageNode.style.top = Math.round(ACCELEROMETER.y * 8.0) + "px";

    // console.log((a.x).toFixed(1))

    motionTimer = setTimeout(function() {
      // TODO: place trigger code here

      clearTimeout(motionTimer);
      motionTimer = null;
    }, ACCELEROMETER.delay);
  }
  */
}

/**
 * NOTE: DOMContentLoaded event fires too early for loading separate svg? not sure..
 */
window.addEventListener("load", function() {
// document.addEventListener("DOMContentLoaded", function() {
  var
    status = false,
    svgDOM, clickNode;

  imageNode = document.querySelector("#container>iframe");

  if (imageNode && ((svgDOM = imageNode.contentDocument) || (svgDOM = imageNode.getSVGDocument()))) {
  /* alternate technique */
  //   clickNode = (imageNode.contentDocument || imageNode.getSVGDocument()).getElementById("selectable_region");

    clickNode = svgDOM.getElementById("selectable_region");

    /*
    if (clickNode) {
      clickNode.addEventListener("click", touchHandler);
    }
    */

    if (window.DeviceMotionEvent) {
      window.addEventListener("devicemotion", motionHandler);
      motionTimer = TIMER.create();
    }

    /**
     *  TODO
     * - multi-level (3) mini-shake -- FOCUS ON X/Y TRIGGER LEVELS (ACCELERATION DELTA)
     *   - based on accelerometer
     *   - based on touches (click, touchdown, touchup)
     * - touchdown > 100 ms should stop shake
     * - touchdown (stop) + drag should move the object (ie. stretch the spring)
     * - wobble on accelerometer > mini-shake
     */

    imageNode.style.left = 0;
    imageNode.style.top = 0;
    status = true;
  }

  if (status) {
    console.log("ready");
  }
  else {
    console.warn("WARNING: UNABLE TO BIND EVENT HANDLER");
  }

});