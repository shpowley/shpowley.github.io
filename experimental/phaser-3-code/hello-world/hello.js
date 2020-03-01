/* global Phaser */
var
  MAIN = (function() {
    function _preload() {
      this.load.setBaseURL("https://labs.phaser.io");

      this.load.image("sky", "assets/skies/space3.png");
      this.load.image("logo", "assets/sprites/phaser3-logo.png");
      this.load.image("red", "assets/particles/red.png");
    }

    function _create() {
      this.add.image(400, 300, "sky"); // SKY MUST BE PLACED PRIOR TO LOGO AND PARTICLE EFFECT, AS IMAGE Z-ORDER IS DETERMINED BY CODE ORDER

      var
        _particles = this.add.particles("red"),

        _emitter = _particles.createEmitter({
          blendMode: "ADD",
          speed: 100,

          scale: {
            start: 1,
            end: 0
          }
        }),

        _logo = this.physics.add.image(400, 100, "logo");


      _logo.setVelocity(100, 200);
      _logo.setBounce(1, 1);
      _logo.setCollideWorldBounds(true);

      _emitter.startFollow(_logo);
    }

    function _start() {
      window.removeEventListener("load", _start, false);
    }

    var
      _CONFIG = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,

        physics: {
          default: "arcade",

          arcade: {
            gravity: {
              y: 200
            }
          }
        },

        scene: {
          preload: _preload,
          create: _create
        }
      },

      _GAME = new Phaser.Game(_CONFIG);

    return {
      start: _start
    };
  })();

window.addEventListener("load", MAIN.start, false);