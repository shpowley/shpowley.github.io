/* global Phaser PIXI */
var
  RESOURCE = {
    background: {
      id: "background",
      location: "assets/back.png"
    },

    foreground: {
      id: "foreground",
      location: "assets/fore.png"
    },

    player: {
      id: "player",
      location: "assets/ship.png"
    },

    shmupfont: {
      id: "shmupfont",
      location: "assets/shmupfont.png",
      xml: "assets/shmupfont.xml"
    }
  },

  SETTINGS = {
    DEBUG: false,

    DYNAMIC_ASPECT_RATIO: true,
    STRETCH_TO_WINDOW: true,

    SCREEN: {
      WIDTH: 640,
      HEIGHT: 400,
      MIN_WIDTH: 160,
      MIN_HEIGHT: 100
    }
  },

  /* BULLET OBJECT PATTERN */
  BULLET = (function() {
    var BULLET = function(game, key) {
      Phaser.Sprite.call(this, game, 0, 0, key);  // CALL THE BASE CONSTRUCTOR

      this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;  // BULLETS SCALED WON'T BE SMOOTHED (PIXI)

      this.anchor.set(0.5);

      // CHECK IF THE BULLET IS WITHIN THE WORLD BOUNDS AND IF NOT KILL IT
      this.checkWorldBounds = true;
      this.outOfBoundsKill = true;

      this.exists = false; // CONTROLS PHYSICS BODY PROCESSING AND GAME VISIBILITY

      /* NEW PROPERTIES (NOT INHERITED FROM SPRITE) */
      this.tracking = false;  // ROTATE TO FACE THE DIRECTION IT IS MOVING IN?
      this.scale_speed = 0;  // HOW FAST THE BULLET SHOULD GROW IN SIZE AS IT TRAVELS
    };

    BULLET.prototype = Object.create(Phaser.Sprite.prototype);
    BULLET.prototype.constructor = BULLET;

    BULLET.prototype.fire = function(x, y, angle, speed, gx, gy) {
      gx = gx || 0;
      gy = gy || 0;

      this.reset(x, y);
      this.scale.set(1);
      this.game.physics.arcade.velocityFromAngle(angle, speed, this.body.velocity);  // SETS BULLETS INITIAL VELOCITY (3RD PARAMETER)
      this.angle = angle;
      this.body.gravity.set(gx, gy);
    };

    BULLET.prototype.update = function() {
      if (this.tracking)
        this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);

      if (this.scale_speed > 0) {
        this.scale.x += this.scale_speed;
        this.scale.y += this.scale_speed;
      }
    };

    return BULLET;
  })(),

  /** NOTES:
   *  - NAMING USED INTERNALLY WITHIN EACH BULLET TYPE DETERMINES THE NAME OF OBJECTS CREATED
   *  - EACH WEAPON TYPE IS ESSENTIALLY A PHASER GROUP CONTAINING MANY BULLETS */
  WEAPON = (function() {
    var
      /* A SINGLE BULLET IS FIRED IN FRONT OF THE SHIP */
      _SINGLE = (function() {
        var SINGLE_BULLET = function(game) {
          // new Group(game, parent, name, addToStage, enableBody, physicsBodyType)
          Phaser.Group.call(this, game, game.world, "Single Bullet", false, true, Phaser.Physics.ARCADE);

          /* NEW PROPERTIES (NOT INHERITED FROM GROUP) */
          this.next_fire = 0;
          this.bullet_speed = 600;
          this.fire_rate = 100;

          for (var i = 0; i < 64; i++) {
            this.add(new BULLET(game, "bullet5"), true);
          }

          return this;
        };

        SINGLE_BULLET.prototype = Object.create(Phaser.Group.prototype);
        SINGLE_BULLET.prototype.constructor = SINGLE_BULLET;

        SINGLE_BULLET.prototype.fire = function(source) {
          if (this.game.time.time < this.next_fire)
            return;

          this.getFirstExists(false).fire(source.x + 10, source.y + 10, 0, this.bullet_speed, 0, 0);  // GROUP > GET FIRST NON-EXISTING CHILD
          this.next_fire = this.game.time.time + this.fire_rate;
        };

        return SINGLE_BULLET;
      })(),

      /* A BULLET IS SHOT BOTH IN FRONT AND BEHIND THE SHIP */
      _FRONT_AND_BACK = (function() {
        var FRONT_AND_BACK = function(game) {
          // new Group(game, parent, name, addToStage, enableBody, physicsBodyType)
          Phaser.Group.call(this, game, game.world, "Front and Back", false, true, Phaser.Physics.ARCADE);

          /* NEW PROPERTIES (NOT INHERITED FROM GROUP) */
          this.next_fire = 0;
          this.bullet_speed = 600;
          this.fire_rate = 100;

          for (var i = 0; i < 64; i++) {
            this.add(new BULLET(game, "bullet5"), true);
          }

          return this;
        };

        FRONT_AND_BACK.prototype = Object.create(Phaser.Group.prototype);
        FRONT_AND_BACK.prototype.constructor = FRONT_AND_BACK;

        FRONT_AND_BACK.prototype.fire = function(source) {
          if (this.game.time.time < this.next_fire)
            return;

          var
            x = source.x + 10,
            y = source.y + 10;

          // BULLET.fire(x, y, angle, speed, gx, gy)
          this.getFirstExists(false).fire(x, y, 0, this.bullet_speed, 0, 0);
          this.getFirstExists(false).fire(x, y, 180, this.bullet_speed, 0, 0);

          this.next_fire = this.game.time.time + this.fire_rate;
        };

        return FRONT_AND_BACK;
      })(),

      /* 3-WAY FIRE (DIRECTLY ABOVE, BELOW AND IN FRONT) */
      _THREE = (function() {
        var THREE_WAY = function(game) {
          // new Group(game, parent, name, addToStage, enableBody, physicsBodyType)
          Phaser.Group.call(this, game, game.world, "Three Way", false, true, Phaser.Physics.ARCADE);

          /* NEW PROPERTIES (NOT INHERITED FROM GROUP) */
          this.next_fire = 0;
          this.bullet_speed = 600;
          this.fire_rate = 100;

          for (var i = 0; i < 96; i++) {
            this.add(new BULLET(game, "bullet7"), true);
          }

          return this;
        };

        THREE_WAY.prototype = Object.create(Phaser.Group.prototype);
        THREE_WAY.prototype.constructor = THREE_WAY;

        THREE_WAY.prototype.fire = function(source) {
          if (this.game.time.time < this.next_fire)
            return;

          var
            x = source.x + 10,
            y = source.y + 10;

          // BULLET.fire(x, y, angle, speed, gx, gy)
          this.getFirstExists(false).fire(x, y, 270, this.bullet_speed, 0, 0);
          this.getFirstExists(false).fire(x, y, 0, this.bullet_speed, 0, 0);
          this.getFirstExists(false).fire(x, y, 90, this.bullet_speed, 0, 0);

          this.next_fire = this.game.time.time + this.fire_rate;
        };

        return THREE_WAY;
      })(),

      /* 8-WAY FIRE, FROM ALL SIDES OF THE SHIP */
      _EIGHT = (function() {
        var EIGHT_WAY = function(game) {
          // new Group(game, parent, name, addToStage, enableBody, physicsBodyType)
          Phaser.Group.call(this, game, game.world, "Eight Way", false, true, Phaser.Physics.ARCADE);

          /* NEW PROPERTIES (NOT INHERITED FROM GROUP) */
          this.next_fire = 0;
          this.bullet_speed = 600;
          this.fire_rate = 100;

          for (var i = 0; i < 96; i++) {
            this.add(new BULLET(game, "bullet5"), true);
          }

          return this;
        };

        EIGHT_WAY.prototype = Object.create(Phaser.Group.prototype);
        EIGHT_WAY.prototype.constructor = EIGHT_WAY;

        EIGHT_WAY.prototype.fire = function(source) {
          if (this.game.time.time < this.next_fire)
            return;

          var
            x = source.x + 16,
            y = source.y + 10;

          // BULLET.fire(x, y, angle, speed, gx, gy)
          this.getFirstExists(false).fire(x, y, 0, this.bullet_speed, 0, 0);
          this.getFirstExists(false).fire(x, y, 45, this.bullet_speed, 0, 0);
          this.getFirstExists(false).fire(x, y, 90, this.bullet_speed, 0, 0);
          this.getFirstExists(false).fire(x, y, 135, this.bullet_speed, 0, 0);
          this.getFirstExists(false).fire(x, y, 180, this.bullet_speed, 0, 0);
          this.getFirstExists(false).fire(x, y, 225, this.bullet_speed, 0, 0);
          this.getFirstExists(false).fire(x, y, 270, this.bullet_speed, 0, 0);
          this.getFirstExists(false).fire(x, y, 315, this.bullet_speed, 0, 0);

          this.next_fire = this.game.time.time + this.fire_rate;
        };

        return EIGHT_WAY;
      })(),

      /* BULLETS ARE FIRED OUT SCATTERED ON THE Y AXIS */
      _SCATTER = (function() {
        var SCATTER_SHOT = function(game) {
          // new Group(game, parent, name, addToStage, enableBody, physicsBodyType)
          Phaser.Group.call(this, game, game.world, "Scatter Shot", false, true, Phaser.Physics.ARCADE);

          /* NEW PROPERTIES (NOT INHERITED FROM GROUP) */
          this.next_fire = 0;
          this.bullet_speed = 600;
          this.fire_rate = 40;

          for (var i = 0; i < 32; i++) {
            this.add(new BULLET(game, "bullet5"), true);
          }

          return this;
        };

        SCATTER_SHOT.prototype = Object.create(Phaser.Group.prototype);
        SCATTER_SHOT.prototype.constructor = SCATTER_SHOT;

        SCATTER_SHOT.prototype.fire = function(source) {
          if (this.game.time.time < this.next_fire)
            return;

          var
            x = source.x + 16,
            y = (source.y + source.height / 2) + this.game.rnd.between(-10, 10);

          // BULLET.fire(x, y, angle, speed, gx, gy)
          this.getFirstExists(false).fire(x, y, 0, this.bullet_speed, 0, 0);

          this.next_fire = this.game.time.time + this.fire_rate;
        };

        return SCATTER_SHOT;
      })(),

      /* FIRES A STREAMING BEAM OF LAZERS, VERY FAST, IN FRONT OF THE PLAYER */
      _BEAM = (function() {
        var BEAM = function(game) {
          // new Group(game, parent, name, addToStage, enableBody, physicsBodyType)
          Phaser.Group.call(this, game, game.world, "Beam", false, true, Phaser.Physics.ARCADE);

          /* NEW PROPERTIES (NOT INHERITED FROM GROUP) */
          this.next_fire = 0;
          this.bullet_speed = 600;
          this.fire_rate = 45;

          for (var i = 0; i < 64; i++) {
            this.add(new BULLET(game, "bullet11"), true);
          }

          return this;
        };

        BEAM.prototype = Object.create(Phaser.Group.prototype);
        BEAM.prototype.constructor = BEAM;

        BEAM.prototype.fire = function(source) {
          if (this.game.time.time < this.next_fire)
            return;

          var
            x = source.x + 40,
            y = source.y + 10;

          // BULLET.fire(x, y, angle, speed, gx, gy)
          this.getFirstExists(false).fire(x, y, 0, this.bullet_speed, 0, 0);

          this.next_fire = this.game.time.time + this.fire_rate;
        };

        return BEAM;
      })(),

      /* A THREE-WAY FIRE WHERE THE TOP AND BOTTOM BULLETS BEND ON A PATH */
      _SPLIT = (function() {
        var SPLIT_SHOT = function(game) {
          // new Group(game, parent, name, addToStage, enableBody, physicsBodyType)
          Phaser.Group.call(this, game, game.world, "Split Shot", false, true, Phaser.Physics.ARCADE);

          /* NEW PROPERTIES (NOT INHERITED FROM GROUP) */
          this.next_fire = 0;
          this.bullet_speed = 700;
          this.fire_rate = 40;

          for (var i = 0; i < 64; i++) {
            this.add(new BULLET(game, "bullet8"), true);
          }

          return this;
        };

        SPLIT_SHOT.prototype = Object.create(Phaser.Group.prototype);
        SPLIT_SHOT.prototype.constructor = SPLIT_SHOT;

        SPLIT_SHOT.prototype.fire = function(source) {
          if (this.game.time.time < this.next_fire)
            return;

          var
            x = source.x + 20,
            y = source.y + 10;

          // BULLET.fire(x, y, angle, speed, gx, gy)
          this.getFirstExists(false).fire(x, y, 0, this.bullet_speed, 0, -500);
          this.getFirstExists(false).fire(x, y, 0, this.bullet_speed, 0, 0);
          this.getFirstExists(false).fire(x, y, 0, this.bullet_speed, 0, 500);

          this.next_fire = this.game.time.time + this.fire_rate;
        };

        return SPLIT_SHOT;
      })(),

      /* BULLETS HAVE GRAVITY.Y SET ON A REPEATING PRE-CALCULATED PATTERN */
      _PATTERN = (function() {
        var PATTERN = function(game) {
          // new Group(game, parent, name, addToStage, enableBody, physicsBodyType)
          Phaser.Group.call(this, game, game.world, "Pattern", false, true, Phaser.Physics.ARCADE);

          /* NEW PROPERTIES (NOT INHERITED FROM GROUP) */
          this.next_fire = 0;
          this.bullet_speed = 600;
          this.fire_rate = 40;

          this.pattern = Phaser.ArrayUtils.numberArrayStep(-800, 800, 200).concat(Phaser.ArrayUtils.numberArrayStep(800, -800, -200));
          this.pattern_index = 0;

          for (var i = 0; i < 64; i++) {
            this.add(new BULLET(game, "bullet4"), true);
          }

          return this;
        };

        PATTERN.prototype = Object.create(Phaser.Group.prototype);
        PATTERN.prototype.constructor = PATTERN;

        PATTERN.prototype.fire = function(source) {
          if (this.game.time.time < this.next_fire)
            return;

          var
            x = source.x + 20,
            y = source.y + 10;

          // BULLET.fire(x, y, angle, speed, gx, gy)
          this.getFirstExists(false).fire(x, y, 0, this.bullet_speed, 0, this.pattern[this.pattern_index++]);

          if (this.pattern_index === this.pattern.length)
            this.pattern_index = 0;

          this.next_fire = this.game.time.time + this.fire_rate;
        };

        return PATTERN;
      })(),

      /* ROCKETS THAT VISUALLY TRACK THE DIRECTION THEY'RE HEADING IN */
      _ROCKET = (function() {
        var ROCKET = function(game) {
          // new Group(game, parent, name, addToStage, enableBody, physicsBodyType)
          Phaser.Group.call(this, game, game.world, "Rockets", false, true, Phaser.Physics.ARCADE);

          /* NEW PROPERTIES (NOT INHERITED FROM GROUP) */
          this.next_fire = 0;
          this.bullet_speed = 400;
          this.fire_rate = 250;

          for (var i = 0; i < 32; i++) {
            this.add(new BULLET(game, "bullet10"), true);
          }

          this.setAll("tracking", true);

          return this;
        };

        ROCKET.prototype = Object.create(Phaser.Group.prototype);
        ROCKET.prototype.constructor = ROCKET;

        ROCKET.prototype.fire = function(source) {
          if (this.game.time.time < this.next_fire)
            return;

          var
            x = source.x + 10,
            y = source.y + 10;

          // BULLET.fire(x, y, angle, speed, gx, gy)
          this.getFirstExists(false).fire(x, y, 0, this.bullet_speed, 0, -700);
          this.getFirstExists(false).fire(x, y, 0, this.bullet_speed, 0, 700);

          this.next_fire = this.game.time.time + this.fire_rate;
        };

        return ROCKET;
      })(),

      /* A SINGLE BULLET THAT SCALES IN SIZE AS IT MOVES ACROSS THE SCREEN */
      _SCALE_BULLET = (function() {
        var SCALE_BULLET = function(game) {
          // new Group(game, parent, name, addToStage, enableBody, physicsBodyType)
          Phaser.Group.call(this, game, game.world, "Scale Bullet", false, true, Phaser.Physics.ARCADE);

          /* NEW PROPERTIES (NOT INHERITED FROM GROUP) */
          this.next_fire = 0;
          this.bullet_speed = 800;
          this.fire_rate = 100;

          for (var i = 0; i < 32; i++) {
            this.add(new BULLET(game, "bullet9"), true);
          }

          this.setAll("scale_speed", 0.05);

          return this;
        };

        SCALE_BULLET.prototype = Object.create(Phaser.Group.prototype);
        SCALE_BULLET.prototype.constructor = SCALE_BULLET;

        SCALE_BULLET.prototype.fire = function(source) {
          if (this.game.time.time < this.next_fire)
            return;

          var
            x = source.x + 10,
            y = source.y + 10;

          // BULLET.fire(x, y, angle, speed, gx, gy)
          this.getFirstExists(false).fire(x, y, 0, this.bullet_speed, 0, 0);

          this.next_fire = this.game.time.time + this.fire_rate;
        };

        return SCALE_BULLET;
      })(),

      /* A WEAPON COMBO - SINGLE SHOT + ROCKETS */
      _COMBO1 = (function() {
        var COMBO1 = function(game) {
          this.name = "Combo One";
          this.weapon1 = new _SINGLE(game);
          this.weapon2 = new _ROCKET(game);
        };

        COMBO1.prototype.reset = function() {
          this.weapon1.visible = false;
          this.weapon1.callAll("reset", null, 0, 0);
          this.weapon1.setAll("exists", false);

          this.weapon2.visible = false;
          this.weapon2.callAll("reset", null, 0, 0);
          this.weapon2.setAll("exists", false);
        };

        COMBO1.prototype.fire = function(source) {
          this.weapon1.fire(source);
          this.weapon2.fire(source);
        };

        return COMBO1;
      })(),

      /* A WEAPON COMBO - THREEWAY, PATTERN AND ROCKETS */
      _COMBO2 = (function() {
        var COMBO2 = function(game) {
          this.name = "Combo Two";
          this.weapon1 = new _PATTERN(game),
          this.weapon2 = new _THREE(game),
          this.weapon3 = new _ROCKET(game);
        };

        COMBO2.prototype.reset = function() {
          this.weapon1.visible = false;
          this.weapon1.callAll("reset", null, 0, 0);
          this.weapon1.setAll("exists", false);

          this.weapon2.visible = false;
          this.weapon2.callAll("reset", null, 0, 0);
          this.weapon2.setAll("exists", false);

          this.weapon3.visible = false;
          this.weapon3.callAll("reset", null, 0, 0);
          this.weapon3.setAll("exists", false);
        };

        COMBO2.prototype.fire = function(source) {
          this.weapon1.fire(source);
          this.weapon2.fire(source);
          this.weapon3.fire(source);
        };

        return COMBO2;
      })();

    return {
      SINGLE_BULLET: _SINGLE,
      FRONT_AND_BACK: _FRONT_AND_BACK,
      THREE_WAY: _THREE,
      EIGHT_WAY: _EIGHT,
      SCATTER_SHOT: _SCATTER,
      BEAM: _BEAM,
      SPLIT_SHOT: _SPLIT,
      PATTERN: _PATTERN,
      ROCKET: _ROCKET,
      SCALE_BULLET: _SCALE_BULLET,
      COMBO1: _COMBO1,
      COMBO2: _COMBO2
    };
  })(),

  MAIN = (function() {
    function _loadFont(state, resource) {
      state.load.bitmapFont(resource.id, resource.location, resource.xml);
    }

    function _loadImage(state, resource) {
      state.load.image(resource.id, resource.location);
    }

    function _scaleCanvas() {
      if (SETTINGS.DYNAMIC_ASPECT_RATIO) {
        var
          height = SETTINGS.SCREEN.HEIGHT,
          width = SETTINGS.SCREEN.WIDTH,
          min_width = SETTINGS.SCREEN.MIN_WIDTH;

        // DESKTOP: ADJUST CANVAS DIMENSIONS TO MATCH SCREEN ASPECT RATIO; CONSTRAIN TO EXISTING HEIGHT
        if (_GAME.device.desktop)
          width = Math.round(height * screen.availWidth / screen.availHeight);

        // MOBILE: RESIZE TO MATCH DEVICE "PIXEL" WIDTH/HEIGHT
        else {
          width = document.body.clientWidth;
          height = document.body.clientHeight;
        }

        // RESIZE CANVAS WIDTH/HEIGHT
        _GAME.scale.setGameSize(width, height);

        // SCALE
        min_width = Math.round(SETTINGS.SCREEN.MIN_HEIGHT * width / height);
      }

      _GAME.scale.setMinMax(min_width, SETTINGS.SCREEN.MIN_HEIGHT);
      _GAME.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      _GAME.scale.refresh();
    }

    function _start() {
      window.removeEventListener("load", _start, false);

      /* DEFAULT TO GAME RESIZEABLE TO CONTAINER / BROWSER WINDOW */
      if (SETTINGS.STRETCH_TO_WINDOW)
        _scaleCanvas();

      _GAME.renderer.renderSession.roundPixels = true;

      _GAME.state.add(_STATES.PLAY.ID, _STATES.PLAY);
      _GAME.state.start(_STATES.PLAY.ID);
    }

    var
      /** new Game(WIDTH, HEIGHT, renderer, parent, state, transparent, antialias, physicsConfig) */
      _GAME = new Phaser.Game(SETTINGS.SCREEN.WIDTH, SETTINGS.SCREEN.HEIGHT, Phaser.AUTO),
      _R = RESOURCE,

      _STATES = {
        PLAY: {
          ID: "PLAY",

          KEYBOARD: null,

          PLAYER_SPEED: 300,

          SPRITES: {
            background: null,
            foreground: null,
            player: null
          },

          WEAPON: {
            active_weapon: 0,
            arms_list: [],
            name: null
          },

          /** BUILT-IN STATE FUNCTIONS */
          init: function() {
            this.physics.startSystem(Phaser.Physics.ARCADE);
            this.KEYBOARD = this.input.keyboard.createCursorKeys();
          },

          preload: function() {
            _loadImage(this, _R.background);
            _loadImage(this, _R.foreground);
            _loadImage(this, _R.player);
            _loadFont(this, _R.shmupfont);

            for (var i = 1; i <= 11; i++) {
              this.load.image("bullet" + i, "assets/bullet" + i + ".png");
            }
          },

          create: function() {
            var
              i = 0,
              _key_weapon = this.input.keyboard.addKey(Phaser.Keyboard.ENTER),
              _SPRITES = this.SPRITES,
              _WEAPON = this.WEAPON;


            /* PLACE INITIAL SPRITES */
            _SPRITES.background = this.add.tileSprite(0, 0, _GAME.width, _GAME.height, _R.background.id);
            _SPRITES.background.autoScroll(-40, 0);  // TILESPRITE AUTO SCROLL IN PX/SEC IN X/Y DIRECTIONS

            /* WEAPONS */
            _WEAPON.arms_list.push(new WEAPON.SINGLE_BULLET(this.game));
            _WEAPON.arms_list.push(new WEAPON.FRONT_AND_BACK(this.game));
            _WEAPON.arms_list.push(new WEAPON.THREE_WAY(this.game));
            _WEAPON.arms_list.push(new WEAPON.EIGHT_WAY(this.game));
            _WEAPON.arms_list.push(new WEAPON.SCATTER_SHOT(this.game));
            _WEAPON.arms_list.push(new WEAPON.BEAM(this.game));
            _WEAPON.arms_list.push(new WEAPON.SPLIT_SHOT(this.game));
            _WEAPON.arms_list.push(new WEAPON.PATTERN(this.game));
            _WEAPON.arms_list.push(new WEAPON.ROCKET(this.game));
            _WEAPON.arms_list.push(new WEAPON.SCALE_BULLET(this.game));
            _WEAPON.arms_list.push(new WEAPON.COMBO1(this.game));
            _WEAPON.arms_list.push(new WEAPON.COMBO2(this.game));

            for (i = 0; i < _WEAPON.arms_list.length; i++) {
              _WEAPON.arms_list[i].visible = false;
            }

            _WEAPON.arms_list[0].visible = true;


            _SPRITES.player = this.add.sprite(64, 200, _R.player.id);
            this.physics.arcade.enable(_SPRITES.player);
            _SPRITES.player.body.collideWorldBounds = true;

            _SPRITES.foreground = this.add.tileSprite(0, 0, _GAME.width, _GAME.height, _R.foreground.id);
            _SPRITES.foreground.autoScroll(-60, 0);

            _WEAPON.name = this.add.bitmapText(8, 364, _R.shmupfont.id, "ENTER = Next Weapon", 24);


            /* KEYBOARD CONTROLS */
            this.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR);  // ENABLES CONSUMING KEYBOARD EVENTS, PREVENTING DEFAULT EVENT-BUBBLING
            _key_weapon.onDown.add(this.switchWeapon, this);
          },

          update: function() {
            var
              _KEY = this.KEYBOARD,
              _VELOCITY = this.SPRITES.player.body.velocity;

            _VELOCITY.set(0);

            // LEFT / RIGHT
            if (_KEY.left.isDown && !_KEY.right.isDown)
              _VELOCITY.x = -this.PLAYER_SPEED;
            else if (_KEY.right.isDown && !_KEY.left.isDown)
              _VELOCITY.x = this.PLAYER_SPEED;

            // UP / DOWN
            if (_KEY.up.isDown && !_KEY.down.isDown)
              _VELOCITY.y = -this.PLAYER_SPEED;
            else if (_KEY.down.isDown && !_KEY.up.isDown)
              _VELOCITY.y = this.PLAYER_SPEED;

            // FIRE
            if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
              this.WEAPON.arms_list[this.WEAPON.active_weapon].fire(this.SPRITES.player);
          },

          /** CUSTOM STATE FUNCTIONS */
          switchWeapon: function() {
            var
              _WEAPON = this.WEAPON,
              _ACTIVE_WEAPON = _WEAPON.arms_list[_WEAPON.active_weapon];

            // TIDY-UP CURRENT WEAPON
            if (_WEAPON.active_weapon > 9)
              _ACTIVE_WEAPON.reset();

            else {
              _ACTIVE_WEAPON.visible = false;
              _ACTIVE_WEAPON.callAll("reset", null, 0, 0);
              _ACTIVE_WEAPON.setAll("exists", false);
            }

            // ACTIVATE NEW WEAPON
            _WEAPON.active_weapon++;

            if (_WEAPON.active_weapon === _WEAPON.arms_list.length)
              _WEAPON.active_weapon = 0;

            _ACTIVE_WEAPON = _WEAPON.arms_list[_WEAPON.active_weapon];
            _ACTIVE_WEAPON.visible = true;
            _WEAPON.name.text = _ACTIVE_WEAPON.name;
          }
        }
      };

    return {
      start: _start
    };
  })();

window.addEventListener("load", MAIN.start, false);