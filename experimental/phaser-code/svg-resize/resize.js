/**
 * Dynamic SVG Image Size
 * - this is a test to maintain "crisp" SVG image quality
 *
 * Result:
 * - SVG "crisp" scaling can be accomplished using staging canvas elements in script.
 * - NOTE: SVG scaling with canvas is only necessary when a new game is created using Phaser.WEBGL
 */

/* global Phaser Image */
var
  RESOURCE = {
    logo: {
      id: "logo",
      location: "logo.svg",
      phaser_obj: null
    },

    heart: {
      id: "heart",
      location: "suit-hearts.svg",
      phaser_obj: null
    },

    heart_new: {
      id: "heart_new",
      location: "suit-hearts.svg",
      phaser_obj: null,
      image: null
    },

    card: {
      id: "ace_diamonds",
      location: "card-diamonds-ace.svg",
      phaser_obj: null
    }
  },

  MAIN = (function() {
    /* function wrapper for Phaser game.load.image() */
    /**
     * - SVG-scaling logic implemented only for renderer = WEBGL, where default WEBGL SVG scaling is poor quality
     * - using an intermediate CANVAS element allows for crisp SVG image scaling
     * - falls back to default if renderer = CANVAS or other "fail" condition
     *
     * parameters:
     * - image_resource (REQUIRED): should contain SVG image id + location
     * - scale (OPTIONAL): takes precedence over scale_width and scale_height
     * - scale_width (OPTIONAL)
     * - scale_height (OPTIONAL)
     *
     * NOTE:
     * - .scale.setTo() should only be used for scaling DOWN
     * - scaling UP should ideally be handled in this load/pre-load step to maintain image quality
     */
    function _loadSVG_old(image_resource, scale, scale_width, scale_height) {
      if (_GAME.renderType === Phaser.WEBGL && (scale || scale_width && scale_height)) {
        // INITIALIZE CANVAS
        if (!_CANVAS_SVG.initialized) {
          _CANVAS_SVG.canvas = document.createElement("canvas");

          if (_CANVAS_SVG.canvas.getContext) {
            _CANVAS_SVG.ctx = _CANVAS_SVG.canvas.getContext("2d");
            _CANVAS_SVG.initialized = true;
          }
        }

        if (_CANVAS_SVG.initialized) {
          var image_original = new Image();

          image_original.src = image_resource.location;

          image_original.onload = function() {
            var
              width = scale ? this.width * scale : scale_width,
              height = scale ? this.height * scale : scale_height;

            _CANVAS_SVG.canvas.width = width;
            _CANVAS_SVG.canvas.height = height;
            _CANVAS_SVG.ctx.drawImage(this, 0, 0, width, height);

            image_resource.image = new Image();

            image_resource.image.src = _CANVAS_SVG.canvas.toDataURL();
          };
        }
      }
    }

    /**
     * TODO
     * - ON HOLD? WHILE THIS CAN BE DONE, NOT REALLY SURE IF IT WORTH PUTTING TIME INTO IT
     *   ..IS THIS NECESSARY AS I IDEALLY WANT TO USE AN SVG ATLAS
     *
     * - _loadSVG() SHOULD USE:
     *   - PARAMETER 1: ARRAY OF SVG RESOURCES TO LOAD / SCALE / CONVERT
     *     - THIS SCALING AFFECTS THE DEFAULT OR "NATURAL" IMAGE DIMENSIONS
     *   - PARAMETER 2: STATE ID TO TRIGGER WHEN FINAL RESOURCE IS LOADED
     *
     * - PROBLEM W/ CONSISTENCY OF SCALING SVGs BETWEEN WEBGL / CANVAS
     *   - STORE [SCALE, WIDTH, HEIGHT] IN RESOURCE
     *   - FOR SVG RESOURCES, SCALING SHOULD HAPPEN IN EITHER _loadSVG() OR .add.sprite(), BUT NOT BOTH..
     *     - MAYBE ANOTHER WRAPPER FUNCTION, BUT DOESN'T ACCOUNT FOR OTHER .add METHODS
     */
    function _loadSVG(resources, state_id) {
      for (var i = 0; i < resources.length; i++) {
        console.log(resources[i].id);
      }
    }

    function _start() {
      _GAME.state.add(_STATES.BOOT.id, _STATES.BOOT);

      // _loadSVG([_R.heart_new], _STATES.BOOT.id);

      _GAME.state.start(_STATES.BOOT.id);
    }

    var
      _CANVAS_SVG = {
        canvas: null,
        ctx: null,
        initialized: false,
        num_images: 0
      },

      // _GAME = new Phaser.Game(800, 600, Phaser.CANVAS, null, null, true, true),
      _GAME = new Phaser.Game(800, 600, Phaser.WEBGL, null, null, true, true),
      _R = RESOURCE,

      _STATES = {
        BOOT: {
          id: "BOOT",

          // vars: {
          //   image: null
          // },

          // fn: {
          //   function_1: function() {
          //   }
          // },

          preload: function() {
            switch (_GAME.renderType) {
              case Phaser.WEBGL:
                console.log("RENDER = WEBGL");
                break;

              case Phaser.CANVAS:
                console.log("RENDER = CANVAS");
                break;

              default:
                console.log("RENDER = OTHER");
            }

            // _GAME.load.image(_R.logo.id, _R.logo.location);
            _GAME.load.image(_R.heart.id, _R.heart.location);
            // _GAME.load.image(_R.heart_new.id, _R.heart_new.image.src);
            _GAME.load.image(_R.card.id, _R.card.location);
          },

          create: function() {
            _R.heart.phaser_obj = _GAME.add.sprite(0, _GAME.world.centerY, _R.heart.id);
            _R.heart.phaser_obj.scale.setTo(4);
            _R.heart.phaser_obj.anchor.setTo(0.5);
            _R.heart.phaser_obj.x = _R.heart.phaser_obj.width;

            // _R.heart_new.phaser_obj = _GAME.add.sprite(_GAME.world.centerX, _GAME.world.centerY, _R.heart_new.id);
            // _R.heart_new.phaser_obj.anchor.setTo(0.5);

            _R.card.phaser_obj = _GAME.add.sprite(_GAME.world.centerX, _GAME.world.centerY, _R.card.id);
            _R.card.phaser_obj.anchor.setTo(0.5);
            _R.card.phaser_obj.scale.setTo(0.65);
            _R.card.phaser_obj.angle = -7.615;
          }
        }
      };

    return {
      start: _start
    };
  })();

window.onload = function() {
  MAIN.start();
};