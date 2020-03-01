/**
 * SIMPLE API FOR MOBILE SENSORS: ACCELEROMETER, GYROSCOPE
 *
 * - 2016-05-12: add shutDown()
 * - 2016-05-04: initial version
 */
var
  SENSORS = (function() {
    function _flip(n, flip) {
      var num = n || 0;

      if (num === 0)
        return num;

      else
        return flip ? -num : num;
    }

    function _calcAccelerationAngle(acceleration_A, acceleration_B) {
      var _angle = 0;

      _angle = 180 * Math.atan(acceleration_B / acceleration_A) / Math.PI;

      if (acceleration_A < 0 && acceleration_B >= 0)
        _angle += 180;

      else if (acceleration_A < 0 && acceleration_B < 0)
        _angle += 180;

      else if (acceleration_A >= 0 && acceleration_B < 0)
        _angle += 360;

      return _angle;
    }

    /* X-Y AXIS CALCULATION FUNCTIONS */
    function _getAccelerationXY() {
      if (!_calc.acceleration_xy.magnitude)
        _calc.acceleration_xy.magnitude = Math.hypot(_raw.acceleration.x, _raw.acceleration.y);

      return _calc.acceleration_xy.magnitude;
    }

    function _getAccelerationAngleXY() {
      if (!_calc.acceleration_xy.angle)
        _calc.acceleration_xy.angle = _calcAccelerationAngle(_raw.acceleration.x, _raw.acceleration.y);

      return _calc.acceleration_xy.angle;
    }

    function _getAccelerationGravityXY() {
      if (!_calc.acceleration_gravity_xy.magnitude)
        _calc.acceleration_gravity_xy.magnitude = Math.hypot(_raw.acceleration_gravity.x, _raw.acceleration_gravity.y);

      return _calc.acceleration_gravity_xy.magnitude;
    }

    function _getAccelerationGravityAngleXY() {
      if (!_calc.acceleration_gravity_xy.angle)
        _calc.acceleration_gravity_xy.angle = _calcAccelerationAngle(_raw.acceleration_gravity.x, _raw.acceleration_gravity.y);

      return _calc.acceleration_gravity_xy.angle;
    }

    /* X-Z AXIS CALCULATION FUNCTIONS */
    function _getAccelerationXZ() {
      if (!_calc.acceleration_xz.magnitude)
        _calc.acceleration_xz.magnitude = Math.hypot(_raw.acceleration.x, _raw.acceleration.z);

      return _calc.acceleration_xz.magnitude;
    }

    function _getAccelerationAngleXZ() {
      if (!_calc.acceleration_xz.angle)
        _calc.acceleration_xz.angle = _calcAccelerationAngle(_raw.acceleration.x, _raw.acceleration.z);

      return _calc.acceleration_xz.angle;
    }

    function _getAccelerationGravityXZ() {
      if (!_calc.acceleration_gravity_xz.magnitude)
        _calc.acceleration_gravity_xz.magnitude = Math.hypot(_raw.acceleration_gravity.x, _raw.acceleration_gravity.z);

      return _calc.acceleration_gravity_xz.magnitude;
    }

    function _getAccelerationGravityAngleXZ() {
      if (!_calc.acceleration_gravity_xz.angle)
        _calc.acceleration_gravity_xz.angle = _calcAccelerationAngle(_raw.acceleration_gravity.x, _raw.acceleration_gravity.z);

      return _calc.acceleration_gravity_xz.angle;
    }

    /* Y-Z AXIS CALCULATION FUNCTIONS */
    function _getAccelerationYZ() {
      if (!_calc.acceleration_yz.magnitude)
        _calc.acceleration_yz.magnitude = Math.hypot(_raw.acceleration.y, _raw.acceleration.z);

      return _calc.acceleration_yz.magnitude;
    }

    function _getAccelerationAngleYZ() {
      if (!_calc.acceleration_yz.angle)
        _calc.acceleration_yz.angle = _calcAccelerationAngle(_raw.acceleration.y, _raw.acceleration.z);

      return _calc.acceleration_yz.angle;
    }

    function _getAccelerationGravityYZ() {
      if (!_calc.acceleration_gravity_yz.magnitude)
        _calc.acceleration_gravity_yz.magnitude = Math.hypot(_raw.acceleration_gravity.y, _raw.acceleration_gravity.z);

      return _calc.acceleration_gravity_yz.magnitude;
    }

    function _getAccelerationGravityAngleYZ() {
      if (!_calc.acceleration_gravity_yz.angle)
        _calc.acceleration_gravity_yz.angle = _calcAccelerationAngle(_raw.acceleration_gravity.y, _raw.acceleration_gravity.z);

      return _calc.acceleration_gravity_yz.angle;
    }

    /* X-Y-Z MAGNITUDE CALCULATIONS */
    function _getAccelerationXYZ() {
      if (!_calc.acceleration_xyz)
        _calc.acceleration_xyz = Math.hypot(_raw.acceleration.x, _raw.acceleration.y, _raw.acceleration.z);

      return _calc.acceleration_xyz;
    }

    function _getAccelerationGravityXYZ() {
      if (!_calc.acceleration_gravity_xyz)
        _calc.acceleration_gravity_xyz = Math.hypot(_raw.acceleration_gravity.x, _raw.acceleration_gravity.y, _raw.acceleration_gravity.z);

      return _calc.acceleration_gravity_xyz;
    }

    function _handleMotion(e) {
      var
        acc = e.acceleration,
        acc_gravity = e.accelerationIncludingGravity,
        rate = e.rotationRate;

      _raw.interval = e.interval;
      _raw.acceleration.x = _flip(acc.x, _flip_acceleration.x);
      _raw.acceleration.y = _flip(acc.y, _flip_acceleration.y);
      _raw.acceleration.z = _flip(acc.z, _flip_acceleration.z);

      _raw.acceleration_gravity.x = _flip(acc_gravity.x, _flip_acceleration.x);
      _raw.acceleration_gravity.y = _flip(acc_gravity.y, _flip_acceleration.y);
      _raw.acceleration_gravity.z = _flip(acc_gravity.z, _flip_acceleration.z);

      _raw.rotation_rate.alpha = rate.alpha;
      _raw.rotation_rate.beta = rate.beta;
      _raw.rotation_rate.gamma = rate.gamma;

      // RESET CALCULATED VECTORS
      _calc.acceleration_xy.angle = _calc.acceleration_yz.angle = _calc.acceleration_xz.angle
      = _calc.acceleration_xy.magnitude = _calc.acceleration_yz.magnitude = _calc.acceleration_xz.magnitude
      = _calc.acceleration_gravity_xy.angle = _calc.acceleration_gravity_yz.angle = _calc.acceleration_gravity_xz.angle
      = _calc.acceleration_gravity_xy.magnitude = _calc.acceleration_gravity_yz.magnitude = _calc.acceleration_gravity_xz.magnitude
      = _calc.acceleration_xyz = _calc.acceleration_gravity_xyz = null;
    }

    function _handleOrientation(e) {
      _raw.rotation.alpha = e.alpha;
      _raw.rotation.beta = e.beta;
      _raw.rotation.gamma = e.gamma;
    }

    function _init() {
      if (!_initialized) {
        if (window.DeviceMotionEvent) {
          window.addEventListener("devicemotion", _handleMotion, true);

          if (window.DeviceOrientationEvent) {
            window.addEventListener("deviceorientation", _handleOrientation, true);
          }
          else
            console.warn("WARNING: UNABLE TO BIND DEVICE ORIENTATION EVENT");
        }
        else {
          console.warn("WARNING: UNABLE TO BIND DEVICE MOTION EVENT");
          return _initialized = false;
        }
      }

      return _initialized = true;
    }

    function _isReady() {
      return _initialized;
    }

    function _shutDown() {
      if (_initialized) {
        window.removeEventListener("devicemotion", _handleMotion, true);
        window.removeEventListener("deviceorietation", _handleOrientation, true);

        _initialized = false;
      }
    }

    var
      _initialized = false,

      _calc = {
        // CALCULATED VECTOR ACCELERATION
        acceleration_xy: {
          angle: null,
          magnitude: null,
        },

        acceleration_xz: {
          angle: null,
          magnitude: null,
        },

        acceleration_yz: {
          angle: null,
          magnitude: null,
        },

        acceleration_xyz: null,

        // CALCULATED VECTOR ACCELERATION WITH GRAVITY
        acceleration_gravity_xy: {
          angle: null,
          magnitude: null,
        },

        acceleration_gravity_xz: {
          angle: null,
          magnitude: null,
        },

        acceleration_gravity_yz: {
          angle: null,
          magnitude: null,
        },

        acceleration_gravity_xyz: null
      },

      // CONTROL X-Y-Z SIGN ORIENTATION (SOMETIME OPPOSITE OF WHAT IS EXPECTED..)
      _flip_acceleration = {
        x: false,
        y: false,
        z: false
      },

      _raw = {
        // RAW COMPONENT ACCELERATION
        acceleration: {
          x: 0,
          y: 0,
          z: 0
        },

        // RAW COMPONENT ACCELERATION WITH GRAVITY (SOME SENSORS ONLY PROVIDE THIS)
        acceleration_gravity: {
          x: 0,
          y: 0,
          z: 0
        },

        interval: 0,

        // RAW ROTATION
        rotation: {
          alpha: 0,
          beta: 0,
          gamma: 0
        },

        // RAW ROTATION RATE (SOME SENSORS DON'T REPORT THIS)
        rotation_rate: {
          alpha: 0,
          beta: 0,
          gamma: 0
        }
      };

    return {
      flip_acceleration: _flip_acceleration,
      raw: _raw,

      getAccelerationXY: _getAccelerationXY,
      getAccelerationAngleXY: _getAccelerationAngleXY,
      getAccelerationGravityXY: _getAccelerationGravityXY,
      getAccelerationGravityAngleXY: _getAccelerationGravityAngleXY,

      getAccelerationXZ: _getAccelerationXZ,
      getAccelerationAngleXZ: _getAccelerationAngleXZ,
      getAccelerationGravityXZ: _getAccelerationGravityXZ,
      getAccelerationGravityAngleXZ: _getAccelerationGravityAngleXZ,

      getAccelerationYZ: _getAccelerationYZ,
      getAccelerationAngleYZ: _getAccelerationAngleYZ,
      getAccelerationGravityYZ: _getAccelerationGravityYZ,
      getAccelerationGravityAngleYZ: _getAccelerationGravityAngleYZ,

      getAccelerationXYZ: _getAccelerationXYZ,
      getAccelerationGravityXYZ: _getAccelerationGravityXYZ,

      init: _init,
      isReady: _isReady,
      shutDown: _shutDown
    };
  })();