/* global Phaser */
// original Phaser "STATES" tutorial: http://perplexingtech.weebly.com/game-dev-blog/using-states-in-phaserjs-javascript-game-developement
var
  /* constants */
  CONST = {
    IMAGE_PLAYER: "player",
    IMAGE_WIN: "win",

    SPRITE_PLAYER: "player",
    SPRITE_WIN: "win",

    STATE_BOOT: "boot",
    STATE_LOAD: "load",
    STATE_MENU: "menu",
    STATE_PLAY: "play",
    STATE_WIN: "win",
  },

  GAME = new Phaser.Game(640, 480, Phaser.AUTO, "div-game"),

  STATES = {
    boot: {
      create: function() {
        GAME.physics.startSystem(Phaser.Physics.ARCADE);
        GAME.state.start(CONST.STATE_LOAD);
      }
    },

    // splash / loading screen
    load: {
      create: function() {
        GAME.state.start(CONST.STATE_MENU);
      },

      preload: function() {
        GAME.add.text(80, 150, "loading...", { font: "30px Courier", fill: "#ffffff" });
        GAME.load.image(CONST.IMAGE_PLAYER, "assets/player.png");
        GAME.load.image(CONST.IMAGE_WIN, "assets/win.png");
      }
    },

    // menu options: difficulty, settings, level select, etc.
    menu: {
      create: function() {
        var
          name_label = GAME.add.text(80, 80, "My First Game", { font: "50px Arial", fill: "#ffffff" }),
          start_label = GAME.add.text(80, GAME.world.height - 80, "press the \"W\" key to start", { font: "25px Arial", fill: "#ffffff" }),
          wkey = GAME.input.keyboard.addKey(Phaser.Keyboard.W);

        wkey.onDown.addOnce(this.start, this);
      },

      start: function() {
        GAME.state.start(CONST.STATE_PLAY);
      }
    },

    play: {
      create: function() {
        this.keyboard = GAME.input.keyboard;

        // player sprite
        this.player = GAME.add.sprite(16, 16, CONST.SPRITE_PLAYER);
        GAME.physics.enable(this.player, Phaser.Physics.ARCADE);

        // win sprite
        this.win = GAME.add.sprite(256, 256, CONST.SPRITE_WIN);
        GAME.physics.enable(this.win, Phaser.Physics.ARCADE);
      },

      update: function() {
        // http://phaser.io/docs/2.4.6/Phaser.Physics.Arcade.html#overlap
        GAME.physics.arcade.overlap(this.player, this.win, this.fn_win, null, this);

        // control player movement via keyboard
        // - WASD
        if (this.keyboard.isDown(Phaser.Keyboard.A))
          this.player.body.velocity.x = -175;
        else if (this.keyboard.isDown(Phaser.Keyboard.D))
          this.player.body.velocity.x = 175;
        else
          this.player.body.velocity.x = 0;

        if (this.keyboard.isDown(Phaser.Keyboard.W))
          this.player.body.velocity.y = -175;
        else if (this.keyboard.isDown(Phaser.Keyboard.S))
          this.player.body.velocity.y = 175;
        else
          this.player.body.velocity.y = 0;
      },

      fn_win: function() {
        GAME.state.start(CONST.STATE_WIN);
      }
    },

    // NOTE: variation using IIFE
    win: (function() {
      var
        _fn_create = function() {
          GAME.add.text(80, 80, "YOU WON!", { font: "50px Arial", fill: "#31B922" });
          GAME.add.text(80, GAME.world.height - 80, "press the \"W\" key to restart", { font: "25px Arial", fill: "#ffffff" });
          GAME.input.keyboard.addKey(Phaser.Keyboard.W).onDown.addOnce(_fn_restart, this);
        },

        _fn_restart = function() {
          GAME.state.start(CONST.STATE_PLAY);
        };

      return {
        create: _fn_create
      }
    })()
  };

// define each state
GAME.state.add(CONST.STATE_BOOT, STATES.boot);
GAME.state.add(CONST.STATE_LOAD, STATES.load);
GAME.state.add(CONST.STATE_MENU, STATES.menu);
GAME.state.add(CONST.STATE_PLAY, STATES.play);
GAME.state.add(CONST.STATE_WIN, STATES.win);

GAME.state.start(CONST.STATE_BOOT);