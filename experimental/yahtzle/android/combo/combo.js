/**
 * COMBINED TEST: TOUCH + ANIMATION
 * - notes:
 *   - chrome://inspect
 *   - window.devicePixelRatio (1 - desktop, 2 - moto g)
 *   - x.style.transform = "scale(0.5)"
 *   - x.style.transform = null (remove a style)
 *   - screen.width/height (device)
 *   - window.outerWidth/outerHeight (window + scrollbars + menu)
 *   - window.innerWidth/innerHeight (visible window only)
 *   - window.matchMedia (CSS media queries from script)
 *   - http://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-mobile-device-in-jquery
 *   - recommended resolution: 320x480
 *
 * - dynamically create canvas layers based on resolution / aspect ratio
 *   - min/max resolution
 *
 * x determine horizontal / vertical centers for positioning
 * - full screen / auto-resize (re-usable template)
 *
 * - 2 decks, 1 top (starting position) and 1 bottom (end position)
 *   - top cards are face up
 *   - tap / click tops cards results in it moving to the other deck
 *
 * - hit box areas
 * - animation
 *
 * additional
 * - sound
 * ? try to put place code into common js
 * - REMEMBER spritesheet version & cache vs download
 *
 * TODO
 * - animate to bottom deck
 * - ..
 */

// if (obj.canvas.requestFullscreen)
//   obj.canvas.requestFullscreen();
// else if (obj.canvas.webkitRequestFullscreen)
//   obj.canvas.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);

/* global UTIL CANVAS SPRITES CARD_SPRITES ANIMATION_TIMER ANIMATION */
var
  $id = document.getElementById.bind(document),
  $create = document.createElement.bind(document),
  _resize_timer, // window resize "debounce" timer

  CONST = {
    CANVAS: ["canvas-0", "canvas-1"],

    // reference card dimensions
    CARDS: {
      width: null,
      height: null,

      // TODO - move somewhere else..
      position_start: {
        x: null,
        y: null
      },

      position_end: {
        x: null,
        y: null
      },

      edge_offset: 3
    },

    // recommended(?): w: 480, h: 320
    DESKTOP: {
      width: 720,
      height: 480
    },

    PIXEL_RATIO: 1,

    // reference canvas dimensions
    // - set during _initCanvases()
    REFERENCE: {
      width: null,
      height: null,

      h_center: null,
      v_center: null
    }
  },

  CALLBACKS = (function() {
    function _cardSheetLoaded() {
      // use a random card from the ref canvas and use it's dimensions for reference values
      var
        card = CARD_SPRITES.getCardMap("AD"),
        canvas_0 = CANVAS.LIBRARY[CONST.CANVAS[0]],
        canvas_1 = CANVAS.LIBRARY[CONST.CANVAS[1]];

      CONST.CARDS.width = card.w;
      CONST.CARDS.height = card.h;

      // position for starting and end decks
      CONST.CARDS.position_start.x = CONST.CARDS.position_end.x = CONST.REFERENCE.h_center - CONST.CARDS.width / 2;
      CONST.CARDS.position_start.y = CONST.CARDS.edge_offset;
      CONST.CARDS.position_end.y = CONST.REFERENCE.height - CONST.CARDS.height - CONST.CARDS.edge_offset;

      // initialize canvas' hit zone measurements
      CANVAS.updateHitzones();

      canvas_0.addHitzone("start-deck", CONST.CARDS.position_start.x, CONST.CARDS.position_start.y, CONST.CARDS.width, CONST.CARDS.height);
      canvas_0.addHitzone("end-deck", CONST.CARDS.position_end.x, CONST.CARDS.position_end.y, CONST.CARDS.width, CONST.CARDS.height);
      canvas_0.addEntity("card-move", CARD_SPRITES.SHEET_ID, "AD", CONST.CARDS.position_start.x, CONST.CARDS.position_start.y);
      canvas_1.addEntity("card-ref", CARD_SPRITES.SHEET_ID, "JD", CONST.CARDS.position_end.x, CONST.CARDS.position_end.y);

      ANIMATION.addTween({
        id: "tween-test",
        entity: canvas_0.entities["card-move"],
        end_pos: { x: CONST.CARDS.position_end.x, y: CONST.CARDS.position_end.y },
        duration: 350
      }, _easing);

      // TODO - later, draw() methods should be moved to a draw timer
      // CARD_SPRITES.draw(CONST.CANVAS[0], "AD", CONST.CARDS.position_start.x, CONST.CARDS.position_start.y);
      // CARD_SPRITES.draw(CONST.CANVAS[0], "KD", CONST.CARDS.position_end.x, CONST.CARDS.position_end.y);
    }

    function _clickScreen(e) {
      var
        canvas_0 = CANVAS.LIBRARY[CONST.CANVAS[0]],
        result,

        point = {
          x: e.pageX,
          y: e.pageY
        };

      result = canvas_0.hitTest(point, "start-deck");

      if (result) {
        ANIMATION.init();
        ANIMATION_TIMER.run(_gameLoop, _animationComplete, Infinity, 60);

        // ANIMATION_TIMER.run(_animationFrame, _animationComplete, Infinity, 60);
      }
    }

    function _gameLoop() {
      ANIMATION.update();
      ANIMATION.render(_gameLoopComplete);
    }

    function _gameLoopComplete() {
      ANIMATION_TIMER.stop();
    }

    // tween: position_start, position_end, duration / velocity
    // t = accumulated time
    // b = v_start
    // c = y_end - y_start
    // d = total time = |c / v_linear|

    // @t is the current time (or position) of the tween. This can be seconds or frames, steps, seconds, ms, whatever – as long as the unit is the same as is used for the total time [3].
    // @b is the beginning value of the property.
    // @c is the change between the beginning and destination value of the property.
    // @d is the total time of the tween.
    function _easing(t, b, c, d) {
      return c*((t=t/d-1)*t*t*t*t + 1) + b;
    }

    // v = dx / dt ==> dx = v * dt
    // - linear velocity: v (constant), dt = timer.delta

    function _animationComplete() {
      console.log("ANIMATION COMPLETE");
    }

    return {
      cardSheetLoaded: _cardSheetLoaded,
      clickScreen: _clickScreen
    };
  })(),

  DOM = (function() {
    function _bindElements() {
      DOM.DIV_DRAW = _div_draw = $id("div-draw");
    }

    function _initialize() {
      _bindElements();
      _initCanvases();

      _div_draw.appendChild(_canvas_0);
      _div_draw.appendChild(_canvas_1);
      _div_draw.hidden = false;
    }

    // initialize the stacked canvas elements
    // - scaling default canvases 50%
    function _initCanvases() {
      var
        obj_0 = CANVAS.add(CONST.CANVAS[0], null, CANVAS.TYPES.DOM_ELEMENT),
        obj_1 = CANVAS.add(CONST.CANVAS[1], null, CANVAS.TYPES.DOM_ELEMENT);

      _canvas_0 = obj_0.canvas,
      _canvas_0.id = CONST.CANVAS[0];
      _canvas_0.style.zIndex = 10;
      obj_0.ctx.imageSmoothingEnabled = false;

      _canvas_1 = obj_1.canvas;
      _canvas_1.id = CONST.CANVAS[1];
      _canvas_1.style.zIndex = 9;
      obj_1.ctx.imageSmoothingEnabled = false;

      // canvas adjustment for mobile environment
      if (UTIL.isMobile()) {
        CONST.PIXEL_RATIO = window.devicePixelRatio;

        if (CONST.PIXEL_RATIO === 1) {
          CONST.REFERENCE.height = _canvas_0.height = _canvas_1.height = window.innerHeight * 2;
          CONST.REFERENCE.width = _canvas_0.width = _canvas_1.width = window.innerWidth * 2;
        }

        // crisper graphics if scaled down to device
        else {
          CONST.REFERENCE.height = _canvas_0.height = _canvas_1.height = window.innerHeight * CONST.PIXEL_RATIO;
          CONST.REFERENCE.width = _canvas_0.width = _canvas_1.width = window.innerWidth * CONST.PIXEL_RATIO;
        }
      }

      // desktop environment
      else {
        document.body.classList.add("desktop");

        CONST.REFERENCE.height = _canvas_0.height = _canvas_1.height = CONST.DESKTOP.height * 2;
        CONST.REFERENCE.width = _canvas_0.width = _canvas_1.width = CONST.DESKTOP.width * 2;
      }

      // set reference measurements
      CONST.REFERENCE.h_center = CONST.REFERENCE.width / 2;
      CONST.REFERENCE.v_center = CONST.REFERENCE.height / 2;

      if (CONST.PIXEL_RATIO === 1) {
        _canvas_0.style.transformOrigin = _canvas_1.style.transformOrigin = "0 0";
        _canvas_0.style.transform = _canvas_1.style.transform = "scale(0.5)";

        _div_draw.style.width = _canvas_0.width / 2 + "px";
        _div_draw.style.height = _canvas_0.height / 2 + "px";
      }
      else {
        _canvas_0.style.transformOrigin = _canvas_1.style.transformOrigin = "0 0";
        _canvas_0.style.transform = _canvas_1.style.transform = "scale(" + 1 / CONST.PIXEL_RATIO + ")";

        _div_draw.style.width = _canvas_0.width / CONST.PIXEL_RATIO + "px";
        _div_draw.style.height = _canvas_0.height / CONST.PIXEL_RATIO + "px";
      }
    }

    var
      _canvas_0, _canvas_1,
      _div_draw;

    return {
      // functions
      initialize: _initialize,

      // dom elements
      CANVAS_0: _canvas_0,
      CANVAS_1: _canvas_1,
      DIV_DRAW: _div_draw
    };
  })();

window.addEventListener("load", function() {
  DOM.initialize();
  DOM.DIV_DRAW.addEventListener("click", CALLBACKS.clickScreen);
  CARD_SPRITES.initialize(CALLBACKS.cardSheetLoaded);


  // x.style.width = window.innerWidth + "px";
  // x.style.height = window.innerHeight + "px";
  // x.hidden = false;

  // console.log(
  //   "screen:" +
  //   "\n  width = " + screen.width +
  //   "\n  height = " + screen.height);

  // console.log(
  //   "window:" +
  //   "\n  width = " + window.outerWidth +
  //   "\n  height = " + window.outerHeight);

  // if (screen.width > screen.height)
  //   console.log("orientation: landscape");
  // else
  //   console.log("orientation: portrait");

  // console.log(navigator.userAgent);
  // console.log(navigator.platform);
});

// update canvas hitzones
// - resize_timer helps "debounce" the resize event, which otherwise triggers numerous times
// - TODO: resize might affect canvas entity measurements, if canvases are scaled; not sure yet
window.addEventListener("resize", function() {
  if (_resize_timer) clearTimeout(_resize_timer);

  _resize_timer = setTimeout(CANVAS.updateHitzones, 300);
});