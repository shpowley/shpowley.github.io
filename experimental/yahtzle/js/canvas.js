/**
 * canvas library that centralizes multiple canvas elements
 *
 * REQUIRES:
 *
 *   $create = document.createElement.bind(document);
 */

/* global $create UTIL SPRITES CARD_SPRITES */
var
  CANVAS = (function() {
    // create new or add existing canvas wrapped in a js object literal and add to LIBRARY
    // - canvas_element: OPTIONAL
    // - canvas_type: OPTIONAL; IN_MEMORY is default
    function _addCanvas(id, canvas_element, canvas_type) {
      if (!canvas_element)
        canvas_element = $create("canvas");
      else if (canvas_element.nodeName !== "CANVAS")
        return null;

      if (canvas_element.getContext) {
        if (!canvas_type)
          canvas_type === _TYPES.IN_MEMORY;

        _LIBRARY.KEYS.push(id);

        if (canvas_type === _TYPES.DOM_ELEMENT)
          _LIBRARY[id] = new _canvasDOM(id, canvas_element, canvas_type);
        else
          _LIBRARY[id] = new _canvasInMemory(id, canvas_element, canvas_type);

        return _LIBRARY[id];
      }
      else
        console.warn("CANVAS unsupported");

      return null;
    }

    function _canvasDOM(id, canvas_element, type) {
      var
        rect = canvas_element.getBoundingClientRect();

      this.id = id;
      this.canvas = canvas_element;
      this.ctx = canvas_element.getContext("2d");
      this.type = type;
      this.x = canvas_element.offsetLeft;
      this.y = canvas_element.offsetTop;
      this.w = rect.width;
      this.h = rect.height;
      this.w_raw = canvas_element.offsetWidth;
      this.h_raw = canvas_element.offsetHeight;
      this.scale = this.h / this.h_raw;

      this.entities = {
        keys: []
      };
    }

    function _canvasInMemory(id, canvas_element, type) {
      this.id = id;
      this.canvas = canvas_element;
      this.ctx = canvas_element.getContext("2d");
      this.type = type;
    }

    // delete custom object literal-wrapped canvas and update map / keys
    function _deleteCanvas(id) {
      if (_LIBRARY[id]) {
        // remove canvas object literal
        delete _LIBRARY[id];

        // update keys
        for (var i = 0, l = _LIBRARY.KEYS.length; i < l; i++) {
          if (_LIBRARY.KEYS[i] === id) {
            _LIBRARY.KEYS.splice(i, 1);
            break;
          }
        }
      }
    }

    // perform hitbox tests in response to user interation (mouse-click / touch)
    // - point: containS x & y pixel page position; object-literal format: { x: NUMBER, y: NUMBER }
    // - canvas_obj: OPTIONAL; default to test all DOM canvases in CANVAS.LIBRARY
    // - entity_id: OPTIONAL; default to stop hit-box test once top-most entity is encountered
    // - returns entity OR null
    function _hitTest(point, canvas_obj, entity_id) {
      // search only through specified canvas
      if (canvas_obj)
        return _hitTestCanvas(point, _LIBRARY[canvas_obj.id], entity_id);

      // iterate through all DOM canvases to find "hit"
      else {
        var
          result;

        for (var key in _LIBRARY) {
          if (_LIBRARY.hasOwnProperty(key)) {
            result = _hitTestCanvas(point, _LIBRARY[key], entity_id);

            if (result)
              break;
          }
        }

        return result;
      }
    }

    // perform hit tests on a specific canvas
    function _hitTestCanvas(point, canvas_obj, entity_id) {
      var
        result = null;

      if (canvas_obj.type == _TYPES.DOM_ELEMENT) {
        if (entity_id)
          return canvas_obj.hitTest(point, entity_id);

        // iterate through all entities as a stack
        else {
          var
            keys = canvas_obj.entities.keys,
            i = keys.length - 1;

          for (; i >= 0; i--) {
            result = canvas_obj.hitTest(point, keys[i]);

            if (result)
              break;
          }
        }
      }

      return result;
    }

    // perform hit test on a specific entity
    function _hitTestEntity(point, entity_id) {
      var
        canvas_obj = this,
        entity = canvas_obj.entities[entity_id];

      if (entity) {
        var
          x = point.x - canvas_obj.x,
          y = point.y - canvas_obj.y;

        // note: with ">= min && <"; this should test all pixel within the range without going over (UNTESTED)
        if (x >= entity.x && x < (entity.x + entity.w) && y >= entity.y && y < (entity.y + entity.h))
          return entity;
      }

      return null;
    }

    // update hit zones for all DOM canvases
    // - note: canvas element must be visible for .getBoundingClientRect() to be valid
    function _updateHitzones() {
      var
        key, canvas_obj, canvas_element, rect;

      for (key in _LIBRARY) {
        if (_LIBRARY.hasOwnProperty(key)) {
          canvas_obj = _LIBRARY[key];

          if (canvas_obj.type === _TYPES.DOM_ELEMENT) {
            canvas_element = canvas_obj.canvas;
            rect = canvas_element.getBoundingClientRect();

            canvas_obj.x = canvas_element.offsetLeft;
            canvas_obj.y = canvas_element.offsetTop;
            canvas_obj.w = rect.width;
            canvas_obj.h = rect.height;
            canvas_obj.h_raw = canvas_element.offsetHeight;
            canvas_obj.w_raw = canvas_element.offsetWidth;
            canvas_obj.scale = canvas_obj.h / canvas_obj.h_raw;
          }
        }
      }
    }

    var
      // IIFE canvas object container
      // - provides better encapsulation
      _ENTITY = (function() {
        // adds a hitzone entity for user interation and collision detection
        // - sprite_scale: OPTIONAL; use when the sprite is resized
        // - opacity: OPTIONAL; 0-1
        function _add(entity_id, sheet_id, sprite_id, x, y, sprite_scale, opacity) {
          var
            canvas_obj = this,
            sprite;

          if (canvas_obj.type === _TYPES.DOM_ELEMENT) {
            sprite = SPRITES.SPRITE_SHEETS[sheet_id].map[sprite_id];

            if (sprite) {
              if (!canvas_obj.entities[entity_id]) {
                if (!sprite_scale)
                  sprite_scale = 1;

                canvas_obj.entities.keys.push(entity_id);

                canvas_obj.entities[entity_id] = new _entity({
                  entity_id: entity_id,
                  x: x,
                  y: y,
                  w: sprite.w * sprite.scale,
                  h: sprite.h * sprite.scale,
                  w_raw: sprite.w,
                  h_raw: sprite.h,
                  sprite_id: sprite_id,
                  sheet_id: sheet_id,
                  scale: sprite_scale,
                  opacity: opacity,
                  canvas_obj: canvas_obj
                });

                // TODO
                // - needs scale?
                // - opacity?
                SPRITES.draw(canvas_obj, sheet_id, sprite_id, x, y);

                return true;
              }
            }
          }

          console.warn("WARNING - ENTITY \"" + entity_id + "\" NOT ADDED");
          return false;
        }

        // adds an invisible hitzone area
        function _addHitzone(entity_id, x, y, w, h) {
          var
            canvas_obj = this;

          if (!canvas_obj.entities[entity_id]) {
            canvas_obj.entities.keys.push(entity_id);

            return canvas_obj.entities[entity_id] = new _hitZone({
              entity_id: entity_id,
              canvas_obj: this,
              x: x,
              y: y,
              w: w,
              h: h
            });
          }

          return null;
        }

        // removes a hitbox OR entity
        function _delete(entity_id) {
          var
            canvas_obj = this,
            entities;

          if (canvas_obj.type === _TYPES.DOM_ELEMENT) {
            entities = canvas_obj.entities;

            if (entities[entity_id]) {
              delete entities[entity_id];

              for (var i = 0, l = entities.keys.length; i < l; i++) {
                if (entities.keys[i] === entity_id) {
                  entities.keys.splice(i, 1);
                  break;
                }
              }

              return true;
            }
          }

          return false;
        }

        function _entity(data) {
          this.id = data.entity_id;
          this.type = _ENTITY_TYPES.ENTITY;
          this.canvas_obj = data.canvas_obj;
          this.x = data.x;
          this.y = data.y;
          this.w = data.w;
          this.h = data.h;
          this.x_raw = data.x;
          this.y_raw = data.y;
          this.w_raw = data.w_raw;
          this.h_raw = data.h_raw;
          this.sprite_id = data.sprite_id;
          this.sheet_id = data.sheet_id;
          this.opacity = data.opacity;
        }

        function _hitZone(data) {
          var
            canvas_obj = data.canvas_obj;

          this.id = data.entity_id;
          this.type = _ENTITY_TYPES.HITZONE;
          this.canvas_obj = canvas_obj;
          this.x = data.x * canvas_obj.scale;
          this.y = data.y * canvas_obj.scale;
          this.w = data.w * canvas_obj.scale;
          this.h = data.h * canvas_obj.scale;
        }

        // pre-calculate entity movement to new position
        function _move(x, y) {
          var
            valid_dx = x && UTIL.isNumber(x) && x !== 0,
            valid_dy = y && UTIL.isNumber(y) && y !== 0;

          if (valid_dx || valid_dy) {
            var
              canvas_obj = this.canvas_obj;

            canvas_obj.ctx.clearRect(this.x_raw, this.y_raw, this.w_raw, this.h_raw);

            if (valid_dx) {
              this.x_raw = x;
              this.x = this.x_raw * canvas_obj.scale;
            }

            if (valid_dy) {
              this.y_raw = y;
              this.y = this.y_raw * canvas_obj.scale;
            }
          }
        }

        // used in conjuction with _move()
        function _render() {
          SPRITES.draw(this.canvas_obj, this.sheet_id, this.sprite_id, this.x_raw, this.y_raw);
        }

        _entity.prototype.move = _move;
        _entity.prototype.render = _render;

        return {
          add: _add,
          addHitzone: _addHitzone,
          delete: _delete,
          hitTest: _hitTest
        };
      })(),

      _ENTITY_TYPES = {
        ENTITY: 0,
        HITZONE: 1
      },

      _LIBRARY = {
        KEYS: [],
      },

      _TYPES = {
        IN_MEMORY: 0,
        DOM_ELEMENT: 1
      };

    _canvasDOM.prototype.addEntity = _ENTITY.add;
    _canvasDOM.prototype.addHitzone = _ENTITY.addHitzone;
    _canvasDOM.prototype.deleteEntity = _ENTITY.delete;
    _canvasDOM.prototype.hitTest = _hitTestEntity;

    return {
      ENTITY_TYPES: _ENTITY_TYPES,
      LIBRARY: _LIBRARY,
      TYPES: _TYPES,

      add: _addCanvas,
      delete: _deleteCanvas,
      hitTest: _hitTest,
      updateHitzones: _updateHitzones
    };
  })();