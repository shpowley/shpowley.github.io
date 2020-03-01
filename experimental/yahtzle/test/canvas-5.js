/**
 * cache pinochle SVG images to a sprite sheet library + HTML5 localStorage
 */
var
  $id = document.getElementById.bind(document),
  $create = document.createElement.bind(document),
  main = null,
  staging = null,

  // place holder
  UTIL = {
    // check if variable is an integer
    isInteger: function(n) {
      return (!isNaN(n) && n === (n | 0));
    },
  },

  // place holder
  YAHTZLE = {
    CARD: {
      SUITS: {
        DIAMONDS: "♦",  // "&diams;"
        SPADES: "♠",    // "&spades;"
        HEARTS: "♥",    // "&hearts;"
        CLUBS: "♣"      // "&clubs;"
      },

      VALUES: {
        ACE: "A",
        TEN: "10",
        KING: "K",
        QUEEN: "Q",
        JACK: "J",
        NINE: "9"
      },

      create: function(value, suit, id) {
        function card(value, suit, id) {
          this.value = value ? value : null;
          this.suit = suit ? suit : null;
          this.code = YAHTZLE.CARD.codeLookup(null, value, suit);
          this.id = UTIL.isInteger(id) ? id : null;
        }

        return new card(value, suit, id);
      },

      // returns a 2-letter code from card
      codeLookup: function(card, value, suit) {
        var C = YAHTZLE.CARD;

        if (card) {
          value = card.value;
          suit = card.suit;
        }

        switch(value) {
          case C.VALUES.ACE:
            value = "A";
            break;

          case C.VALUES.TEN:
            value = "T";
            break;

          case C.VALUES.KING:
            value = "K";
            break;

          case C.VALUES.QUEEN:
            value = "Q";
            break;

          case C.VALUES.JACK:
            value = "J";
            break;

          case C.VALUES.NINE:
            value = "9";
        }

        switch(suit) {
          case C.SUITS.DIAMONDS:
            suit = "D";
            break;

          case C.SUITS.SPADES:
            suit = "S";
            break;

          case C.SUITS.HEARTS:
            suit = "H";
            break;

          case C.SUITS.CLUBS:
            suit = "C";
        }

        return (!value || !suit ? null : value + suit);
      },
    },

    DECK: {
      CARDS: [],

      /* ===========================| FUNCTIONS |=========================== */
      // initialize deck suits & values for double deck pinochle
      initialize: function() {
        YAHTZLE.DECK.CARDS.length = 0;

        var
          C = YAHTZLE.CARD,
          D = YAHTZLE.DECK.CARDS,
          id = 0,
          i, j, k;

        for (i = 0; i < 2; i++) {
          for (j in C.SUITS) {
            for (k in C.VALUES) {
              D.push(C.create(C.VALUES[k], C.SUITS[j], id++));
            }
          }
        }
      }
    },

    STORAGE: {
      // https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
      IS_SUPPORTED: null,

      clear: function(ID) {
        var DB = YAHTZLE.STORAGE;

        if (DB.isSupported())
          localStorage.clear(ID);
      },

      get: function(ID) {
        var DB = YAHTZLE.STORAGE;

        if (DB.isSupported()) {
          var s = localStorage.getItem(ID);

          if (typeof(s) === "string")
            return JSON.parse(s);
        }

        return null;
      },

      isSupported: function() {
        var
          DB = YAHTZLE.STORAGE,
          x = "STORAGE TEST";

        if (!DB.IS_SUPPORTED) { // falsey
          try {
            localStorage.setItem(x,x);
            localStorage.removeItem(x);
            DB.IS_SUPPORTED = true;
          }
          catch(e) {
            DB.IS_SUPPORTED = false;
          }
        }

        return DB.IS_SUPPORTED;
      },

      set: function(ID, data) {
        var DB = YAHTZLE.STORAGE;

        if (DB.isSupported())
          localStorage.setItem(ID, JSON.stringify(data));
      }
    }
  },

  // a utility namespace containing sprite sheets and library of individual sprite mappings
  // - library and sprite_sheets are JSON maps with unique key names
  SPRITES = {
    sprite_sheets: {},
    library: {},

    /* FUNCTIONS */
    createSheet: function(sheet_id) {
      return SPRITES.sprite_sheets[sheet_id] = {
        id: sheet_id,
        image: new Image(),
        cached: null
      };
    },

    createSprite: function(sprite_id, filename, sheet_id) {
      return SPRITES.library[sprite_id] = {
        id: sprite_id,
        name: filename,
        sheet_id: sheet_id,
        x: null,
        y: null,
        w: null,
        h: null
      };
    },

    // generic draw sprite function
    // - scale (optional)
    draw: function(canvas, sprite_id, dest_x, dest_y, scale) {
      var
        S = SPRITES.library[sprite_id],
        sheet_id = S.sheet_id;

      // drawImage(image, source-x, source-y, source-w, source-h, dest-x, dest-dy, dest-w, dest-h);
      if (UTIL.isInteger(scale))
        canvas.ctx.drawImage(SPRITES.sprite_sheets[sheet_id].image, S.x, S.y, S.w, S.h, dest_x, dest_y, S.w * scale, S.h * scale);
      else
        canvas.ctx.drawImage(SPRITES.sprite_sheets[sheet_id].image, S.x, S.y, S.w, S.h, dest_x, dest_y, S.w, S.h);
    },
  },

  // a util namespace related to cards in a pinochle deck
  // - built on top of SPRITES namespace
  CARDS = {
    version: 1.1,
    initialized: false,
    scale: 0.6,
    sheet_id: "DECK",
    sprite_sheet: null, // reference to SPRITES.spritesheet holding card deck
    fnCompleted: null,
    image_buffer: new Image(),
    index: 0,
    keys: null,

    // card sprite placement x,y
    x: 0,
    y: 0,

    // single card sprite h,w
    h: 0,
    w: 0,

    /* FUNCTIONS */
    helperImageError: function() {
      console.warn("Error loading image \"" + this.src +  "\"");
      CARDS.loadNextImage();
    },

    // individual card SVG draw to canvas
    // + sprite sheet export upon loading all SVG cards
    // + sprite sheet cache to localStorage
    helperImageLoad: function() {
      var img = CARDS.image_buffer;

      // set default card sizes
      if (CARDS.w === 0) {
        CARDS.w = Math.ceil(img.naturalWidth * CARDS.scale);
        CARDS.h = Math.ceil(img.naturalHeight * CARDS.scale);

        // staging[0] handles initial svg to canvas conversion
        staging[0].canvas.height = CARDS.h;
        staging[0].canvas.width = CARDS.w * CARDS.keys.length;
      }

      CARDS.helperSpriteUpdate();
      staging[0].ctx.drawImage(img, CARDS.x, CARDS.y, CARDS.w, CARDS.h);

      if (CARDS.index < CARDS.keys.length) {
        CARDS.x += CARDS.w;
        CARDS.loadNextImage();
      }

      // upon loading last image
      else if (CARDS.index === CARDS.keys.length) {
        // no longer needed
        CARDS.keys = null;
        img.onload = null;
        img.onerror = null;
        CARDS.image_buffer = null;

        // re-using image variable
        img = CARDS.sprite_sheet.image;
        img.src = staging[0].canvas.toDataURL();

        img.onload = function() {
          CARDS.initialized = true;

          if (!CARDS.sprite_sheet.cached) {
            YAHTZLE.STORAGE.set(
              CARDS.sheet_id,
              {
                version: CARDS.version,
                h: CARDS.h,
                w: CARDS.w,
                image_data: this.src
              }
            );
          }

          if (typeof(CARDS.fnCompleted) === "function")
            CARDS.fnCompleted();
        };
      }
    },

    // load card deck sprite sheet from localStorage
    // + map position / size data to sprite library
    helperSpriteSheetLoad: function() {
      // update card deck sprite library position / size info
      while (true) {
        CARDS.helperSpriteUpdate();

        if (CARDS.index === CARDS.keys.length)
          break;

        CARDS.x += CARDS.w;
      }

      // no longer needed
      CARDS.keys = null;
      CARDS.image_buffer.onload = null;
      CARDS.image_buffer.onerror = null;
      CARDS.image_buffer = null;

      CARDS.initialized = true;

      if (typeof(CARDS.fnCompleted) === "function")
        CARDS.fnCompleted();
    },

    // update sprite info with current card position / size data
    helperSpriteUpdate: function() {
      var obj = SPRITES.library[CARDS.keys[CARDS.index++]];

      obj.x = CARDS.x;
      obj.y = 0;
      obj.h = CARDS.h;
      obj.w = CARDS.w;
    },

    initialize: function() {
      if (!CARDS.initialized) {
        var
          img = CARDS.image_buffer,
          sheet = CARDS.sheet_id;

        img.onload = CARDS.helperImageLoad;
        img.onerror = CARDS.helperImageError;

        CARDS.sprite_sheet = SPRITES.createSheet(sheet);

        // create skeleton SPRITE library for cards faces / card back
        SPRITES.createSprite("AD", "ace_of_diamonds.svg", sheet);
        SPRITES.createSprite("TD", "10_of_diamonds.svg", sheet);
        SPRITES.createSprite("KD", "king_of_diamonds2.svg", sheet);
        SPRITES.createSprite("QD", "queen_of_diamonds2.svg", sheet);
        SPRITES.createSprite("JD", "jack_of_diamonds2.svg", sheet);
        SPRITES.createSprite("9D", "9_of_diamonds.svg", sheet);
        SPRITES.createSprite("AS", "ace_of_spades2.svg", sheet);
        SPRITES.createSprite("TS", "10_of_spades.svg", sheet);
        SPRITES.createSprite("KS", "king_of_spades2.svg", sheet);
        SPRITES.createSprite("QS", "queen_of_spades2.svg", sheet);
        SPRITES.createSprite("JS", "jack_of_spades2.svg", sheet);
        SPRITES.createSprite("9S", "9_of_spades.svg", sheet);
        SPRITES.createSprite("AH", "ace_of_hearts.svg", sheet);
        SPRITES.createSprite("TH", "10_of_hearts.svg", sheet);
        SPRITES.createSprite("KH", "king_of_hearts2.svg", sheet);
        SPRITES.createSprite("QH", "queen_of_hearts2.svg", sheet);
        SPRITES.createSprite("JH", "jack_of_hearts2.svg", sheet);
        SPRITES.createSprite("9H", "9_of_hearts.svg", sheet);
        SPRITES.createSprite("AC", "ace_of_clubs.svg", sheet);
        SPRITES.createSprite("TC", "10_of_clubs.svg", sheet);
        SPRITES.createSprite("KC", "king_of_clubs2.svg", sheet);
        SPRITES.createSprite("QC", "queen_of_clubs2.svg", sheet);
        SPRITES.createSprite("JC", "jack_of_clubs2.svg", sheet);
        SPRITES.createSprite("9C", "9_of_clubs.svg", sheet);
        SPRITES.createSprite("card_back", "card_back.svg", sheet);

        CARDS.keys = Object.keys(SPRITES.library);
      }
    },

    // loads next card sprite into library - http://stackoverflow.com/a/21076769
    loadNextImage: function() {
      // check if sprite sheet is cached
      var cache_data = null;

      if (CARDS.sprite_sheet.cached === null) {
        cache_data = YAHTZLE.STORAGE.get(CARDS.sheet_id);

        if (cache_data === null)
          CARDS.sprite_sheet.cached = false;

        else if (cache_data.version === CARDS.version)
          CARDS.sprite_sheet.cached = true;

        else {
          cache_data = null;
          CARDS.sprite_sheet.cached = false;
        }
      }

      // sprite sheet not cached, create in-memory card sprite sheet from SVG files
      if (cache_data === null) {
        if (CARDS.index < CARDS.keys.length) {
          // triggers image.load(); CARDS.index incremented later during sprite info update
          CARDS.image_buffer.src = "images/" + SPRITES.library[CARDS.keys[CARDS.index]].name;
        }
      }

      // card sprite sheet loaded from localStorage
      else {
        CARDS.h = cache_data.h;
        CARDS.w = cache_data.w;
        CARDS.sprite_sheet.image.onload = CARDS.helperSpriteSheetLoad;
        CARDS.sprite_sheet.image.src = cache_data.image_data;
      }
    }
  },

  // custom animation timer
  TIMER = {
    FPS_60: 60,
    FPS_30: 30,
    FPS_20: 20,

    trigger_count: 0,

    // animation
    animation_frame: null, // handle for cancel
    animation_fn: null, // reference to animation function

    // FPS control
    FPS: null,
    FPS_delay: null,
    FPS_actual: null,

    // tolerance for timing comparisons
    tolerance: 0.01,

    // total stats
    timer_start: null,
    duration: null, // desired run duration (milliseconds)
    elapsed: null,

    // individual frame
    frame_delta: null,
    frame_start: null,

    /* FUNCTIONS */
    anim_init: function(timestamp) {
      TIMER.timer_start = TIMER.frame_start = timestamp;
      TIMER.requestAnimationFrame(TIMER.animation_fn);
    },

    cancelAnimationFrame: function(handle) {
      if (!handle)
        handle = TIMER.animation_frame;

      window.cancelAnimationFrame ? window.cancelAnimationFrame(handle) :
      window.webkitCancelAnimationFrame ? window.webkitCancelAnimationFrame(handle) :
      window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle) :
      window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle) :
      window.msCancelRequestAnimationFrame ? window.msCancelRequestAnimationFrame(handle) :
      window.oCancelRequestAnimationFrame	? window.oCancelRequestAnimationFrame(handle) :
      null;
    },

    init: function(anim, duration_ms, fps) {
      if (duration_ms && UTIL.isInteger(duration_ms) && duration_ms > 0)
        TIMER.duration = duration_ms;
      else
        return;

      TIMER.FPS = (fps && UTIL.isInteger(fps) && fps > 0) ? fps : TIMER.FPS_30;
      TIMER.FPS_delay = 1000 / TIMER.FPS;
      TIMER.animation_fn = anim;
      TIMER.trigger_count = 0;

      TIMER.requestAnimationFrame(TIMER.anim_init);
    },

    isComplete: function(timestamp) {
      TIMER.elapsed = timestamp - TIMER.timer_start;

      if (TIMER.elapsed < TIMER.duration + TIMER.tolerance) {
        TIMER.trigger_count++;
        TIMER.frame_start = timestamp;
        TIMER.FPS_actual = Math.round(1000 / TIMER.frame_delta);
        return false;
      }
      else {
        TIMER.cancelAnimationFrame();
        return true;
      }
    },

    isTriggered: function(timestamp) {
      TIMER.requestAnimationFrame(TIMER.animation_fn);
      TIMER.frame_delta = timestamp - TIMER.frame_start;

      return (TIMER.frame_delta >= TIMER.FPS_delay - TIMER.tolerance || TIMER.frame_delta >= TIMER.FPS_delay + TIMER.tolerance);
    },

    requestAnimationFrame: function(fn) {
      return TIMER.animation_frame = window.requestAnimationFrame(fn) ||
        window.webkitRequestAnimationFrame(fn) ||
        window.mozRequestAnimationFrame(fn) ||
        window.msRequestAnimationFrame(fn) ||
        window.oRequestAnimationFrame(fn);
    }
  },

  c_sprite = {
    y_init: 0,
    x: 100,
    y: 100,
    y_final: 1000,
    h: CARDS.h * 2,
    w: CARDS.w * 2,
    v: null,
    time: 500,

    init: function() {
      this.y_init = this.y;
      staging[0].canvas.height = this.h = CARDS.h * 2;
      staging[0].canvas.width = this.w = CARDS.w * 2;
      this.v = (this.y_final - this.y) / this.time;
      staging[0].ctx.globalAlpha = 0.2;
    }
  };

// create one canvas wrapped in a js object literal
function canvasObject(o) {
  if (o === undefined)
    o = $create("canvas");

  else if (o.nodeName !== "CANVAS")
    return null;

  if (o.getContext)
    return {
      canvas: o,
      ctx: o.getContext("2d")
    };

  else {
    console.error("CANVAS unsupported");
    return null;
  }
}

// create array of canvas-based js object literals
function canvasArray(n) {
  var
    i = 0,
    canvas_array = [];

  for (; i < n; i++) {
    canvas_array.push(canvasObject());
  }

  return canvas_array;
}

function anim(timestamp) {
  if (TIMER.isTriggered(timestamp)) {
    if (!TIMER.isComplete(timestamp)) {
      main.ctx.clearRect(c_sprite.x, c_sprite.y, c_sprite.w, c_sprite.h);

      // SPRITES.draw(staging[0], "JD", 0, 0, 2);
      // main.ctx.drawImage(staging[0].canvas, c_sprite.x, c_sprite.y);

      c_sprite.y = c_sprite.v * TIMER.elapsed + c_sprite.y_init;

      // v = x1 - x0 / t1 - t0 ==> x1 = v * (t1 - t0) + x0
      SPRITES.draw(main, "JD", c_sprite.x, c_sprite.y, 2);
      // console.log("TIME: " + TIMER.elapsed);
      // console.log(TIMER.trigger_count + ": FPS = " + TIMER.FPS_actual);
    }
  }
}

window.addEventListener("load", function() {
  YAHTZLE.DECK.initialize();

  main = canvasObject($id("canvas-main"));
  main.canvas.width = document.body.clientWidth * 2;
  main.canvas.height = document.body.clientHeight * 2;

  if (main !== null) {
    staging = canvasArray(1);
    CARDS.initialize();
    CARDS.loadNextImage();
  }
});

CARDS.fnCompleted = function() {
  // some test output
  SPRITES.draw(main, "QS", 0, 0);
  SPRITES.draw(main, "JD", c_sprite.x, c_sprite.y, 2);
  c_sprite.init();
  main.canvas.hidden = false;
  TIMER.init(anim, c_sprite.time, TIMER.FPS_60);
};