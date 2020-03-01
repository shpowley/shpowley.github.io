// native method script aliases
Element.prototype.on = Element.prototype.addEventListener;
Element.prototype.$css = Element.prototype.querySelector;

var
  $id = document.getElementById.bind(document),
  $css = document.querySelector.bind(document),

  SCORECARD = {
    playerName: null,
    sheets: [],
    initialized: false,

    // integer between 0 and 5
    isValidSheet: function(n) {
      return (!isNaN(n) && n === (n | 0) && n >= 0 && n < 6);
    },

    getSheet: function() {
      return {
        // upper sheet
        "1s": null,             // null, 0-5
        "2s": null,             // null, 0-10 (multiples of 2)
        "3s": null,             // null, 0-15 (multiples of 3)
        "4s": null,             // null, 0-20 (multiples of 4)
        "5s": null,             // null, 0-25 (multiples of 5)
        "6s": null,             // null, 0-30 (multiples of 6)
        upper_subtotal: null,   // null, aces + twos + threes + fours + fives + sixes
        bonus: null,            // null, 0, 35 (upper subtotal > 63)
        upper_total: null,      // null, upper subtotal + bonus

        // lower sheet
        "3k": null,             // null, 0, total of 5 dice
        "4k": null,             // null, 0, total of 5 dice
        full: null,             // null, 0, 25
        sm: null,               // null, 0, 30
        lg: null,               // null, 0, 40
        yahtzee: null,          // null, 0, 50
        yahtzee_bonuses: null,  // 0-12 (not displayed on original retro sheet)
        chance: null,           // null, total of 5 dice (0 not allowed, 5 minimum)
        lower_total: null,      // null, 3 of a kind + 4 of a kind + full house + sm. straight + lg. straight + yahtzee + chance + yahtzee bonuses
        grand_total: null,      // null, upper total + lower total
      };
    },

    resetSheet: function(n) {
      if (this.isValidSheet(n)) {
        var s = this.sheets[n];

        s["1s"] = s["2s"] = s["3s"] = s["4s"] = s["5s"] = s["6s"] = s.upper_subtotal = s.bonus = s.upper_total = s["3k"] = s["4k"] = s.full = s.sm = s.lg = s.yahtzee = s.yahtzee_bonuses = s.chance = s.lower_total = s.grand_total = null;
      }
      else {
        console.error("Invalid sheet index.");
      }
    },

    resetScorecard: function() {
      for (var n = 0; n < 6; n++) {
        this.resetSheet(n);
      }
    },

    recalculate: function(n) {
      if (this.isValidSheet(n)) {
        var s = this.sheets[n];

        s.upper_subtotal = s["1s"] + s["2s"] + s["3s"] + s["4s"] + s["5s"] + s["6s"];
        s.bonus = s.upper_subtotal > 63 ? 35 : 0;
        s.upper_total = s.upper_subtotal + s.bonus;
        s.lower_total = s["3k"] + s["4k"] + s.full + s.sm + s.lg + s.yahtzee + s.yahtzee_bonuses * 100 + s.chance;
        s.grand_total = s.upper_total + s.lower_total;
      }
      else {
        console.error("Invalid sheet index.");
      }
    },

    init: function() {
      if (!this.initialized) {
        this.sheets.push(this.getSheet());
        this.sheets.push(this.getSheet());
        this.sheets.push(this.getSheet());
        this.sheets.push(this.getSheet());
        this.sheets.push(this.getSheet());
        this.sheets.push(this.getSheet());
        this.initialized = true;
      }
    }
  };

window.addEventListener("load", function() {
  console.log("window::load()");
});

document.addEventListener("DOMContentLoaded", function() {
  console.log("document::DOMContentLoaded()");

  SCORECARD.init();

  $id("mybutton").on("click", function() {
    // scorecard json data
    var s = SCORECARD.sheets[0];

    s["1s"] = 5;
    s["3s"] = 9;
    s["4s"] = 12;
    s["5s"] = 20;
    s["6s"] = 18;
    s["3k"] = 30;
    s.yahtzee = 50;
    s.yahtzee_bonuses = 2;
    SCORECARD.recalculate(0);

    console.log("sheet 1 - upper subtotal: " + s.upper_subtotal);
    console.log("sheet 1 - bonus: " + s.bonus);
    console.log("sheet 1 - upper total: " + s.upper_total);
    console.log("sheet 1 - lower total: " + s.lower_total);
    console.log("sheet 1 - grand total: " + s.grand_total);

    // native method aliases
    $css("#t1").innerHTML = "OK USA!";
    $id("graphics").$css("#t2").innerHTML = "OK Canada!";
  });
});