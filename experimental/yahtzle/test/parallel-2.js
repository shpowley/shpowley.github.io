/**
 * DESCRIPTION:
 *
 * load pinochle SVG images
 * - use concurrent asset loading
 * - create sprite sheet library
 * - save HTML5 localStorage
 */
var
  $id = document.getElementById.bind(document),
  $create = document.createElement.bind(document),

  // utility namespace for common functions and localStorage wrapper
  UTIL = (function() {
    // faster equivalent to "Math.floor(n)"
    function _floor(n) {
      return n | 0;
    }

    // get a random integer between min/max inclusive
    function _getRandom(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // check if variable is an integer
    function _isInteger(n) {
      return (!isNaN(n) && n === (n | 0));
    }

    // http://stackoverflow.com/a/24398129
    function _pad(s, width, pad_char, left_justify) {
      if (_isInteger(width)) {
        var padding;

        if (typeof(pad_char) !== "string" || pad_char.length > 1)
          pad_char = ' ';

        if (s === null || s === undefined)
          s = "X";
        else if (typeof(s) !== "string")
          s = s.toString();

        padding = Array(width + 1 - s.length).join(pad_char);

        if (left_justify === true)
          return s + padding;
        else
          return padding + s;
      }
      else
        return s;
    }

    // http://phrogz.net/js/string_to_number.html
    function _toInteger(n) {
      switch (typeof(n)) {
        case "string":
          n = n - 0;

        case "number":
          if (!isFinite(n) || _isInteger(n)) return n;
          else return _floor(n);

        default:
          return n;
      }
    }

    var
      _STORAGE = (function() {
        function _clear(ID) {
          if (_isSupported())
            localStorage.clear(ID);
        }

        function _get(ID) {
          if (_isSupported()) {
            var s = localStorage.getItem(ID);

            if (typeof(s) === "string")
              return JSON.parse(s);
          }

          return null;
        }

        function _isSupported() {
          var
            x = "STORAGE TEST";

          if (!_IS_SUPPORTED) {
            try {
              localStorage.setItem(x, x);
              localStorage.removeItem(x);
              _IS_SUPPORTED = true;
            }
            catch(e) {
              _IS_SUPPORTED = false;
            }
          }

          return _IS_SUPPORTED;
        }

        function _set(ID, data) {
          if (_isSupported())
            localStorage.setItem(ID, JSON.stringify(data));
        }

        /* PRIVATE */
        var
          _IS_SUPPORTED = null;

        /* PUBLIC */
        return {
          clear: _clear,
          isSupported: _isSupported,
          get: _get,
          set: _set
        };
      })();

    return {
      STORAGE: _STORAGE,

      floor: _floor,
      getRandom: _getRandom,
      isInteger: _isInteger,
      pad: _pad,
      toInteger: _toInteger
    };
  })(),

  // a utility namespace containing sprite sheets and library of individual sprite mappings
  // - library and sprite_sheets are JSON maps with unique key names
  // - individual sprites are loaded into a sprite sheet and downloaded in parallel
  SPRITES = (function() {
    // create a new empty sprite sheet and add to sheet array
    function _createSheet(sheet_id) {
      return _SPRITE_SHEETS[sheet_id] = {
        id: sheet_id,
        image: new Image(), // actual in-memory sprite sheet
        cached: null,
        map: {},
        map_keys: null,
        version: null
      };
    }

    // create a new sprite container and add to a sprite sheet / map
    // - scale parameter is optional; uses global SCALE_FACTOR value if not specified
    // - _downloadSprites() is required to actually load the sprite sheet with image assets
    function _createSprite(sprite_id, file_name, sheet_id, scale) {
      if (!_SPRITE_SHEETS[sheet_id])
        _createSheet(sheet_id);

      return _SPRITE_SHEETS[sheet_id].map[sprite_id] = {
        file_name: file_name,
        scale: scale ? scale : SPRITES.SCALE_FACTOR,
        x: null,
        y: null,
        h: null,
        w: null
      };
    }

    // initiates loading of image assets
    function _downloadSprites(sheet_id, version) {
      var
        sheet = _SPRITE_SHEETS[sheet_id];

      if (sheet) {
        if (version)
          sheet.version = version;

        sheet.map_keys = Object.keys(sheet.map);

        if (sheet.map_keys.length > 0) {
          var
            canvas = _PRELOAD.canvas;

          canvas.obj = CANVAS.add(canvas.id);
          canvas.obj.canvas.height = canvas.max_height;
          canvas.obj.canvas.width = canvas.max_width;
          canvas.x = 0;
          canvas.height = 0;
          canvas.width = 0;
          _PRELOAD.initialized = false;
          _PRELOAD.sheet = sheet;
          _queueNextImage();
        }
      }
    }

    // generic draw sprite function
    // - scale (optional)
    function _draw(canvas, sheet_id, sprite_id, x, y, scale) {
      var S = _SPRITE_SHEETS[sheet_id].map[sprite_id];

      // drawImage(image, source-x, source-y, source-w, source-h, dest-x, dest-dy, dest-w, dest-h);
      if (typeof(scale) === "number")
        canvas.ctx.drawImage(_SPRITE_SHEETS[sheet_id].image, S.x, S.y, S.w, S.h, x, y, S.w * scale, S.h * scale);
      else
        canvas.ctx.drawImage(_SPRITE_SHEETS[sheet_id].image, S.x, S.y, S.w, S.h, x, y);
    }

    // return true if sprite sheet is cached in localStorage and successfully loaded
    function _loadCached(sheet_id, version) {
      var
        cache_data = UTIL.STORAGE.get(sheet_id);

      if (cache_data === null || cache_data.version !== version)
        return false;

      else {
        var
          sheet = _SPRITE_SHEETS[sheet_id];

        if (!sheet)
          sheet = _createSheet(sheet_id);

        sheet.id = sheet_id;
        sheet.image.src = cache_data.image;
        sheet.cached = true;
        sheet.map = cache_data.map;
        sheet.map_keys = Object.keys(cache_data.map);
        sheet.version = version;

        if (typeof(SPRITES.CALLBACK) === "function")
          SPRITES.CALLBACK(sheet);

        return true;
      }
    }

    function _onImageLoaded() {
      if (_PRELOAD.initialized === true)
        return;

      var
        images = _PRELOAD.images,
        file_name = this.src.slice(this.src.lastIndexOf('/') + 1),
        sprite = images[file_name].sprite,
        staging_canvas = _PRELOAD.canvas;

      // update sprite map info
      // - sprite canvas is for "staging" and true dimensions are fixed (_PRELOAD max_height/max_width)
      // - tracks the canvas sprite boundary as sprites are added
      // - sprites are only added horizontally for the final sprite sheet
      sprite.x = staging_canvas.width;
      sprite.y = 0;
      sprite.w = Math.ceil(this.naturalWidth * sprite.scale);
      sprite.h = Math.ceil(this.naturalHeight * sprite.scale);
      staging_canvas.width += sprite.w;

      // adjust staging height descriptor if necessary
      if (sprite.h > staging_canvas.height)
        staging_canvas.height = sprite.h;

      if (staging_canvas.width > staging_canvas.max_width || staging_canvas.height > staging_canvas.max_height)
        console.warn("WARNING: staging dimensions exceeded while loading sprites");

      staging_canvas.obj.ctx.drawImage(this, sprite.x, 0, sprite.w, sprite.h);

      // clear image buffer
      images[file_name].image = null;
      delete images[file_name];

      _PRELOAD.num_images_loaded++;
      _queueNextImage();
    }

    // works in concert with _onImageLoaded to request loading images in parallel
    // - about 25-40% faster than serial download
    function _queueNextImage() {
      var
        keys = _PRELOAD.sheet.map_keys;

      // queue next image
      if (_PRELOAD.index < keys.length) {
        var
          image = new Image(),
          sprite_id = keys[_PRELOAD.index++],
          sprite = _PRELOAD.sheet.map[sprite_id];

        image.src = sprite.file_name;
        image.onload = _onImageLoaded;

        _PRELOAD.images[sprite.file_name.slice(sprite.file_name.lastIndexOf('/') + 1)] = {
          image: image,
          sprite: sprite
        };

        // keep the image download queue full with as many concurrent image downloads as possible
        if (Object.keys(_PRELOAD.images).length < SPRITES.CONCURRENT_DOWNLOADS)
          _queueNextImage();
      }

      // done with downloading all images from web server (LAST STEP)
      else if (_PRELOAD.num_images_loaded >= keys.length) {
        var
          img = _PRELOAD.sheet.image,
          canvas_obj = _PRELOAD.canvas,
          staging = CANVAS.add("STAGING");

        // copy "snug" sprite sheet to another staging canvas
        staging.canvas.width = canvas_obj.width;
        staging.canvas.height = canvas_obj.height;
        staging.ctx.drawImage(_PRELOAD.canvas.obj.canvas, 0, 0, canvas_obj.width, canvas_obj.height, 0, 0, canvas_obj.width, canvas_obj.height);
        img.src = staging.canvas.toDataURL();

        img.onload = function() {
          var
            sheet = _PRELOAD.sheet;

          UTIL.STORAGE.set(
            sheet.id,
            {
              // h: sheet.image.height,
              // w: sheet.image.width,
              image: sheet.image.src,
              map: sheet.map,
              version: sheet.version
            }
          );

          sheet.cached = true;

          if (typeof(SPRITES.CALLBACK) === "function")
            SPRITES.CALLBACK(sheet);

          // cleanup / reset preloading variables
          delete CANVAS.LIBRARY[_PRELOAD.canvas.id];
          _PRELOAD.canvas.obj = null;
          _PRELOAD.canvas.x = 0;
          _PRELOAD.canvas.height = 0;
          _PRELOAD.canvas.width = 0;
          _PRELOAD.images = {};
          _PRELOAD.initialized = true;
          _PRELOAD.index = 0;
          _PRELOAD.num_images_loaded = 0;
          _PRELOAD.sheet = null;
        };
      }
    }

    var
      // _PRELOAD is for image preloading
      _PRELOAD = {
        canvas: {
          obj: null,
          id: "SPRITE-CANVAS",
          x: 0,
          height: 0,
          width: 0,
          max_height: 400,
          max_width: 3500
        },

        images: {},
        index: 0,
        initialized: false,
        num_images_loaded: 0,
        sheet: null
      },

      _SPRITE_SHEETS = {};

    /* PUBLIC */
    return {
      CALLBACK: null,
      CONCURRENT_DOWNLOADS: 6,
      SCALE_FACTOR: 1,
      SPRITE_SHEETS: _SPRITE_SHEETS,

      // TODO: eliminate createSheet / createSprite as public methods (?)
      createSheet: _createSheet,
      createSprite: _createSprite,
      downloadSprites: _downloadSprites,
      draw: _draw,
      loadCached: _loadCached
    };
  })(),

  CANVAS = (function() {
    // create new or add existing canvas wrapped in a js object literal and add to LIBRARY
    // - canvas parameter is optional
    function _add(id, canvas) {
      if (canvas === undefined)
        canvas = $create("canvas");
      else if (canvas.nodeName !== "CANVAS")
        return null;

      if (canvas.getContext)
        return _LIBRARY[id] = {
          canvas: canvas,
          ctx: canvas.getContext("2d")
        };
      else
        console.warn("CANVAS unsupported");

      return null;
    }

    var
      _LIBRARY = {};

    return {
      add: _add,

      LIBRARY: _LIBRARY
    };
  })(),

  // card sprite namespace that builds on top of SPRITES namespace
  // - loads all the pinochle card sprites
  CARD_SPRITES = (function() {
    function _callback(sheet) {
      CARD_SPRITES.SHEET = sheet;
      _INITIALIZED = true;

      if (typeof(CARD_SPRITES.CALLBACK) === "function")
        CARD_SPRITES.CALLBACK();
    }

    // 1st function called
    function _initialize() {
      if (_INITIALIZED === true)
        return null;

      SPRITES.CALLBACK = _callback;

      // if sprite sheet is cached in localStorage load that image + map (built in .loadCached())
      if (SPRITES.loadCached(_SHEET_ID, _VERSION) === false) {
        // otherwise, download images + build map
        var
          path = "images/";

        SPRITES.SCALE_FACTOR = CARD_SPRITES.SCALE_FACTOR;

        // prepare sprite map descriptors
        SPRITES.createSprite("AD", path + "ace_of_diamonds.svg", _SHEET_ID);
        SPRITES.createSprite("TD", path + "10_of_diamonds.svg", _SHEET_ID);
        SPRITES.createSprite("KD", path + "king_of_diamonds2.svg", _SHEET_ID);
        SPRITES.createSprite("QD", path + "queen_of_diamonds2.svg", _SHEET_ID);
        SPRITES.createSprite("JD", path + "jack_of_diamonds2.svg", _SHEET_ID);
        SPRITES.createSprite("9D", path + "9_of_diamonds.svg", _SHEET_ID);
        SPRITES.createSprite("AS", path + "ace_of_spades2.svg", _SHEET_ID);
        SPRITES.createSprite("TS", path + "10_of_spades.svg", _SHEET_ID);
        SPRITES.createSprite("KS", path + "king_of_spades2.svg", _SHEET_ID);
        SPRITES.createSprite("QS", path + "queen_of_spades2.svg", _SHEET_ID);
        SPRITES.createSprite("JS", path + "jack_of_spades2.svg", _SHEET_ID);
        SPRITES.createSprite("9S", path + "9_of_spades.svg", _SHEET_ID);
        SPRITES.createSprite("AH", path + "ace_of_hearts.svg", _SHEET_ID);
        SPRITES.createSprite("TH", path + "10_of_hearts.svg", _SHEET_ID);
        SPRITES.createSprite("KH", path + "king_of_hearts2.svg", _SHEET_ID);
        SPRITES.createSprite("QH", path + "queen_of_hearts2.svg", _SHEET_ID);
        SPRITES.createSprite("JH", path + "jack_of_hearts2.svg", _SHEET_ID);
        SPRITES.createSprite("9H", path + "9_of_hearts.svg", _SHEET_ID);
        SPRITES.createSprite("AC", path + "ace_of_clubs.svg", _SHEET_ID);
        SPRITES.createSprite("TC", path + "10_of_clubs.svg", _SHEET_ID);
        SPRITES.createSprite("KC", path + "king_of_clubs2.svg", _SHEET_ID);
        SPRITES.createSprite("QC", path + "queen_of_clubs2.svg", _SHEET_ID);
        SPRITES.createSprite("JC", path + "jack_of_clubs2.svg", _SHEET_ID);
        SPRITES.createSprite("9C", path + "9_of_clubs.svg", _SHEET_ID);
        SPRITES.createSprite("card_back", path + "card_back.svg", _SHEET_ID);

        // download actual sprites
        SPRITES.downloadSprites(_SHEET_ID, _VERSION);
      }
    }

    var
      _INITIALIZED = false,
      _SHEET_ID = "CARD-SPRITES",
      _VERSION = 0.2;

    return {
      CALLBACK: null,
      SCALE_FACTOR: 1,
      SHEET: null,

      initialize: _initialize
    };
  })();

window.addEventListener("load", function() {
  CARD_SPRITES.CALLBACK = function() {
    $id("deck").src = CARD_SPRITES.SHEET.image.src;
    console.log("DONE LOADING IMAGES");
  };

  CARD_SPRITES.SCALE_FACTOR = 0.4;
  CARD_SPRITES.initialize();
});