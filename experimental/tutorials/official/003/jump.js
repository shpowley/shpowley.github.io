/* global Phaser */
var
  CONST = {
    DIRECTION: {
      LEFT: "LEFT",
      RIGHT: "RIGHT",
      TURN: "TURN",
      IDLE: "IDLE"
    }
  },

  RESOURCE = {
    clouds: {
      id: "clouds",
      location: "assets/clouds.png",
      obj: null
    },

    dude: {
      id: "dude",
      location: "assets/dude.png",
      obj: null,
      facing: CONST.DIRECTION.LEFT,
    },

    trees: {
      id: "trees",
      location: "assets/trees.png",
      obj: null
    },

    ice_platform: {
      id: "ice_platform",
      location: "assets/ice-platform.png",
      obj: null
    },

    platform: {
      id: "platform",
      location: "assets/platform.png",
      obj: null
    },
  },

  MAIN = (function() {
    function _start() {
      /* RESIZEABLE GAME */
      _GAME.scale.setMinMax(640, 480);
      _GAME.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      // _GAME.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
      _GAME.scale.refresh();

      /*
      // NOT SURE IF IMPROVES PERFORMANCE
      _GAME.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;

      _GAME.input.onDown.add(function() {
        if (_GAME.scale.isFullScreen)
          _GAME.scale.stopFullScreen();
        else
          _GAME.scale.startFullScreen(false, true);
      }, this);
      */

      _GAME.state.add(_STATES.MAIN.id, _STATES.MAIN);
      _GAME.state.start(_STATES.MAIN.id);
    }

    var
      /** new Game(width, height, renderer, parent, state, transparent, antialias, physicsConfig) */
      _GAME = new Phaser.Game(640, 480, Phaser.CANVAS),
      // _GAME = new Phaser.Game(640, 480, Phaser.AUTO),
      _R = RESOURCE,

      /** STATES: http://phaser.io/docs/2.4.6/Phaser.State.html */
      _STATES = {
        MAIN: {
          id: "MAIN",

          vars: {
            cursors: null,
            edge_timer: 0,
            jump_timer: 0,
            platforms: null,
            was_standing: false
          },

          /** BUILT-IN STATE FUNCTIONS */
          init: function() {
            _GAME.renderer.renderSession.roundPixels = true;
            this.world.resize(640, 2000);

            this.physics.startSystem(Phaser.Physics.ARCADE);
            this.physics.arcade.gravity.y = 750;
            this.physics.arcade.skipQuadTree = false; // "QuadTrees are great if objects are well spread out in your game, otherwise they are a performance hit."
          },

          preload: function() {
            this.load.image(_R.clouds.id, _R.clouds.location);
            this.load.image(_R.ice_platform.id, _R.ice_platform.location);
            this.load.image(_R.platform.id, _R.platform.location);
            this.load.image(_R.trees.id, _R.trees.location);
            this.load.spritesheet(_R.dude.id, _R.dude.location, 32, 48);
          },

          create: function() {
            var
              _V = this.vars,
              type,
              platform,
              i = 0,
              x = 0,
              y = 64;

            this.stage.backgroundColor = "#2F9ACC";

            _R.clouds.obj = this.add.tileSprite(0, 0, 640, 480, _R.clouds.id);
            _R.clouds.obj.fixedToCamera = true;

            _R.trees.obj = this.add.sprite(0, 1906, _R.trees.id);

            _V.platforms = this.add.physicsGroup();

            // GENERATE RANDOM-SPEED PLATFORMS
            for (; i < 19; i++) {
              type = i % 2 === 1 ? _R.platform.id : _R.ice_platform.id;
              platform = _V.platforms.create(x, y, type);

              platform.body.velocity.x = _GAME.rnd.between(100, 150);  // RANDOM PLATFORM SPEED

              if (Math.random() > 0.5)
                platform.body.velocity.x *= -1;

              x += 200;

              if (x >= 600)
                x = 0;

              y += 104;
            }

            _V.platforms.setAll("body.allowGravity", false);
            _V.platforms.setAll("body.immovable", true);

            _R.dude.obj = this.add.sprite(320, 1952, _R.dude.id);
            this.physics.arcade.enable(_R.dude.obj);
            _R.dude.obj.body.collideWorldBounds = true;

            /** setSize(width, height, offsetX, offsetY)
             * - modify the size of the physics Body to be any dimension you need (smaller or larger than the parent Sprite)
             * - also control the x and y offset */
            // _R.dude.obj.body.setSize(20, 32, 5, 16);
            _R.dude.obj.body.setSize(12, 32, 10, 16);

            /** add(name, frames, frameRate, loop, useNumericIndex) */
            _R.dude.obj.animations.add(CONST.DIRECTION.LEFT, [0, 1, 2, 3], 10, true);
            _R.dude.obj.animations.add(CONST.DIRECTION.TURN, [4], 20, true);
            _R.dude.obj.animations.add(CONST.DIRECTION.RIGHT, [5, 6, 7, 8], 10, true);

            this.camera.follow(_R.dude.obj);

            _V.cursors = this.input.keyboard.createCursorKeys();
          },

          update: function() {
            var
              _V = this.vars,
              dude = _R.dude.obj,
              player_standing;

            /** * 0.7 : "gives the illusion of a bit more depth to the scrolling"
             *  - essentially a parallax effect
             *  - a higher number creates a more drastic effect, a smaller number makes background appear further away */
            _R.clouds.obj.tilePosition.y = -(this.camera.y * 0.7);

            /** Phaser.Group IS NOT AN ARRAY, BUT DOES HAVE A BUILT-IN forEach() */
            _V.platforms.forEach(this.wrapPlatform, this);

            /** .collide(object1, object2, collideCallback, processCallback, callbackContext)
             *  - recommended to use newer .body.friction property instead of this callback method */
            this.physics.arcade.collide(dude, _V.platforms, this.setFriction, null, this);

            /** PERFORM AFTER THE COLLIDE CHECK
             *  - Arcade.Body
             *    - .blocked | up/down/left/right
             *    - .touching | none/up/down/left/right */
            player_standing = dude.body.blocked.down || dude.body.touching.down;

            dude.body.velocity.x = 0;

            if (_V.cursors.left.isDown) {
              dude.body.velocity.x = -200;

              if (_R.dude.facing !== CONST.DIRECTION.LEFT) {
                dude.play(CONST.DIRECTION.LEFT);
                _R.dude.facing = CONST.DIRECTION.LEFT;
              }
            }

            else if (_V.cursors.right.isDown) {
              dude.body.velocity.x = 200;

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

            // ALLOWS EXTRA TIME TO PERFORM JUMP, EVEN HAVING FALLEN OFF A PLATFORM
            if (!player_standing && _V.was_standing)
              _V.edge_timer = this.time.time + 250;

            if ((player_standing || this.time.time <= _V.edge_timer) && _V.cursors.up.isDown && this.time.time > _V.jump_timer) {
              dude.body.velocity.y = -500;
              _V.jump_timer = this.time.time + 750;
            }

            _V.was_standing = player_standing;
          },

          // render: function() {
          //   _GAME.debug.body(_R.dude.obj);
          // },

          /** CUSTOM STATE FUNCTIONS */
          wrapPlatform: function(platform) {
            if (platform.body.velocity.x < 0 && platform.x <= -160)
              platform.x = 640;

            else if (platform.body.velocity.x > 0 && platform.x >= 640)
              platform.x = -160;
          },

          setFriction: function(player, platform) {
            if (platform.key === _R.ice_platform.id)
              player.body.x -= platform.body.x - platform.body.prev.x;
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