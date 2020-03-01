/* global Phaser */
var
  RESOURCE = {
    shmupfont: {
      id: "shmupfont",
      location: "assets/shmupfont.png",
      xml: "assets/shmupfont.xml"
    }
  },

  SETTINGS = {
    DEBUG: false,

    DYNAMIC_ASPECT_RATIO: false,
    STRETCH_TO_WINDOW: true,

    SCREEN: {
      WIDTH: 640,
      HEIGHT: 480,
      MIN_WIDTH: 160,
      MIN_HEIGHT: 120
    }
  },

  MAIN = (function() {
    function _loadFont(state, resource) {
      state.load.bitmapFont(resource.id, resource.location, resource.xml);
    }

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
      _GAME.renderer.renderSession.roundPixels = true;

      _GAME.state.add(_STATES.MOTION.ID, _STATES.MOTION);
      _GAME.state.start(_STATES.MOTION.ID);
    }

    var
      /** new Game(WIDTH, HEIGHT, renderer, parent, state, transparent, antialias, physicsConfig) */
      _GAME = new Phaser.Game(SETTINGS.SCREEN.WIDTH, SETTINGS.SCREEN.HEIGHT, Phaser.AUTO),
      _R = RESOURCE,

      MODE = {
        LINEAR: {
          index: 0,
          name: "Linear"
        },

        BEZIER: {
          index: 1,
          name: "Bezier"
        },

        CATMULL_ROM: {
          index: 2,
          name: "Catmull Rom"
        }
      },

      _STATES = {
        MOTION: {
          ID: "MOTION",

          BITMAP_DATA: null,
          MODE: MODE.LINEAR.index,
          MOTION_NAME: null,

          POINTS: {
            x: [32, 128, 256, 384, 512, 608],
            y: [240, 240, 240, 240, 240, 240]
          },

          /** BUILT-IN STATE FUNCTIONS */
          init: function() {
            this.stage.backgroundColor = "#204090";
          },

          preload: function() {
            _loadFont(this, _R.shmupfont);
          },

          create: function() {
            var
              i = 0,
              points_y = this.POINTS.y;

            /* BITMAPDATA OBJECT - MANIPULATED AND DRAWN TO LIKE A TRADITIONAL CANVAS OBJECT AND USED TO TEXTURE SPRITES */
            this.BITMAP_DATA = this.add.bitmapData(_GAME.width, _GAME.height);

            /* CREATES & PLACES NEW PHASER.IMAGE OBJECT USING BITMAPDATA TEXTURE */
            this.BITMAP_DATA.addToWorld();

            for (i = 0; i < points_y.length; i++) {
              points_y[i] = this.rnd.between(32, 432);
            }

            this.MOTION_NAME = this.add.bitmapText(8, 444, _R.shmupfont.id, MODE.LINEAR.name, 24);
            this.input.onDown.add(this.changeMode, this);
            this.plot();
          },

          /** CUSTOM STATE FUNCTIONS */
          changeMode: function() {
            this.MODE++;
            this.MODE %= 3;

            switch (this.MODE) {
              case MODE.LINEAR.index:
                this.MOTION_NAME.text = MODE.LINEAR.name;
                break;

              case MODE.BEZIER.index:
                this.MOTION_NAME.text = MODE.BEZIER.name;
                break;

              case MODE.CATMULL_ROM.index:
              default:
                this.MOTION_NAME.text = MODE.CATMULL_ROM.name;
            }

            this.plot();
          },

          plot: function() {
            var
              i = 0,
              delta_x = 1 / _GAME.width,
              x = 0,
              y = 0,
              CANVAS = this.BITMAP_DATA,
              DATA = this.POINTS;

            CANVAS.clear();

            /* DRAW PATH */
            for (i = 0; i <= 1; i += delta_x) {
              switch (this.MODE) {
                case MODE.LINEAR.index:
                  x = this.math.linearInterpolation(DATA.x, i);
                  y = this.math.linearInterpolation(DATA.y, i);
                  break;

                case MODE.BEZIER.index:
                  x = this.math.bezierInterpolation(DATA.x, i);
                  y = this.math.bezierInterpolation(DATA.y, i);
                  break;

                case MODE.CATMULL_ROM.index:
                default:
                  x = this.math.catmullRomInterpolation(DATA.x, i);
                  y = this.math.catmullRomInterpolation(DATA.y, i);
              }

              CANVAS.rect(x, y, 1, 1, "#FFF");
            }

            /* DRAW DATA POINTS (RED SQUARES */
            for (i = 0; i < DATA.x.length; i++) {
              CANVAS.rect(DATA.x[i] - 3, DATA.y[i] - 3, 6, 6, "#F00");
            }
          }
        }
      };

    return {
      start: _start
    };
  })();

window.addEventListener("load", MAIN.start, false);