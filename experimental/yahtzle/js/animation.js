/**
 * animation TWEEN library
 */

 /* global performance UTIL ANIMATION_TIMER */
var
  ANIMATION = (function() {
    function _init() {
      var
        timestamp = performance.now();

      // initialize all tween timers
      _LIBRARY.KEYS.forEach(function(id) {
        _LIBRARY[id].init(timestamp);
      });
    }

    // render a single frame for all tween animations
    function _render(fn_complete) {
      _LIBRARY.KEYS.forEach(_renderHelper);

      if (_LIBRARY.KEYS.length === 0 && fn_complete)
        fn_complete();
    }

    function _renderHelper(id) {
      _LIBRARY[id].render();
    }

    function _update() {
      _LIBRARY.KEYS.forEach(_updateHelper);
    }

    function _updateHelper(id) {
      _LIBRARY[id].update();
    }

    var
      _LIBRARY = {
        KEYS: []
      },

      /* TWEEN OBJECT LITERAL TEMPLATE */
      /*
      {
        id: null,
        entity: null,
        start_angle: null,  // optional

        // at least one
        end_pos: null,      // optional; { x: null, y: null }
        end_angle: null     // optional; degrees
        end_scale: null,    // optional; ie. 0.5 = 50%
        end_opacity: null,  // optional; 0-1

        // at least one
        duration: null,     // optional; ms
        velocity: null,     // optional; linear velocity

        fn_easing: null     // optional; non-linear animations
      }
      */
      _TWEEN = (function() {
        // add a tween
        // - data: object literal for tween data
        //   - id (unique tween id)
        //   - entity: canvas entity
        //   - start_angle (OPTIONAL; degrees)
        //   - end_pos AND/OR end_angle (OPTIONAL; degrees) AND/OR end_scale (OPTIONAL; ex. 0.5 = 50%) AND/OR end_opacity (OPTIONAL; 0-1) { AT LEAST ONE }
        //   - duration (OPTIONAL; ms) OR velocity (OPTIONAL; equiv. linear velocity for the tween)
        // - fn_easing (OPTIONAL; easing function)
        function _add(data, fn_easing) {
          if (!_LIBRARY[data.id]) {
            if (
              ( data.end_pos && data.end_pos.x && UTIL.isNumber(data.end_pos.x) && data.end_pos.y && UTIL.isNumber(data.end_pos.y) ||
                data.end_angle && UTIL.isNumber(data.end_angle) ||
                data.end_scale && UTIL.isNumber(data.end_scale ||
                data.end_opacity && UTIL.isNumber(data.end_opacity)) ) &&

              ( data.duration && UTIL.isNumber(data.duration) || data.velocity && UTIL.isNumber(data.velocity) )) {

              _LIBRARY[data.id] = new _tween(data, fn_easing);
              _LIBRARY.KEYS.push(data.id);

              return true;
            }
            else
              console.warn("WARNING - MISSING/INVALID TWEEN DATA");
          }
          else
            console.warn("WARNING - TWEEN ID \"" + data.id + "\" ALREADY EXISTS");

          return false;
        }

        function _init(timestamp) {
          this.start_time = timestamp;
        }

        // render a single frame of a tween
        function _render() {
          this.entity.render();

          // check if tween is complete
          if (this.elapsed >= this.duration) {
            delete _LIBRARY[this.id];

            for (var i = 0, l = _LIBRARY.KEYS.length; i < l; i++) {
              if (_LIBRARY.KEYS[i] === this.id) {
                _LIBRARY.KEYS.splice(i, 1);
                break;
              }
            }
          }
        }

        // tween object
        function _tween(data, fn_easing) {
          var
            dx, dy;

          this.id = data.id;
          this.entity = data.entity; // entity should contain all other useful info: canvas_id, sprite_id, etc.

          // position
          // - current x/y
          this.start_x = data.entity.x_raw;
          this.start_y = data.entity.y_raw;

          if (data.end_pos) {
            this.end_x = data.end_pos.x;
            this.end_y = data.end_pos.y;
          }
          else {
            this.end_x = null;
            this.end_y = null;
          }

          // angle
          // - canvas entities have no pre-defined angle as each entity is sprite-based
          this.start_angle = data.start_angle ? data.start_angle : 0;
          this.end_angle = data.end_angle ? data.end_angle : null;

          // scale
          this.start_scale = data.entity.scale;
          this.end_scale = data.end_scale ? data.scale : null;

          // opacity
          this.start_opacity = data.entity.opacity;
          this.end_opacity = data.end_opacity ? data.end_opacity : null;

          // duration OR linear velocity
          if (data.duration) {
            this.duration = data.duration;

            if (fn_easing && typeof(fn_easing) === "function") {
              this.velocity = this.velocity_x = this.velocity_y = 0;
              this.easing = fn_easing;
            }
            else {
              dx = this.end_x - this.start_x,
              dy = this.end_y - this.start_y;

              this.velocity_x = dx / this.duration; // v = dx/dt
              this.velocity_y = dy / this.duration;
              this.velocity = Math.sqrt(Math.pow(this.velocity_x, 2) + Math.pow(this.velocity_y, 2));
            }
          }
          else {
            dx = this.end_x - this.start_x,
            dy = this.end_y - this.start_y;

            this.velocity = data.velocity;
            this.duration = Math.abs(Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) / this.velocity); // v = d_total / dt ==> dt = d_total / v
            this.velocity_x = dx / this.duration;
            this.velocity_y = dy / this.duration;
          }

          // tween timing
          this.start_time = 0;
          this.elapsed = 0;
          // this.trigger_count = 0;
        }

        function _update() {
          var
            entity = this.entity,
            dx, dy;

          this.elapsed = ANIMATION_TIMER.timestamp - this.start_time;

          // HERE - easing return values are much too large
          if (this.easing) {
            this.velocity_x = this.easing(this.elapsed, this.velocity_x, this.end_x - this.start_x, this.duration);
            this.velocity_y = this.easing(this.elapsed, this.velocity_y, this.end_y - this.start_y, this.duration);
          }

          dx = entity.x_raw + this.velocity_x * ANIMATION_TIMER.delta;
          dy = entity.y_raw + this.velocity_y * ANIMATION_TIMER.delta;

          if (dx >= this.end_x)
            dx = this.end_x;

          if (dy >= this.end_y)
            dy = this.end_y;

          entity.move(dx, dy);

          // this.trigger_count++;
        }

        _tween.prototype.init = _init;
        _tween.prototype.render = _render;
        _tween.prototype.update = _update;

        return {
          add: _add
        };
      })();

    return {
      LIBRARY: _LIBRARY,

      addTween: _TWEEN.add,
      init: _init,
      render: _render,
      update: _update
    };
  })();