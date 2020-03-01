/* global Phaser */
var
  CONST = {
    SCREEN: {
      WIDTH: 800,
      HEIGHT: 600
    }
  },

  RESOURCE = {
    PIGGLY_SPRITESHEET: {
      id: "PIGGLY_SPRITESHEET",
      location: "/wiggly/svg-sheet/piggly-wiggly-sheet-min.svg",
      json: "/wiggly/svg-sheet/piggly-wiggly-sheet.json"
    }
  },

  MAIN = (function() {
    function _scaleCanvas() {
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
      _GAME.scale.setMinMax(CONST.SCREEN.WIDTH, CONST.SCREEN.HEIGHT);
      _GAME.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      _GAME.scale.refresh();
    }

    function _start() {
      /* DEFAULT TO GAME RESIZEABLE TO CONTAINER / BROWSER WINDOW */
      _scaleCanvas();

      /** STATES: http://phaser.io/docs/2.4.7/Phaser.State.html */
      _GAME.state.add(_STATES.TEST.id, _STATES.TEST);
      _GAME.state.start(_STATES.TEST.id);
    }

    var
      /** new Game(WIDTH, HEIGHT, renderer, parent, state, transparent, antialias, physicsConfig) */
      _GAME = new Phaser.Game(CONST.SCREEN.WIDTH, CONST.SCREEN.HEIGHT, Phaser.CANVAS, null, null, true),
      _R = RESOURCE,

      _STATES = {
        TEST: {
          id: "TEST",

          /** BUILT-IN STATE FUNCTIONS */
          preload: function() {
            _GAME.load.atlas(_R.PIGGLY_SPRITESHEET.id, _R.PIGGLY_SPRITESHEET.location, _R.PIGGLY_SPRITESHEET.json, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
          },

          create: function() {
            // shadows: x: -16, y: -16, w: +32, h: +32
            var
              shadow_offset = {
                x: 6,
                y: 6
              },

              group = _GAME.add.group(),
              // sprite_shadow = _GAME.add.image(_GAME.world.centerX + shadow_offset.x, _GAME.world.centerY + shadow_offset.y, _R.PIGGLY_SPRITESHEET.id, "PIGGLY_STICKER_SHADOW", group),
              sprite = _GAME.add.image(_GAME.world.centerX, _GAME.world.centerY, _R.PIGGLY_SPRITESHEET.id, "REGISTERED_RED", group);

            // sprite_shadow.anchor.setTo(0.5);
            sprite.anchor.setTo(0.5);
            group.alpha = 0;

            /* SCALE INDIVIDUAL SPRITES IN THE GROUP INSTEAD OF THE GROUP ITSELF TO MAINTAIN ANCHOR */
            // sprite_shadow.scale.setTo(0.5);
            // sprite.scale.setTo(0.5);

            _GAME.make.tween(group).to({ alpha: 1 }, 500, Phaser.Easing.Linear.None, true, 0);
          }
        }
      };

    return {
      start: _start
    };
  })();

window.addEventListener("load", function() {
  MAIN.start();
});