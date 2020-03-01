/* global Phaser SENSORS */
var
  CONST = {
    COLOR: {
      RED: 0,
      WHITE: 1,
      BLACK: 2
    },

    FONT: {
      SMALL: {
        font: "30px Courier",
        fill: "#FFFFFF"
      }
    },

    ORIENTATION: {
      LANDSCAPE: 0,
      PORTRAIT: 1
    },

    SCREEN: {
      WIDTH: 800,
      HEIGHT: 600,
      MIN_WIDTH: 400,
      MIN_HEIGHT: 300
    }
  },

  RESOURCE = {
    HULA: {
      /* SPRITESHEET INFO */
      SPRITESHEET: {
        ID: "HULA_SPRITESHEET",
        LOCATION: "img/hula-sheet.png",
        JSON_FILE: "json/hula-sheet.json"
      },

      /* SPRITE FRAMES THAT CORRESPOND TO LABELS IN .JSON FILE */
      SPRITES: {
        HULA_BASE: "HULA_BASE",
        HULA_FULL: "HULA_FULL",
        HULA_TORSO: "HULA_TORSO"
      }
    },

    PIGGLY: {
      /* SPRITESHEET INFO */
      SPRITESHEET: {
        ID: "PIGGLY_SPRITESHEET",
        LOCATION: "/wiggly/svg-sheet/piggly-wiggly-sheet-min.svg",
        JSON_FILE: "/wiggly/svg-sheet/piggly-wiggly-sheet.json"
      },

      /* SPRITE FRAMES THAT CORRESPOND TO LABELS IN .JSON FILE */
      SPRITES: {
        FACE: "FACE",
        FACE_STICKER: "FACE_STICKER",
        FACE_WITH_SHADOW: "FACE_WITH_SHADOW",
        FACE_STICKER_WITH_SHADOW: "FACE_STICKER_WITH_SHADOW",
        FACE_SHADOW: "FACE_SHADOW",
        FACE_STICKER_SHADOW: "FACE_STICKER_SHADOW",

        REAR: "REAR",
        REAR_STICKER: "REAR_STICKER",
        REAR_WITH_SHADOW: "REAR_WITH_SHADOW",
        REAR_STICKER_WITH_SHADOW: "REAR_STICKER_WITH_SHADOW",
        REAR_SHADOW: "REAR_SHADOW",
        REAR_STICKER_SHADOW: "REAR_STICKER_SHADOW",

        TAIL: "TAIL",
        REAR_TAIL: "REAR_TAIL",
        REAR_STICKER_TAIL: "REAR_STICKER_TAIL",
        REAR_TAIL_WITH_SHADOW: "REAR_TAIL_WITH_SHADOW",
        REAR_STICKER_TAIL_WITH_SHADOW: "REAR_STICKER_TAIL_WITH_SHADOW",

        PIGGLY_WIGGLY_TEXT_BLACK: "PIGGLY_WIGGLY_TEXT_BLACK",
        PIGGLY_TEXT_BLACK: "PIGGLY_TEXT_BLACK",
        WIGGLY_TEXT_BLACK: "WIGGLY_TEXT_BLACK",
        REGISTERED_BLACK: "REGISTERED_BLACK",

        PIGGLY_WIGGLY_TEXT_WHITE: "PIGGLY_WIGGLY_TEXT_WHITE",
        PIGGLY_TEXT_WHITE: "PIGGLY_TEXT_WHITE",
        WIGGLY_TEXT_WHITE: "WIGGLY_TEXT_WHITE",
        REGISTERED_WHITE: "REGISTERED_WHITE",

        PIGGLY_WIGGLY_TEXT_RED: "PIGGLY_WIGGLY_TEXT_RED",
        PIGGLY_TEXT_RED: "PIGGLY_TEXT_RED",
        WIGGLY_TEXT_RED: "WIGGLY_TEXT_RED",
        REGISTERED_RED: "REGISTERED_RED"
      }
    }
  },

  SETTINGS = {

    /* GLOBAL SETTINGS */

    ACCELEROMETER: {
      FLIP_X: false,
      FLIP_Y: true,
      FLIP_Z: true,
    },

    ANTIALIAS: true,
    AUTO_WOBBLE: false, // TODO
    DEBUG: false,
    DYNAMIC_ASPECT_RATIO: true,
    ENABLE_ACCELEROMETER: true,
    ENABLE_KEYBOARD: true,
    ENABLE_TOUCH: true,
    FULL_SCREEN: false, // TODO
    PREVENT_AUTO_PAUSE: true,
    SCALE_CANVAS: 1,
    SCALE_MAX: 1, // LATER SET TO device.pixelRatio
    SOUND: true, // TODO
    STRETCH_TO_WINDOW: true,
    Z_WOBBLE: true,


    /* GRAPHIC-SPECIFIC SETTINGS */

    HULA: {
      SCALE_LANDSCAPE: 0.9,
      SCALE_PORTRAIT: 0.92,

      /* PHYSICS OBJECTS */

      BOBBLE: {
        ANGULAR_DAMPING: 0.2,
        LINEAR_DAMPING: 0.9,
        MASS: 0.13
      },


      /* SPRINGS */
      SPRING_LINEAR: {
        ACCELERATION_MAX: null, // CALCULATED IN HULA.create() CALCULATION ON DONE ONCE
        DAMPING: 0.9,
        FORCE_MAX: 120,
        REST_LENGTH: 0,
        STIFFNESS: 400
      },

      SPRING_ROTATIONAL: {
        DAMPING: 0.2,
        FORCE_MAX: 70,
        FORCE_MAX_TAP: 700,
        REST_ANGLE: 0,
        STIFFNESS: 1200,
        THRESHOLD_ACCELERATION: 0.5,
        VELOCITY_MAX: 4.0
      }
    },

    PIGGLY: {
      DROP_SHADOW: true,
      SCALE_LANDSCAPE: 0.5,
      SCALE_PORTRAIT: 0.75,
      SHOW_TEXT: true,
      STICKER_EFFECT: true,
      TEXT_COLOR: CONST.COLOR.RED,
      WIGGLY_TRANSITION: true,

      /* PHYSICS OBJECTS */
      // TODO: OBJECT DAMPING VS. SPRING DAMPING, SHOULD THEY BE THE SAME?
      BOBBLE: {
        ANGULAR_DAMPING: 0.4,
        LINEAR_DAMPING: 0.4,
        MASS: 0.25
      },

      TAIL: {
        ANGULAR_DAMPING: 0.01,
        MASS: 0.007
      },


      /* SPRINGS */

      SPRING_LINEAR: {
        DAMPING: 0.3,
        FORCE_MAX: 120,

        // DELETE? USED IF ROTATION FORCE REQUIRES THIS..
        // RANGE: {
        //   X: 40 // ARBITARY RANGE
        // },

        REST_LENGTH: 0,
        STIFFNESS: 50,
        THRESHOLD_ACCELERATION: 0.4,
        VELOCITY_MAX: 1300
      },

      SPRING_ROTATIONAL: {
        DAMPING: 0.3,
        FORCE_MAX: 70,
        REST_ANGLE: 0,
        STIFFNESS: 160,
        VELOCITY_MAX: 8
      },

      SPRING_TAIL: {
        DAMPING: 0.01,
        FORCE_MAX: 0.015,
        REST_ANGLE: 0,
        STIFFNESS: 40,
        VELOCITY_MAX: 13,
        VELOCITY_MIN: 4
      }
    }
  },

  BOBBLE = (function() {
    function _getOrientation() {
      return CONST.SCREEN.WIDTH > CONST.SCREEN.HEIGHT ? CONST.ORIENTATION.LANDSCAPE : CONST.ORIENTATION.PORTRAIT;
    }

    /* APPLIES CHANGES TO SETTINGS */
    function _restart(state_id) {
      _KEYBOARD = SETTINGS.ENABLE_KEYBOARD ? _GAME.input.keyboard.createCursorKeys() : null;

      if (SETTINGS.ENABLE_ACCELEROMETER && SENSORS.init()) {
        SENSORS.flip_acceleration.x = SETTINGS.ACCELEROMETER.FLIP_X;
        SENSORS.flip_acceleration.y = SETTINGS.ACCELEROMETER.FLIP_Y;
        SENSORS.flip_acceleration.z = SETTINGS.ACCELEROMETER.FLIP_Z;
      }

      if (SETTINGS.DEBUG) {
        _GAME.time.advancedTiming = true; // NOTE: TRUE IF FPS-RELATED INFO REQUIRED
        _GAME.debug.renderShadow = false;
      }
      else
        _GAME.time.advancedTiming = false;

      _GAME.state.start(state_id);
      // _GAME.state.restart();
    }

    function _start() {
      window.removeEventListener("load", _start, false);

      SETTINGS.SCALE_MAX = _GAME.device.pixelRatio;  // QUALITY SETTINGS ADJUSTMENT (MOBILE?)
      _GAME.input.maxPointers = 1;
      _GAME.stage.disableVisibilityChange = SETTINGS.PREVENT_AUTO_PAUSE;  // PREVENT PHASER AUTO-PAUSE

      /* SCALE CANVAS TO CONTAINER (BROWSER WINDOW) */
      if (SETTINGS.STRETCH_TO_WINDOW) {
        if (SETTINGS.DYNAMIC_ASPECT_RATIO) {
          var
            canvas_height = CONST.SCREEN.HEIGHT *= SETTINGS.SCALE_CANVAS,
            canvas_width = CONST.SCREEN.WIDTH *= SETTINGS.SCALE_CANVAS;

          // DESKTOP: ADJUST CANVAS DIMENSIONS TO MATCH SCREEN ASPECT RATIO (CONSTRAIN TO EXISTING HEIGHT)
          // - NOTE: "screen" IS A GLOBAL DOM VARIABLE
          if (_GAME.device.desktop)
            canvas_width = CONST.SCREEN.WIDTH = Math.round(CONST.SCREEN.HEIGHT * screen.availWidth / screen.availHeight);

          // MOBILE: RESIZE TO MATCH DEVICE "PIXEL" WIDTH/HEIGHT
          else {
            canvas_width = CONST.SCREEN.WIDTH = document.body.clientWidth * SETTINGS.SCALE_CANVAS;
            canvas_height = CONST.SCREEN.HEIGHT = document.body.clientHeight * SETTINGS.SCALE_CANVAS;
          }

          // RESIZE CANVAS WIDTH / HEIGHT
          _GAME.scale.setGameSize(canvas_width, canvas_height);

          CONST.SCREEN.MIN_WIDTH = Math.round(CONST.SCREEN.MIN_HEIGHT * CONST.SCREEN.WIDTH / CONST.SCREEN.HEIGHT);
        }

        _GAME.scale.setMinMax(CONST.SCREEN.MIN_WIDTH, CONST.SCREEN.MIN_HEIGHT);
        _GAME.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        _GAME.scale.refresh();
      }

      /* VARIOUS SCREENS (STATES) */
      _GAME.state.add(_STATES.HULA.ID, _STATES.HULA);
      _GAME.state.add(_STATES.LOAD.ID, _STATES.LOAD);
      _GAME.state.add(_STATES.PIGGLY.ID, _STATES.PIGGLY);

      _restart(_STATES.HULA.ID);
      // _restart(_STATES.PIGGLY.ID);
    }

    var
      /**
       * new Game(WIDTH, HEIGHT, renderer, parent, state, transparent, antialias, physicsConfig)
       * - TODO: transparent option may change..?
       */
      _GAME = new Phaser.Game(CONST.SCREEN.WIDTH, CONST.SCREEN.HEIGHT, Phaser.CANVAS, null, null, true, SETTINGS.ANTIALIAS), // NOTE: Phaser.CANVAS works best for Android Moto G
      _KEYBOARD,
      _R, // pointer to current resource

      /**
       * STATES:
       * - LOADING
       * - SPLASH
       * - MENU
       * - GLOBAL CONFIG
       * - PIGGLY WIGGLY
       * - PIGGLY CONFIG
       * - HULA DANCER
       * - HULA CONFIG
       * - ABOUT
       */
      _STATES = {
        LOAD: {
          ID: "LOAD",

          /* BUILT-IN STATE FUNCTIONS */
          init: null,

          preload: function() {
            _GAME.add.text(80, 150, "Loading...", CONST.FONT.SMALL);
          },

          create: null,

          update: null,

          render: null
        },

        HULA: {
          ID: "HULA",
          SCALE: 1, // CALCULATED IN create()

          SPRINGS: {
            LINEAR: null,
            ROTATIONAL: null
          },

          SPRITE_BOXES: {
            BASE: {
              ID: null,
              OBJ: null
            },

            BOBBLE: {
              ID: null,
              OBJ: null
            },

            REFERENCE: {
              ID: null,
              OBJ: null
            }
          },

          /* BUILT-IN STATE FUNCTIONS */

          // NOTE: MOST VALUES IN THIS FUNCTION ARE DETERMINED BY TRIAL AND ERROR, OVERLAYED ONTO A REFERENCE IMAGE OF THE FULL HULU DANCER. CONSISTENT ON DESKTOP & MOBILE
          create: function() {
            var
              _BOX = this.SPRITE_BOXES,
              _SETTING = SETTINGS.HULA,
              _SPRING = this.SPRINGS,
              _SPRITE = _R.SPRITES,
              orientation = _getOrientation();

            _BOX.REFERENCE.ID = _SPRITE.HULA_FULL;
            _BOX.REFERENCE.OBJ = this.add.sprite(this.world.centerX, this.world.centerY, _R.SPRITESHEET.ID, _BOX.REFERENCE.ID);
            _BOX.REFERENCE.OBJ.anchor.setTo(0.5);
            _BOX.REFERENCE.OBJ.visible = false;

            _BOX.BASE.ID = _SPRITE.HULA_BASE;
            _BOX.BASE.OBJ = this.add.sprite(this.world.centerX, this.world.centerY, _R.SPRITESHEET.ID, _BOX.BASE.ID);
            // _BOX.BASE.OBJ.anchor.setTo(0.5); // NOTE: UNNECESSARY AS IMAGE LOSES PLACEMENT WITH SPRING CONNECTIONS LATER IN NOTE 1A/1B
            _BOX.BASE.OBJ.alpha = 0;

            _BOX.BOBBLE.ID = _SPRITE.HULA_TORSO;
            _BOX.BOBBLE.OBJ = this.add.sprite(this.world.centerX, this.world.centerY, _R.SPRITESHEET.ID, _BOX.BOBBLE.ID);
            _BOX.BOBBLE.OBJ.alpha = 0;

            // SCALE ASSET BASED ON DEVICE DIMENSIONAL CONSTRAINTS
            this.SCALE = (orientation === CONST.ORIENTATION.LANDSCAPE ? _SETTING.SCALE_LANDSCAPE : _SETTING.SCALE_PORTRAIT);
            this.SCALE = ((CONST.SCREEN.WIDTH - _BOX.REFERENCE.OBJ.width < CONST.SCREEN.HEIGHT - _BOX.REFERENCE.OBJ.height) ? CONST.SCREEN.WIDTH * this.SCALE / _BOX.REFERENCE.OBJ.width : CONST.SCREEN.HEIGHT * this.SCALE / _BOX.REFERENCE.OBJ.height);

            if (this.SCALE <= SETTINGS.SCALE_MAX) {
              _BOX.REFERENCE.OBJ.scale.setTo(this.SCALE);
              _BOX.BASE.OBJ.scale.setTo(this.SCALE);
              _BOX.BOBBLE.OBJ.scale.setTo(this.SCALE);
            }

            // NOTE 1A: PLACEMENT OF OBJECTS
            // - DIFFERENCE OF THESE COORDINATES FROM NOTE 1B CAUSES INITIAL BOUNCE
            // _BOX.BASE.OBJ.x -= _BOX.REFERENCE.OBJ.width * 0.01; // NOTE: 0.135 MATCHES REF IMAGE, BUT NEW VALUE IS MORE CENTERED VISUALLY AT THE BASE
            _BOX.BASE.OBJ.y += _BOX.REFERENCE.OBJ.height * 0.26; // NOTE: 0.27 MATCHES REF IMAGE, BUT NEW VALUE IS MORE CENTERED VISUALLY
            // _BOX.BASE.OBJ.x -= _BOX.REFERENCE.OBJ.width * 0.04; // NOTE: 0.135 MATCHES REF IMAGE, BUT NEW VALUE IS MORE CENTERED VISUALLY AT THE BASE
            // _BOX.BASE.OBJ.y += _BOX.REFERENCE.OBJ.height * 0.29; // NOTE: 0.27 MATCHES REF IMAGE, BUT NEW VALUE IS MORE CENTERED VISUALLY
            _BOX.BOBBLE.OBJ.x += _BOX.REFERENCE.OBJ.width * 0.08;
            _BOX.BOBBLE.OBJ.y -= _BOX.REFERENCE.OBJ.height * 0.11;

            // this.make.tween(_BOX.REFERENCE.OBJ).to({ alpha: 1 }, 500, Phaser.Easing.Linear.None, true, 0);
            this.make.tween(_BOX.BASE.OBJ).to({ alpha: 1 }, 700, Phaser.Easing.Linear.None, true, 0);
            this.make.tween(_BOX.BOBBLE.OBJ).to({ alpha: 1 }, 500, Phaser.Easing.Linear.None, true, 0);


            /**** SPRING PHYSICS ****/

            if (!(SENSORS.raw.acceleration.x || SENSORS.raw.acceleration.y || SENSORS.raw.acceleration.z))
              SENSORS.shutDown();

            this.physics.p2.enable([_BOX.BASE.OBJ, _BOX.BOBBLE.OBJ]);

            _BOX.BASE.OBJ.body.static = true;
            _BOX.BASE.OBJ.body.clearCollision(true, true);
            _BOX.BOBBLE.OBJ.body.clearCollision(true, true);

            _BOX.BOBBLE.OBJ.body.mass = _SETTING.BOBBLE.MASS;
            _BOX.BOBBLE.OBJ.body.angularDamping = _SETTING.BOBBLE.ANGULAR_DAMPING;
            _BOX.BOBBLE.OBJ.body.damping = _SETTING.BOBBLE.LINEAR_DAMPING;
            _BOX.BOBBLE.OBJ.body.angle = 1;

            // NOTE 1B: PLACEMENT OF SPRING CONNECTION POINTS - http://phaser.io/docs/2.6.2/Phaser.Physics.P2.html#createSpring
            // - LOCAL B = [-_BOX.REFERENCE.OBJ.width * 0.2, _BOX.REFERENCE.OBJ.height * 0.406] IS CLOSER TO REFERENGE IMAGE, BUT IS TOO EASY TO SEE THE LEG WHEN WOBBLING
            // _SPRING.LINEAR = this.physics.p2.createSpring(_BOX.BOBBLE.OBJ, _BOX.BASE.OBJ, _SETTING.SPRING_LINEAR.REST_LENGTH, _SETTING.SPRING_LINEAR.STIFFNESS, _SETTING.SPRING_LINEAR.DAMPING, null, null, [0, 0], [-_BOX.REFERENCE.OBJ.width * 0.13, _BOX.REFERENCE.OBJ.height * 0.406]);
            _SPRING.LINEAR = this.physics.p2.createSpring(_BOX.BOBBLE.OBJ, _BOX.BASE.OBJ, _SETTING.SPRING_LINEAR.REST_LENGTH, _SETTING.SPRING_LINEAR.STIFFNESS, _SETTING.SPRING_LINEAR.DAMPING, null, null, [0, 0], [-_BOX.REFERENCE.OBJ.width * 0.09, _BOX.REFERENCE.OBJ.height * 0.376]);
            this.physics.p2.createRevoluteConstraint(_BOX.BASE.OBJ, [-_BOX.BASE.OBJ.width * 0.03, -_BOX.BASE.OBJ.width * 0.03], _BOX.BOBBLE.OBJ, [0, 0], _SETTING.SPRING_ROTATIONAL.FORCE_MAX);
            _SPRING.ROTATIONAL = this.physics.p2.createRotationalSpring(_BOX.BOBBLE.OBJ, _BOX.BASE.OBJ, _SETTING.SPRING_ROTATIONAL.REST_ANGLE, _SETTING.SPRING_ROTATIONAL.STIFFNESS, _SETTING.SPRING_ROTATIONAL.DAMPING);


            /**** CALCULATE INITIAL SETTINGS ****/
            _SETTING.SPRING_LINEAR.ACCELERATION_MAX = _SETTING.SPRING_LINEAR.FORCE_MAX / _SETTING.BOBBLE.MASS;


            /**** HANDLE TOUCH / MOUSE INPUT ****/
            if (SETTINGS.ENABLE_TOUCH) {
              _BOX.BOBBLE.OBJ.inputEnabled = true;
              _BOX.BOBBLE.OBJ.events.onInputDown.add(this.tap, this);
            }
          },

          init: function() {
            _R = RESOURCE.HULA;
            this.physics.startSystem(Phaser.Physics.P2JS);
          },

          preload: function() {
            this.load.atlas(_R.SPRITESHEET.ID, _R.SPRITESHEET.LOCATION, _R.SPRITESHEET.JSON_FILE, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
          },

          render: function() {
            if (SETTINGS.DEBUG)
              _GAME.debug.text(_GAME.time.fps + " FPS", 20, 20, "#000");
          },

          update: function() {
            var
              _SETTING = SETTINGS.HULA,
              _USE_ACCELEROMETER = SETTINGS.ENABLE_ACCELEROMETER && SENSORS.isReady();

            if (SETTINGS.ENABLE_KEYBOARD || _USE_ACCELEROMETER) {
              var
                _ACCELERATION = {
                  X: SENSORS.raw.acceleration.x,
                  Y: SENSORS.raw.acceleration.y,
                  Z: SENSORS.raw.acceleration.z
                },

              _BOX = this.SPRITE_BOXES,
              _BODY = _BOX.BOBBLE.OBJ.body,
              _FORCE = 0;

              // FOR BOBBLE MOVEMENT, USE X/Y/Z ACCELERATION, WHICHEVER HAS GREATEST MAGNITUDE
              if (_USE_ACCELEROMETER) {
                if (SETTINGS.Z_WOBBLE) // FORWARD-BACK MOVEMENT
                  _ACCELERATION.X = Math.max(Math.abs(_ACCELERATION.X), Math.abs(_ACCELERATION.Y), Math.abs(_ACCELERATION.Z));
                else
                  _ACCELERATION.X = Math.max(Math.abs(_ACCELERATION.X), Math.abs(_ACCELERATION.Y));
              }

              // READ KEYBOARD ARROWS AS SUBSTITUTES FOR ACCELERATION X/Y
              else if (!_USE_ACCELEROMETER && SETTINGS.ENABLE_KEYBOARD) {
                if (_KEYBOARD.left.isDown && !_KEYBOARD.right.isDown)
                  _ACCELERATION.X = -_SETTING.SPRING_LINEAR.ACCELERATION_MAX;
                else if (!_KEYBOARD.left.isDown && _KEYBOARD.right.isDown)
                  _ACCELERATION.X = _SETTING.SPRING_LINEAR.ACCELERATION_MAX;
              }

              // CHECK THRESHOLD ACCELERATION
              if (Math.abs(_ACCELERATION.X) > _SETTING.SPRING_ROTATIONAL.THRESHOLD_ACCELERATION) {
                // _FORCE = _SETTING.SPRING_ROTATIONAL.FORCE_MAX * _ACCELERATION.X / 6.5; // VERSUS 9.81;
                _FORCE = _SETTING.SPRING_ROTATIONAL.FORCE_MAX * _ACCELERATION.X / 9.81; // VERSUS 9.81;

                // APPLY ROTATIONAL FORCE ON TORSO
                _FORCE = SETTINGS.SCALE_CANVAS * (Math.abs(_FORCE) > _SETTING.SPRING_ROTATIONAL.FORCE_MAX ? _SETTING.SPRING_ROTATIONAL.FORCE_MAX : _FORCE);

                // IF ALREADY MOVING IN A GIVEN DIRECTION, APPLY THE FORCE IN THE SAME DIRECTION SO AS TO ELIMINATE MOMENTUM CANCELLATION
                if (Math.sign(_BODY.angularVelocity))
                  _FORCE *= Math.sign(_BODY.angularVelocity);

                _BODY.angularForce = _FORCE;
              }

              // LIMIT ANGULAR VELOCITY
              if (Math.abs(_BODY.angularVelocity) > _SETTING.SPRING_ROTATIONAL.VELOCITY_MAX)
                _BODY.angularVelocity = Math.sign(_BODY.angularVelocity) * _SETTING.SPRING_ROTATIONAL.VELOCITY_MAX;
            }
          },

          /* CUSTOM STATE FUNCTIONS */

          tap: function(sprite, pointer) {
            // IF ALREADY MOVING IN A GIVEN DIRECTION, APPLY THE FORCE IN THE SAME DIRECTION SO AS TO ELIMINATE MOMENTUM CANCELLATION
            var
              _BODY = this.SPRITE_BOXES.BOBBLE.OBJ.body,
              force = SETTINGS.SCALE_CANVAS * SETTINGS.HULA.SPRING_ROTATIONAL.FORCE_MAX_TAP;

            if (Math.sign(_BODY.angularVelocity))
              force *= Math.sign(_BODY.angularVelocity);

            _BODY.angularForce = force;
          }
        },

        MENU: {
          ID: "MENU",

          /* BUILT-IN STATE FUNCTIONS */
          init: null,

          preload: null,

          create: null,

          update: null,

          render: null
        },

        PIGGLY: {
          ID: "PIGGLY",
          REAR_SCALE: 1.25,
          SCALE: 1, // CALCULATED IN create()
          SHOWING_PIGGLY: true, // true (PIGGLY'S FACE), false (PIGGLY'S REAR)

          SPRINGS: {
            LINEAR: null,
            ROTATIONAL: null,
            TAIL: null
          },

          SPRITE_BOXES: {
            BASE: {
              ID: null,
              OBJ: null
            },

            BOBBLE: {
              ID: null,
              OBJ: null
            },

            TAIL: {
              ID: null,
              OBJ: null
            },

            TEXT_MAIN: {
              ID: null,
              OBJ: null
            }
          },

          /* BUILT-IN STATE FUNCTIONS */
          create: function() {
            var
              _BOX = this.SPRITE_BOXES,
              _SETTING = SETTINGS.PIGGLY,
              _SPRING = this.SPRINGS,
              _SPRITE = _R.SPRITES,
              orientation = _getOrientation();

            // SHOW TEXT BASED ON SETTINGS
            if (_SETTING.SHOW_TEXT) {
              switch (_SETTING.TEXT_COLOR) {
                case CONST.COLOR.BLACK:
                  _BOX.TEXT_MAIN.ID = _SETTING.WIGGLY_TRANSITION ? _SPRITE.PIGGLY_TEXT_BLACK : _SPRITE.PIGGLY_WIGGLY_TEXT_BLACK;
                  break;

                case CONST.COLOR.WHITE:
                  _BOX.TEXT_MAIN.ID = _SETTING.WIGGLY_TRANSITION ? _SPRITE.PIGGLY_TEXT_WHITE : _SPRITE.PIGGLY_WIGGLY_TEXT_WHITE;
                  break;

                case CONST.COLOR.RED:
                  default:
                  _BOX.TEXT_MAIN.ID = _SETTING.WIGGLY_TRANSITION ? _SPRITE.PIGGLY_TEXT_RED : _SPRITE.PIGGLY_WIGGLY_TEXT_RED;
              }

              _BOX.TEXT_MAIN.OBJ = this.add.image(0, 0, _R.SPRITESHEET.ID, _BOX.TEXT_MAIN.ID);
              _BOX.TEXT_MAIN.OBJ.anchor.setTo(0.5, 0);
              _BOX.TEXT_MAIN.OBJ.alpha = 0;
            }

            // DETERMINE VISIBLE BOBBLE ASSETS TO USE
            if (_SETTING.STICKER_EFFECT)
              _BOX.BOBBLE.ID = _SETTING.DROP_SHADOW ? _SPRITE.FACE_STICKER_WITH_SHADOW : _SPRITE.FACE_STICKER;
            else
              _BOX.BOBBLE.ID = _SETTING.DROP_SHADOW ? _SPRITE.FACE_WITH_SHADOW : _SPRITE.FACE;

            _BOX.BOBBLE.OBJ = this.add.sprite(this.world.centerX, this.world.centerY, _R.SPRITESHEET.ID, _BOX.BOBBLE.ID);
            _BOX.BOBBLE.OBJ.anchor.setTo(0.5);
            _BOX.BOBBLE.OBJ.alpha = 0;

            // EXTRA SPRITE FOR TAIL SPECIFIC TO PIGGLY->WIGGLY TRANSITION
            if (_SETTING.WIGGLY_TRANSITION) {
              _BOX.TAIL.ID = _SPRITE.TAIL;
              _BOX.TAIL.OBJ = this.add.sprite(this.world.centerX, 0, _R.SPRITESHEET.ID, _BOX.TAIL.ID);
              _BOX.TAIL.OBJ.visible = false;
            }

            // SCALE ASSET BASED ON DEVICE DIMENSIONAL CONSTRAINTS
            this.SCALE = (orientation === CONST.ORIENTATION.LANDSCAPE ? _SETTING.SCALE_LANDSCAPE : _SETTING.SCALE_PORTRAIT);
            this.SCALE = ((CONST.SCREEN.WIDTH - _BOX.BOBBLE.OBJ.width < CONST.SCREEN.HEIGHT - _BOX.BOBBLE.OBJ.height) ? CONST.SCREEN.WIDTH * this.SCALE / _BOX.BOBBLE.OBJ.width : CONST.SCREEN.HEIGHT * this.SCALE / _BOX.BOBBLE.OBJ.height);

            if (this.SCALE <= SETTINGS.SCALE_MAX) {
              _BOX.BOBBLE.OBJ.scale.setTo(this.SCALE);

              if (_SETTING.WIGGLY_TRANSITION) {
                _BOX.TAIL.OBJ.scale.setTo(this.SCALE * this.REAR_SCALE);
                _BOX.TAIL.OBJ.y = _BOX.BOBBLE.OBJ.y - 0.12 * _BOX.BOBBLE.OBJ.height;
              }
            }

            // TEXT: SCALING / RE-POSITIONING ASSETS
            if (_SETTING.SHOW_TEXT) {
              var
                text_scale = _SETTING.WIGGLY_TRANSITION ? this.SCALE : this.SCALE * 0.7,
                gap_y = 0,
                delta_y = 0;

              _BOX.TEXT_MAIN.OBJ.scale.setTo(text_scale);

              gap_y = _BOX.BOBBLE.OBJ.height * 0.02;
              delta_y = (gap_y + _BOX.TEXT_MAIN.OBJ.height) / 2;

              _BOX.BOBBLE.OBJ.y -= delta_y;

              if (_SETTING.WIGGLY_TRANSITION)
                _BOX.TAIL.OBJ.y -= delta_y;

              _BOX.TEXT_MAIN.OBJ.x = this.world.centerX;
              _BOX.TEXT_MAIN.OBJ.y = _BOX.BOBBLE.OBJ.y + _BOX.BOBBLE.OBJ.height / 2 + gap_y;

              this.make.tween(_BOX.TEXT_MAIN.OBJ).to({ alpha: 1 }, 500, Phaser.Easing.Linear.None, true, 0);
            }

            this.make.tween(_BOX.BOBBLE.OBJ).to({ alpha: 1 }, 500, Phaser.Easing.Linear.None, true, 0);


            /**** SPRING PHYSICS ****/

            // NOTE: BY THE TIME THIS EVENT - create() HAS TRIGGERED, THE ACCELEROMETER SHOULD BE WORKING OR NOT; COMPENSATE FOR NO ACCELEROMETER READINGS
            if (!(SENSORS.raw.acceleration.x || SENSORS.raw.acceleration.y || SENSORS.raw.acceleration.z))
              SENSORS.shutDown();

            _BOX.BASE.OBJ = this.add.sprite(_BOX.BOBBLE.OBJ.x, _BOX.BOBBLE.OBJ.y, _R.SPRITESHEET.ID, _BOX.BASE.ID);
            _BOX.BASE.OBJ.anchor.setTo(0.5);
            _BOX.BASE.OBJ.visible = false;

            this.physics.p2.enable([_BOX.BASE.OBJ, _BOX.BOBBLE.OBJ]);

            _BOX.BASE.OBJ.body.static = true;
            _BOX.BASE.OBJ.body.clearCollision(true, true);
            _BOX.BOBBLE.OBJ.body.clearCollision(true, true);

            _BOX.BOBBLE.OBJ.body.mass = _SETTING.BOBBLE.MASS;
            _BOX.BOBBLE.OBJ.body.angularDamping = _SETTING.BOBBLE.ANGULAR_DAMPING;
            _BOX.BOBBLE.OBJ.body.damping = _SETTING.BOBBLE.LINEAR_DAMPING;
            _BOX.BOBBLE.OBJ.body.angle = 30;

            _SPRING.LINEAR = this.physics.p2.createSpring(_BOX.BOBBLE.OBJ, _BOX.BASE.OBJ, _SETTING.SPRING_LINEAR.REST_LENGTH, _SETTING.SPRING_LINEAR.STIFFNESS, _SETTING.SPRING_LINEAR.DAMPING);
            _SPRING.ROTATIONAL = this.physics.p2.createRotationalSpring(_BOX.BOBBLE.OBJ, _BOX.BASE.OBJ, _SETTING.SPRING_ROTATIONAL.REST_ANGLE, _SETTING.SPRING_ROTATIONAL.STIFFNESS, _SETTING.SPRING_ROTATIONAL.DAMPING);

            if (_SETTING.WIGGLY_TRANSITION) {
              this.physics.p2.enableBody(_BOX.TAIL.OBJ);
              _BOX.TAIL.OBJ.body.clearCollision(true, true);
              _BOX.TAIL.OBJ.body.mass = _SETTING.TAIL.MASS;
              _BOX.TAIL.OBJ.body.angularDamping = _SETTING.TAIL.ANGULAR_DAMPING;
              this.physics.p2.createRevoluteConstraint(_BOX.BOBBLE.OBJ, [-_BOX.BOBBLE.OBJ.width * 0.02, -_BOX.BOBBLE.OBJ.height * 0.07], _BOX.TAIL.OBJ, [-_BOX.TAIL.OBJ.width * 0.45, _BOX.TAIL.OBJ.height * 0.45]);
              _SPRING.TAIL = this.physics.p2.createRotationalSpring(_BOX.TAIL.OBJ, _BOX.BOBBLE.OBJ, _SETTING.SPRING_TAIL.REST_ANGLE, _SETTING.SPRING_TAIL.STIFFNESS, _SETTING.SPRING_TAIL.DAMPING);
            }


            /**** HANDLE INPUT ****/

            if (_SETTING.WIGGLY_TRANSITION) {
              _BOX.BOBBLE.OBJ.inputEnabled = true;
              _BOX.BOBBLE.OBJ.events.onInputDown.add(this.bobbleDown, this);
            }
          },

          init: function() {
            _R = RESOURCE.PIGGLY;
            this.physics.startSystem(Phaser.Physics.P2JS);
          },

          preload: function() {
            this.load.atlas(_R.SPRITESHEET.ID, _R.SPRITESHEET.LOCATION, _R.SPRITESHEET.JSON_FILE, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
          },

          render: function() {
            if (SETTINGS.DEBUG)
              _GAME.debug.text(_GAME.time.fps + " FPS", 20, 20, "#000");
          },

          update: function() {
            var
              _SETTING = SETTINGS.PIGGLY,
              _USE_ACCELEROMETER = SETTINGS.ENABLE_ACCELEROMETER && SENSORS.isReady();

            if (SETTINGS.ENABLE_KEYBOARD || _USE_ACCELEROMETER) {
              var
                _ACCELERATION = {
                  MAX: _SETTING.SPRING_LINEAR.FORCE_MAX / _SETTING.BOBBLE.MASS,
                  X: SENSORS.raw.acceleration.x,
                  Y: SENSORS.raw.acceleration.y,
                  Z: SENSORS.raw.acceleration.z
                },

                _BOX = this.SPRITE_BOXES,
                _BODY = _BOX.BOBBLE.OBJ.body;

              // FOR BOBBLE UP/DOWN MOVEMENT, DEPENDING ON SETTING
              // USE Y OR Z ACCELERATION, WHICHEVER HAS GREATEST MAGNITUDE
              if (_USE_ACCELEROMETER && SETTINGS.Z_WOBBLE && Math.abs(_ACCELERATION.Z) > Math.abs(_ACCELERATION.Y))
                _ACCELERATION.Y = _ACCELERATION.Z;

              // READ KEYBOARD ARROWS AS SUBSTITUTES FOR ACCELERATION X/Y
              else if (!_USE_ACCELEROMETER && SETTINGS.ENABLE_KEYBOARD) {
                if (_KEYBOARD.left.isDown && !_KEYBOARD.right.isDown)
                  _ACCELERATION.X = _ACCELERATION.MAX;
                else if (!_KEYBOARD.left.isDown && _KEYBOARD.right.isDown)
                  _ACCELERATION.X = -_ACCELERATION.MAX;

                if (_KEYBOARD.up.isDown && !_KEYBOARD.down.isDown)
                  _ACCELERATION.Y = _ACCELERATION.MAX;
                else if (!_KEYBOARD.up.isDown && _KEYBOARD.down.isDown)
                  _ACCELERATION.Y = -_ACCELERATION.MAX;
              }


              // APPLY LINEAR FORCE ON BOBBLE BODY
              _BODY.applyForce([this.scaleAccelerationLinear(_ACCELERATION.X), this.scaleAccelerationLinear(_ACCELERATION.Y)], 0, 0);

              // APPLY ROTATIONAL FORCE ON BOBBLE BODY
              // _BODY.angularForce = _SETTING.SPRING_ROTATIONAL.FORCE_MAX * (_GAME.world.centerX - _BOX.BOBBLE.OBJ.x) / _SETTING.SPRING_LINEAR.RANGE.X;
              _BODY.angularForce = this.scaleAccelerationLinear(_ACCELERATION.X);


              // LIMIT LINEAR MASS X-VELOCITY
              if (Math.abs(_BODY.velocity.x) > _SETTING.SPRING_LINEAR.VELOCITY_MAX)
                _BODY.velocity.x = Math.sign(_BODY.velocity.x) * _SETTING.SPRING_LINEAR.VELOCITY_MAX;

              // LIMIT LINEAR MASS Y-VELOCITY
              if (Math.abs(_BODY.velocity.y) > _SETTING.SPRING_LINEAR.VELOCITY_MAX)
                _BODY.velocity.y = Math.sign(_BODY.velocity.y) * _SETTING.SPRING_LINEAR.VELOCITY_MAX;

              // LIMIT ANGULAR VELOCITY
              if (Math.abs(_BODY.angularVelocity) > _SETTING.SPRING_ROTATIONAL.VELOCITY_MAX)
                _BODY.angularVelocity = Math.sign(_BODY.angularVelocity) * _SETTING.SPRING_ROTATIONAL.VELOCITY_MAX;

              // LIMIT TAIL'S ANGULAR VELOCITY
              if (_SETTING.WIGGLY_TRANSITION && !this.SHOWING_PIGGLY) {
                var
                  _TAIL = _BOX.TAIL.OBJ.body;

                if (Math.abs(_BODY.angularVelocity - _TAIL.angularVelocity) > _SETTING.SPRING_TAIL.VELOCITY_MAX)
                  _TAIL.angularVelocity = Math.sign(_TAIL.angularVelocity) * _SETTING.SPRING_TAIL.VELOCITY_MAX;

                else if (Math.abs(_BODY.angularVelocity - _TAIL.angularVelocity) < _SETTING.SPRING_TAIL.VELOCITY_MIN)
                  _TAIL.angularForce = Math.sign(_TAIL.angularVelocity) * _SETTING.SPRING_TAIL.FORCE_MAX;
              }
            }
          },

          /* CUSTOM STATE FUNCTIONS */
          bobbleDown: function(sprite, pointer) {
            if (SETTINGS.PIGGLY.WIGGLY_TRANSITION)
              this.swapPigglyWiggly();
          },

          scaleAccelerationLinear: function(a) {
            var
              force_max = SETTINGS.PIGGLY.SPRING_LINEAR.FORCE_MAX,
              force = Math.abs(a) < SETTINGS.PIGGLY.SPRING_LINEAR.THRESHOLD_ACCELERATION ? 0 : force_max * a / 9.81;

            return SETTINGS.SCALE_CANVAS * (Math.abs(force) > force_max ? Math.sign(force) * force_max : force);
          },

          swapPigglyWiggly: function() {
            var
              _BOX = this.SPRITE_BOXES,
              _SETTING = SETTINGS.PIGGLY,
              _SPRITE = _R.SPRITES,
              new_bobble_id;

            // DETERMINE WHICH GRAPHICS TO USE BASED ON "STICKER" AND "DROP SHADOW" EFFECTS
            if (_SETTING.STICKER_EFFECT) {
              if (_SETTING.DROP_SHADOW)
                new_bobble_id = this.SHOWING_PIGGLY ? _SPRITE.REAR_STICKER_WITH_SHADOW : _SPRITE.FACE_STICKER_WITH_SHADOW;
              else
                new_bobble_id = this.SHOWING_PIGGLY ? _SPRITE.REAR_STICKER : _SPRITE.FACE_STICKER;
            }
            else {
              if (_SETTING.DROP_SHADOW)
                new_bobble_id = this.SHOWING_PIGGLY ? _SPRITE.REAR_WITH_SHADOW : _SPRITE.FACE_WITH_SHADOW;
              else
                new_bobble_id = this.SHOWING_PIGGLY ? _SPRITE.REAR : _SPRITE.FACE;
            }

            // SWAP GRAPHICS + PAUSE / RESUME TAIL ANIMATION
            _BOX.BOBBLE.ID = _BOX.BOBBLE.OBJ.frameName = new_bobble_id;

            if (this.SHOWING_PIGGLY) {
              _BOX.BOBBLE.OBJ.scale.setTo(this.SCALE * this.REAR_SCALE);
              _BOX.TAIL.OBJ.visible = true;

            }
            else {
              _BOX.BOBBLE.OBJ.scale.setTo(this.SCALE);
              _BOX.TAIL.OBJ.visible = false;
            }

            if (_SETTING.SHOW_TEXT) {
              switch (_SETTING.TEXT_COLOR) {
                case CONST.COLOR.BLACK:
                  _BOX.TEXT_MAIN.ID = this.SHOWING_PIGGLY ? _SPRITE.WIGGLY_TEXT_BLACK : _SPRITE.PIGGLY_TEXT_BLACK;
                  break;

                case CONST.COLOR.WHITE:
                  _BOX.TEXT_MAIN.ID = this.SHOWING_PIGGLY ? _SPRITE.WIGGLY_TEXT_WHITE : _SPRITE.PIGGLY_TEXT_WHITE;
                  break;

                case CONST.COLOR.RED:
                default:
                  _BOX.TEXT_MAIN.ID = this.SHOWING_PIGGLY ? _SPRITE.WIGGLY_TEXT_RED : _SPRITE.PIGGLY_TEXT_RED;
              }

              _BOX.TEXT_MAIN.OBJ.frameName = _BOX.TEXT_MAIN.ID;
            }

            this.SHOWING_PIGGLY = !this.SHOWING_PIGGLY;
          }
        },

        SPLASH: {
          ID: "SPLASH",

          /* BUILT-IN STATE FUNCTIONS */
          init: null,

          preload: null,

          create: null,

          update: null,

          render: null
        }
      };

    return {
      restart: _restart,
      start: _start,
      HULA: _STATES.HULA.SPRITE_BOXES.BOBBLE
    };
  })();

window.addEventListener("load", BOBBLE.start, false);