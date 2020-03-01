// TUTORIAL: https://www.youtube.com/watch?v=IQs_pze2SsA
/* global Phaser */
var
  // _GAME = new Phaser.Game(800, 600, Phaser.CANVAS, "game_div"),
  _GAME = new Phaser.Game(800, 600, Phaser.WEBGL, "game_div"),

  _BACKGROUND = {
    id: "starfield",
    location: "starfield.png",
    obj: null
  },

  _PLAYER = {
    id: "player",
    location: "spaceship.png",
    obj: null
  },

  _BULLETS = {
    id: "blast",
    location: "blast.png",
    group: null,
    speed: -600,              // bullet velocity
    last_fired: 0,            // time of last bullet
    delay: 1500               // minimum delay between bullet shots ..less frequent shots
  },

  _ENEMIES = {
    id: "enemies",
    location: "alien.gif",
    group: null
  },

  _TEXT = {
    score: 0,
    score_obj: null,
    win_obj: null,

    font: {
      font: "32px Arial",
      fill: "#fff"
    }
  },

  _KEYBOARD,
  _FIREBUTTON,

  _STATES = {
    MAIN: {
      id: "main",

      /* COMMON STATE FUNCTIONS */
      preload: function() {
        _GAME.load.image(_BACKGROUND.id, _BACKGROUND.location);
        _GAME.load.image(_PLAYER.id, _PLAYER.location);
        _GAME.load.image(_BULLETS.id, _BULLETS.location);
        _GAME.load.image(_ENEMIES.id, _ENEMIES.location);
      },

      create: function() {
        // TODO
        // - is there more efficient scrolling background?
        // - DOCS: "When running under WebGL the texture should ideally be a power of two in size
        //   (i.e. 4, 8, 16, 32, 64, 128, 256, 512, etch pixels width by height)"
        // - note: starfield.png = 512 x 1024
        _BACKGROUND.obj = _GAME.add.tileSprite(0, 0, 800, 600, _BACKGROUND.id);
        // _BACKGROUND.obj.tileScale.x = 1.6;
        // _BACKGROUND.obj.tileScale.y = 1.6;

        // position spaceship centered on lower half of the screen
        _PLAYER.obj = _GAME.add.sprite(_GAME.world.centerX, _GAME.world.centerY + 200, _PLAYER.id);

        // #A1 | add physics to the "player" spaceship | TODO - READ DOCS
        _GAME.physics.enable(_PLAYER.obj, Phaser.Physics.ARCADE);

        // bullets treated as a group
        _BULLETS.group = _GAME.add.group();

        // TODO - can the following be implemented like #A1
        _BULLETS.group.enableBody = true; // TODO - READ DOCS
        _BULLETS.group.physicsBodyType = Phaser.Physics.ARCADE;

        // bullets configuration | TODO - READ DOCS | .createMultiple(), .setAll()
        _BULLETS.group.createMultiple(30, _BULLETS.id);
        _BULLETS.group.setAll("anchor.x", 0.5);
        _BULLETS.group.setAll("anchor.y", 1);
        _BULLETS.group.setAll("outOfBoundsKill", true);
        _BULLETS.group.setAll("checkWorldBounds", true);

        // enemies treated as a group
        _ENEMIES.group = _GAME.add.group();
        _ENEMIES.group.enableBody = true;
        _ENEMIES.group.physicsBodyType = Phaser.Physics.ARCADE;

        this.createEnemies();

        // create text objects
        _TEXT.score_obj = _GAME.add.text(20, 20, "Score:", _TEXT.font);
        _TEXT.win_obj = _GAME.add.text(_GAME.world.centerX, _GAME.world.centerY, "YOU WIN", _TEXT.font);
        _TEXT.win_obj.anchor.setTo(0.5);
        _TEXT.win_obj.visible = false;

        // enable keyboard arrow keys to control left/right spaceship movement | TODO - READ DOCS
        _KEYBOARD = _GAME.input.keyboard.createCursorKeys();

        // enable keyboard SPACE key to control spaceship firing
        _FIREBUTTON = _GAME.input.keyboard.addKey(Phaser.Keyboard.CONTROL);
      },

      update: function() {
        // bullet collisions
        _GAME.physics.arcade.overlap(_BULLETS.group, _ENEMIES.group, this.collisionHandler, null, this); // TODO - READ DOCS

        // move background starfield
        _BACKGROUND.obj.tilePosition.y += 4;

        // move spaceship left | right
        // - .body.velocity requires physics
        if (_KEYBOARD.left.isDown && _KEYBOARD.right.isUp)
          _PLAYER.obj.body.velocity.x = -350;
        else if (_KEYBOARD.left.isUp && _KEYBOARD.right.isDown)
          _PLAYER.obj.body.velocity.x = 350;
        else
          _PLAYER.obj.body.velocity.x = 0;

        // control firing blast
        if (_GAME.time.now > _BULLETS.last_fired && _FIREBUTTON.isDown)
          this.fireBullet();

        // update the score
        _TEXT.score_obj.text = "SCORE: " + _TEXT.score;

        // check if game over condition
        if (_ENEMIES.group.countLiving() == 0)
          _TEXT.win_obj.visible = true;
      },

      /* MAIN - CUSTOM */

      // TODO - READ DOCS
      collisionHandler: function(bullet, enemy) {
        bullet.kill();
        enemy.kill();

        _TEXT.score += 100;
      },

      // initial enemy placement
      createEnemies: function() {
        var
          enemy, tween,
          x = 0,
          y = 0;

        // place individual enemy ships within the group
        for (y = 0; y < 3; y++) {
          for (x = 0; x < 7; x++) {
            enemy = _ENEMIES.group.create(x * 80, y * 80, _ENEMIES.id);
            enemy.anchor.setTo(0.5, 0.5); // TODO - SAME AS .setTo(0.5)?
          }
        }

        // position the group
        _ENEMIES.group.x = 50;
        _ENEMIES.group.y = 50;

        // DOCS: .to(properties, duration, ease, autoStart, delay, repeat, yoyo)
        tween = _GAME.add.tween(_ENEMIES.group).to({x: 270}, 2000, Phaser.Easing.Linear.None, true, 0, 100, true);
        // tween.onLoop.add(this.descend, this);
        tween.onRepeat.add(this.descend, this);
      },

      descend: function() {
        _ENEMIES.group.y += 10;
      },

      fireBullet: function() {
        var bullet = _BULLETS.group.getFirstExists(false); // TODO - READ DOCS; what kind of object is bullet

        if (bullet) {
          bullet.reset(_PLAYER.obj.x + 32, _PLAYER.obj.y); // TODO - READ DOCS .reset()
          bullet.body.velocity.y = _BULLETS.speed;
          _BULLETS.last_fired = _GAME.time.now + _BULLETS.delay;
        }
      }
    }
  };

window.addEventListener("load", function() {
  _GAME.state.add(_STATES.MAIN.id, _STATES.MAIN);
  _GAME.state.start(_STATES.MAIN.id);
});