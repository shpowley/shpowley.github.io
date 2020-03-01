Element.prototype.on = Element.prototype.addEventListener;
Element.prototype.$css = Element.prototype.querySelector;

var
  $id = document.getElementById.bind(document),

  dice = {
    a: $id("dice-a"),
    b: $id("dice-b"),
    c: $id("dice-c"),
    d: $id("dice-d"),
    e: $id("dice-e"),
    f: $id("dice-f")
  },

  diceCount = [1, 1, 1, 1, 1, 1],
  dice_B_image,
  dice_B_timer;

// increment / return next die face
function nextDie(n) {
  return diceCount[n] = diceCount[n] % 6 + 1;
}

// random dice #
// - http://stackoverflow.com/a/7228322 (min/max)
// - http://stackoverflow.com/a/8063367 (optimized)
function randomDie(n) {
  var t = ~~(Math.random() * 6) + 1;

  return diceCount[n] = (diceCount[n] == t ? nextDie(n) : t);
}

function cycleDiceB() {
  // I think this method appears best overall
  dice_B_image.setAttribute("xlink:href", "svg/svg-sprites.svg#dice-" + randomDie(1));
}

document.addEventListener("DOMContentLoaded", function() {
  var init = true;

  /* DICE A */
  dice.a.on("click", function() {
    this.innerHTML = "<svg class='dice'><use xlink:href='svg/svg-sprites.svg#dice-" + nextDie(0) + "'/></svg>";
  });

  /* DICE B */
  dice_B_image = dice.b.$css("use");
  dice_B_timer = TIMER.create();
  // dice.b.classList.add("pause", "dice-rolling");
  dice.b.classList.add("pause");

  dice.b.on("click", function() {
    // start/stop changing dice "face" using timer
    if (this.classList.contains("pause")) {
      // work-around hack for android chrome webview
      if (init) {
        this.classList.add("rolling");
        init = false;
      }

      dice_B_timer.intervalRequest(cycleDiceB, 450);
    }
    else {
      dice_B_timer.clear();
    }

    // start/stop rotation animation
    this.classList.toggle("pause");
  });

  /*
    triggered 1x per animation iteration
    - http://www.sitepoint.com/css3-animation-javascript-event-handlers/
    - not used as this code changes dice faces multiple times per animation iteration
  */
  // dice.b.on("webkitAnimationIteration", cycleDiceB);
  // dice.b.on("animationiteration", cycleDiceB);

  /* DICE C */
  dice.c.on("click", function() {
    this.src = "svg/svg-sprites-fragments.svg#dice-" + nextDie(2);
  });

  /* DICE D */
  dice.d.on("click", function() {
    this.src = "svg/svg-sprites-fragments.svg#dice-" + randomDie(3);
  });

  /* DICE E */
  dice.e.on("click", function() {
    this.src = "svg/svg-sprites-fragments.svg#dice-" + nextDie(4);
  });

  /* DICE F */
  dice.f.on("click", function() {
    this.src = "svg/svg-sprites-fragments.svg#dice-" + nextDie(5);
  });
});