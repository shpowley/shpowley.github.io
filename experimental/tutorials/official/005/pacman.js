/* global Phaser */
var
  CONST = {
    OPPOSITES: [Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP], // CUSTOM OPPOSITE DIRECTION BASED ON INDEX LOOKUP

    SCREEN: {
      WIDTH: 448,
      HEIGHT: 496
    }
  },

  RESOURCE = {
    dot: {
      id: "dot",
      location: "assets/dot.png",
      group: null
    },

    maze: {
      id: "maze",
      location: "assets/pacman-map.json",
      map: null,
      layer: null,
      grid_size: 16,
      safe_tile: 14
    },

    pacman: {
      id: "pacman",
      location: "assets/pacman.png",
      obj: null,

      sprite: {
        width: 32,
        height: 32
      },

      animation: {
        MUNCH: "munch"
      },

      speed: 150,
      turn_speed: 150,
      current_direction: Phaser.NONE,
      turning: Phaser.NONE,
      tile_marker: new Phaser.Point(),
      turn_point: new Phaser.Point()
    },

    tiles: {
      id: "tiles",
      location: "assets/pacman-tiles.png"
    }
  },

  MAIN = (function() {
    function _start() {
      /* DEFAULT TO GAME RESIZEABLE TO CONTAINER / BROWSER WINDOW */
      _GAME.scale.setMinMax(CONST.SCREEN.WIDTH, CONST.SCREEN.HEIGHT);
      _GAME.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      _GAME.scale.refresh();

      /** Sets the CSS image-rendering property on the given canvas to be 'crisp' */
      // Phaser.Canvas.setImageRenderingCrisp(_GAME.canvas);

      /** VS. .renderSession.roundPixels
       * - Pixi API call
       * - If true, Pixi will Math.floor() x/y values when rendering, stopping pixel interpolation.
       *   Handy for crisp pixel art and speed on legacy devices. */
      _GAME.renderer.renderSession.roundPixels = true;

      /** STATES: http://phaser.io/docs/2.4.7/Phaser.State.html */
      _GAME.state.add(_STATES.PLAY.id, _STATES.PLAY);
      _GAME.state.start(_STATES.PLAY.id);
    }

    var
      /** new Game(WIDTH, HEIGHT, renderer, parent, state, transparent, antialias, physicsConfig) */
      // _GAME = new Phaser.Game(CONST.SCREEN.WIDTH, CONST.SCREEN.HEIGHT, Phaser.AUTO, null, null, false, false),
      _GAME = new Phaser.Game(CONST.SCREEN.WIDTH, CONST.SCREEN.HEIGHT, Phaser.AUTO),
      _R = RESOURCE,

      _STATES = {
        PLAY: {
          id: "PLAY",

          vars: {
            cursors: null,
            directions: [null, null, null, null, null],
            threshold: 3
          },

          /** BUILT-IN STATE FUNCTIONS */
          init: function() {
            this.vars.cursors = this.input.keyboard.createCursorKeys();
            this.physics.startSystem(Phaser.Physics.ARCADE);
          },

          preload: function() {
            this.load.image(_R.dot.id, _R.dot.location);
            this.load.image(_R.tiles.id, _R.tiles.location);
            this.load.spritesheet(_R.pacman.id, _R.pacman.location, _R.pacman.sprite.width, _R.pacman.sprite.height);
            this.load.tilemap(_R.maze.id, _R.maze.location, null, Phaser.Tilemap.TILED_JSON);
          },

          create: function() {
            _R.maze.map = this.add.tilemap(_R.maze.id);
            _R.maze.map.addTilesetImage("pacman-tiles", _R.tiles.id);

            _R.maze.layer = _R.maze.map.createLayer("Pacman");

            _R.dot.group = this.add.physicsGroup();

            /** .createFromTiles(tiles, replacements, key, layer, group, properties)
             *  - Creates a Sprite for every object matching the given tile indexes in the map data. */
            _R.maze.map.createFromTiles(7, _R.maze.safe_tile, _R.dot.id, _R.maze.layer, _R.dot.group);

            /** .setAll(key, value, checkAlive, checkVisible, operation, force) */
            _R.dot.group.setAll("x", 6, false, false, 1);
            _R.dot.group.setAll("y", 6, false, false, 1);

            /** collide with everything except the safe tile
             *  - .setCollisionByExclusion(indexes, collides, layer, recalculate) */
            _R.maze.map.setCollisionByExclusion([_R.maze.safe_tile], true, _R.maze.layer);

            // POSITION PACMAN @ TILE X:14, Y:17
            _R.pacman.obj = this.add.sprite((14 * _R.maze.grid_size) + 8, (17 * _R.maze.grid_size) + 8, _R.pacman.id, 0);
            _R.pacman.obj.anchor.set(0.5);
            _R.pacman.obj.animations.add(_R.pacman.animation.MUNCH, [0, 1, 2, 1], 20, true);

            this.physics.arcade.enable(_R.pacman.obj);

            _R.pacman.obj.body.setSize(16, 16, 0, 0);
            _R.pacman.obj.play(_R.pacman.animation.MUNCH);

            this.move(Phaser.LEFT);
          },

          update: function() {
            var
              _V = this.vars;

            this.physics.arcade.collide(_R.pacman.obj, _R.maze.layer);

            /** .overlap(object1, object2, overlapCallback, processCallback, callbackContext)
             *  - Checks for overlaps between two game objects.
             *    Unlike .collide() the objects do NOT have any physics applied..MERELY TEST FOR OVERLAP
             *    Both the first and second parameter can be arrays of objects, of differing types. */
            this.physics.arcade.overlap(_R.pacman.obj, _R.dot.group, this.eatDot, null, this);

            // CURRENT TILE
            _R.pacman.tile_marker.x = this.math.snapToFloor(Math.floor(_R.pacman.obj.x), _R.maze.grid_size) / _R.maze.grid_size;
            _R.pacman.tile_marker.y = this.math.snapToFloor(Math.floor(_R.pacman.obj.y), _R.maze.grid_size) / _R.maze.grid_size;

            // UPDATE GRID SENSORS
            _V.directions[1] = _R.maze.map.getTileLeft(_R.maze.layer.index, _R.pacman.tile_marker.x, _R.pacman.tile_marker.y);
            _V.directions[2] = _R.maze.map.getTileRight(_R.maze.layer.index, _R.pacman.tile_marker.x, _R.pacman.tile_marker.y);
            _V.directions[3] = _R.maze.map.getTileAbove(_R.maze.layer.index, _R.pacman.tile_marker.x, _R.pacman.tile_marker.y);
            _V.directions[4] = _R.maze.map.getTileBelow(_R.maze.layer.index, _R.pacman.tile_marker.x, _R.pacman.tile_marker.y);

            this.checkKeys();

            if (_R.pacman.turning !== Phaser.NONE)
              this.turn();
          },

          /** CUSTOM STATE FUNCTIONS */
          checkDirection: function(new_direction) {
            var
              _V = this.vars;

            // ALREADY TURNING OR NO TILE OR NON-FLOOR TILE IN SPECIFIED NEW DIRECTION
            if (_R.pacman.turning === new_direction || _V.directions[new_direction] === null || _V.directions[new_direction].index !== _R.maze.safe_tile)
              return;

            if (_R.pacman.current_direction === CONST.OPPOSITES[new_direction])
              this.move(new_direction);

            else {
              _R.pacman.turning = new_direction;
              _R.pacman.turn_point.x = (_R.pacman.tile_marker.x * _R.maze.grid_size) + (_R.maze.grid_size / 2);
              _R.pacman.turn_point.y = (_R.pacman.tile_marker.y * _R.maze.grid_size) + (_R.maze.grid_size / 2);
            }
          },

          checkKeys: function() {
            var
              keys = this.vars.cursors;

            if (keys.left.isDown && _R.pacman.current_direction !== Phaser.LEFT)
              this.checkDirection(Phaser.LEFT);

            else if (keys.right.isDown && _R.pacman.current_direction !== Phaser.RIGHT)
              this.checkDirection(Phaser.RIGHT);

            else if (keys.up.isDown && _R.pacman.current_direction !== Phaser.UP)
              this.checkDirection(Phaser.UP);

            else if (keys.down.isDown && _R.pacman.current_direction !== Phaser.DOWN)
              this.checkDirection(Phaser.DOWN);

            else
              _R.pacman.turning = Phaser.NONE;
          },

          eatDot: function(pacman, dot) {
            dot.kill();

            if (_R.dot.group.total === 0)
              _R.dot.group.callAll("revive");
          },

          move: function(direction) {
            var
              speed = _R.pacman.speed;

            if (direction === Phaser.LEFT || direction === Phaser.UP)
              speed = -speed;

            if (direction === Phaser.LEFT || direction === Phaser.RIGHT)
              _R.pacman.obj.body.velocity.x = speed;

            else
              _R.pacman.obj.body.velocity.y = speed;

            // RESET DIRECTION PACMAN IS FACING AND ANGLE
            _R.pacman.obj.scale.x = 1;
            _R.pacman.obj.angle = 0;

            if (direction === Phaser.LEFT)
              _R.pacman.obj.scale.x = -1;

            else if (direction === Phaser.UP)
              _R.pacman.obj.angle = 270;

            else if (direction === Phaser.DOWN)
              _R.pacman.obj.angle = 90;

            _R.pacman.current_direction = direction;
          },

          turn: function() {
            var
              _V = this.vars,
              cx = Math.floor(_R.pacman.obj.x),
              cy = Math.floor(_R.pacman.obj.y);

            if (!this.math.fuzzyEqual(cx, _R.pacman.turn_point.x, _V.threshold) || !this.math.fuzzyEqual(cy, _R.pacman.turn_point.y, _V.threshold))
              return false;

            // ALIGN TO GRID BEFORE TURNING
            _R.pacman.obj.x = _R.pacman.turn_point.x;
            _R.pacman.obj.y = _R.pacman.turn_point.y;

            _R.pacman.obj.body.reset(_R.pacman.turn_point.x, _R.pacman.turn_point.y);

            this.move(_R.pacman.turning);
            _R.pacman.turning = Phaser.NONE;

            return true;
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