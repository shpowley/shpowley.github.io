/* global Phaser */
var
  RESOURCE = {
    wiggly: {
      id: "wiggly",
      location: "wiggly.svg",
      obj: null
    }
  },

  MAIN = (function() {
    function _start() {
      _GAME.state.add(_STATES.BOOT.id, _STATES.BOOT);
      _GAME.state.start(_STATES.BOOT.id);
    }

    var
      /** new Game(width, height, renderer, parent, state, transparent, antialias, physicsConfig) */
      _GAME = new Phaser.Game(800, 600, Phaser.WEBGL, null, null, true),
      _CURSORS,
      _R = RESOURCE,

      /** STATES: http://phaser.io/docs/2.4.6/Phaser.State.html */
      /**
       * BUILT-IN STATES / EXECUTION ORDER:
       * - init() - very 1st function called
       * - preload() - load game assets
       *   - loadRender()
       *   - loadUpdate()
       * - create()
       * - update()
       *   - paused()
       *     - pauseUpdate()
       *   - resume()
       *   - resize()
       *   - preRender()
       *   - render()
       * - shutdown() - state is switched
       */
      _STATES = {
        BOOT: {
          id: "BOOT",

          /** TEMPLATE VARIABLES / CUSTOM FUNCTIONS */
          vars: {
            base: null,
            spring_linear: null,
            spring_rotational: null
          },
          /*

          fn: {
            function_1: function() {
            }
          },
          */

          /** BUILT-IN STATE FUNCTIONS */
          preload: function() {
            _GAME.load.image(_R.wiggly.id, _R.wiggly.location);
          },

          create: function() {
            _CURSORS = _GAME.input.keyboard.createCursorKeys();

            _GAME.physics.startSystem(Phaser.Physics.P2JS);

            this.vars.base = _GAME.add.sprite(_GAME.world.centerX, _GAME.world.centerY, _R.wiggly.id);
            _R.wiggly.obj = _GAME.add.sprite(_GAME.world.centerX, _GAME.world.centerY, _R.wiggly.id);

            _R.wiggly.obj.anchor.setTo(0.5); // TODO - MAYBE ADJUSTED FOR PIGGLY FACE - CENTER
            this.vars.base.anchor.setTo(0.5);
            this.vars.base.visible = false;

            // enable(object, debug, children) - http://phaser.io/docs/2.4.6/Phaser.Physics.P2.html#enable
            _GAME.physics.p2.enable([this.vars.base, _R.wiggly.obj]);

            // KEEP ANCHORS IN FIXED LOCATION
            this.vars.base.body.static = true;

            // PREVENT COLLISION WITH ANCHORS
            this.vars.base.body.clearCollision(true, true); // NOT REALLY NECESSARY, AS SET ON WIGGLY BODY
            _R.wiggly.obj.body.clearCollision(true, true); // NOTE: DOESN'T COLLIDE WITH BASE AND AVOID BOUNDARIES

            _R.wiggly.obj.body.mass = 0.3;
            _R.wiggly.obj.body.angularDamping = 0.2;
            _R.wiggly.obj.body.damping = 0.2;

            // new Spring(world, bodyA, bodyB, restLength, stiffness, damping, worldA, worldB, localA, localB)
            this.vars.spring_linear = _GAME.physics.p2.createSpring(_R.wiggly.obj, this.vars.base, 0, 20, 0.5);

            // createRotationalSpring(bodyA, bodyB, restAngle, stiffness, damping)
            this.vars.spring_rotational = _GAME.physics.p2.createRotationalSpring(_R.wiggly.obj, this.vars.base, 0, 1000, 0.5);
          },

          update: function() {
            /** THIS SEEMS TO WORK OK FOR X/Y FORCES */
            /**
             * - maybe limit max velocity
             */
            if (_CURSORS.left.isDown && !_CURSORS.right.isDown) {
              _R.wiggly.obj.body.applyForce([50, 0], 0, 0);
              _R.wiggly.obj.body.angularForce = -100;
            }
            else if (!_CURSORS.left.isDown && _CURSORS.right.isDown) {
              _R.wiggly.obj.body.applyForce([-50, 0], 0, 0);
              _R.wiggly.obj.body.angularForce = 100;
            }

            if (_CURSORS.up.isDown && !_CURSORS.down.isDown) {
              _R.wiggly.obj.body.applyForce([0, 50], 0, 0);
              _R.wiggly.obj.body.angularForce = 100;
            }
            else if (!_CURSORS.up.isDown && _CURSORS.down.isDown) {
              _R.wiggly.obj.body.applyForce([0, -50], 0, 0);
              _R.wiggly.obj.body.angularForce = -100;
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