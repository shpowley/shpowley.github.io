/**
 * TANKS - PART 2 | http://phaser.io/tutorials/coding-tips-002
 */

/* global Phaser */
var
  RESOURCE = {
    background: {
      id: "background",
      location: "../001/assets/background.png",
      obj: null
    },

    bullet: {
      id: "bullet",
      location: "../001/assets/bullet.png",
      obj: null
    },

    flame: {
      id: "flame",
      location: "../001/assets/flame.png",
      obj: null
    },

    land: {
      id: "land",
      location: "../001/assets/land.png",
      obj: null
    },

    tank: {
      id: "tank",
      location: "../001/assets/tank.png",
      obj: null
    },

    target: {
      id: "target",
      location: "../001/assets/target.png",
      group: null
    },

    turret: {
      id: "turret",
      location: "../001/assets/turret.png",
      obj: null
    },
  },

  MAIN = (function() {
    function _start() {
      // _GAME = new Phaser.Game(640, 480, Phaser.AUTO, "game"); // BUG IN 2.4.7 DOESN'T ALLOW SCALE TO WINDOW WITH A PARENT CONTAINER
      _GAME = new Phaser.Game(640, 480, Phaser.CANVAS, null); // NOTE: BLENDING USED TO CREATE BULLET CRATERS ONLY SEEM TO WORK WITH CANVAS RENDERER

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
            explosion: null,
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
            // this.load.baseURL = 'http://files.phaser.io.s3.amazonaws.com/codingtips/issue002/';
            // this.load.crossOrigin = 'anonymous'; // used in conjunction w/ .baseURL; see docs

            this.load.image(_R.background.id, _R.background.location);
            this.load.image(_R.bullet.id, _R.bullet.location);
            this.load.image(_R.flame.id, _R.flame.location);
            this.load.image(_R.land.id, _R.land.location);
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
            _R.target.group.create(284, 378, _R.target.id);
            _R.target.group.create(456, 153, _R.target.id);
            _R.target.group.create(545, 305, _R.target.id);
            _R.target.group.create(726, 391, _R.target.id);
            _R.target.group.create(972, 74, _R.target.id);

            // .setAll(key, value, checkAlive, checkVisible, operation, force)
            // - Quickly set the same property across all children of this group to a new value.
            // - NOTE: doesn't descend down children (see Group.setAllChildren)
            _R.target.group.setAll("body.allowGravity", false);

            /* DEFORMABLE LAND */
            // - Phaser.BitmapData can be manipulated and drawn to like a traditional canvas object
            _R.land.obj = this.add.bitmapData(992, 480);
            _R.land.obj.draw(_R.land.id); // draws "land" graphic to BitmapData
            _R.land.obj.update();
            _R.land.obj.addToWorld(); // creates a new Phaser.Image object based on BitmapData, placed on the world

            /* EXPLOSION */
            _V.explosion = this.add.emitter(0, 0, 30); // EMITTER = LIGHTWEIGHT PARTICLE EMITTER USING ARCADE PHYSICS (EXPLOSIONS, RAIN, FIRE, ETC)
            _V.explosion.makeParticles("flame"); // makeParticles(keys, frames, quantity, collide, collideWorldBounds)
            _V.explosion.setXSpeed(-120, 120); // EMITTER MIN/MAX X-VELOCITY RANGE
            _V.explosion.setYSpeed(-100, -200); // EMITTER MIN/MAX Y-VELOCITY RANGE
            // _V.explosion.setRotation(); // NO PARAMETERS = ROTATION DISABLED FOR EMITTER PARTICLES

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
            var
              bullet = _R.bullet.obj;


            // bullet "in flight"
            if (_R.bullet.obj.exists) {
              // out of bounds check
              if (bullet.x < 0 || bullet.x > _GAME.world.width || bullet.y > _GAME.world.height)
                this.removeBullet();

              else {
                // bullet hits a target?
                // .overlap(object1, object2, overlapCallback, processCallback, callbackContext_obj)
                this.physics.arcade.overlap(bullet, _R.target.group, this.hitTarget, null, this);

                // bullet hits land mass?
                this.bulletVsLand(Math.floor(bullet.x), Math.floor(bullet.y));
              }
            }

            // tank control mode
            else {
              var _V = this.vars;

              // power: 100 - 600
              if (_V.cursors.down.isDown && !_V.cursors.up.isDown && _V.power.value > 100)
                _V.power.value -= 2;

              else if (!_V.cursors.down.isDown && _V.cursors.up.isDown && _V.power.value < 600)
                _V.power.value += 2;

              // angle: -90 (straight up) - 0 (straight/right)
              if (_V.cursors.left.isDown && !_V.cursors.right.isDown && _R.turret.obj.angle > -90)
                _R.turret.obj.angle--;

              else if (!_V.cursors.left.isDown && _V.cursors.right.isDown && _R.turret.obj.angle < 0)
                _R.turret.obj.angle++;

              // update HUD
              _V.power.text_obj.text = "Power: " + _V.power.value;
            }
          },

          /** CUSTOM FUNCTIONS */
          bulletVsLand: function(x, y) {
            // .getPixel() GET THE COLOR OF A SPECIFIC PIXEL
            var
              land = _R.land.obj, // BitmapData
              rgba = land.getPixel(x, y);

            // CHECK LAND MASS PIXEL ALPHA @ BULLET'S X/Y EACH FRAME
            if (rgba.a > 0) {
              // THIS EFFECTIVELY CREATES A CIRCULAR CRATER IN THE LAND MASS BITMAP DATA
              // - NOTE: AFTER SOME RESEARCH & TESTING, THESE BLEND OPERATIONS ONLY WORK WHEN USING THE CANVAS RENDERER
              // - METHODS CAN BE CHAINED
              // - COMPOSITE OPERATIONS: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
              land.blendDestinationOut();
              land.circle(x, y, 16, "rgba(0, 0, 0, 255)");
              land.blendReset();
              land.update();

              this.removeBullet();
            }
          },

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
            this.vars.explosion.at(target);
            this.vars.explosion.explode(2000, 10); // 2 seconds, 10 particles

            // A killed Game Object has its alive, exists and visible properties all set to false
            target.kill();
            this.removeBullet(true);
          },

          removeBullet: function(target_explodes) {
            _R.bullet.obj.kill();
            this.camera.follow(); // reset the camera
            this.add.tween(this.camera).to({ x: 0 }, 1000, "Quint", true, target_explodes ? 2000 : 1000);
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