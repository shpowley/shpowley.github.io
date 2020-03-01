/**
 * HITBOX
 * - CANVAS GAMES:    http://www.ibm.com/developerworks/library/wa-games/
 * - CANVAS GUIDE:    https://developer.apple.com/library/safari/documentation/AudioVideo/Conceptual/HTML-canvas-guide
 * - EVENTS:          http://www.w3schools.com/jsref/dom_obj_event.asp
 * - TOUCH VS. MOUSE: http://www.html5rocks.com/en/mobile/touchandmouse/
 * - use .getBoundingClientRect() for actual element size and scaling
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
  // - library and sprite_sheets are object literal JSON maps with unique key names
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

  CANVAS = {
    /**
     * TODO
     * - add simple (invisible, not in DOM) / complex
     *
     */
    // create / add a js object literal wrapper for a canvas element
    // - simple / complex wrapper based on whether canvas_element is a dom element
    create: function(canvas_element) {
      var is_complex = true;

      if (canvas_element === undefined)
        canvas_element = $create("canvas");

      else if (canvas_element.nodeName !== "CANVAS")
        return null;

      // HERE
      if (canvas_element.getContext) {
        // var o = {
        //   canvas: canvas_element,
        //   ctx: canvas_element.getContext("2d")
        // };

        // if (canvas_element.parentNode) {
        //   // object literal map of all sprites drawn on this canvas
        //   o.sprites = {};

        //   // measurements retrieved using init()
        //   o.x = null;
        //   o.y = null;
        //   o.w = null;
        //   o.h = null;
        //   o.scale = null;

        //   o.raw = {
        //     h: null,
        //     w: null
        //   };

        //   o.addSprite = null;
        // }

        // return o;

        return {
          canvas: canvas_element,
          ctx: canvas_element.getContext("2d"),

          // object literal map of all sprites drawn on this canvas
          sprites: {},

          // measurements retrieved using init()
          x: null,
          y: null,
          w: null,
          h: null,
          scale: null,

          raw: {
            h: null,
            w: null
          },

          /* FUNCTIONS */
          addSprite: function(id, sprite_id, x, y, scale) {
            var
              sprite = SPRITES.library[sprite_id],
              canvas = this;

            if (!scale)
              scale = 1;

            canvas.sprites[id] = {
              sprite_id: sprite_id,
              x: x * canvas.scale,
              y: y * canvas.scale,
              h: sprite.h * canvas.scale * scale,
              w: sprite.w * canvas.scale * scale,
              scale: scale,

              raw: {
                x: x,
                y: y,
                h: sprite.h,
                w: sprite.w,
              }
            };

            SPRITES.draw(canvas, sprite_id, x, y, scale);
          },

          deleteSprite: function(id) {
            this.ctx.clearRect();
          },

          // hit test for a single sprite
          hitTest: function(id, page_xy) {
            var
              canvas = this,
              sprite = canvas.sprites[id];

            if (sprite) {
              var
                x = page_xy.x - canvas.x,
                y = page_xy.y - canvas.y;

              return (x >= sprite.x && x <= (sprite.x + sprite.w) && y >= sprite.y && y <= (sprite.y + sprite.h));
            }
            else {
              console.warn("WARNING: \"" + id + "\" sprite not found.");
              return false;
            }
          },

          initRect: function() {
            var
              hidden_status = canvas_element.hidden,
              canvas = this,
              rect = null;

            if (hidden_status)
              canvas_element.hidden = false;

            // this function only works if the html element is visible
            rect = canvas_element.getBoundingClientRect();

            canvas.x = canvas_element.offsetLeft;
            canvas.y = canvas_element.offsetTop;
            canvas.w = rect.width;
            canvas.h = rect.height;
            canvas.scale = rect.width / canvas_element.offsetWidth;
            canvas.raw.h = canvas_element.offsetHeight;
            canvas.raw.w = canvas_element.offsetWidth;

            canvas_element.hidden = hidden_status;
          }
        };
      }

      else {
        console.error("CANVAS unsupported");
        return null;
      }
    },

    // create array of canvas-based js object literals
    createArray: function(n) {
      var
        i = 0,
        canvas_array = [];

      for (; i < n; i++) {
        canvas_array.push(CANVAS.create());
      }

      return canvas_array;
    }
  };

function clicky(e) {
  // var
  //   x = e.pageX - main.x,
  //   y = e.pageY - main.y,
  //   key = null,
  //   sprite = null;

  // for (key in main.sprites) {
  //   sprite = main.sprites[key];

  //   if (
  //     x >= sprite.x &&
  //     x <= (sprite.x + sprite.w) &&
  //     y >= sprite.y &&
  //     y <= (sprite.y + sprite.h))
  //     console.log(key);
  // }

  var xy = {
    x: e.pageX,
    y: e.pageY
  };

  if (main.hitTest("JACK", xy))
    console.log("JACK");

  if (main.hitTest("QUEEN", xy))
    console.log("QUEEN");

  if (main.hitTest("KING", xy))
    console.log("KING");

  if (main.hitTest("NINE", xy))
    console.log("NINE");
}

window.addEventListener("load", function() {
  YAHTZLE.DECK.initialize();

  // main = canvasObject($id("canvas-main"));
  main = CANVAS.create($id("canvas-main"));

  // canvas scaled down
  main.canvas.width = 1000;
  main.canvas.height = 600;

  if (main !== null) {
    staging = CANVAS.createArray(1);
    CARDS.initialize();
    CARDS.loadNextImage();
  }
});

CARDS.fnCompleted = function() {
  // some test output
  main.initRect();

  main.addSprite("QUEEN", "QS", 50, 100, 2);
  main.addSprite("JACK", "JD", 360, 100, 2);
  main.addSprite("KING", "KS", 660, 80);
  main.addSprite("NINE", "9H", 660, 300);
  main.canvas.hidden = false;

  main.canvas.addEventListener("click", clicky);
};
