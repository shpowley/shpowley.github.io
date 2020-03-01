/* global Phaser */
var
  CONST = {},

  RESOURCE = {
    resource_1: {
      id: "resource_1",
      location: "",
      obj: null
    }
  },

  SETTINGS = {
    DEBUG: false,

    DYNAMIC_ASPECT_RATIO: true,
    STRETCH_TO_WINDOW: true,

    SCREEN: {
      WIDTH: 640,
      HEIGHT: 480,
      MIN_WIDTH: 160,
      MIN_HEIGHT: 120
    }
  },

  MAIN = (function() {
    /*
    function _loadAudio(state, resource) {
      state.load.audio(resource.id, resource.location);
    }

    function _loadFont(state, resource) {
      state.load.bitmapFont(resource.id, resource.location, resource.xml);
    }

    function _loadImage(state, resource) {
      state.load.image(resource.id, resource.location);
    }
    */

    function _scaleCanvas() {
      if (SETTINGS.DYNAMIC_ASPECT_RATIO) {
        var
          height = SETTINGS.SCREEN.HEIGHT,
          width = SETTINGS.SCREEN.WIDTH,
          min_width = SETTINGS.SCREEN.MIN_WIDTH;

        // DESKTOP: ADJUST CANVAS DIMENSIONS TO MATCH SCREEN ASPECT RATIO; CONSTRAIN TO EXISTING HEIGHT
        if (_GAME.device.desktop)
          width = Math.round(height * screen.availWidth / screen.availHeight);

        // MOBILE: RESIZE TO MATCH DEVICE "PIXEL" WIDTH/HEIGHT
        else {
          width = document.body.clientWidth;
          height = document.body.clientHeight;
        }

        // RESIZE CANVAS WIDTH/HEIGHT
        _GAME.scale.setGameSize(width, height);

        // SCALE
        min_width = Math.round(SETTINGS.SCREEN.MIN_HEIGHT * width / height);
      }

      _GAME.scale.setMinMax(min_width, SETTINGS.SCREEN.MIN_HEIGHT);
      _GAME.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      _GAME.scale.refresh();
    }

    function _start() {
      window.removeEventListener("load", _start, false);

      /* DEFAULT TO GAME RESIZEABLE TO CONTAINER / BROWSER WINDOW */
      if (SETTINGS.STRETCH_TO_WINDOW)
        _scaleCanvas();

      /**
       * USE ONE OR MORE OF THE FOLLOWING FOR BETTER LARGE PIXEL RENDERING
       * - .setImageRenderingCrisp
       * - renderSession.roundPixels
       * - turn off game antialiasing */
      // Phaser.Canvas.setImageRenderingCrisp(_GAME.canvas);
      // _GAME.renderer.renderSession.roundPixels = true;

      /** STATES: http://phaser.io/docs/2.4.7/Phaser.State.html */
      _GAME.state.add(_STATES.BOOT.ID, _STATES.BOOT);
      _GAME.state.add(_STATES.PRELOAD.ID, _STATES.PRELOAD);
      _GAME.state.add(_STATES.SPLASH.ID, _STATES.SPLASH);
      _GAME.state.add(_STATES.MENU.ID, _STATES.MENU);
      _GAME.state.start(_STATES.BOOT.ID);
    }

    var
      /** new Game(WIDTH, HEIGHT, renderer, parent, state, transparent, antialias, physicsConfig) */
      _GAME = new Phaser.Game(SETTINGS.SCREEN.WIDTH, SETTINGS.SCREEN.HEIGHT, Phaser.AUTO),
      _R = RESOURCE,

      /** STATE TEMPLATE VARIABLES
       *  - OBJECT LITERALS FOR GROUPS, SPRITES, ETC.
       *  - USE ALL CAPS FOR SINGULAR VARIABLES
       */
      /*
        GROUPS: {},
        SPRITES: {},
        TEXT: {},
        TIMERS: {},
       */

      _STATES = {
        BOOT: {
          ID: "BOOT",

          /** BUILT-IN STATE FUNCTIONS */
          init: null,
          preload: null,
          create: null,
          update: null

          /** CUSTOM STATE FUNCTIONS */
        },

        PRELOAD: {
          ID: "PRELOAD",

          /** BUILT-IN STATE FUNCTIONS */
          init: null,
          preload: null,
          create: null,
          update: null

          /** CUSTOM STATE FUNCTIONS */
        },

        SPLASH: {
          ID: "SPLASH",

          /** BUILT-IN STATE FUNCTIONS */
          init: null,
          preload: null,
          create: null,
          update: null

          /** CUSTOM STATE FUNCTIONS */
        },

        MENU: {
          ID: "MENU",

          /** BUILT-IN STATE FUNCTIONS */
          init: null,
          preload: null,
          create: null,
          update: null

          /** CUSTOM STATE FUNCTIONS */
        }
      };

    return {
      start: _start
    };
  })();

window.addEventListener("load", MAIN.start, false);