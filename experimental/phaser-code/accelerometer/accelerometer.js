/* global Phaser SENSORS */
var
  CONST = {
    SCREEN: {
      WIDTH: 800,
      HEIGHT: 600
    }
  },

  MAIN = (function() {
    // FIX A NUMBER TO DECIMAL PLACES
    function _fix(n) {
      return +(n || 0).toFixed(2);
    }

    function _scaleCanvas() {
      var
        canvas_height = CONST.SCREEN.HEIGHT,
        canvas_width = CONST.SCREEN.WIDTH;

      // DESKTOP: ADJUST CANVAS DIMENSIONS TO MATCH SCREEN ASPECT RATIO; CONSTRAIN TO EXISTING HEIGHT
      if (_GAME.device.desktop)
        canvas_width = CONST.SCREEN.WIDTH = Math.round(CONST.SCREEN.HEIGHT * screen.availWidth / screen.availHeight);

      // MOBILE: RESIZE TO MATCH DEVICE "PIXEL" WIDTH/HEIGHT
      else {
        canvas_width = CONST.SCREEN.WIDTH = document.body.clientWidth;
        canvas_height = CONST.SCREEN.HEIGHT = document.body.clientHeight;
      }

      // RESIZE CANVAS WIDTH/HEIGHT
      _GAME.scale.setGameSize(canvas_width, canvas_height);

      // SCALE
      _GAME.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      _GAME.scale.refresh();
    }

    function _start() {
      SENSORS.init();
      SENSORS.flip_acceleration.x = true;
      SENSORS.flip_acceleration.y = true;
      SENSORS.flip_acceleration.z = true;

      _scaleCanvas();

      _GAME.state.add(_STATES.DEBUG.id, _STATES.DEBUG);
      _GAME.state.start(_STATES.DEBUG.id);
    }

    var
      /** new Game(width, height, renderer, parent, state, transparent, antialias, physicsConfig) */
      _GAME = new Phaser.Game(CONST.SCREEN.WIDTH, CONST.SCREEN.HEIGHT, Phaser.CANVAS, null, null, true),

      _STATES = {
        DEBUG: {
          id: "DEBUG",

          /** TEMPLATE VARIABLES / CUSTOM FUNCTIONS */
          vars: {
            reference_line_length: 250,
            reference_line_horizontal: null,
            reference_line_vertical: null,
            device_circle: null,
            device_line: null,
            normal_length: 200,
            HUD_x: 0,
            HUD_acceleration_y: 0,
            HUD_rotation_y: 0,
            gravity_max: 20,
            title_font: "12pt monospace",
            font: "8pt monospace"
          },

          /** BUILT-IN STATE FUNCTIONS */
          create: function() {
            var
              _V = this.vars,
              _half_length = _V.reference_line_length / 2;

            _GAME.debug.font = _V.font;

            _V.reference_line_horizontal = new Phaser.Line(_GAME.world.centerX - _half_length, _GAME.world.centerY, _GAME.world.centerX + _half_length, _GAME.world.centerY),
            _V.reference_line_vertical = new Phaser.Line(_GAME.world.centerX, _GAME.world.centerY - _half_length, _GAME.world.centerX, _GAME.world.centerY + _half_length),

            _V.device_circle = new Phaser.Circle(_GAME.world.centerX, _GAME.world.centerY, 30),
            _V.device_line = new Phaser.Line(_GAME.world.centerX, _GAME.world.centerY, _V.device_circle.x, _V.device_circle.y);

            _V.HUD_x = _GAME.world.centerX - 160;
            _V.HUD_acceleration_y = _GAME.world.centerY - _V.reference_line_length + 40;
            _V.HUD_rotation_y = _GAME.world.centerY + _V.reference_line_length - 100;
          },

          update: function() {
            var _V = this.vars;

            _V.device_circle.x = _GAME.world.centerX + _V.normal_length * SENSORS.raw.acceleration_gravity.x / _V.gravity_max;
            _V.device_circle.y = _GAME.world.centerY - _V.normal_length * SENSORS.raw.acceleration_gravity.y / _V.gravity_max;
            _V.device_line.setTo(_GAME.world.centerX, _GAME.world.centerY, _V.device_circle.x, _V.device_circle.y);
          },

          render: function() {
            var
              _V = this.vars,
              _raw = SENSORS.raw,
              _acc = _raw.acceleration,
              _acc_grav = _raw.acceleration_gravity,
              _rot = _raw.rotation,
              _rot_rate = _raw.rotation_rate;

            _GAME.debug.text("ACCELEROMETER + GYROSCOPE", _GAME.world.centerX - 120, _V.HUD_acceleration_y - 30, null, _V.title_font);

            _GAME.debug.start(_V.HUD_x, _V.HUD_acceleration_y, null, 210);
            _GAME.debug.line("ACCELERATION (m/s²)", "+GRAVITY (m/s²)");
            _GAME.debug.line("X: " + _fix(_acc.x), "X: " + _fix(_acc_grav.x));
            _GAME.debug.line("Y: " + _fix(_acc.y), "Y: " + _fix(_acc_grav.y));
            _GAME.debug.line("Z: " + _fix(_acc.z), "Z: " + _fix(_acc_grav.z));
            _GAME.debug.line();
            _GAME.debug.line("", "X-Y: " + _fix(SENSORS.getAccelerationGravityXY()));
            _GAME.debug.line("", "X-Y ∠: " + _fix(SENSORS.getAccelerationGravityAngleXY()) + "°");
            _GAME.debug.stop();

            _GAME.debug.start(_V.HUD_x, _V.HUD_rotation_y, null, 210);
            _GAME.debug.line("ROTATION (°)", "RATE (°/sec)");
            _GAME.debug.line("α: " + _fix(_rot.alpha), "α: " + _fix(_rot_rate.alpha));
            _GAME.debug.line("β: " + _fix(_rot.beta), "β: " + _fix(_rot_rate.beta));
            _GAME.debug.line("γ: " + _fix(_rot.gamma), "γ: " + _fix(_rot_rate.gamma));
            _GAME.debug.line();
            _GAME.debug.line("READ INTERVAL: " + _raw.interval + " ms");
            _GAME.debug.stop();

            _GAME.debug.geom(_V.reference_line_horizontal, "white");
            _GAME.debug.geom(_V.reference_line_vertical, "white");
            _GAME.debug.geom(_V.device_circle, "#5BEC4B", false);
            _GAME.debug.geom(_V.device_line, "#5BEC4B");
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