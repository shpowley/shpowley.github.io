// TODO
// - incorporate shuffled top deck from yahtzle.js
// - get it to work in android webview
// recommended 768x512

/* global Phaser YAHTZLE UTIL */
var
  $id = document.getElementById.bind(document),

  // card info
  CARDS = {
    // image relative location
    LOCATION: "images/cards_05.png",

    // dimensions
    // - _scale dimensions set in code
    SCALE: 0.7,
    w: 112,
    h: 162,
    w_scale: 0,
    h_scale: 0,

    // tween info
    TWEEN_SPEED: 550,
    EASING: Phaser.Easing.Quintic.Out,

    // "keys" and corresponding spritesheet index
    AC: 0,
    TC: 1,
    KC: 2,
    QC: 3,
    JC: 4,
    "9C": 5,
    AD: 6,
    TD: 7,
    KD: 8,
    QD: 9,
    JD: 10,
    "9D": 11,
    AS: 12,
    TS: 13,
    KS: 14,
    QS: 15,
    JS: 16,
    "9S": 17,
    AH: 18,
    TH: 19,
    KH: 20,
    QH: 21,
    JH: 22,
    "9H":23,
    CARD_BACK: 24
  },

  CONST = {
    DECK: {
      BOTTOM: {
        x: null,
        y: null
      },

      TOP: {
        x: null,
        y: null
      }
    },

    DEBUG: true,
    DEBUG_SHOW_HITZONES: false,

    // default values are for desktop, modified to match screen size if mobile
    SCREEN: {
      w: 960,
      h: 640,
      w_min: 768,
      h_min: 512
    }
  },

  GAME = (function() {
    /* BUILT-IN PHASER FUNCTIONS */
    function _create() {
      var
        _deck = YAHTZLE.DECK,
        _cards = _deck.CARDS,
        _sprite;

      /* CANVAS SCALING */
      // USER-SPECIFIED %
      // _GAME.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
      // _GAME.scale.setUserScale(1.4, 1.4);

      // EXACT FIT TO PARENT
      // _GAME.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
      // _GAME.scale.setExactFit();

      if (_GAME.device.desktop) {
        // STRETCH PROPORTIONALLY TO FIT CONTAINER
        _GAME.scale.setMinMax(CONST.SCREEN.w_min, CONST.SCREEN.h_min);
        _GAME.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        _GAME.scale.setShowAll();

        _GAME.scale.refresh();
      }

      // _GAME.scale.fullScreenScaleMode = Phaser.ScaleManager.RESIZE;
      // _GAME.stage.backgroundColor = "#269069";

      CONST.DECK.TOP.x = CONST.DECK.BOTTOM.x = _GAME.world.centerX - CARDS.w_scale / 2;
      CONST.DECK.TOP.y = 0;
      CONST.DECK.BOTTOM.y = _GAME.world.height - CARDS.h_scale;

      // hit zones
      _hit_zone_top = new Phaser.Rectangle(CONST.DECK.TOP.x, CONST.DECK.TOP.y, CARDS.w_scale, CARDS.h_scale);
      _hit_zone_bottom = new Phaser.Rectangle(CONST.DECK.BOTTOM.x, CONST.DECK.BOTTOM.y, CARDS.w_scale, CARDS.h_scale);

      // groups
      _group_top = _GAME.add.group();
      _group_bottom = _GAME.add.group();
      _group_moving = _GAME.add.group();

      // yahtzle cards
      _deck.initialize();
      _deck.shuffle();

      // create interactive card sprites
      for (var i = 0, l = _cards.length; i < l; i++) {
        _sprite = _group_top.create(CONST.DECK.TOP.x, 0, "cards", CARDS[_cards[i].code]);
        _sprite.scale.setTo(CARDS.SCALE, CARDS.SCALE);
        _sprite.smoothed = true;
      }

      // user click-event handler
      _GAME.input.onDown.add(_pointerDown);

      // $id("div-game").hidden = false;
    }

    function _init() {
      var
        screen_w = CONST.SCREEN.w,
        screen_h = CONST.SCREEN.h;

      if (UTIL.isMobile()) {
        CONST.SCREEN.w = screen_w = window.innerWidth;
        CONST.SCREEN.h = screen_h = window.innerHeight;
        CARDS.SCALE = 0.5;
      }

      CARDS.w_scale = CARDS.w * CARDS.SCALE;
      CARDS.h_scale = CARDS.h * CARDS.SCALE;

      // http://phaser.io/docs/2.4.4/Phaser.Game.html
      // - height / width % don't seem to work well in containers 2.4.4
      _GAME = new Phaser.Game(
        screen_w, // width
        screen_h, // height
        // Phaser.Auto, // auto webgl->canvas
        Phaser.CANVAS, // auto webgl->canvas
        // Phaser.WEBGL, // auto webgl->canvas

        null, // parent dom element
        // "div-game", // parent dom element

        // phaser state functions
        {
          create: _create,
          preload: _preload,
          render: _render,
          update: _update
        },

        true, // transparent
        false  // antialias
      );
    }

    function _preload() {
      _GAME.load.spritesheet("cards", CARDS.LOCATION, CARDS.w, CARDS.h);

      if (CONST.DEBUG)
        _GAME.time.advancedTiming = true;
    }

    function _render() {
      if (CONST.DEBUG) {
        if (CONST.DEBUG_SHOW_HITZONES) {
          _GAME.debug.geom(_hit_zone_top, "rgba(134, 244, 255, 0.6)");
          _GAME.debug.geom(_hit_zone_bottom, "rgba(134, 244, 255, 0.6)");
        }

        _GAME.debug.text(_GAME.time.fps + " fps", 10, 20, "#000000");
      }
    }

    function _update() {
    }

    /* CUSTOM FUNCTIONS */
    function _pointerDown(pointer) {
      var
        _card_moving;

      // check top deck hit zone
      if (_group_top.total && !_tween_to_top && _hit_zone_top.contains(pointer.x, pointer.y)) {
        _card_moving = _group_top.getTop();
        _group_moving.addChild(_group_top.removeChild(_card_moving));
        _tween_to_bottom = _GAME.make.tween(_card_moving).to({x: CONST.DECK.BOTTOM.x, y: CONST.DECK.BOTTOM.y}, CARDS.TWEEN_SPEED, CARDS.EASING);
        _tween_to_bottom.onComplete.addOnce(_tweenToBottomComplete, this);
        _tween_to_bottom.start();
      }

      // check bottom deck hit zone
      else if (_group_bottom.total && !_tween_to_bottom && _hit_zone_bottom.contains(pointer.x, pointer.y)) {
        _card_moving = _group_bottom.getTop();
        _group_moving.addChild(_group_bottom.removeChild(_card_moving));
        _tween_to_top = _GAME.make.tween(_card_moving).to({x: CONST.DECK.BOTTOM.x, y: CONST.DECK.TOP.y}, CARDS.TWEEN_SPEED, CARDS.EASING);
        _tween_to_top.onComplete.addOnce(_tweenToTopComplete, this);
        _tween_to_top.start();
      }
    }

    function _tweenToBottomComplete() {
      var
        _card_moving = _group_moving.getBottom();

      // console.log("CARD MOVED TO BOTTOM - COMPLETE");
      _GAME.tweens.remove(_card_moving);
      _group_bottom.addChild(_group_moving.removeChild(_card_moving));

      if (_group_moving.total === 0)
        _tween_to_bottom = null;
    }

    function _tweenToTopComplete() {
      var
        _card_moving = _group_moving.getBottom();

      // console.log("CARD MOVED TO TOP - COMPLETE");
      _GAME.tweens.remove(_card_moving);
      _group_top.addChild(_group_moving.removeChild(_card_moving));

      if (_group_moving.total === 0)
        _tween_to_top = null;
    }

    var
      _GAME,

      // groups - groups have display precedence
      _group_top, // top deck
      _group_bottom, // bottom deck
      _group_moving, // contains card moving

      _hit_zone_top, _hit_zone_bottom, // hit zones
      _tween_to_bottom, _tween_to_top;

    return {
      init: _init
    };
  })();

window.addEventListener("load", function() {
  GAME.init();
});