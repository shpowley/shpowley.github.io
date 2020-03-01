/**
 * TANKS - PART 1 | http://phaser.io/tutorials/coding-tips-001
 */

/* global Phaser */
var
  RESOURCE = {
    background: {
      id: "background",
      location: "assets/background.png",
      obj: null
    },

    bullet: {
      id: "bullet",
      location: "assets/bullet.png",
      obj: null
    },

    flame: {
      id: "flame",
      location: "assets/flame.png",
      obj: null
    },

    tank: {
      id: "tank",
      location: "assets/tank.png",
      obj: null
    },

    target: {
      id: "target",
      location: "assets/target.png",
      group: null
    },

    turret: {
      id: "turret",
      location: "assets/turret.png",
      obj: null
    },
  },

  MAIN = (function() {
    function _start() {
      // _GAME = new Phaser.Game(640, 480, Phaser.AUTO, "tank-game");
      _GAME = new Phaser.Game(640, 480, Phaser.AUTO, null);

      _GAME.state.add(_STATES.MAIN.id, _STATES.MAIN);
      _GAME.state.start(_STATES.MAIN.id);
    }

    var
      /** new Game(width, height, renderer, parent, state, transparent, antialias, physicsConfig) */
      _GAME,
      _R = RESOURCE,


      _STATES = {
        MAIN: {
          id: "MAIN",

          /** STATE VARIABLES */
          vars: {
            cursors: null,
            fire_button: null,

            power: {
              value: 0,
              text_obj: null,
            }
          },

          /** BUILT-IN STATE FUNCTIONS */
          init: function() {
            // PIXI.js | If true Pixi will Math.floor() x/y values when rendering, stopping pixel interpolation. Handy for crisp pixel art and speed on legacy devices.
            _GAME.renderer.renderSession.roundPixels = true;

            _GAME.world.setBounds(0, 0, 992, 480);

            // NOTE: "this" refers to current STATE
            this.physics.startSystem(Phaser.Physics.ARCADE); // NOTE: physics set for the state
            this.physics.arcade.gravity.y = 200;
          },

          preload: function() {
            /* RESIZEABLE GAME */
            // setMinMax(minWidth, minHeight, maxWidth, maxHeight)
            _GAME.scale.setMinMax(640, 480);

            // .SHOW_ALL = Show the entire game display area while maintaining the original aspect ratio
            _GAME.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

            // .refresh() = informs the ScaleManager that a layout refresh is required
            _GAME.scale.refresh();

            // Useful if allowing the asset base url to be configured outside of the game code. The string must end with a "/".
            // this.load.baseURL = 'http://files.phaser.io.s3.amazonaws.com/codingtips/issue001/';
            // this.load.crossOrigin = 'anonymous'; // used in conjunction w/ .baseURL; see docs

            this.load.image(_R.background.id, _R.background.location);
            this.load.image(_R.bullet.id, _R.bullet.location);
            this.load.image(_R.flame.id, _R.flame.location);
            this.load.image(_R.tank.id, _R.tank.location);
            this.load.image(_R.target.id, _R.target.location);
            this.load.image(_R.turret.id, _R.turret.location);
          },

          create: function() {
            var _V = this.vars;

            /* BACKGROUND */
            _R.background.obj = this.add.sprite(0, 0, _R.background.id);

            /* TARGETS */
            // .add.group(parent, name, addToStage, enableBody, physicsBodyType)
            _R.target.group = this.add.group(_GAME.world, _R.target.id, false, true, Phaser.Physics.ARCADE);
            _R.target.group.create(300, 390, _R.target.id);
            _R.target.group.create(500, 390, _R.target.id);
            _R.target.group.create(700, 390, _R.target.id);
            _R.target.group.create(900, 390, _R.target.id);

            // .setAll(key, value, checkAlive, checkVisible, operation, force)
            // - Quickly set the same property across all children of this group to a new value.
            // - NOTE: doesn't descend down children (see Group.setAllChildren)
            _R.target.group.setAll("body.allowGravity", false);

            /* BULLET */
            _R.bullet.obj = this.add.sprite(0, 0, _R.bullet.id);
            _R.bullet.obj.exists = false; // controls physics body interaction & visibility
            this.physics.arcade.enable(_R.bullet.obj);

            /* TANK */
            _R.tank.obj = this.add.sprite(24, 383, _R.tank.id);

            /* TURRET */
            _R.turret.obj = this.add.sprite(_R.tank.obj.x + 30, _R.tank.obj.y + 14, _R.turret.id);

            /* TURRET FIRING */
            _R.flame.obj = this.add.sprite(0, 0, _R.flame.id);
            _R.flame.obj.anchor.set(0.5);
            _R.flame.obj.visible = false;

            /* HUD - POWER */
            _V.power.value = 300;
            _V.power.text_obj = this.add.text(8, 8, "Power: 300", { font: "18px Arial", fill: "#fff" });

            // setShadow(x, y, color, blur, shadowStroke, shadowFill)
            _V.power.text_obj.setShadow(1, 1, "rgba(0, 0, 0, 0.8)", 1);
            _V.power.text_obj.fixedToCamera = true;

            /* KEYBOARD CONTROLS */
            _V.cursors = this.input.keyboard.createCursorKeys();

            _V.fire_button = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            _V.fire_button.onDown.add(this.fire, this);
          },

          update: function() {
            // bullet "in flight"
            if (_R.bullet.obj.exists) {
              // bullet misses..
              if (_R.bullet.obj.y > 425)
                this.removeBullet();

              // bullet hits a target?
              // .overlap(object1, object2, overlapCallback, processCallback, callbackContext_obj)
              else
                this.physics.arcade.overlap(_R.bullet.obj, _R.target.group, this.hitTarget, null, this);
            }

            // tank control mode
            else {
              var _V = this.vars;

              // power: 100 - 600
              if (_V.cursors.left.isDown && !_V.cursors.right.isDown && _V.power.value > 100)
                _V.power.value -= 2;

              else if (!_V.cursors.left.isDown && _V.cursors.right.isDown && _V.power.value < 600)
                _V.power.value += 2;

              // angle: -90 (straight up) - 0 (straight/right)
              if (_V.cursors.up.isDown && !_V.cursors.down.isDown && _R.turret.obj.angle > -90)
                _R.turret.obj.angle--;

              else if (!_V.cursors.up.isDown && _V.cursors.down.isDown && _R.turret.obj.angle < 0)
                _R.turret.obj.angle++;

              // update HUD
              _V.power.text_obj.text = "Power: " + _V.power.value;
            }
          },

          /** CUSTOM FUNCTIONS */
          fire: function() {
            if (_R.bullet.obj.exists)
              return;

            // reposition single-shot bullet
            _R.bullet.obj.reset(_R.turret.obj.x, _R.turret.obj.y);

            var p = new Phaser.Point(_R.turret.obj.x, _R.turret.obj.y);

            // determine end point of cannon for "blast fire" graphic
            // rotate(x, y, angle, asDegrees, distance)
            p.rotate(p.x, p.y, _R.turret.obj.rotation, false, _R.turret.obj.width + 10); // NOTE: .rotation is in radians; for .angle for degrees

            // position "blast fire"
            _R.flame.obj.x = p.x;
            _R.flame.obj.y = p.y;
            _R.flame.obj.alpha = 1;
            _R.flame.obj.visible = true;

            // "BOOM" visual: bright --> fade
            // to(properties, duration, ease, autoStart, delay, repeat, yoyo)
            this.add.tween(_R.flame.obj).to({ alpha: 0 }, 500, "Linear", true);

            // camera follows the bullet
            this.camera.follow(_R.bullet.obj);

            // velocityFromRotation(rotation, speed, point)
            // - applies velocity calculation to point (physics body)
            this.physics.arcade.velocityFromRotation(_R.turret.obj.rotation, this.vars.power.value, _R.bullet.obj.body.velocity);
          },

          // NOTE: notice the 2 parameters passed
          // - target is a child within the "targets" group, and would otherwise be difficult to identify
          hitTarget: function(bullet, target) {
            // A killed Game Object has its alive, exists and visible properties all set to false
            target.kill();
            this.removeBullet();
          },

          removeBullet: function() {
            _R.bullet.obj.kill();
            this.camera.follow(); // reset the camera
            this.add.tween(this.camera).to({ x: 0 }, 1000, "Quint", true, 1000);
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