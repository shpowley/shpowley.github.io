/* global Phaser */
var
  CONST = {
    OPPOSITES: [Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP], // CUSTOM OPPOSITE DIRECTION BASED ON INDEX LOOKUP

    SCREEN: {
      WIDTH: 640,
      HEIGHT: 480
    }
  },

  RESOURCE = {
    car: {
      id: "car",
      location: "assets/car.png",
      obj: null,
      current_direction: Phaser.UP,
      speed: 150,
      turn_speed: 150,
      turning: Phaser.NONE,
      tile_marker: new Phaser.Point(),
      turn_point: new Phaser.Point()
    },

    tiles: {
      id: "tiles",
      location: "assets/tiles.png"
    },

    maze: {
      id: "maze",
      location: "assets/maze.json",
      map: null,
      layer: null,
      grid_size: 32,
      safe_tile: 1
    }
  },

  MAIN = (function() {
    function _start() {
      /* DEFAULT TO GAME RESIZEABLE TO CONTAINER / BROWSER WINDOW */
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

      _STATES = {
        MAIN: {
          id: "MAIN",

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
            /** tilemap(key, url, data, format)
             *  - http://phaser.io/docs/2.4.7/Phaser.Loader.html#tilemap
             *  - SEE WILD_DESIGNS_ADVANCED TILEMAP FOR COMPARISON IMPLEMENTATION */
            this.load.tilemap(_R.maze.id, _R.maze.location, null, Phaser.Tilemap.TILED_JSON);
            this.load.image(_R.car.id, _R.car.location);
            this.load.image(_R.tiles.id, _R.tiles.location);
          },

          create: function() {
            _R.maze.map = this.add.tilemap(_R.maze.id); // .json FILE CONTAINS TILE WIDTH/HEIGHT UNLIKE .csv
            _R.maze.map.addTilesetImage(_R.tiles.id);
            _R.maze.layer = _R.maze.map.createLayer("Tile Layer 1"); // PARAMETER 1 = ACTUAL LAYER ID FROM .json FILE

            /** setCollision(indexes, collides, layer, recalculate)
             *  - http://phaser.io/docs/2.4.7/Phaser.Tilemap.html#setCollision
             *  - parameter #1 = tile ID(s) to check collision */
            _R.maze.map.setCollision(20, true, _R.maze.layer);

            _R.car.obj = this.add.sprite(48, 48, _R.car.id);
            _R.car.obj.anchor.set(0.5);

            this.physics.arcade.enable(_R.car.obj);

            // NOTE: INITIAL STATE OF CAR IS UP AND ACTUALLY ROTATES 180 AT START
            this.move(Phaser.DOWN);
          },

          render: function() {
            var
              t = 1,
              _direction = null,
              _color;

            for (; t < 5; t++) {
              _direction = this.vars.directions[t];

              if (_direction === null)
                continue;

              if (t === _R.car.current_direction)
                _color = "rgba(255, 255, 255, 0.3";

              else if (_direction.index !== _R.maze.safe_tile)
                _color = "rgba(255, 0, 0, 0.3";

              else
                _color = "rgba(0, 255, 0, 0.3";

              _GAME.debug.geom(new Phaser.Rectangle(_direction.worldX, _direction.worldY, 32, 32), _color, true);
            }

            _GAME.debug.geom(_R.car.turn_point, "#FFFF00");
          },

          update: function() {
            this.physics.arcade.collide(_R.car.obj, _R.maze.layer);

            /** CALCULATE TILE # X/Y BASED ON PIXEL POSITION X/Y
             *  - math.snapToFloor = "Snap a value to nearest grid slice, using floor" */
            _R.car.tile_marker.x = this.math.snapToFloor(Math.floor(_R.car.obj.x), _R.maze.grid_size) / _R.maze.grid_size;
            _R.car.tile_marker.y = this.math.snapToFloor(Math.floor(_R.car.obj.y), _R.maze.grid_size) / _R.maze.grid_size;

            /** UPDATE GRID SENSORS
             *  - .getTileLeft = GET TILE OBJECT IN THE DIRECTION SPECIFIED */
            this.vars.directions[1] = _R.maze.map.getTileLeft(_R.maze.layer.index, _R.car.tile_marker.x, _R.car.tile_marker.y);
            this.vars.directions[2] = _R.maze.map.getTileRight(_R.maze.layer.index, _R.car.tile_marker.x, _R.car.tile_marker.y);
            this.vars.directions[3] = _R.maze.map.getTileAbove(_R.maze.layer.index, _R.car.tile_marker.x, _R.car.tile_marker.y);
            this.vars.directions[4] = _R.maze.map.getTileBelow(_R.maze.layer.index, _R.car.tile_marker.x, _R.car.tile_marker.y);

            this.checkKeys();

            if (_R.car.turning !== Phaser.NONE)
              this.turn();
          },

          /** CUSTOM STATE FUNCTIONS */
          checkDirection: function(turn_to) {
            var
              _directions = this.vars.directions;

            /** INVALID DIRECTIONS:
             *  - CAR IS ALREADY TURNING THAT WAY
             *  - NO TILE IS THERE
             *  - TILE INDEX ISN'T A FLOOR TILE */
            if (_R.car.turning === turn_to || _directions[turn_to] === null || _directions[turn_to].index !== _R.maze.safe_tile)
              return;

            // CHECK IF THE CAR WANTS TO TURN AROUND AND IS ABLE TO
            if (_R.car.current_direction === CONST.OPPOSITES[turn_to])
              this.move(turn_to);

            else {
              _R.car.turning = turn_to;

              _R.car.turn_point.x = (_R.car.tile_marker.x * _R.maze.grid_size) + (_R.maze.grid_size / 2);
              _R.car.turn_point.y = (_R.car.tile_marker.y * _R.maze.grid_size) + (_R.maze.grid_size / 2);
            }
          },

          checkKeys: function() {
            var
              _keys = this.vars.cursors;

            if (_keys.left.isDown && _R.car.current_direction !== Phaser.LEFT)
              this.checkDirection(Phaser.LEFT);

            else if (_keys.right.isDown && _R.car.current_direction !== Phaser.RIGHT)
              this.checkDirection(Phaser.RIGHT);

            else if (_keys.up.isDown && _R.car.current_direction !== Phaser.UP)
              this.checkDirection(Phaser.UP);

            else if (_keys.down.isDown && _R.car.current_direction !== Phaser.DOWN)
              this.checkDirection(Phaser.DOWN);

            else
              _R.car.turning = Phaser.NONE;
          },

          getAngle: function(direction) {
            var
              _current = _R.car.current_direction;

            if (_current === CONST.OPPOSITES[direction])
              return "180";

            if ((_current === Phaser.UP && direction === Phaser.LEFT) ||
                (_current === Phaser.DOWN && direction === Phaser.RIGHT) ||
                (_current === Phaser.LEFT && direction === Phaser.DOWN) ||
                (_current === Phaser.RIGHT && direction === Phaser.UP))
              return "-90";

            return "90";
          },

          move: function(direction) {
            var
              _speed = _R.car.speed;

            if (direction === Phaser.LEFT || direction === Phaser.UP)
              _speed = -_speed;

            if (direction === Phaser.LEFT || direction === Phaser.RIGHT)
              _R.car.obj.body.velocity.x = _speed;
            else
              _R.car.obj.body.velocity.y = _speed;

            this.add.tween(_R.car.obj).to({angle: this.getAngle(direction)}, _R.car.turn_speed, "Linear", true);

            _R.car.current_direction = direction;
          },

          turn: function() {
            var
              _V = this.vars,
              cx = Math.floor(_R.car.obj.x),
              cy = Math.floor(_R.car.obj.y);

            // .fuzzyEqual = "Two number are fuzzyEqual if their difference is less than epsilon"
            if (!this.math.fuzzyEqual(cx, _R.car.turn_point.x, _V.threshold) || (!this.math.fuzzyEqual(cy, _R.car.turn_point.y, _V.threshold)))
              return false;

            _R.car.obj.x = _R.car.turn_point.x;
            _R.car.obj.y = _R.car.turn_point.y;

            _R.car.obj.body.reset(_R.car.turn_point.x, _R.car.turn_point.y);

            this.move(_R.car.turning);

            _R.car.turning = Phaser.NONE;

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