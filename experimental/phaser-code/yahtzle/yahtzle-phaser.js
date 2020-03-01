/* MAIN TODO LIST */
/*
  MENU
  - keep text as is and re-visit design

  LOADING SCREEN
  - check animation load delay in mobile dev tools
  - options:
    - new game
    - player setup
    - settings
    - high scores
    - rules
    - scoring
    - show deck

  - cut the rope
    - menu
      - logo
      - background graphic (ripped gift wrap paper)
      - intro music
      - rotating light animation

      - play
      - option

      - (icon) sound on / off / music + effects

  - basket & ball
    - http://suntemple.co/
    - menu
      - logo + main graphic
      - animated background
      - music
      - sound icon
      - social media buttons

      - play
      - options
      - walk-through

  - % complete
    - additional suit colors: red heart/diamond + black spade/club
    - "play" button SVG
    - "play" button once loaded
    - full screen option for web browser?
    - more crisp graphics using IMAGE DATA
    - animation (MUCH LATER)
      - look @ other games..
      - cards dealt on table from the bottom
      - yahtzle logo / suits fade in
      - suit colors start fading in to correct red / black colors

  BEGINNING OF A CARD FLIP ANIMATION
  var tween = _GAME.make.tween(this.vars.sprite_card).to({ width: 2 }, 200, Phaser.Easing.Quintic.Out, true);
  - replace with card edge
  - replace with card back animation
  - put this into a common function

  ASSETS TO localStorage
  - SVG / json atlas assets

  RESIZE IMAGES AND CREATE ATLAS / MAP AT RUN-TIME SPECIFIC TO RESOLUTION
  - @ startup
  - save to localStorage

  IMAGE DATA (not sure.. unless using for localStorage cache.. maybe MUCH LATER)
  - see sprite.js | /yahtzle/js/sprite.js (~line 378) + /yahtzle/admin/sprite-admin.js
  - canvas.toDataURL() | https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL

  - http://phaser.io/docs/2.4.6/Phaser.Cache.html
  - phaser ex. http://codepen.io/ianmcgregor/pen/qkvcj
      var data = new Image();
      data.src = dataURI; // where dataURI is the base64 data
      game.cache.addImage('image-data', dataURI, data);
*/

/* global Phaser YAHTZLE UTIL */
var
  $id = document.getElementById.bind(document),

  // "keys" and corresponding spritesheet index
  CARDS = {
    AC: 0,
    TC: 1,
    KC: 2,
    QC: 3,
    JC: 4,
    "9C": 5,
    AD: 6,
    TD: 7,
    KD: 8,
    QD: 9,
    JD: 10,
    "9D": 11,
    AS: 12,
    TS: 13,
    KS: 14,
    QS: 15,
    JS: 16,
    "9S": 17,
    AH: 18,
    TH: 19,
    KH: 20,
    QH: 21,
    JH: 22,
    "9H":23,
    CARD_BACK: 24
  },

  CONST = {
    // resource atlas keys
    ATLAS: {
      LOADING: "ATLAS-LOADING",
      GAME: "ATLAS-MAIN"
    },

    CARDS: {
      // dimensions
      SCALE: 0.7,
      SCALE_HEIGHT: 0,
      SCALE_WIDTH: 0,
      HEIGHT: 162,
      WIDTH: 112,

      // tween info
      TWEEN_SPEED: 550,
      EASING: Phaser.Easing.Quintic.Out
    },

    DEBUG: true,
    DEBUG_SHOW_HITZONES: false,

    // position deck
    // TODO - delete later if the deck is off screen
    DECK: {
      BOTTOM: {
        X: null,
        Y: null
      },

      TOP: {
        X: null,
        Y: null
      }
    },

    FADE_IN_TIME: 500,
    FADE_OUT_TIME: 500,

    // key / location for all resources
    // - populated at _init()
    RESOURCE: {},

    // desktop defaults, modified for mobile at run-time
    SCREEN: {
      HEIGHT: 640,
      WIDTH: 960,

      MIN_HEIGHT: 360,
      MIN_WIDTH: 540
    },

    // state label "keys"
    STATE: {
      BOOT: "STATE-BOOT",               // initial state
      DECK: "STATE-DECK",               // display deck
      DEV_SPLASH: "STATE-DEV-SPLASH",   // developer splash screen
      DETAIL: "STATE-DETAIL",           // play mode scoring detail
      LOAD: "STATE-LOADING",            // loading screen
      MENU: "STATE-MENU",               // main menu
      PLAY: "STATE-PLAY",               // play mode
      PLAYERS: "STATE-PLAYERS",         // player select
      RULES: "STATE-RULES",             // display the rules
      SCORES: "STATE-SCORES",           // high scores
      SCORING: "STATE-SCORING",         // rules - display scoring
      SETTINGS: "STATE-SETTINGS",       // game settings
      SUIT_SELECT: "STATE-SUIT-SELECT"  // random suit
    },

    STYLE: {
      TEXT: { font: "30px Courier", fill: "#ffffff" },
      TEXT_LARGE: { font: "40px Courier", fill: "#ffffff" }
    },

    // set at run-time
    WORLD: {
      CENTER_X: 0,
      CENTER_Y: 0
    }
  },

  MAIN = (function() {
    function _createMetaResource(key, location) {
      _R[key] = {
        KEY: key,
        LOCATION: location
      };
    }

    // TODO - ADJUST CANVAS SIZE H/W PIXELS; SEE /phaser-code/piggly.js
    function _init() {
      var
        canvas_height = CONST.SCREEN.HEIGHT,
        canvas_width = CONST.SCREEN.WIDTH;

      // mobile
      if (UTIL.isMobile()) {
        canvas_height = CONST.SCREEN.HEIGHT = document.body.clientHeight;
        canvas_width = CONST.SCREEN.WIDTH = document.body.clientWidth;
        // canvas_height = CONST.SCREEN.HEIGHT = window.innerHeight;
        // canvas_width = CONST.SCREEN.WIDTH = window.innerWidth;
        CONST.CARDS.SCALE = 0.5;
      }

      // desktop
      else {
        var
          scale_factor = screen.availWidth / screen.availHeight;

        // adjust canvas dimensions proportionally to display
        canvas_width = CONST.SCREEN.WIDTH = Math.round(CONST.SCREEN.HEIGHT * scale_factor);
        CONST.SCREEN.MIN_WIDTH = Math.round(CONST.SCREEN.MIN_HEIGHT * scale_factor);
      }

      // for card sprites, start w/ higher resolution sheet and scale down
      CONST.CARDS.SCALE_HEIGHT = Math.round(CONST.CARDS.HEIGHT * CONST.CARDS.SCALE);
      CONST.CARDS.SCALE_WIDTH = Math.round(CONST.CARDS.WIDTH * CONST.CARDS.SCALE);

      CONST.WORLD.CENTER_X = Math.round(canvas_width / 2);
      CONST.WORLD.CENTER_Y = Math.round(canvas_height / 2);

      // preset image keys / locations

      // TODO - THESE WILL BE REMOVED
      _createMetaResource("CLUBS", "images/clubs.png");
      _createMetaResource("DIAMONDS", "images/diamonds.png");
      _createMetaResource("HEARTS", "images/hearts.png");
      _createMetaResource("SPADES", "images/spades.png");
      _createMetaResource("CARDS", "images/cards_05.png");
      _createMetaResource("START_BUTTON", "images/button.png");

      // create Phaser Game instance
      // TODO - CANVAS / WEBGL DECISION - TEST OUT MOBILE / DESKTOP, FPS, AND OVERALL LOOK TO DETERMINE CRITERIA
      _GAME = new Phaser.Game(
        canvas_width,
        canvas_height,

        Phaser.Auto,
        // Phaser.CANVAS, // better android fps
        // Phaser.WEBGL, // set antialias = TRUE if using .WEBGL

        null, // parent DOM element; null = root
        null, // phaser state functions; using states
        true // transparency
        // true  // antialias (WEBGL)
        // false // antialias (CANVAS)
      );

      // add states
      _GAME.state.add(CONST.STATE.BOOT, _STATES.BOOT);
      _GAME.state.add(CONST.STATE.DECK, _STATES.DECK);
      _GAME.state.add(CONST.STATE.DEV_SPLASH, _STATES.DEV_SPLASH);
      _GAME.state.add(CONST.STATE.DETAIL, _STATES.DETAIL);
      _GAME.state.add(CONST.STATE.LOAD, _STATES.LOAD);
      _GAME.state.add(CONST.STATE.MENU, _STATES.MENU);
      _GAME.state.add(CONST.STATE.PLAY, _STATES.PLAY);
      _GAME.state.add(CONST.STATE.PLAYERS, _STATES.PLAYERS);
      _GAME.state.add(CONST.STATE.RULES, _STATES.RULES);
      _GAME.state.add(CONST.STATE.SCORES, _STATES.SCORES);
      _GAME.state.add(CONST.STATE.SCORING, _STATES.SCORING);
      _GAME.state.add(CONST.STATE.SETTINGS, _STATES.SETTINGS);
      _GAME.state.add(CONST.STATE.SUIT_SELECT, _STATES.SUIT_SELECT);

      _GAME.state.start(CONST.STATE.BOOT);
    }

    var
      _GAME,
      _R = CONST.RESOURCE,

      // BOOT > LOAD > DEV_SPLASH > MENU
      // - COMBINE DEV_SPLASH + LOAD INTO ONE
      _STATES = {
        // BOOT-UP INITIALIZATION (STAGE 1)
        BOOT: {
          /* BUILT-IN PHASER FUNCTIONS */
          create: function() {
            // TODO
            // - see scaling TODO above (/phaser-code/piggly.js)
            // - make default as a fixed size and add scale to browser / full screen as options
            // - get this to work for mobile browsers (android chrome, ..)

            // DESKTOP - STRETCH PROPORTIONALLY TO FIT CONTAINER
            if (_GAME.device.desktop) {
              _GAME.scale.setMinMax(CONST.SCREEN.MIN_WIDTH, CONST.SCREEN.MIN_HEIGHT);
              _GAME.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
              // _GAME.scale.setShowAll();
              _GAME.scale.refresh();
            }

            _GAME.state.start(CONST.STATE.LOAD);
          },

          // load assets for the LOAD state
          // - phaser atlas can successfully load SVG SPRITESHEET!!
          preload: function() {
            // TODO - PLACE IN RESOURCES
            _GAME.load.atlas(CONST.ATLAS.LOADING, "drawing/sheet.svg", "drawing/sprites.json", Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
          }
        },

        // SHOW CARD DECK
        DECK: {
          vars: {
            group_deck: null,
            message_suit: null
          },

          /* BUILT-IN PHASER FUNCTIONS */
          create: function() {
            var
              o = this.vars;

            o.group_deck = _GAME.add.group();
            o.message_suit = _GAME.add.text(CONST.WORLD.CENTER_X, CONST.WORLD.CENTER_Y, "SHOW DECK", CONST.STYLE.TEXT, o.group_deck);
            o.message_suit.anchor.set(0.5);
          },

          preload: null,
          render: null,
          update: null

          /* CUSTOM FUNCTIONS */
        },

        // PLAY DETAIL (PLAY SUB-SCREEN)
        DETAIL: {
          vars: {
            group_detail: null,
            message_suit: null
          },

          /* BUILT-IN PHASER FUNCTIONS */
          create: function() {
            var
              o = this.vars;

            o.group_detail = _GAME.add.group();
            o.message_suit = _GAME.add.text(CONST.WORLD.CENTER_X, CONST.WORLD.CENTER_Y, "PLAY DETAIL SCREEN", CONST.STYLE.TEXT, o.group_detail);
            o.message_suit.anchor.set(0.5);
          },

          preload: null,
          render: null,
          update: null

          /* CUSTOM FUNCTIONS */
        },

        // DEVELOPER SPLASH SCREEN (STAGE 3)
        DEV_SPLASH: {
          vars: {
            group_dev: null,
            message_dev: null
          },

          /* BUILT-IN PHASER FUNCTIONS */
          create: function() {
            var
              o = this.vars,
              tween;

            // create loading screen text/graphics, initially invisible
            o.group_dev = _GAME.add.group();
            o.group_dev.alpha = 0;

            o.message_dev = _GAME.add.text(0, 0, "Developer Splash", CONST.STYLE.TEXT, o.group_dev);
            o.message_dev.anchor.set(0.5);
            o.message_dev.x = CONST.WORLD.CENTER_X;
            o.message_dev.y = CONST.WORLD.CENTER_Y;

            // fade in
            tween = _GAME.make.tween(o.group_dev).to({ alpha: 1 }, CONST.FADE_IN_TIME, Phaser.Easing.Linear.None);
            tween.onComplete.addOnce(this.fn.wait, this);
            tween.start();
          },

          preload: null,
          render: null,
          update: null,

          /* CUSTOM FUNCTIONS */
          fn: {
            fadeOut: function() {
              var
                tween = _GAME.make.tween(this.vars.group_dev).to({ alpha: 0 }, CONST.FADE_OUT_TIME, Phaser.Easing.Linear.None);

              tween.onComplete.addOnce(this.fn.nextState, this);
              tween.start();
            },

            nextState: function() {
              _GAME.state.start(CONST.STATE.MENU);
            },

            wait: function() {
              _GAME.time.events.add(2000, this.fn.fadeOut, this);
            }
          }
        },

        // LOAD SCREEN (STAGE 2)
        LOAD: {
          vars: {
            group_loading: null,
            message_loading: null, // TODO - REMOVE / JUST A PLACEHOLDER FOR A LOADING GRAPHIC..
            sprite: null,
            button_start: null
          },

          layout: {
            REFERENCE: {
              w: 1280,
              h: 720
            },
            QUEEN_SPADES_SHADOW: {
              id: "CARD-SHADOW",
              x: 413.631,
              y: 174.274,
              w: 320.8,
              h: 434.39,
              angle: -7.615
            },
            QUEEN_SPADES: {
              id: "QUEEN-SPADES",
              x: 431.631,
              y: 192.274,
              w: 285.76,
              h: 399.352,
              angle: -7.615
            },
            JACK_DIAMONDS_SHADOW: {
              id: "CARD-SHADOW",
              x: 552.555,
              y: 202.628,
              w: 320.8,
              h: 434.39,
              angle: 4.911
            },
            JACK_DIAMONDS: {
              id: "JACK-DIAMONDS",
              x: 570.555,
              y: 220.628,
              w: 285.76,
              h: 399.352,
              angle: 4.911
            },
            LOGO_SHADOW: {
              id: "LOGO-SHADOW",
              x: 232,
              y: 115.524,
              w: 818.465,
              h: 426.476
            },
            LOGO_GOLD: {
              id: "LOGO-GOLD",
              x: 253,
              y: 136.524,
              w: 786.465,
              h: 394.476
            },
            SPADE_GOLD: {
              id: "SPADE-GOLD",
              x: 501.71,
              y: 96.41,
              w: 47.266,
              h: 62.06
            },
            DIAMOND_GOLD: {
              id: "DIAMOND-GOLD",
              x: 572.27,
              y: 96.99,
              w: 44.66,
              h: 60.9
            },
            CLUB_GOLD: {
              id: "CLUB-GOLD",
              x: 640.023,
              y: 97.57,
              w: 60.534,
              h: 60.03
            },
            HEART_GOLD: {
              id: "HEART-GOLD",
              x: 723.876,
              y: 96.7,
              w: 54.271,
              h: 61.493
            },
          },

          /* BUILT-IN PHASER FUNCTIONS */
          create: function() {
            var
              O = this.vars,
              L = this.layout;

            // create loading screen text/graphics, initially invisible
            O.group_loading = _GAME.add.group();
            O.group_loading.alpha = 0;

            // TODO - remove when no longer needed
            O.message_loading = _GAME.add.text(CONST.WORLD.CENTER_X, CONST.SCREEN.HEIGHT * 0.93, "loading...", CONST.STYLE.TEXT, O.group_loading);
            O.message_loading.anchor.set(0.5);

            // place SVG sprite assets (iterate through layout list)
            for (var key in L) {
              if (L.hasOwnProperty(key) && key !== "REFERENCE")
                this.fn.setPosition(L[key], O.sprite, L.REFERENCE, O.group_loading);
            }

            // load assets
            _GAME.load.onLoadStart.add(this.fn.loadStart, this);
            _GAME.load.onFileComplete.add(this.fn.fileComplete, this);
            _GAME.load.onLoadComplete.add(this.fn.loadComplete, this);

            // TODO - REMOVE; load assets for testing % loaded
            _GAME.load.spritesheet(_R.CARDS.KEY, _R.CARDS.LOCATION, CONST.CARDS.WIDTH, CONST.CARDS.HEIGHT);
            _GAME.load.image(_R.SPADES.KEY, _R.SPADES.LOCATION);
            _GAME.load.image(_R.HEARTS.KEY, _R.HEARTS.LOCATION);
            _GAME.load.image(_R.DIAMONDS.KEY, _R.DIAMONDS.LOCATION);
            _GAME.load.image(_R.CLUBS.KEY, _R.CLUBS.LOCATION);
            _GAME.load.image(_R.START_BUTTON.KEY, _R.START_BUTTON.LOCATION);
            _GAME.load.start();

            // this delay helps prevent visible canvas distortion
            _GAME.time.events.add(250, this.fn.fadeIn, this);
          },

          // NOTE: pre-load images should NOT be here with asset loading %
          // - pre-loading images necessary for this screen should be done a state prior to this
          // - loading images / sprites here will result in loading events not triggering correctly
          preload: null,
          render: null,
          update: null,

          /* CUSTOM FUNCTIONS */
          fn: {
            buttonClick: function() {
              this.fn.fadeOut.call(this);
            },

            fadeIn: function() {
              var
                tween = _GAME.make.tween(this.vars.group_loading).to({ alpha: 1 }, CONST.FADE_IN_TIME, Phaser.Easing.Linear.None);

              _GAME.canvas.style.opacity = "1";
              tween.start();
            },

            fadeOut: function() {
              var
                tween = _GAME.make.tween(this.vars.group_loading).to({ alpha: 0 }, CONST.FADE_OUT_TIME, Phaser.Easing.Linear.None);

              tween.onComplete.addOnce(this.fn.nextState, this);
              tween.start();
            },

            fileComplete: function(progress, cacheKey, success, totalLoaded, totalFiles) {
              this.vars.message_loading.setText("load status: " + totalLoaded + " of " + totalFiles + " | " + progress + "%");
            },

            loadComplete: function() {
              _GAME.time.events.add(1000, this.fn.wait, this);
            },

            loadStart: function() {
              YAHTZLE.initialize();
              this.vars.message_loading.setText("load status: INITIALIZING..");
            },

            nextState: function() {
              // _GAME.state.start(CONST.STATE.DEV_SPLASH);
              _GAME.state.start(CONST.STATE.MENU);
            },

            // TODO - move this function to a more central location
            // set element layout
            setPosition: function(layout_object, sprite, REF, group) {
              // .sprite(x, y, key, frame, group)
              sprite = _GAME.add.image(CONST.SCREEN.WIDTH * layout_object.x / REF.w, 0, CONST.ATLAS.LOADING, layout_object.id, group);
              sprite.width = CONST.SCREEN.WIDTH * layout_object.w / REF.w;
              sprite.height = CONST.SCREEN.HEIGHT * layout_object.h / REF.h;
              sprite.y = CONST.SCREEN.HEIGHT * (REF.h - layout_object.y) / REF.h - sprite.height;

              if (layout_object.hasOwnProperty("angle"))
                sprite.angle = layout_object.angle;
            },

            wait: function() {
              var
                O = this.vars;

              O.message_loading.setText("load status: LOAD COMPLETE");

              // add.button(x, y, key, callback, callbackContext, overFrame, outFrame, downFrame, upFrame, group)
              O.button_start = _GAME.add.button(CONST.WORLD.CENTER_X, O.message_loading.y, _R.START_BUTTON.KEY, this.fn.buttonClick, this, null, null, null, null, O.group_loading);
              O.button_start.alpha = 0;
              O.button_start.anchor.set(0.5);

              // .to(properties, duration, ease, autoStart, delay, repeat, yoyo)
              _GAME.make.tween(O.message_loading).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true, 500);
              _GAME.make.tween(O.button_start).to({ alpha: 1 }, 500, Phaser.Easing.Linear.None, true, 1000);
            }
          }
        },

        // MAIN MENU (STAGE 4)
        // TODO
        // - replace menu screen with actual graphics
        MENU: {
          vars: {
            group_menu: null,
            message_menu: null,
            message_new_game: null,
            message_player_setup: null,
            message_settings: null,
            message_high_scores: null,
            message_rules: null,
            message_scoring: null,
            message_show_deck: null
          },

          /* BUILT-IN PHASER FUNCTIONS */
          create: function() {
            var
              o = this.vars,
              message_height = 0,
              message_x = 0,
              num_lines = 8,
              tween;

            // clean up - remove completed states
            _GAME.state.remove(CONST.STATE.BOOT);
            _GAME.state.remove(CONST.STATE.LOAD);
            _GAME.state.remove(CONST.STATE.DEV_SPLASH);

            // TODO / NOTE:
            // - wrong method to remove atlas seems to work here when debugging in chrome dev tools..
            // _GAME.cache.removeTextureAtlas(CONST.ATLAS.LOADING); // CAUSES AN ERROR - PHASER 2.6.2
            _GAME.cache.removeImage(CONST.ATLAS.LOADING, true);

            // add menu screen text/graphics, initially invisible
            o.group_menu = _GAME.add.group();
            o.group_menu.alpha = 0;

            // create clickable text, created in code in the order of appearance
            o.message_menu = _GAME.add.text(CONST.WORLD.CENTER_X, 0, "MENU SCREEN", CONST.STYLE.TEXT, o.group_menu);
            o.message_menu.anchor.set(0.5, 0);
            o.message_menu.y = (_GAME.world.height - num_lines * o.message_menu.height) / 2;

            message_height = o.message_menu.height;
            message_x = CONST.WORLD.CENTER_X - o.message_menu.width / 2;

            o.message_new_game = _GAME.add.text(message_x, o.message_menu.y + message_height, "New Game", CONST.STYLE.TEXT, o.group_menu);
            o.message_player_setup = _GAME.add.text(message_x, o.message_new_game.y + message_height, "Player Setup", CONST.STYLE.TEXT, o.group_menu);
            o.message_settings = _GAME.add.text(message_x, o.message_player_setup.y + message_height, "Game Settings", CONST.STYLE.TEXT, o.group_menu);
            o.message_high_scores = _GAME.add.text(message_x, o.message_settings.y + message_height, "High Scores", CONST.STYLE.TEXT, o.group_menu);
            o.message_rules = _GAME.add.text(message_x, o.message_high_scores.y + message_height, "Rules", CONST.STYLE.TEXT, o.group_menu);
            o.message_scoring = _GAME.add.text(message_x, o.message_rules.y + message_height, "Scoring", CONST.STYLE.TEXT, o.group_menu);
            o.message_show_deck = _GAME.add.text(message_x, o.message_scoring.y + message_height, "Show Deck", CONST.STYLE.TEXT, o.group_menu);

            // add click events
            o.message_new_game.inputEnabled = o.message_player_setup.inputEnabled = o.message_settings.inputEnabled = o.message_high_scores.inputEnabled = o.message_rules.inputEnabled = o.message_scoring.inputEnabled = o.message_show_deck.inputEnabled = true;

            o.message_high_scores.events.onInputDown.add(this.fn.highScores);
            o.message_new_game.events.onInputDown.add(this.fn.newGame);
            o.message_player_setup.events.onInputDown.add(this.fn.playerSetup);
            o.message_rules.events.onInputDown.add(this.fn.rules);
            o.message_scoring.events.onInputDown.add(this.fn.scoring);
            o.message_settings.events.onInputDown.add(this.fn.settings);
            o.message_show_deck.events.onInputDown.add(this.fn.showDeck);

            // fade in the graphics
            tween = _GAME.make.tween(o.group_menu).to({ alpha: 1 }, CONST.FADE_IN_TIME, Phaser.Easing.Linear.None);
            tween.start();
          },

          preload: null,
          render: null,
          update: null,

          /* CUSTOM FUNCTIONS */
          fn: {
            highScores: function() {
              _GAME.state.start(CONST.STATE.SCORES);
            },

            newGame: function() {
              _GAME.state.start(CONST.STATE.SUIT_SELECT);
            },

            playerSetup: function() {
              _GAME.state.start(CONST.STATE.PLAYERS);
            },

            rules: function() {
              _GAME.state.start(CONST.STATE.RULES);
            },

            scoring: function() {
              _GAME.state.start(CONST.STATE.SCORING);
            },

            settings: function() {
              _GAME.state.start(CONST.STATE.SETTINGS);
            },

            showDeck: function() {
              _GAME.state.start(CONST.STATE.DECK);
            }
          }
        },

        // PLAY (ACTUAL GAME)
        PLAY: {
          vars: {
            group_play: null,
            message_title: null,
            message_play_detail: null
          },

          /* BUILT-IN PHASER FUNCTIONS */
          create: function() {
            var
              o = this.vars,
              num_lines = 2,
              message_height = 0,
              message_x = 0;

            o.group_play = _GAME.add.group();
            o.message_title = _GAME.add.text(CONST.WORLD.CENTER_X, 0, "PLAY SCREEN", CONST.STYLE.TEXT, o.group_play);
            o.message_title.anchor.set(0.5, 0);
            o.message_title.y = (_GAME.world.height - num_lines * o.message_title.height) / 2;

            message_height = o.message_title.height;
            message_x = CONST.WORLD.CENTER_X - o.message_title.width / 2;

            o.message_play_detail = _GAME.add.text(message_x, o.message_title.y + message_height, "Play Detail", CONST.STYLE.TEXT, o.group_play);

            // add click events
            o.message_play_detail.inputEnabled = true;

            o.message_play_detail.events.onInputDown.add(this.fn.playDetail);
          },

          preload: null,
          render: null,
          update: null,

          /* CUSTOM FUNCTIONS */
          fn: {
            playDetail: function() {
              _GAME.state.start(CONST.STATE.DETAIL);
            }
          }
        },

        // PLAYER SETUP
        PLAYERS: {
          vars: {
            group_players: null,
            message_suit: null
          },

          /* BUILT-IN PHASER FUNCTIONS */
          create: function() {
            var
              o = this.vars;

            o.group_players = _GAME.add.group();
            o.message_suit = _GAME.add.text(CONST.WORLD.CENTER_X, CONST.WORLD.CENTER_Y, "PLAYER SETUP", CONST.STYLE.TEXT, o.group_players);
            o.message_suit.anchor.set(0.5);
          },

          preload: null,
          render: null,
          update: null

          /* CUSTOM FUNCTIONS */
        },

        // RULES / HOW TO PLAY
        RULES: {
          vars: {
            group_rules: null,
            message_suit: null
          },

          /* BUILT-IN PHASER FUNCTIONS */
          create: function() {
            var
              o = this.vars;

            o.group_rules = _GAME.add.group();
            o.message_suit = _GAME.add.text(CONST.WORLD.CENTER_X, CONST.WORLD.CENTER_Y, "RULES", CONST.STYLE.TEXT, o.group_rules);
            o.message_suit.anchor.set(0.5);
          },

          preload: null,
          render: null,
          update: null

          /* CUSTOM FUNCTIONS */
        },

        // HIGH SCORES
        SCORES: {
          vars: {
            group_scores: null,
            message_suit: null
          },

          /* BUILT-IN PHASER FUNCTIONS */
          create: function() {
            var
              o = this.vars;

            o.group_scores = _GAME.add.group();
            o.message_suit = _GAME.add.text(CONST.WORLD.CENTER_X, CONST.WORLD.CENTER_Y, "HIGH SCORES", CONST.STYLE.TEXT, o.group_scores);
            o.message_suit.anchor.set(0.5);
          },

          preload: null,
          render: null,
          update: null

          /* CUSTOM FUNCTIONS */
        },

        // RULES / SCORING
        SCORING: {
          vars: {
            group_scoring: null,
            message_suit: null
          },

          /* BUILT-IN PHASER FUNCTIONS */
          create: function() {
            var
              o = this.vars;

            o.group_scoring = _GAME.add.group();
            o.message_suit = _GAME.add.text(CONST.WORLD.CENTER_X, CONST.WORLD.CENTER_Y, "SCORING", CONST.STYLE.TEXT, o.group_scoring);
            o.message_suit.anchor.set(0.5);
          },

          preload: null,
          render: null,
          update: null

          /* CUSTOM FUNCTIONS */
        },

        // GAME SETTINGS
        SETTINGS: {
          vars: {
            group_settings: null,
            message_suit: null
          },

          /* BUILT-IN PHASER FUNCTIONS */
          create: function() {
            var
              o = this.vars;

            o.group_settings = _GAME.add.group();
            o.message_suit = _GAME.add.text(CONST.WORLD.CENTER_X, CONST.WORLD.CENTER_Y, "SETTINGS", CONST.STYLE.TEXT, o.group_settings);
            o.message_suit.anchor.set(0.5);
          },

          preload: null,
          render: null,
          update: null

          /* CUSTOM FUNCTIONS */
        },

        // TODO
        // - change this to developer mode only
        // - create a new state for random suit selection
        // SUIT SELECTION (PRE-PLAY STEP)
        SUIT_SELECT: {
          vars: {
            group_suit_select: null,
            group_suits: null, // child group containing just suits
            message_title: null,
            message_play: null,
            image_spade: null,
            image_heart: null,
            image_diamond: null,
            image_club: null
          },

          /* BUILT-IN PHASER FUNCTIONS */
          create: function() {
            var
              O = this.vars,
              message_height = 0,
              suit_dx = 120,
              suit_scale = 0.4,
              SUITS = YAHTZLE.CARD.SUITS;

            // create groups
            O.group_suit_select = _GAME.add.group();
            O.group_suits = _GAME.add.group();
            O.group_suit_select.add(O.group_suits);

            // title
            O.message_title = _GAME.add.text(CONST.WORLD.CENTER_X, 0, "SELECT A SUIT", CONST.STYLE.TEXT, O.group_suit_select);
            O.message_title.anchor.set(0.5, 0);
            message_height = O.message_title.height;

            // suit images
            O.image_spade = _GAME.add.image(0, 0, _R.SPADES.KEY, null, O.group_suits);
            O.image_spade.scale.setTo(suit_scale);
            O.image_spade.anchor.set(0.5);
            O.image_diamond = _GAME.add.image(O.image_spade.x + suit_dx, 0, _R.DIAMONDS.KEY, null, O.group_suits);
            O.image_diamond.scale.setTo(suit_scale);
            O.image_diamond.anchor.set(0.5);
            O.image_club = _GAME.add.image(O.image_diamond.x + suit_dx, 0, _R.CLUBS.KEY, null, O.group_suits);
            O.image_club.scale.setTo(suit_scale);
            O.image_club.anchor.set(0.5);
            O.image_heart = _GAME.add.image(O.image_club.x + suit_dx, 0, _R.HEARTS.KEY, null, O.group_suits);
            O.image_heart.scale.setTo(suit_scale);
            O.image_heart.anchor.set(0.5);

            O.message_title.y = CONST.WORLD.CENTER_Y - (message_height * 5 + O.group_suits.height) / 2;
            O.group_suits.y = O.message_title.y + 2 * message_height + O.image_spade.height / 2;
            O.group_suits.x = CONST.WORLD.CENTER_X - O.group_suits.width / 2 + O.image_spade.width / 2;

            // suit select event handlers
            O.image_spade.inputEnabled = O.image_diamond.inputEnabled = O.image_club.inputEnabled = O.image_heart.inputEnabled = true;
            O.image_spade.events.onInputDown.add(this.fn.selectSuit, this, null, SUITS.SPADES);
            O.image_diamond.events.onInputDown.add(this.fn.selectSuit, this, null, SUITS.DIAMONDS);
            O.image_club.events.onInputDown.add(this.fn.selectSuit, this, null, SUITS.CLUBS);
            O.image_heart.events.onInputDown.add(this.fn.selectSuit, this, null, SUITS.HEARTS);

            O.message_play = _GAME.add.text(CONST.WORLD.CENTER_X, O.message_title.y + O.group_suits.height + 3.5 * message_height, "PLAY", CONST.STYLE.TEXT_LARGE, O.group_suit_select);
            O.message_play.anchor.set(0.5, 0);
            O.message_play.alpha = 0;
          },

          preload: null,
          render: null,
          update: null,

          /* CUSTOM FUNCTIONS */
          fn: {
            nextState: function() {
              _GAME.state.start(CONST.STATE.PLAY);
            },

            playClick: function() {
              this.vars.message_play.inputEnabled = true;
              this.vars.message_play.events.onInputDown.add(this.fn.nextState);
            },

            playShow: function() {
              var
                tween = _GAME.make.tween(this.vars.message_play).to({ alpha: 1 }, 1000, Phaser.Easing.Linear.None, false);

              tween.onComplete.addOnce(this.fn.playClick, this);
              tween.start();
            },

            selectSuit(obj, pointer, suit) {
              var
                O = this.vars,
                SUITS = YAHTZLE.CARD.SUITS,
                tween_time = 750,
                tween_delay = CONST.FADE_OUT_TIME / 2,
                tween,
                image;

              if (suit && (suit === SUITS.SPADES || suit === SUITS.DIAMONDS || suit === SUITS.CLUBS || suit === SUITS.HEARTS)) {
                O.image_spade.inputEnabled = O.image_diamond.inputEnabled = O.image_club.inputEnabled = O.image_heart.inputEnabled = false;

                if (suit !== SUITS.SPADES)
                  _GAME.make.tween(O.image_spade).to({ alpha: 0 }, CONST.FADE_OUT_TIME, Phaser.Easing.Linear.None, true);
                else
                  image = O.image_spade;

                if (suit !== SUITS.DIAMONDS)
                  _GAME.make.tween(O.image_diamond).to({ alpha: 0 }, CONST.FADE_OUT_TIME, Phaser.Easing.Linear.None, true);
                else
                  image = O.image_diamond;

                if (suit !== SUITS.CLUBS)
                  _GAME.make.tween(O.image_club).to({ alpha: 0 }, CONST.FADE_OUT_TIME, Phaser.Easing.Linear.None, true);
                else
                  image = O.image_club;

                if (suit !== SUITS.HEARTS)
                  _GAME.make.tween(O.image_heart).to({ alpha: 0 }, CONST.FADE_OUT_TIME, Phaser.Easing.Linear.None, true);
                else
                  image = O.image_heart;

                _GAME.make.tween(O.message_title).to({ alpha: 0 }, CONST.FADE_OUT_TIME, Phaser.Easing.Linear.None, true);
                _GAME.make.tween(image.scale).to({ x: 0.6, y: 0.6 }, tween_time, Phaser.Easing.Linear.None, true, tween_delay);
                tween = _GAME.make.tween(image).to({ x: CONST.WORLD.CENTER_X - O.group_suits.x }, tween_time, Phaser.Easing.Quintic.Out, false, tween_delay);
                tween.onComplete.addOnce(this.fn.playShow, this);
                tween.start();

                YAHTZLE.GAME.setSuit(suit);
                YAHTZLE.GAME.initialize();
              }
            }
          }
        }
      };

    return {
      init: _init
    };
  })();


window.addEventListener("load", function() {
  MAIN.init();
});