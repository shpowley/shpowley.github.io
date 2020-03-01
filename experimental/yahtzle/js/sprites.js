/**
 * a utility namespace containing sprite sheets and library of individual sprite mappings
 * - library and sprite_sheets are JSON maps with unique key names
 * - individual sprites are loaded into a sprite sheet and downloaded in parallel
 *
 * REQUIRES: canvas.js, util.js
 */

/* global UTIL CANVAS */
var
  SPRITES = (function() {
    // pre-calculate sprite width / height, x-translation based on scale & rotation
    function _calculateRaw(sheet, sprite) {
      var
        scale = sprite.scale,

        calc = {
          rotation: sprite.rotation,
          translate_x: null,
          sprite_w: sprite.image.width,
          sprite_h: sprite.image.height,
          canvas_w: 0,
          canvas_h: 0
        };

      if (!scale)
        scale = sheet.scale;

      if (scale) {
        calc.sprite_w *= scale;
        calc.sprite_h *= scale;
      }

      if (calc.rotation) {
        calc.rotation *= Math.PI / 180;
        calc.translate_x = calc.sprite_h * Math.sin(calc.rotation);

        // calculate new height / width based on rotation
        calc.canvas_h = calc.sprite_w * Math.sin(calc.rotation) + calc.sprite_h * Math.cos(calc.rotation);
        calc.canvas_w = calc.translate_x + calc.sprite_w * Math.cos(calc.rotation);
      }

      calc.translate_x = Math.ceil(calc.translate_x);
      calc.sprite_w = Math.ceil(calc.sprite_w);
      calc.sprite_h = Math.ceil(calc.sprite_h);
      calc.canvas_w = Math.ceil(calc.canvas_w);
      calc.canvas_h = Math.ceil(calc.canvas_h);

      return calc;
    }

    // create a new empty sprite sheet and add to sheet array
    // - scale parameter is optional
    function _createSheet(sheet_id, scale) {
      return _SPRITE_SHEETS[sheet_id] = {
        id: sheet_id,
        image: new Image(), // actual in-memory sprite sheet
        cached: null,
        map: {},
        map_keys: [], // sprite sheet map keys: sort order (index), sprite id lookup (element), sprite sheet row breaks (element = SPRITES.ROW_BREAK_TOKEN)
        scale: scale ? scale : null,
        version: null
      };
    }

    // create a new sprite container and add to a sprite sheet / map
    // - scale parameter is optional; uses container sheet scale if not specified
    // - rotation parameter is optional
    // - _downloadSprites() is required to actually load the sprite sheet with image assets
    function _createSprite(sprite_id, file_name, sheet_id, scale, rotation) {
      var
        sheet = _SPRITE_SHEETS[sheet_id],
        sprite_index = 0;

      if (!sheet)
        sheet = _createSheet(sheet_id);

      sprite_index = sheet.map_keys.push(sprite_id) - 1;

      return sheet.map[sprite_id] = {
        id: sprite_id,
        index: sprite_index, // refers to position index in map_keys array; updates to map_keys indexes ideally stays in sync
        file_name: file_name,
        image: null,
        rotation: rotation ? rotation : null,
        scale: scale ? scale : null,
        x: null,
        y: null,
        h: null,
        w: null
      };
    }

    // initiates loading of individual image assets
    // - loading images in more efficient parallel "chunks"
    // - works in concert with _queueNextImage + _onImageLoaded
    function _downloadSprites(sheet_id, fn_callback) {
      var
        sheet = _SPRITE_SHEETS[sheet_id];

      if (sheet && sheet.map_keys.length > 0) {
        _CALLBACK = fn_callback;
        _PRELOAD.canvas_obj = CANVAS.add(_PRELOAD.canvas_id);
        _PRELOAD.num_images_loaded = _PRELOAD.index = 0;
        _PRELOAD.num_images_total = Object.keys(sheet.map).length;
        _PRELOAD.initialized = false;
        _PRELOAD.sheet = sheet;
        _queueNextImage();
      }
    }

    // downloads a spritesheet and sprite map
    // - retrieves serialized json data
    // - combined json format or separate image / map
    // - image_url (optional; separate image / map only; if not provided, looks .png with same base filename as json_url)
    function _downloadSpritesheet(sheet_id, json_url, image_url, fn_callback) {
      var
        xhttp = new XMLHttpRequest();

      _CALLBACK = fn_callback;

      xhttp.addEventListener("readystatechange", function() {
        if (xhttp.readyState === xhttp.DONE && xhttp.status === 200) {
          var
            data = JSON.parse(xhttp.responseText),
            sheet = _createSheet(sheet_id);

          if (data.type && data.type === _JSON_TYPES.COMBINED || data.type === _JSON_TYPES.MAP) {
            sheet.version = data.version;
            sheet.map = data.map;
            sheet.map_keys = Object.keys(data.map);
            _syncMapIndexes(sheet_id);

            if (data.type === _JSON_TYPES.COMBINED)
              sheet.image.src = data.image;

            else if (image_url)
              sheet.image.src = image_url;

            else // image_url not provided; spritesheet assumed to have same root name as the json map file
              sheet.image.src = json_url.slice(0, json_url.lastIndexOf(".")) + ".png";

            sheet.image.addEventListener("load", function() {
              // cache image data to localStorage
              UTIL.STORAGE.set(
                sheet.id,
                {
                  image: this.src,
                  map: sheet.map,
                  version: sheet.version
                }
              );

              sheet.cached = true;

              if (typeof(_CALLBACK) === "function")
                _CALLBACK(sheet);
            });
          }
        }
      });

      xhttp.open("POST", json_url, true);
      xhttp.send();
    }

    // generic draw sprite sheet sprite
    // - scale (optional)
    function _draw(canvas_obj, sheet_id, sprite_id, x, y, scale) {
      var
        S = _SPRITE_SHEETS[sheet_id].map[sprite_id];

      // drawImage(image, source-x, source-y, source-w, source-h, dest-x, dest-dy, dest-w, dest-h);
      if (typeof(scale) === "number")
        canvas_obj.ctx.drawImage(_SPRITE_SHEETS[sheet_id].image, UTIL.round(S.x), UTIL.round(S.y), UTIL.round(S.w), UTIL.round(S.h), UTIL.round(x), UTIL.round(y), UTIL.round(S.w * scale), UTIL.round(S.h * scale));
      else
        canvas_obj.ctx.drawImage(_SPRITE_SHEETS[sheet_id].image, UTIL.round(S.x), UTIL.round(S.y), UTIL.round(S.w), UTIL.round(S.h), UTIL.round(x), UTIL.round(y), UTIL.round(S.w), UTIL.round(S.h));

      // if (typeof(scale) === "number")
      //   canvas_obj.ctx.drawImage(_SPRITE_SHEETS[sheet_id].image, S.x, S.y, S.w, S.h, x, y, S.w * scale, S.h * scale);
      // else
      //   canvas_obj.ctx.drawImage(_SPRITE_SHEETS[sheet_id].image, S.x, S.y, S.w, S.h, x, y, S.w, S.h);
    }

    // draw a scaled/rotated "raw" sprite
    // - must have a defined sprite map entry with an image with appropriate rotation / scale properties
    function _drawRaw(canvas_obj, sheet_id, sprite_id, x, y) {
      var
        sheet = _SPRITE_SHEETS[sheet_id],
        sprite = sheet.map[sprite_id];

      if (sprite && sprite.image !== null) {
        var
          ctx = canvas_obj.ctx,
          calc = _calculateRaw(sheet, sprite);

        canvas_obj.canvas.width = calc.canvas_w;
        canvas_obj.canvas.height = calc.canvas_h;

        ctx.save();

        if (calc.rotation) {
          ctx.translate(calc.translate_x, 0);
          ctx.rotate(calc.rotation);
        }

        ctx.drawImage(sprite.image, UTIL.round(x), UTIL.round(y), UTIL.round(calc.sprite_w), UTIL.round(calc.sprite_h));
        // ctx.drawImage(sprite.image, x, y, calc.sprite_w, calc.sprite_h);
        ctx.restore();
      }
    }

    // return true if sprite sheet is cached in localStorage and successfully loaded
    function _loadCached(sheet_id, version, fn_callback) {
      if (sheet_id && version) {
        var
          cache_data = UTIL.STORAGE.get(sheet_id);

        if (cache_data && cache_data.version === version) {
          var
            sheet = _SPRITE_SHEETS[sheet_id];

          if (!sheet)
            sheet = _createSheet(sheet_id);

          _CALLBACK = fn_callback;
          sheet.id = sheet_id;
          sheet.cached = true;
          sheet.map = cache_data.map;
          sheet.map_keys = Object.keys(cache_data.map);
          sheet.version = version;
          sheet.image.src = cache_data.image;

          if (typeof(_CALLBACK) === "function") {
            sheet.image.addEventListener("load", function() {
              _CALLBACK(sheet);
            });
          }

          return true;
        }
      }

      return false;
    }

    // moves a sprite by swapping its index with another sprite
    function _moveSprite(sheet_id, index, new_index) {
      var
        sheet = _SPRITE_SHEETS[sheet_id];

      if (sheet) {
        var
          sprite_id = sheet.map_keys[index],
          new_sprite_id = sheet.map_keys[new_index],
          l = sheet.map_keys.length;

        if (l > 0 && UTIL.isInteger(new_index) && new_index >= 0 && new_index < l) {
          // sprite maps
          if (new_sprite_id !== SPRITES.ROW_BREAK_TOKEN)
            sheet.map[new_sprite_id].index = index;

          if (sprite_id !== SPRITES.ROW_BREAK_TOKEN)
            sheet.map[sprite_id].index = new_index;

          // map keys (sort order)
          sheet.map_keys[new_index] = sprite_id;
          sheet.map_keys[index] = new_sprite_id;
        }
      }
    }

    // works in concert with _downloadSprites + _queueNextImage to request loading images in parallel
    function _onImageLoaded() {
      if (!_PRELOAD.initialized) {
        this.removeEventListener("load", _onImageLoaded);
        delete _PRELOAD.images[UTIL.splitURI(this.src).file]; // clear image buffer

        _PRELOAD.num_images_loaded++;
        _queueNextImage();
      }
    }

    // works in concert with _downloadSprites + _onImageLoaded to request loading images in parallel
    // - about 25-40% faster than serial download
    function _queueNextImage() {
      var
        keys = _PRELOAD.sheet.map_keys,
        sprite, sprite_id;

      // queue next image
      if (_PRELOAD.num_images_loaded < _PRELOAD.num_images_total && _PRELOAD.index < keys.length) {
        sprite_id = keys[_PRELOAD.index++];

        if (sprite_id !== SPRITES.ROW_BREAK_TOKEN) {
          sprite = _PRELOAD.sheet.map[sprite_id];

          if (sprite.image === null)
            sprite.image = new Image();

          if (sprite.image.width === 0) {
            sprite.image.addEventListener("load", _onImageLoaded);
            sprite.image.src = sprite.file_name;

            _PRELOAD.images[UTIL.splitURI(sprite.file_name).file] = {
              image: sprite.image,
              sprite: sprite
            };
          }
          else
            _PRELOAD.num_images_loaded++;
        }

        // keep the image download queue full with as many concurrent image downloads as possible
        if (Object.keys(_PRELOAD.images).length < SPRITES.CONCURRENT_DOWNLOADS)
          _queueNextImage();
      }

      // done with downloading all images from web server (LAST STEP)
      else if (_PRELOAD.num_images_loaded >= _PRELOAD.num_images_total) {
        var
          canvas = _PRELOAD.canvas_obj.canvas,
          ctx = _PRELOAD.canvas_obj.ctx,
          sheet = _PRELOAD.sheet,
          img = sheet.image,
          x = 0,
          y = 0,
          row_h = 0, // track tallest sprite in each row
          canvas_w = 0,
          canvas_h = 0;

        // create sprite map & calculate canvas / sprite sheet dimensions concurrently
        for (var i = 0, l = keys.length; i < l; i++) {
          sprite_id = keys[i];

          // reposition for a new row
          if (sprite_id === SPRITES.ROW_BREAK_TOKEN) {
            x = 0;
            y += row_h;
            canvas_h += row_h;
            row_h = 0;
          }
          else {
            sprite = sheet.map[sprite_id];
            sprite.x = x;
            sprite.y = y;

            // calculate dimensions based on scale / rotation
            // - remove .calc property after image is drawn on the sprite sheet
            sprite.calc = _calculateRaw(sheet, sprite);

            if (sprite.calc.rotation) {
              sprite.w = sprite.calc.canvas_w;
              sprite.h = sprite.calc.canvas_h;
            }
            else {
              sprite.w = sprite.calc.sprite_w;
              sprite.h = sprite.calc.sprite_h;
            }

            x += sprite.w;

            if (sprite.h > row_h)
              row_h = sprite.h;

            if (x > canvas_w)
              canvas_w = x;
          }
        }

        canvas_h += row_h;

        // set canvas size
        canvas.width = canvas_w;
        canvas.height = canvas_h;

        // place sprites on sprite sheet
        for (var key in sheet.map) {
          sprite = sheet.map[key];

          if (sprite.calc.rotation) {
            ctx.save();
            ctx.translate(sprite.calc.translate_x + sprite.x, sprite.y);
            ctx.rotate(sprite.calc.rotation);
            ctx.drawImage(sprite.image, 0, 0, sprite.calc.sprite_w, sprite.calc.sprite_h);
            ctx.restore();
          }
          else
            ctx.drawImage(sprite.image, sprite.x, sprite.y, sprite.calc.sprite_w, sprite.calc.sprite_h);

          delete sprite.calc;
        }

        img.src = canvas.toDataURL();

        img.addEventListener("load", function() {
          // cache image data to localStorage
          UTIL.STORAGE.set(
            sheet.id,
            {
              image: this.src,
              map: sheet.map,
              version: sheet.version
            }
          );

          sheet.cached = true;

          if (typeof(_CALLBACK) === "function")
            _CALLBACK(sheet.image);

          // cleanup / reset preloading variables
          // delete CANVAS.LIBRARY[_PRELOAD.canvas_id]; // TODO - test / remove
          CANVAS.delete(_PRELOAD.canvas_id);
          _PRELOAD.canvas_obj = null;
          _PRELOAD.images = {};
          _PRELOAD.initialized = true;
          _PRELOAD.index = 0;
          _PRELOAD.num_images_loaded = 0;
          _PRELOAD.sheet = null;

          // ensures only one eventlistener, otherwise a new eventlister listener is created each time "Create Sheet" is pressed
          // - http://stackoverflow.com/a/11511956 (ES5 strict event.callee not legal)
          // - another possible solution is to pre-empt img.addEventListener and check if an EventListener already exists
          this.removeEventListener("load", arguments.callee);
        });
      }
    }

    // remove redundant, first & last row breaks
    // - returns TRUE if rows have been removed
    function _removeRowBreaks(keys) {
      var
        i = 0,
        j = -1,
        l_original = keys.length,
        l = l_original;

      // remove SEQUENTIAL ROW BREAKS
      for (; i < l; i++) {
        if (keys[i] === SPRITES.ROW_BREAK_TOKEN) {
          if (i === j + 1) {
            keys.splice(i, 1);
            i--;
          }
          else
            j = i;
        }
      }

      // remove 1st ROW BREAK
      if (keys.length > 0 && keys[0] === SPRITES.ROW_BREAK_TOKEN)
        keys.splice(0, 1);

      // remove last ROW BREAK
      l = keys.length;

      if (l > 0 && keys[l - 1] === SPRITES.ROW_BREAK_TOKEN)
        keys.pop();

      return (l !== l_original);
    }

    // renames a sprite object key, updates the matching map_key and sprite.id
    function _renameSprite(sheet_id, sprite_id, new_sprite_id) {
      if (sprite_id !== new_sprite_id) {
        var
          sheet = _SPRITE_SHEETS[sheet_id],
          sprite, file_name;

        if (sheet) {
          sprite = sheet.map[sprite_id];

          // verify sprite exists and the sprite name isn't already used
          if (sprite && !sheet.map[new_sprite_id]) {
            file_name = UTIL.splitURI(sprite.file_name).file;

            if (new_sprite_id.length === 0)
              new_sprite_id = file_name;

            // if (new_sprite_id === sprite.id)
            //   return;

            sheet.map[new_sprite_id] = sprite;
            sprite.id = new_sprite_id;
            delete sheet.map[sprite_id];
            sheet.map_keys[sprite.index] = new_sprite_id; // keep map / map_keys in sync: rename map_key entry

            return true;
          }
        }
      }

      return false;
    }

    // syncs map indexes to map keys sort order for a sprite sheet
    // - start_index is optional
    function _syncMapIndexes(sheet_id, start_index) {
      var
        sheet = _SPRITE_SHEETS[sheet_id];

      if (sheet) {
        var
          i = (start_index && UTIL.isInteger(start_index) ? start_index : 0),
          l = sheet.map_keys.length,
          key;

        for (; i < l; i++) {
          key = sheet.map_keys[i];

          if (key !== SPRITES.ROW_BREAK_TOKEN)
            sheet.map[key].index = i;
        }
      }
    }

    var
      _JSON_TYPES = {
        DESCRIPTOR: "DESCRIPTOR FILE",
        MAP: "SPRITE MAP",
        COMBINED: "SPRITE SHEET + MAP"
      },

      _CALLBACK = null, // re-usable sprite sheet completion callback

      // _PRELOAD is for image preloading
      _PRELOAD = {
        canvas_id: "SPRITE-CANVAS",
        canvas_obj: null,
        images: {},
        index: 0,
        initialized: false,
        num_images_loaded: 0,
        num_images_total: 0,
        sheet: null
      },

      _SPRITE_SHEETS = {};

    /* PUBLIC */
    return {
      CONCURRENT_DOWNLOADS: 6,
      ROW_BREAK_TOKEN: "ROW-BREAK",
      SPRITE_SHEETS: _SPRITE_SHEETS,

      createSheet: _createSheet,
      createSprite: _createSprite,
      downloadSprites: _downloadSprites,
      downloadSpritesheet: _downloadSpritesheet,
      draw: _draw,
      drawRaw: _drawRaw,
      loadCached: _loadCached,
      moveSprite: _moveSprite,
      removeRowBreaks: _removeRowBreaks, // removes extra row breaks
      renameSprite: _renameSprite,
      syncMapIndexes: _syncMapIndexes
    };
  })();