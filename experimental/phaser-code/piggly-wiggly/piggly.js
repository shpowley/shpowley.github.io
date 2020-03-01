/**
 *  TODO:
 *  x ANTIALIAS SETTING
 *  x MAX ACCELERATION (Z-AXIS OR Y-AXIS) TO CONTROL Y-MOTION (MORE INTERESTING VISUAL)
 *  ~ DYNAMIC OFFSET BASED ON GYRO (BETA / GAMMA) ..GYRO TESTER (RESOLVED?)
 *  x DISABLE BASE OFFSET FOR NO ACCELEROMETER + DISABLE ACCELEROMETER
 *  x KEYBOARD ACCELERATION
 *
 *  - MAKE SETTINGS PUBLIC
 *
 *  - ACTIVATE "WIGGLY" ON ACCELERATION OR VERTICAL DISTANCE THRESHOLD
 *    - "OINKING" SOUND
 *    - OVER X SECONDS?
 *    - SLOWER ACCELERATION RESET / TAP-TO-RESET
 *
 *  - SCALE BY ALL GRAPHICS / PHYSICS CONSISTENTLY ACROSS MOBILE/DESKTOP & RESOLUTIONS (0.5 - 2)
 *  - DON'T ALLOW DESKTOP TO SCALE PAST 100%
 *  - #1A: THIS ENTIRE LINE SHOULD BE BASED ON % INSTEAD OF EXACT PX; SEE ALSO SPRING_LINEAR.range
 *
 *  - SOUND
 *    - https://www.freesound.org/people/TheAcidRomance/sounds/260640/
 *    - https://www.freesound.org/people/tompallant/sounds/257858/
 *    - https://www.freesound.org/people/JarredGibb/sounds/233159/
 *    - https://www.freesound.org/people/Robinhood76/sounds/76796/
 *
 *  - TURN OFF PHASER "AUTO-PAUSE" FEATURE | SETTING
 *
 *  - TAIL WOBBLE
 *    - DISABLE TAIL WOBBLE EFFECT OFF WHEN NOT VISIBLE
 *    - SLOWER MOTION, SLIGHTLY GREATER RANGE OF MOTION & MORE TWEEN-LIKE
 *
 *  - AUTO WOBBLE EFFECT
 *  - REMOVE UNNEEDED SVG SPRITES
 *
 *  - SETTINGS:
 *    - ALL SETTINGS
 *    - CONSTRAIN SCALE TO 50-MAX %
 *
 *  - PERFORMANCE:
 *    - SPRITESHEET "TEXTURE": USE BASE 2 SVG OR INCREMENTS OF 32 PX
 *    - SVG CONVERTED TO "IN-MEMORY" TEXTURE USING HTML5 CANVAS; SPRITES SIZED RUNNING APPLICATION
 *
 *  - APP PREP
 *    - MINIFICATION / OBFUSCATION
 *
 *  - ACCELEROMETER "NOISE"..MAYBE ACCEPTABLE
 *    - CHECK READINGS LYING FLAT, INCLINED ASKEW WITH NO VIBRATIONS.
 *
 *
 *  NOTES:
 *
 *  - BE CAREFUL! POSITIONING CODE IS VERY "BRITTLE" AND CAN EASILY BE BROKEN ACROSS DIFFERENT SCALES (ex. 800x600 => 200x150)
 *
 *  - ASSUME FIXED PORTRAIT ORIENTATION FOR NOW
 *    - LATER USE JAVASCRIPT orientationchange EVENT */

/* global Phaser SENSORS */
var
  CONST = {
    COLOR: {
      RED: 0,
      WHITE: 1,
      BLACK: 2
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
    PIGGLY_SPRITESHEET: {
      id: "PIGGLY_SPRITESHEET",
      location: "/wiggly/svg-sheet/piggly-wiggly-sheet-min.svg",
      json: "/wiggly/svg-sheet/piggly-wiggly-sheet.json"
    }
  },

  SETTINGS = {
    DEBUG: false,

    DYNAMIC_ASPECT_RATIO: true,
    STRETCH_TO_WINDOW: true,

    PIGGLY: {
      antialias: true,
      // auto_wobble: false,
      drop_shadow: true,
      enable_keyboard: true,
      enable_accelerometer: true,
      show_text: true,
      // sound_on: true,
      sticker: true,
      text_color: CONST.COLOR.RED,
      wiggly_transition: true,

      // % OF BOUNDING WIDTH/HEIGHT (WHICH EVER DIMENSION IS SMALLEST)
      scale_landscape: 0.5,
      scale_portrait: 0.75,

      canvas_scale: 1,
      max_scale: 1      // LATER SET TO device.pixelRatio
    },

    SPRING_LINEAR: {
      acceleration_max: null, // CALCULATED LATER
      damping: 0.3,
      force_max: 120,
      rest_length: 0,
      stiffness: 50,
      threshold_acceleration: 0.4,
      velocity_max: 1300,

      range: {
        x: 40,
        y: null
      }
    },

    SPRING_ROTATIONAL: {
      damping: 0.3,
      force_max: 70,
      rest_angle: 0,
      stiffness: 160,
      velocity_max: 8
    },

    SPRING_TAIL: {
      damping: 0.01,
      force_max: 0.015,
      rest_angle: 0,
      stiffness: 40,
      velocity_max: 13,
      velocity_min: 4
    }
  },

  /* JSON IDS - SVG SPRITE ATLAS */
  SVG = {
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
  },

  PIGGLY = (function() {
    function _initAccelerometer() {
      if (SETTINGS.PIGGLY.enable_accelerometer && SENSORS.init()) {
        SENSORS.flip_acceleration.x = false;
        SENSORS.flip_acceleration.y = true;
        SENSORS.flip_acceleration.z = true;
      }
    }

    /* FUNCTION CALLED AFTER SETTINGS MODIFIED */
    function _restart() {
      _GAME.state.restart();
    }

    function _scaleCanvas() {
      if (SETTINGS.DYNAMIC_ASPECT_RATIO) {
        var
          canvas_height = CONST.SCREEN.HEIGHT *= SETTINGS.PIGGLY.canvas_scale,
          canvas_width = CONST.SCREEN.WIDTH *= SETTINGS.PIGGLY.canvas_scale;

        // DESKTOP: ADJUST CANVAS DIMENSIONS TO MATCH SCREEN ASPECT RATIO; CONSTRAIN TO EXISTING HEIGHT
        if (_GAME.device.desktop)
          canvas_width = CONST.SCREEN.WIDTH = Math.round(CONST.SCREEN.HEIGHT * screen.availWidth / screen.availHeight);

        // MOBILE: RESIZE TO MATCH DEVICE "PIXEL" WIDTH/HEIGHT
        else {
          canvas_width = CONST.SCREEN.WIDTH = document.body.clientWidth * SETTINGS.PIGGLY.canvas_scale;
          canvas_height = CONST.SCREEN.HEIGHT = document.body.clientHeight * SETTINGS.PIGGLY.canvas_scale;
        }

        // RESIZE CANVAS WIDTH/HEIGHT
        _GAME.scale.setGameSize(canvas_width, canvas_height);

        // SCALE
        CONST.SCREEN.MIN_WIDTH = Math.round(CONST.SCREEN.MIN_HEIGHT * CONST.SCREEN.WIDTH / CONST.SCREEN.HEIGHT);
      }

      _GAME.scale.setMinMax(CONST.SCREEN.MIN_WIDTH, CONST.SCREEN.MIN_HEIGHT);
      _GAME.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      _GAME.scale.refresh();

      // _GAME.renderer.renderSession.roundPixels = true;
      // Phaser.Canvas.setImageRenderingCrisp(_GAME.canvas);
    }

    function _start() {
      window.removeEventListener("load", _start, false);

      _initAccelerometer();

      SETTINGS.PIGGLY.max_scale = _GAME.device.pixelRatio;  // FOR QUALITY SETTINGS ADJUSTMENTS
      _GAME.input.maxPointers = 1;
      _GAME.stage.disableVisibilityChange = true;  // PREVENT PHASER AUTO-PAUSE

      /* DEFAULT TO GAME RESIZEABLE TO CONTAINER / BROWSER WINDOW */
      if (SETTINGS.STRETCH_TO_WINDOW)
        _scaleCanvas();

      /** STATES: http://phaser.io/docs/2.4.7/Phaser.State.html */
      _GAME.state.add(_STATES.PLAY.ID, _STATES.PLAY);
      _GAME.state.start(_STATES.PLAY.ID);
    }

    var
      /** new Game(WIDTH, HEIGHT, renderer, parent, state, transparent, antialias, physicsConfig) */
      _GAME = new Phaser.Game(CONST.SCREEN.WIDTH, CONST.SCREEN.HEIGHT, Phaser.AUTO, null, null, true, SETTINGS.PIGGLY.antialias),
      _R = RESOURCE,
      _KEYBOARD,

      _STATES = {
        PLAY: {
          ID: "PLAY",

          REAR_SCALE: 1.25,
          SCALE: 1,  // CALCULATED SCALE IN create()

          SHOWING_PIGGLY: true, // true = SHOWING PIGGLY FACE, false = SHOWING WIGGLY REAR

          SPRITES: {
            base: {
              id: null,
              obj: null,
              visible: false,

              // NOT USED ANY MORE... TODO - DELETE
              gravity_offset: -0.17 // % OF BOBBLE SPRITE; CALCULATED BY HAND - USING INITIAL PLACEMENT W/ NO GRAVITY - OFFSET W/ GRAVITY EFFECT
            },

            bobble: {
              id: null,
              obj: null,

              angular_damping: 0.4,
              linear_damping: 0.4,
              mass: 0.25
            },

            tail: {
              id: null,
              obj: null,
              mass: 0.007
            },

            text_main: {
              id: null,
              obj: null
            }
          },

          SPRINGS: {
            LINEAR: null,
            ROTATIONAL: null,
            TAIL: null
          },


          /** BUILT-IN STATE FUNCTIONS */
          init: function() {
            this.physics.startSystem(Phaser.Physics.P2JS);

            if (SETTINGS.PIGGLY.enable_keyboard)
              _KEYBOARD = this.input.keyboard.createCursorKeys();

            if (SETTINGS.DEBUG) {
              _GAME.time.advancedTiming = true; // NOTE: TRUE IF FPS-RELATED INFO REQUIRED
              _GAME.debug.renderShadow = false;
            }
          },

          preload: function() {
            _GAME.load.atlas(_R.PIGGLY_SPRITESHEET.id, _R.PIGGLY_SPRITESHEET.location, _R.PIGGLY_SPRITESHEET.json, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
          },

          create: function(){
            var
              SPRITE = this.SPRITES,
              SPRINGS = this.SPRINGS,
              orientation = CONST.SCREEN.WIDTH > CONST.SCREEN.HEIGHT ? CONST.ORIENTATION.LANDSCAPE : CONST.ORIENTATION.PORTRAIT;

            // SHOW TEXT BASED ON SETTINGS
            if (SETTINGS.PIGGLY.show_text) {
              switch (SETTINGS.PIGGLY.text_color) {
                case CONST.COLOR.BLACK:
                  SPRITE.text_main.id = SETTINGS.PIGGLY.wiggly_transition ? SVG.PIGGLY_TEXT_BLACK : SVG.PIGGLY_WIGGLY_TEXT_BLACK;
                  break;

                case CONST.COLOR.WHITE:
                  SPRITE.text_main.id = SETTINGS.PIGGLY.wiggly_transition ? SVG.PIGGLY_TEXT_WHITE : SVG.PIGGLY_WIGGLY_TEXT_WHITE;
                  break;

                case CONST.COLOR.RED:
                default:
                  SPRITE.text_main.id = SETTINGS.PIGGLY.wiggly_transition ? SVG.PIGGLY_TEXT_RED : SVG.PIGGLY_WIGGLY_TEXT_RED;
              }

              SPRITE.text_main.obj = this.add.image(0, 0, _R.PIGGLY_SPRITESHEET.id, SPRITE.text_main.id);
              SPRITE.text_main.obj.anchor.setTo(0.5, 0);
              SPRITE.text_main.obj.alpha = 0;
            }

            // DETERMINE VISIBLE BOBBLE ASSETS TO USE
            if (SETTINGS.PIGGLY.sticker)
              SPRITE.bobble.id = SETTINGS.PIGGLY.drop_shadow ? SVG.FACE_STICKER_WITH_SHADOW : SVG.FACE_STICKER;
            else
              SPRITE.bobble.id = SETTINGS.PIGGLY.drop_shadow ? SVG.FACE_WITH_SHADOW : SVG.FACE;

            SPRITE.bobble.obj = this.add.sprite(this.world.centerX, this.world.centerY, _R.PIGGLY_SPRITESHEET.id, SPRITE.bobble.id);
            SPRITE.bobble.obj.anchor.setTo(0.5);
            SPRITE.bobble.obj.alpha = 0;

            // EXTRA SPRITE FOR TAIL SPECIFIC TO PIGGLY->WIGGLY TRANSITION
            if (SETTINGS.PIGGLY.wiggly_transition) {
              SPRITE.tail.id = SVG.TAIL;
              SPRITE.tail.obj = this.add.sprite(this.world.centerX, 0, _R.PIGGLY_SPRITESHEET.id, SPRITE.tail.id);
              SPRITE.tail.obj.visible = false;
            }

            // SCALE ASSET BASED ON DEVICE DIMENSIONAL CONSTRAINTS
            this.SCALE = (orientation === CONST.ORIENTATION.LANDSCAPE ? SETTINGS.PIGGLY.scale_landscape : SETTINGS.PIGGLY.scale_portrait);

            if (CONST.SCREEN.WIDTH - SPRITE.bobble.obj.width < CONST.SCREEN.HEIGHT - SPRITE.bobble.obj.height)
              this.SCALE = CONST.SCREEN.WIDTH * this.SCALE / SPRITE.bobble.obj.width;
            else
              this.SCALE = CONST.SCREEN.HEIGHT * this.SCALE / SPRITE.bobble.obj.height;

            if (this.SCALE <= SETTINGS.PIGGLY.max_scale) {
              SPRITE.bobble.obj.scale.setTo(this.SCALE);

              if (SETTINGS.PIGGLY.wiggly_transition) {
                SPRITE.tail.obj.scale.setTo(this.SCALE * this.REAR_SCALE);
                SPRITE.tail.obj.y = SPRITE.bobble.obj.y - 0.12 * SPRITE.bobble.obj.height;
              }
            }

            // TEXT: SCALING / RE-POSITIONING ASSETS
            if (SETTINGS.PIGGLY.show_text) {
              var
                text_scale = SETTINGS.PIGGLY.wiggly_transition ? this.SCALE : this.SCALE * 0.7,
                gap_y = 0,
                delta_y = 0;

              SPRITE.text_main.obj.scale.setTo(text_scale);

              gap_y = SPRITE.bobble.obj.height * 0.02;
              delta_y = (gap_y + SPRITE.text_main.obj.height) / 2;

              SPRITE.bobble.obj.y -= delta_y;

              if (SETTINGS.PIGGLY.wiggly_transition)
                SPRITE.tail.obj.y -= delta_y;

              SPRITE.text_main.obj.x = this.world.centerX;
              SPRITE.text_main.obj.y = SPRITE.bobble.obj.y + SPRITE.bobble.obj.height / 2 + gap_y;

              this.make.tween(SPRITE.text_main.obj).to({ alpha: 1 }, 500, Phaser.Easing.Linear.None, true, 0);
            }

            this.make.tween(SPRITE.bobble.obj).to({ alpha: 1 }, 500, Phaser.Easing.Linear.None, true, 0);


            /**** SPRING PHYSICS ****/

            // NOTE: BY THE TIME THIS EVENT - create() HAS TRIGGERED, THE ACCELEROMETER SHOULD BE WORKING OR NOT; COMPENSATE FOR NO ACCELEROMETER READINGS
            if (!(SENSORS.raw.acceleration.x || SENSORS.raw.acceleration.y || SENSORS.raw.acceleration.z))
              SENSORS.shutDown();

            SPRITE.base.obj = this.add.sprite(SPRITE.bobble.obj.x, SPRITE.bobble.obj.y, _R.PIGGLY_SPRITESHEET.id, SPRITE.base.id);
            SPRITE.base.obj.anchor.setTo(0.5);
            SPRITE.base.obj.visible = SPRITE.base.visible;

            this.physics.p2.enable([SPRITE.base.obj, SPRITE.bobble.obj]);

            SPRITE.base.obj.body.static = true;
            SPRITE.base.obj.body.clearCollision(true, true);
            SPRITE.bobble.obj.body.clearCollision(true, true);

            SPRITE.bobble.obj.body.mass = SPRITE.bobble.mass;
            SPRITE.bobble.obj.body.angularDamping = SPRITE.bobble.angular_damping;
            SPRITE.bobble.obj.body.damping = SPRITE.bobble.linear_damping;

            SPRINGS.LINEAR = this.physics.p2.createSpring(SPRITE.bobble.obj, SPRITE.base.obj, SETTINGS.SPRING_LINEAR.rest_length, SETTINGS.SPRING_LINEAR.stiffness, SETTINGS.SPRING_LINEAR.damping);
            SPRINGS.ROTATIONAL = this.physics.p2.createRotationalSpring(SPRITE.bobble.obj, SPRITE.base.obj, SETTINGS.SPRING_ROTATIONAL.rest_angle, SETTINGS.SPRING_ROTATIONAL.stiffness, SETTINGS.SPRING_ROTATIONAL.damping);

            if (SETTINGS.PIGGLY.wiggly_transition) {
              this.physics.p2.enableBody(SPRITE.tail.obj);
              SPRITE.tail.obj.body.clearCollision(true, true);
              SPRITE.tail.obj.body.mass = SPRITE.tail.mass;
              this.physics.p2.createRevoluteConstraint(SPRITE.bobble.obj, [-SPRITE.bobble.obj.width * 0.02, -SPRITE.bobble.obj.height * 0.07], SPRITE.tail.obj, [-SPRITE.tail.obj.width * 0.45, SPRITE.tail.obj.height * 0.45]);
              SPRINGS.TAIL = this.physics.p2.createRotationalSpring(SPRITE.tail.obj, SPRITE.bobble.obj, SETTINGS.SPRING_TAIL.rest_angle, SETTINGS.SPRING_TAIL.stiffness, SETTINGS.SPRING_TAIL.damping);
            }

            SETTINGS.SPRING_LINEAR.acceleration_max = SETTINGS.SPRING_LINEAR.force_max / this.SPRITES.bobble.mass;


            /**** HANDLE INPUT ****/

            if (SETTINGS.PIGGLY.wiggly_transition) {
              SPRITE.bobble.obj.inputEnabled = true;
              SPRITE.bobble.obj.events.onInputDown.add(this.bobbleDown, this);
            }
            // this.input.onTap.add(this.tapListener, this);
          },

          update: function() {
            if (SETTINGS.PIGGLY.enable_keyboard || SETTINGS.PIGGLY.enable_accelerometer && SENSORS.isReady()) {
              var
                body = this.SPRITES.bobble.obj.body,

                acceleration_X = SENSORS.raw.acceleration.x,
                acceleration_Y = SENSORS.raw.acceleration.y;
                // acceleration_Z = SENSORS.raw.acceleration.z,

                // DELETE
                // acceleration_X = SENSORS.raw.acceleration_gravity.x,
                // acceleration_Y = SENSORS.raw.acceleration_gravity.y,
                // acceleration_Z = SENSORS.raw.acceleration_gravity.z,

                // REMOVE??
                // FOR BOBBLE VERTICAL MOVEMENT, USE Y OR Z ACCELERATION, WHICHEVER HAS GREATEST MAGNITUDE
                // ISSUE #1C - WHILE THIS IS GOOD, IT MIGHT BE BETTER USING MAX ACCELERATION-YZ DELTA
                // acceleration_YZ_max = Math.abs(acceleration_Y) >= Math.abs(acceleration_Z) ? acceleration_Y : acceleration_Z;

              // READ KEYBOARD ARROWS AS SUBSTITUTES FOR ACCELERATION X/Y
              if (SETTINGS.PIGGLY.enable_keyboard) {
                var
                  acc_max = SETTINGS.SPRING_LINEAR.acceleration_max;

                if (_KEYBOARD.left.isDown && !_KEYBOARD.right.isDown)
                  acceleration_X = acc_max;
                else if (!_KEYBOARD.left.isDown && _KEYBOARD.right.isDown)
                  acceleration_X = -acc_max;

                if (_KEYBOARD.up.isDown && !_KEYBOARD.down.isDown)
                  acceleration_Y = acc_max;
                else if (!_KEYBOARD.up.isDown && _KEYBOARD.down.isDown)
                  acceleration_Y = -acc_max;

                // DELETE
                // if (_KEYBOARD.up.isDown && !_KEYBOARD.down.isDown)
                //   acceleration_YZ_max = SETTINGS.SPRING_LINEAR.force_max;
                // else if (!_KEYBOARD.up.isDown && _KEYBOARD.down.isDown)
                //   acceleration_YZ_max = -SETTINGS.SPRING_LINEAR.force_max;
              }

              this.applyForce(acceleration_X, acceleration_Y);
            }
          },

          render: function() {
            if (SETTINGS.DEBUG)
              _GAME.debug.text(_GAME.time.fps + " FPS", 20, 20, "#000");
          },

          /** CUSTOM STATE FUNCTIONS */
          applyForce: function(acceleration_X, acceleration_Y) {
            var
              body = this.SPRITES.bobble.obj.body;

            // BOBBLE LINEAR SPRING
            body.applyForce([this.scaleAccelerationLinear(acceleration_X), this.scaleAccelerationLinear(acceleration_Y)], 0, 0);

            // DELETE
            // body.applyForce([this.scaleAccelerationLinear(acceleration_X), this.scaleAccelerationLinear(acceleration_YZ_max)], 0, 0);

            // BOBBLE ROTATIONAL SPRING | THOUGH NOT IDEAL..USING DYNAMIC ANGULAR FORCE BASED ON LINEAR POSITION-X PX..USE % INSTEAD | ISSUE #1A
            body.angularForce = SETTINGS.SPRING_ROTATIONAL.force_max * (_GAME.world.centerX - this.SPRITES.bobble.obj.x) / SETTINGS.SPRING_LINEAR.range.x;

            // BOBBLE - LIMIT LINEAR VELOCITY X
            if (Math.abs(body.velocity.x) > SETTINGS.SPRING_LINEAR.velocity_max)
              body.velocity.x = Math.sign(body.velocity.x) * SETTINGS.SPRING_LINEAR.velocity_max;

            // BOBBLE - LIMIT LINEAR VELOCITY Y
            if (Math.abs(body.velocity.y) > SETTINGS.SPRING_LINEAR.velocity_max)
              body.velocity.y = Math.sign(body.velocity.y) * SETTINGS.SPRING_LINEAR.velocity_max;

            // BOBBLE - LIMIT ANGULAR VELOCITY
            if (Math.abs(body.angularVelocity) > SETTINGS.SPRING_ROTATIONAL.velocity_max)
              body.angularVelocity = Math.sign(body.angularVelocity) * SETTINGS.SPRING_ROTATIONAL.velocity_max;

            // TAIL - LIMIT ANGULAR VELOCITY
            if (SETTINGS.PIGGLY.wiggly_transition && !this.SHOWING_PIGGLY) {
              var tail = this.SPRITES.tail.obj.body;

              if (Math.abs(body.angularVelocity - tail.angularVelocity) > SETTINGS.SPRING_TAIL.velocity_max)
                tail.angularVelocity = Math.sign(tail.angularVelocity) * SETTINGS.SPRING_TAIL.velocity_max;
              else if (Math.abs(body.angularVelocity - tail.angularVelocity) < SETTINGS.SPRING_TAIL.velocity_min)
                tail.angularForce = Math.sign(tail.angularVelocity) * SETTINGS.SPRING_TAIL.force_max;
                // tail.angularVelocity = Math.sign(tail.angularVelocity) * SETTINGS.SPRING_TAIL.velocity_min;
            }
          },

          // BOBBLE SPRITE INPUT DOWN
          bobbleDown: function(sprite, pointer) {
            var
              acc_max = 4 * SETTINGS.SPRING_LINEAR.acceleration_max;

            if (SETTINGS.PIGGLY.wiggly_transition && pointer.msSinceLastClick < this.input.doubleTapRate)
              this.swapPigglyWiggly();
            else
              this.applyForce(this.randomDirection(acc_max), this.randomDirection(acc_max));
          },

          randomDirection: function(n) {
            return Math.floor(Math.random() * 2) ? n : -n;
          },

          scaleAccelerationLinear: function(a) {
            var
              force_max = SETTINGS.SPRING_LINEAR.force_max,
              force = Math.abs(a) < SETTINGS.SPRING_LINEAR.threshold_acceleration ? 0 : force_max * a / 9.81;

            return SETTINGS.PIGGLY.canvas_scale * (Math.abs(force) > force_max ? Math.sign(force) * force_max : force);
          },

          swapPigglyWiggly: function() {
            var
              SPRITE = this.SPRITES,
              new_bobble_id;

            // DETERMINE WHICH GRAPHICS TO USE BASE ON "STICKER" AND "DROP SHADOW" EFFECTS
            if (SETTINGS.PIGGLY.sticker) {
              if (SETTINGS.PIGGLY.drop_shadow)
                new_bobble_id = this.SHOWING_PIGGLY ? SVG.REAR_STICKER_WITH_SHADOW : SVG.FACE_STICKER_WITH_SHADOW;
              else
                new_bobble_id = this.SHOWING_PIGGLY ? SVG.REAR_STICKER : SVG.FACE_STICKER;
            }
            else {
              if (SETTINGS.PIGGLY.drop_shadow)
                new_bobble_id = this.SHOWING_PIGGLY ? SVG.REAR_WITH_SHADOW : SVG.FACE_WITH_SHADOW;
              else
                new_bobble_id = this.SHOWING_PIGGLY ? SVG.REAR : SVG.FACE;
            }

            // SWAP GRAPHICS + PAUSE/RESUME TAIL ANIMATION
            if (this.SHOWING_PIGGLY) {
              SPRITE.bobble.id = SPRITE.bobble.obj.frameName = new_bobble_id;
              SPRITE.bobble.obj.scale.setTo(this.SCALE * this.REAR_SCALE);
              SPRITE.tail.obj.visible = true;

              if (SETTINGS.PIGGLY.show_text) {
                switch(SETTINGS.PIGGLY.text_color) {
                  case CONST.COLOR.BLACK:
                    SPRITE.text_main.id = SVG.WIGGLY_TEXT_BLACK;
                    break;

                  case CONST.COLOR.WHITE:
                    SPRITE.text_main.id = SVG.WIGGLY_TEXT_WHITE;
                    break;

                  case CONST.COLOR.RED:
                  default:
                    SPRITE.text_main.id = SVG.WIGGLY_TEXT_RED;
                }

                SPRITE.text_main.obj.frameName = SPRITE.text_main.id;
              }
            }

            else {
              SPRITE.bobble.id = SPRITE.bobble.obj.frameName = new_bobble_id;
              SPRITE.bobble.obj.scale.setTo(this.SCALE);
              SPRITE.tail.obj.visible = false;

              if (SETTINGS.PIGGLY.show_text) {
                switch(SETTINGS.PIGGLY.text_color) {
                  case CONST.COLOR.BLACK:
                    SPRITE.text_main.id = SVG.PIGGLY_TEXT_BLACK;
                    break;

                  case CONST.COLOR.WHITE:
                    SPRITE.text_main.id = SVG.PIGGLY_TEXT_WHITE;
                    break;

                  case CONST.COLOR.RED:
                  default:
                    SPRITE.text_main.id = SVG.PIGGLY_TEXT_RED;
                }

                SPRITE.text_main.obj.frameName = SPRITE.text_main.id;
              }
            }

            this.SHOWING_PIGGLY = !this.SHOWING_PIGGLY;
          },

          // TODO - QUICK TAP / DOUBLE-TAP FOR ENTIRE CANVAS
          // tapListener: function(pointer, double_tap) {
          //   if (this.SPRITES.bobble.obj.input.pointerDown(pointer.id)) {
          //     if (double_tap)
          //       console.log("DOUBLE-TAP");
          //     else
          //       console.log("TAP");
          //   }
          // }
        }
      };

    return {
      restart: _restart,
      start: _start
    };
  })();

window.addEventListener("load", PIGGLY.start, false);