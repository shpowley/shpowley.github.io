/* global Phaser */
var
  CONST = {
    DIRECTION: {
      LEFT: "LEFT",
      RIGHT: "RIGHT",
      TURN: "TURN",
      IDLE: "IDLE"
    },

    SCREEN: {
      WIDTH: 640,
      HEIGHT: 480
    }
  },

  RESOURCE = {
    background: {
      id: "background",
      location: "assets/clouds-h.png",
      obj: null
    },

    cloud_platform: {
      id: "cloud_platform",
      location: "assets/cloud-platform.png",
      obj: null
    },

    dude: {
      id: "dude",
      location: "assets/dude.png",
      obj: null,
      facing: CONST.DIRECTION.IDLE,

      // "LOCKING" CONCEPT IS NECESSARY DUE TO TWEEN MOVEMENT NON-INTERACTION WITH PHYSICS API MODELS
      locked: false,
      was_locked: false,
      locked_to: null,
      will_jump: false
    },

    platform: {
      id: "platform",
      location: "assets/platform.png",
      obj: null
    },

    trees: {
      id: "trees",
      location: "assets/trees-h.png",
      obj: null
    }
  },

  /**
   * - TECHNIQUE BETTER ENCAPSULATES THE CODE NECESSARY FOR A NEW OBJECT PATTERN
   *
   * - NOTE THAT THE WORD "CLOUD_PLATFORM" DOESN'T HAVE TO BE THE SAME FOR THE TOP-LEVEL VARIABLE NAME (VISIBLE TO
   *   THE REST OF THE CODE) AND INTERNAL OBJECT-TYPE, BUT THIS OFFERS BETTER READABILITY
   */
  CLOUD_PLATFORM = (function() {
    var CLOUD_PLATFORM = function(game, x, y, key, group) {
      if (typeof group === 'undefined')
        group = game.world;

      Phaser.Sprite.call(this, game, x, y, key);

      game.physics.arcade.enable(this);

      this.anchor.x = 0.5;

      this.body.customSeparateX = true;
      this.body.customSeparateY = true;
      this.body.allowGravity = false;
      this.body.immovable = true;

      this.playerLocked = false;

      group.add(this);
    };

    CLOUD_PLATFORM.prototype = Object.create(Phaser.Sprite.prototype);
    CLOUD_PLATFORM.prototype.constructor = CLOUD_PLATFORM;

    CLOUD_PLATFORM.prototype.addMotionPath = function (motionPath) {
      this.tweenX = this.game.add.tween(this.body);
      this.tweenY = this.game.add.tween(this.body);

      //  motionPath is an array containing objects with this structure
      //  [
      //   { x: "+200", xSpeed: 2000, xEase: "Linear", y: "-200", ySpeed: 2000, yEase: "Sine.easeIn" }
      //  ]

      for (var i = 0; i < motionPath.length; i++) {
        this.tweenX.to({ x: motionPath[i].x }, motionPath[i].xSpeed, motionPath[i].xEase);
        this.tweenY.to({ y: motionPath[i].y }, motionPath[i].ySpeed, motionPath[i].yEase);
      }

      this.tweenX.loop();
      this.tweenY.loop();
    };

    CLOUD_PLATFORM.prototype.start = function () {
      this.tweenX.start();
      this.tweenY.start();
    };

    CLOUD_PLATFORM.prototype.stop = function () {
      this.tweenX.stop();
      this.tweenY.stop();
    };

    return CLOUD_PLATFORM;
  })(),

  MAIN = (function() {
    function _start() {
      /* RESIZEABLE GAME */
      _GAME.scale.setMinMax(CONST.SCREEN.WIDTH, CONST.SCREEN.HEIGHT);
      _GAME.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      _GAME.scale.refresh();

      /** STATES: http://phaser.io/docs/2.4.7/Phaser.State.html */
      _GAME.state.add(_STATES.MAIN.id, _STATES.MAIN);
      _GAME.state.start(_STATES.MAIN.id);
    }

    var
      /** new Game(WIDTH, HEIGHT, renderer, parent, state, transparent, antialias, physicsConfig) */
      _GAME = new Phaser.Game(CONST.SCREEN.WIDTH, CONST.SCREEN.HEIGHT, Phaser.CANVAS),
      _R = RESOURCE,

      /** STATE TEMPLATE VARIABLES / CUSTOM FUNCTIONS */
      /*
      vars: {
        v_1: null
      },

      fn: {
        function_1: function() {
        }
      },
      */

      _STATES = {
        MAIN: {
          id: "MAIN",

          vars: {
            cursors: null,
            clouds: null,
            jump_timer: 0,
            stationary_platforms: null
          },

          /** BUILT-IN STATE FUNCTIONS */
          init: function() {
            _GAME.renderer.renderSession.roundPixels = true;
            this.world.resize(CONST.SCREEN.WIDTH * 3, CONST.SCREEN.HEIGHT);
            this.physics.startSystem(Phaser.Physics.ARCADE);
            this.physics.arcade.gravity.y = 600;
          },

          preload: function() {
            this.load.image(_R.background.id, _R.background.location);
            this.load.image(_R.cloud_platform.id, _R.cloud_platform.location);
            this.load.image(_R.platform.id, _R.platform.location);
            this.load.image(_R.trees.id, _R.trees.location);
            this.load.spritesheet(_R.dude.id, _R.dude.location, 32, 48);
          },

          // TODO - FIGURE OUT TILESPRITE COORDINATE PLACEMENT
          create: function() {
            var
              _V = this.vars,
              cloud1, cloud2, cloud3;

            _R.background.obj = this.add.tileSprite(0, 0, CONST.SCREEN.WIDTH, CONST.SCREEN.HEIGHT, _R.background.id);
            _R.background.obj.fixedToCamera = true;

            _R.trees.obj = this.add.tileSprite(0, 364, 640, 116, _R.trees.id);
            _R.trees.obj.fixedToCamera = true;

            // STATIONARY PLATFORMS
            _V.stationary_platforms = this.add.physicsGroup();

            _V.stationary_platforms.create(0, 96, _R.platform.id);
            _V.stationary_platforms.create(632, 220, _R.platform.id);
            _V.stationary_platforms.create(1100, 300, _R.platform.id);

            _V.stationary_platforms.setAll("body.allowGravity", false);
            _V.stationary_platforms.setAll("body.immovable", true);

            // MOVING PLATFORMS (CLOUDS)
            _V.clouds = this.add.physicsGroup();

            cloud1 = new CLOUD_PLATFORM(_GAME, 300, 450, _R.cloud_platform.id, _V.clouds);
            cloud2 = new CLOUD_PLATFORM(_GAME, 800, 96, _R.cloud_platform.id, _V.clouds);
            cloud3 = new CLOUD_PLATFORM(_GAME, 1300, 290, _R.cloud_platform.id, _V.clouds);

            cloud1.addMotionPath([
              { x: "+200", xSpeed: 2000, xEase: "Linear", y: "-200", ySpeed: 2000, yEase: "Sine.easeIn" },
              { x: "-200", xSpeed: 2000, xEase: "Linear", y: "-200", ySpeed: 2000, yEase: "Sine.easeOut" },
              { x: "-200", xSpeed: 2000, xEase: "Linear", y: "+200", ySpeed: 2000, yEase: "Sine.easeIn" },
              { x: "+200", xSpeed: 2000, xEase: "Linear", y: "+200", ySpeed: 2000, yEase: "Sine.easeOut" }
            ]);

            cloud2.addMotionPath([
              { x: "+0", xSpeed: 2000, xEase: "Linear", y: "+300", ySpeed: 2000, yEase: "Sine.easeIn" },
              { x: "-0", xSpeed: 2000, xEase: "Linear", y: "-300", ySpeed: 2000, yEase: "Sine.easeOut" }
            ]);

            cloud3.addMotionPath([
              { x: "+500", xSpeed: 4000, xEase: "Expo.easeIn", y: "-200", ySpeed: 3000, yEase: "Linear" },
              { x: "-500", xSpeed: 4000, xEase: "Expo.easeOut", y: "+200", ySpeed: 3000, yEase: "Linear" }
            ]);

            // THE PLAYER DUDE
            _R.dude.obj = this.add.sprite(32, 0, _R.dude.id);

            this.physics.arcade.enable(_R.dude.obj);

            _R.dude.obj.body.collideWorldBounds = true;
            _R.dude.obj.body.setSize(20, 32, 5, 16);

            _R.dude.obj.animations.add(CONST.DIRECTION.LEFT, [0, 1, 2, 3], 10, true);
            _R.dude.obj.animations.add(CONST.DIRECTION.TURN, [4], 20, true);
            _R.dude.obj.animations.add(CONST.DIRECTION.RIGHT, [5, 6, 7, 8], 10, true);

            this.camera.follow(_R.dude.obj);

            // ---
            _V.cursors = this.input.keyboard.createCursorKeys();

            _V.clouds.callAll("start");  // SIMILAR TO .setAll() GROUP METHOD
          },

          update: function() {
            var
              dude = _R.dude.obj,
              standing = false,
              _V = this.vars;

            // ..COOL PARALLAX
            _R.background.obj.tilePosition.x = -(this.camera.x * 0.15);
            _R.trees.obj.tilePosition.x = -(this.camera.x * 0.9);

            this.physics.arcade.collide(_R.dude.obj, _V.stationary_platforms);
            this.physics.arcade.collide(_R.dude.obj, _V.clouds, this.customSep, null, this);

            // THIS STEP MUST BE PERFORMED AFTER COLLISION CHECKS
            standing = dude.body.blocked.down || dude.body.touching.down || this.locked;

            dude.body.velocity.x = 0;

            if (_V.cursors.left.isDown && !_V.cursors.right.isDown) {
              dude.body.velocity.x = -150;

              if (_R.dude.facing !== CONST.DIRECTION.LEFT) {
                dude.play(CONST.DIRECTION.LEFT);
                _R.dude.facing = CONST.DIRECTION.LEFT;
              }
            }

            else if (!_V.cursors.left.isDown && _V.cursors.right.isDown) {
              dude.body.velocity.x = 150;

              if (_R.dude.facing !== CONST.DIRECTION.RIGHT) {
                dude.play(CONST.DIRECTION.RIGHT);
                _R.dude.facing = CONST.DIRECTION.RIGHT;
              }
            }

            else {
              if (_R.dude.facing !== CONST.DIRECTION.IDLE) {
                dude.animations.stop();

                if (_R.dude.facing === CONST.DIRECTION.LEFT)
                  dude.frame = 0;
                else
                  dude.frame = 5;

                _R.dude.facing = CONST.DIRECTION.IDLE;
              }
            }

            if (standing && _V.cursors.up.isDown && this.time.time > _V.jump_timer) {
              if (_R.dude.locked)
                this.cancelLock();

              _R.dude.will_jump = true;
            }

            if (_R.dude.locked)
              this.checkLock();
          },

          preRender: function() {
            var
              dude = _R.dude;

            if (_GAME.paused)
              return;

            if (dude.locked || dude.was_locked) {
              dude.obj.x += dude.locked_to.deltaX;
              dude.obj.y = dude.locked_to.y - 48;

              if (dude.obj.body.velocity.x !== 0)
                dude.obj.body.velocity.y = 0;
            }

            if (dude.will_jump) {
              dude.will_jump = false;

              if (dude.locked_to && dude.locked_to.deltaX < 0 && dude.was_locked)
                // IF THE PLATFORM IS MOVING UP WE ADD ITS VELOCITY TO THE PLAYERS JUMP
                dude.obj.body.velocity.y = -300 + (dude.locked_to.deltaY * 10);

              else
                dude.obj.body.velocity.y = -300;
            }

            if (dude.was_locked) {
              dude.was_locked = false;
              dude.locked_to.playerLocked = false;
              dude.locked_to = null;
            }
          },

          /** CUSTOM STATE FUNCTIONS */
          cancelLock: function() {
            _R.dude.was_locked = true;
            _R.dude.locked = false;
          },

          checkLock: function() {
            var body = _R.dude.obj.body;

            body.velocity.y = 0;

            //  IF THE PLAYER HAS WALKED OFF EITHER SIDE OF THE PLATFORM THEN THEY'RE NO LONGER LOCKED TO IT
            if (body.right < _R.dude.locked_to.body.x || body.x > _R.dude.locked_to.body.right)
              this.cancelLock();
          },

          customSep: function(player, platform) {
            if (!_R.dude.locked && player.body.velocity.y > 0) {
              _R.dude.locked = true;
              _R.dude.locked_to = platform;
              platform.playerLocked = true;

              player.body.velocity.y = 0;
            }
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