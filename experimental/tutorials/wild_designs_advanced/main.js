// TUTORIAL: https://youtu.be/2JWbytEGjhM
/* global Phaser */
var
  RESOURCE = {
    button: {
      id: "buttons",
      location: "buttons.png",
      obj: null,

      sprite: {
        w: 193,
        h: 71
      },
    },

    logo: {
      id: "logo",
      location: "hearts.png",
      obj: null
    },

    pepper: {
      id: "pepper",
      location: "pepper.png",
      obj: null
    },

    player: {
      id: "player",
      location: "player.png",
      obj: null,

      sprite: {
        w: 24,
        h: 26
      },

      animation: {
        IDLE: "idle",
        JUMP: "jump",
        RUN: "run"
      },

      position_start: {
        x: 100,
        y: 560
      },

      speed: 250,
      jump_time: 0
    },

    preload_bar: {
      id: "preload_bar",
      location: "preload_bar.png",
      obj: null
    },

    tilemap: {
      id: "map",
      location: "level_1.csv",
      map: null,
      layer: null,

      tile: {
        w: 64,
        h: 64
      }
    },

    tileset: {
      id: "tileset",
      location: "tiles.png"
    }
  },

  MAIN = (function() {
    function _init() {
      _GAME.state.add(_STATES.BOOT.id, _STATES.BOOT);
      _GAME.state.add(_STATES.PRELOADER.id, _STATES.PRELOADER);
      _GAME.state.add(_STATES.MAIN_MENU.id, _STATES.MAIN_MENU);
      _GAME.state.add(_STATES.LEVEL_1.id, _STATES.LEVEL_1);
      _GAME.state.start(_STATES.BOOT.id);
    }

    var
      _GAME = new Phaser.Game(800, 600, Phaser.WEBGL, "game_div"),
      _R = RESOURCE, // image resources
      _KEYS, // keyboard controls (@LEVEL_1.create())
      _PLAYER, // player object ref (@LEVEL_1.create())
      _ANIMATION = _R.player.animation,

      _STATES = {
        BOOT: {
          id: "BOOT",

          init: function() {
            _GAME.input.maxPointers = 1; // NOTE: NOT SURE IF NECESSARY OR BEST IMPLEMENTATION
            _GAME.stage.disableVisibilityChange = true; // NOTE: TRUE = PREVENT AUTO-PAUSE; DEFAULT IS TO PAUSE WHEN BROWSER TAB LOSES FOCUS
          },

          preload: function() {
            _GAME.load.image(_R.logo.id, _R.logo.location);
            _GAME.load.image(_R.preload_bar.id, _R.preload_bar.location);
          },

          create: function() {
            _GAME.state.start(_STATES.PRELOADER.id);
          }
        },

        PRELOADER: {
          id: "PRELOADER",

          preload: function() {
            _R.logo.obj = _GAME.add.sprite(_GAME.world.centerX, _GAME.world.centerY - 30, _R.logo.id);
            _R.logo.obj.anchor.setTo(0.5);

            _R.preload_bar.obj = _GAME.add.sprite(_GAME.world.centerX - 189, _GAME.world.centerY + 30, _R.preload_bar.id);

            // _GAME.time.advancedTiming = true; // NOTE: TRUE IF FPS-RELATED INFO REQUIRED
            _GAME.load.setPreloadSprite(_R.preload_bar.obj); // setPreloadSprite(sprite, direction) | CROPS IMAGE 100% > 0%

            // LOAD ALL ASSETS
            _GAME.load.tilemap(_R.tilemap.id, _R.tilemap.location); // LOAD TILED MAP FILE (CSV OR JSON)
            _GAME.load.image(_R.tileset.id, _R.tileset.location);   // LOAD TILED IMAGE FILE
            _GAME.load.spritesheet(_R.player.id, _R.player.location, _R.player.sprite.w, _R.player.sprite.h);
            _GAME.load.spritesheet(_R.button.id, _R.button.location, _R.button.sprite.w, _R.button.sprite.h);
            _GAME.load.image(_R.pepper.id, _R.pepper.location);
          },

          create: function() {
            _GAME.time.events.add(1200, function() {
              _GAME.state.start(_STATES.LEVEL_1.id);
            });
          }
        },

        LEVEL_1: {
          id: "LEVEL_1",

          create: function() {
            var
              tilemap = _R.tilemap;

            _GAME.stage.backgroundColor = "#3A5963"; // STAGE = ROOT LEVEL DISPLAY OBJECT
            _GAME.physics.arcade.gravity.y = 1300; // ARCADE PHYSICS SYSTEM - WORLD GRAVITY

            // _GAME.physics.arcade.skipQuadTree = false; // ARCADE PHYSICS ONLY; USED WITH .debug.quadTree

            tilemap.map = _GAME.add.tilemap(tilemap.id, tilemap.tile.w, tilemap.tile.h); // CREATE A NEW TILEMAP OBJECT POPULATED WITH DATA BASED ON TILED JSON/CSV KEY FILE
            tilemap.map.addTilesetImage(_R.tileset.id); // ASSOCIATES AN ACTUAL IMAGE TO THE TILEMAP

            tilemap.layer = tilemap.map.createLayer(0);
            tilemap.layer.resizeWorld(); // SETS THE WORLD SIZE TO MATCH THE SIZE OF THIS LAYER

            tilemap.map.setCollisionBetween(0, 2); // SET COLLISION (ON/OFF) ON A RANGE OF TILES
            tilemap.map.setTileIndexCallback(5, this.resetPlayer, this); // PLAYER RUNS INTO SPIKES | SETS GLOBAL COLLISION CALLBACK FOR A SPECIFIC TILE TYPE
            tilemap.map.setTileIndexCallback(6, this.getCoin, this); // PLAYER RUNS INTO A COIN

            _PLAYER = _R.player.obj = _GAME.add.sprite(_R.player.position_start.x, _R.player.position_start.y, _R.player.id);
            _PLAYER.anchor.setTo(0.5, 0.5); // NOTE: OMITTING THE 2ND PARAMETER SET BOTH X/Y TO THE SAME VALUE; DEFAULT (0, 0) = UPPER-RIGHT-HAND CORNER

            // DEFINE ANIMATIONS AND FRAME SEQUENCES FOR A SPECIFIC SPRITE
            _PLAYER.animations.add(_ANIMATION.IDLE, [0, 1], 1, true);
            _PLAYER.animations.add(_ANIMATION.JUMP, [2], 1, true);
            _PLAYER.animations.add(_ANIMATION.RUN, [3, 4, 5, 6, 7, 8], 7, true);

            _GAME.physics.arcade.enable(_PLAYER); // CREATE AN ARCADE PHYSICS BODY ON A GAME OBJECT
            _GAME.camera.follow(_PLAYER); // TELL THE CAMERA WHICH SPRITE TO FOLLOW
            _PLAYER.body.collideWorldBounds = true; // BODY = GAME OBJECT PHYSICS BODY; STAY WITHIN WORLD BOUND? T/F

            // button(x, y, key, callback, callbackContext, overFrame, outFrame, downFrame, upFrame, group)
            _R.button.obj = _GAME.add.button(_GAME.world.centerX - 95, _GAME.world.centerY + 200, _R.button.id, function() {
              console.log("PRESSED");
            }, this, 2, 1, 0); // LAST PARAMETERS HERE = overFrame, outFrame, downFrame

            _R.button.obj.fixedToCamera = true; // FIXED TO CAMERA (HUD EFFECT) - ON/OFF

            // DRAGGABLE SPRITE
            _R.pepper.obj = _GAME.add.sprite(_PLAYER.x, _PLAYER.y, _R.pepper.id);
            _R.pepper.obj.anchor.setTo(0.5);
            _R.pepper.obj.inputEnabled = true;
            _R.pepper.obj.input.enableDrag(true);

            // DEFINE KEYBOARD CONTROLS
            _KEYS = {
              RIGHT: _GAME.input.keyboard.addKey(Phaser.Keyboard.RIGHT),
              LEFT: _GAME.input.keyboard.addKey(Phaser.Keyboard.LEFT),
              UP: _GAME.input.keyboard.addKey(Phaser.Keyboard.UP)
            };

            // USED IN CONJUNCTION WITH .time.fps
            // _GAME.time.advancedTiming = true;
          },

          update: function() {
            // _GAME.physics.arcade.collide(_PLAYER, _R.tilemap.layer, this.collision, null, this);
            _GAME.physics.arcade.collide(_PLAYER, _R.tilemap.layer);
            _PLAYER.body.velocity.x = 0;

            if (_KEYS.RIGHT.isDown && !_KEYS.LEFT.isDown) {
              _PLAYER.animations.play(_ANIMATION.RUN);
              _PLAYER.scale.setTo(1, 1);
              _PLAYER.body.velocity.x += _R.player.speed;
            }
            else if (!_KEYS.RIGHT.isDown && _KEYS.LEFT.isDown) {
              _PLAYER.animations.play(_ANIMATION.RUN);
              _PLAYER.scale.setTo(-1, 1);
              _PLAYER.body.velocity.x -= _R.player.speed;
            }

            // ONFLOOR = Body (BOTTOM) is in contact with either the world bounds or a tile
            // TOUCHING.DOWN = TEST PHYSICS BODY "TOUCHING" SIDE (EX. BOTTOM)
            if (_KEYS.UP.isDown
              && (_PLAYER.body.onFloor() || _PLAYER.body.touching.down)
              && _GAME.time.now > _R.player.jump_time) {

              _PLAYER.body.velocity.y = -500;
              _R.player.jump_time = _GAME.time.now + 750;
              _PLAYER.animations.play(_ANIMATION.JUMP);
            }

            else if (_PLAYER.body.velocity.x == 0 && _PLAYER.body.velocity.y == 0)
              _PLAYER.animations.play(_ANIMATION.IDLE);
          },

          /**
           * THE COMPLETE GUIDE TO DEBUGGING PHASER GAMES
           * - https://gamedevacademy.org/how-to-debug-phaser-games/
           *
           * NOTE:
           * - many debug functions are "composite"
           * - similar approach can be used to create custom composite debug functions
           */
          render: function() {
            // FPS (NOTE: .time.advancedTiming = true MUST BE SET FOR .time.fps TO WORK CORRECTLY)
            // _GAME.debug.text(_GAME.time.fps + " FPS", 20, 20);

            // _GAME.debug.text(`Debugging Phaser ${Phaser.VERSION}`, 20, 20, 'yellow', 'Segoe UI'); // STRING TEMPLATES - ES6
            // _GAME.debug.text("Debugging Phaser " + Phaser.VERSION, 20, 20, "#fff"); // COLORS - NAMED OR HEX CODE

            // MULTI-LINE / MULTI-COLUMN DEBUG INFO
            // _GAME.debug.start(20, 20, "blue", 80);
            // _GAME.debug.line(); // BLANK LINE
            // _GAME.debug.line("1ST LINE", "COL 2", "COL 3");
            // _GAME.debug.line("2ND LINE", "COL 2");
            // _GAME.debug.stop();

            // CAMERA INFO
            // _GAME.debug.cameraInfo(_GAME.camera, 20, 20);

            // INPUT - KEYS
            // var debug_font = "1.4em 'Lucida Console', monospace";
            // _GAME.debug.font = debug_font; // standard css font - http://www.w3schools.com/cssref/pr_font_font.asp
            // _GAME.debug.text("UP", 20, 20, null, debug_font);
            // _GAME.debug.key(_KEYS.UP, 80, 20);
            // _GAME.debug.text("RIGHT", 20, 20 + 3 * _GAME.debug.lineHeight, null, debug_font);
            // _GAME.debug.key(_KEYS.RIGHT, 80, 20 + 3 * _GAME.debug.lineHeight);
            // _GAME.debug.text("LEFT", 20, 20 + 6 * _GAME.debug.lineHeight, null, debug_font);
            // _GAME.debug.key(_KEYS.LEFT, 80, 20 + 6 * _GAME.debug.lineHeight);

            // INPUT - POINTER (GRAPHICAL, POSITION, CLICK STATE)
            // _GAME.debug.pointer(_GAME.input.activePointer);

            // INPUT - POINTER (FIXED, POSITION DATA ONLY)
            // _GAME.debug.inputInfo(20, 20);

            // SPRITES - SPRITEINFO
            // _GAME.debug.spriteInfo(_PLAYER, 20, 20);

            // SPRITES - SPRITE COORDINATES (USEFUL?)
            // _GAME.debug.spriteCoords(_PLAYER, 20, 20);

            // SPRITES - SPRITE INPUT INFO (SPRITE INPUT FUNCTIONS MUST BE ENABLED - OFF BY DEFAULT)
            // _PLAYER.inputEnabled = true;
            // _GAME.debug.spriteInputInfo(_PLAYER, 20, 20);

            // SPRITES - SPRITE BOUNDS (DRAWS A BOUNDING BOX)
            // _GAME.debug.spriteBounds(_PLAYER);

            // TODO SOUNDS - UNABLE TO TEST AT THE MOMENT
            // _GAME.debug.soundInfo(<sound variable>, 20, 20);

            // GEOMETRY - RECTANGLE, CIRCLE, POINT, LINE
            // _GAME.debug.geom(new Phaser.Rectangle(_PLAYER.x - _PLAYER.width / 2, _PLAYER.y - _PLAYER.height / 2, _PLAYER.width, _PLAYER.height), "blue", false);
            // _GAME.debug.geom(new Phaser.Circle(_PLAYER.x, _PLAYER.y, 10), "blue", false);

            // SINGLE PIXEL (NOTE: X/Y POSITION SEEMS "OFF" IF TIED TO A SPRITE POSITION AS SPRITE MOVES)
            // _GAME.debug.pixel(_PLAYER.x, _PLAYER.y, "yellow", 8);

            // PHYSICS INFO + BODY
            // _GAME.debug.body(_PLAYER);
            // _GAME.debug.bodyInfo(_PLAYER, 20, 20);

            // QUADTREE (ONLY FOR ARCADE PHYSICS.. ENABLED WITH .physics.arcade.skipQuadTree = false)
            // - REDUCE # BODIES NEEDED TO TEST FOR COLLISION
            // _GAME.debug.quadTree(_GAME.physics.arcade.quadTree, "yellow");
          },

          collision: function(player, layer) {
            console.log("COLLISION");
          },

          getCoin: function() {
            // _R.tilemap.map.putTile(-1, _R.tilemap.layer.getTileX(_R.player.obj.x), _R.tilemap.layer.getTileY(_R.player.obj.y));
            _R.tilemap.map.removeTile(_R.tilemap.layer.getTileX(_R.player.obj.x), _R.tilemap.layer.getTileY(_R.player.obj.y));
          },

          resetPlayer: function() {
            _R.player.obj.reset(_R.player.position_start.x, _R.player.position_start.y);
          }
        },

        MAIN_MENU: {
          id: "MAIN_MENU",

          preload: null,
          create: null,
          update: null
        }
      };

    return {
      init: _init
    };
  })();

window.addEventListener("load", function() {
  MAIN.init();
});