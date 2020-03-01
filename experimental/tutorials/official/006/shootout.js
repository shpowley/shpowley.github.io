/* global Phaser */
var
  CONST = {
    SCREEN: {
      WIDTH: 640,
      HEIGHT: 480,
      MIN_WIDTH: 320,
      MIN_HEIGHT: 240
    }
  },

  RESOURCE = {
    logo: {
      id: "logo",
      location: "assets/photonstorm.png"
    },

    preload: {
      id: "preload",
      location: "assets/preload.png"
    },

    standoff: {
      id: "standoff",
      location: "assets/standoff.png"
    },

    win: {
      id: "win",
      location: "assets/win.png"
    },

    lose: {
      id: "lose",
      location: "assets/lose.png"
    },

    draw: {
      id: "draw",
      location: "assets/draw.png"
    },

    font: {
      id: "font",
      location: "assets/font.png",
      xml: "assets/font.xml"
    },

    casing: {
      id: "casing",
      location: "assets/casing.mp3"
    },

    fire: {
      id: "fire",
      location: "assets/fire.mp3"
    },

    reload: {
      id: "reload",
      location: "assets/reload.mp3"
    },

    splat: {
      id: "splat",
      location: "assets/splat.mp3"
    },

    walk: {
      id: "walk",
      location: "assets/walk.mp3"
    },
  },

  SETTINGS = {
    DEBUG: false,

    DYNAMIC_ASPECT_RATIO: false,
    STRETCH_TO_WINDOW: true
  },

  SHOOTOUT = (function() {
    function _loadAudio(state, resource) {
      state.load.audio(resource.id, resource.location);
    }

    function _loadFont(state, resource) {
      state.load.bitmapFont(resource.id, resource.location, resource.xml);
    }

    function _loadImage(state, resource) {
      state.load.image(resource.id, resource.location);
    }

    function _scaleCanvas() {
      if (SETTINGS.DYNAMIC_ASPECT_RATIO) {
        var
          canvas_height = CONST.SCREEN.HEIGHT,
          canvas_width = CONST.SCREEN.WIDTH;

        // DESKTOP: ADJUST CANVAS DIMENSIONS TO MATCH SCREEN ASPECT RATIO; CONSTRAIN TO EXISTING HEIGHT
        if (_GAME.device.desktop)
          canvas_width = CONST.SCREEN.WIDTH = Math.round(CONST.SCREEN.HEIGHT * screen.availWidth / screen.availHeight);

        // MOBILE: RESIZE TO MATCH DEVICE "PIXEL" WIDTH/HEIGHT
        else {
          canvas_width = CONST.SCREEN.WIDTH = document.body.clientWidth;
          canvas_height = CONST.SCREEN.HEIGHT = document.body.clientHeight;
        }

        // RESIZE CANVAS WIDTH/HEIGHT
        _GAME.scale.setGameSize(canvas_width, canvas_height);

        // SCALE
        CONST.SCREEN.MIN_WIDTH = Math.round(CONST.SCREEN.MIN_HEIGHT * CONST.SCREEN.WIDTH / CONST.SCREEN.HEIGHT);
      }

      _GAME.scale.setMinMax(CONST.SCREEN.MIN_WIDTH, CONST.SCREEN.MIN_HEIGHT);
      _GAME.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      _GAME.scale.refresh();
    }

    function _start() {
      window.removeEventListener("load", _start, false);

      /* DEFAULT TO GAME RESIZEABLE TO CONTAINER / BROWSER WINDOW */
      if (SETTINGS.STRETCH_TO_WINDOW)
        _scaleCanvas();

      _GAME.state.add(_STATES.BOOT.ID, _STATES.BOOT);
      _GAME.state.add(_STATES.PRELOAD.ID, _STATES.PRELOAD);
      _GAME.state.add(_STATES.GAME.ID, _STATES.GAME);
      _GAME.state.start(_STATES.BOOT.ID);
    }

    var
      /** new Game(WIDTH, HEIGHT, renderer, parent, state, transparent, antialias, physicsConfig) */
      _GAME = new Phaser.Game(CONST.SCREEN.WIDTH, CONST.SCREEN.HEIGHT, Phaser.AUTO),
      _R = RESOURCE,

      MODES = {
        INTRO: 0,
        PACING: 1,
        SHOOTING: 2,
        OUTCOME: 3
      },

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
          preload: function() {
            _loadImage(this, _R.logo);
            _loadImage(this, _R.preload);
          },

          create: function() {
            this.input.maxPointers = 1;
            this.state.start(_STATES.PRELOAD.ID);
          }
        },

        PRELOAD: {
          ID: "PRELOAD",
          READY: false,

          SPRITES: {
            logo: null,
            preload_bar: null
          },

          /** BUILT-IN STATE FUNCTIONS */
          preload: function() {
            this.SPRITES.logo = this.add.sprite(265, 400, _R.logo.id);
            this.SPRITES.preload_bar = this.add.sprite(120, 260, _R.preload.id);

            this.load.setPreloadSprite(this.SPRITES.preload_bar);

            _loadImage(this, _R.standoff);
            _loadImage(this, _R.win);
            _loadImage(this, _R.lose);
            _loadImage(this, _R.draw);

            _loadFont(this, _R.font);

            _loadAudio(this, _R.casing);
            _loadAudio(this, _R.fire);
            _loadAudio(this, _R.reload);
            _loadAudio(this, _R.splat);
            _loadAudio(this, _R.walk);
          },

          update: function() {
            if (!this.READY) {
              if (
                this.cache.isSoundDecoded(_R.casing.id) &&
                this.cache.isSoundDecoded(_R.fire.id) &&
                this.cache.isSoundDecoded(_R.reload.id) &&
                this.cache.isSoundDecoded(_R.splat.id) &&
                this.cache.isSoundDecoded(_R.walk.id))
              {
                this.READY = true;
                this.state.start(_STATES.GAME.ID);
              }
            }
          }
        },

        GAME: {
          ID: "GAME",

          COWBOY_DEAD: false,
          MODE: MODES.INTRO,
          PACE: 1,
          SHOT_AT: 0,

          REACTION_TIME: {
            MIN: 100,
            MAX: 500
          },

          SPRITES: {
            cowboy: null,
            draw: null
          },

          TEXT: {
            help: null,
            pace: null
          },

          TIMERS: {
            cowboy: null,
            pace: null
          },

          /** BUILT-IN STATE FUNCTIONS */
          create: function() {
            this.SPRITES.cowboy = this.add.sprite(0, 0, _R.standoff.id);
            this.SPRITES.draw = this.add.sprite(0, 0, _R.draw.id);
            this.SPRITES.draw.visible = false;

            this.TEXT.help = this.add.bitmapText(630, 404, _R.font.id, "After 10 paces\nclick to shoot.\nBut only when he says Draw", 16);
            this.TEXT.help.align = "right";

            this.MODE = MODES.INTRO;
            this.input.onDown.add(this.onDown, this);
          },

          preRender: function() {
            if (this.TEXT.help)
              this.TEXT.help.pivot.x = this.TEXT.help.textWidth;
          },

          /** CUSTOM STATE FUNCTIONS */
          cheat: function() {
            this.youWin(true);
          },

          heShoots: function() {
            if (!this.COWBOY_DEAD) {
              this.sound.play(_R.fire.id);
              this.youLose();
            }
          },

          onDown: function(pointer) {
            // IN CASE USER CLICKS TO SHOOT THE MOMENT AFTER THEY WERE KILLED
            if (this.time.time - this.SHOT_AT < 250)
              return;

            switch(this.MODE) {
              case MODES.INTRO:
                this.start();
                break;

              case MODES.PACING:
                this.cheat();
                break;

              case MODES.SHOOTING:
                this.shoot();
                break;

              case MODES.OUTCOME:
                this.restart();
            }
          },

          playSplat: function() {
            this.sound.play(_R.splat.id);
          },

          restart: function() {
            this.MODE = MODES.INTRO;
            this.SPRITES.cowboy.loadTexture(_R.standoff.id);

            this.TIMERS.cowboy = null;
            this.COWBOY_DEAD = false;

            this.TIMERS.pace = null;
            this.TEXT.pace = null;
            this.PACE = 1;

            this.SHOT_AT = 0;
            this.TEXT.help.text = "After 10 paces\nclick to shoot.\nBut only when he says Draw";

            this.sound.play(_R.reload.id);
          },

          shoot: function() {
            if (this.TIMERS.cowboy.running)
              this.youWin(false);
          },

          start: function() {
            this.MODE = MODES.PACING;
            this.TEXT.help.visible = false;

            this.TEXT.pace = this.add.bitmapText(480, 390, _R.font.id, "1", 64);

            // 10 PACES TIMER
            this.TIMERS.pace = this.time.create(false);
            this.TIMERS.pace.repeat(500, 10, this.stepAway, this);
            this.TIMERS.pace.start();

            this.sound.play(_R.walk.id);
          },

          startDraw: function() {
            var reaction_time = this.rnd.between(this.REACTION_TIME.MIN, this.REACTION_TIME.MAX);

            this.MODE = MODES.SHOOTING;
            this.SPRITES.draw.visible = true;

            this.TIMERS.cowboy = this.time.create(false);
            this.TIMERS.cowboy.add(reaction_time, this.heShoots, this);
            this.TIMERS.cowboy.start();
          },

          stepAway: function() {
            this.PACE++;

            if (this.PACE <= 10)
              this.TEXT.pace.text = this.PACE;

            else {
              var delay = this.rnd.between(500, 3000);

              this.TEXT.pace.visible = false;
              this.time.events.add(delay, this.startDraw, this);
            }
          },

          youLose: function() {
            this.MODE = MODES.OUTCOME;
            this.SPRITES.draw.visible = false;

            this.sound.play(_R.casing.id);
            this.time.events.add(500, this.playSplat, this);

            this.TEXT.help.text = "He draws ...\nand shoots.\nYou are dead!";
            this.TEXT.help.visible = true;

            this.SPRITES.cowboy.loadTexture(_R.lose.id);
            this.SHOT_AT = this.time.time;
            this.TIMERS.cowboy.stop();
          },

          youWin: function(cowardly) {
            this.MODE = MODES.OUTCOME;
            this.SPRITES.draw.visible = false;
            this.TEXT.pace.visible = false;

            this.sound.play(_R.fire.id);
            this.sound.play(_R.casing.id);

            this.time.events.add(500, this.playSplat, this);

            if (cowardly)
              this.TEXT.help.text = "You shoot first.\nYou killed him!\nBut what a cowardly victory.";

            else {
              // HOW MUCH TIME DID THE COWBOY HAVE LEFT
              if (this.TIMERS.cowboy.duration < 100)
                this.TEXT.help.text = "He draws ...\nBut you shoot first (just!)\nYou killed him!";
              else
                this.TEXT.help.text = "He draws ...\nBut you shoot first.\nYou killed him!";
            }

            this.TEXT.help.visible = true;
            this.SPRITES.cowboy.loadTexture(_R.win.id);
            this.TIMERS.pace.stop();
            this.SHOT_AT = this.time.time;

            if (this.TIMERS.cowboy)
              this.TIMERS.cowboy.stop();
          }
        }
      };

    return {
      start: _start
    };
  })();

window.addEventListener("load", SHOOTOUT.start, false);