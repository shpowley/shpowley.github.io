var
  $id = document.getElementById.bind(document),
  $card,    // alias to svgDOM.getElementById() -- set after SVG is loaded
  svgDOM,   // reference to SVG document

  SCORECARD = {
    playerName: null,
    sheets: [],

    // get JSON data for 1 scorecard sheet
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

    // resets / initializes the array of yahtzee sheets
    reset: function() {
      var s = this.sheets;

      // delete array - http://stackoverflow.com/a/1232046 (best methods)
      while (s.length > 0) {
        s.pop();
      }

      for (var i = 0; i < 6; i++) {
        s.push(this.getSheet());
      }
    },

    // recalculate totals for sheet index n
    recalculate: function(n) {
      // index n is an integer between 0 and 5
      if (!isNaN(n) && n === (n | 0) && n >= 0 && n < 6) {
        var s = this.sheets[n];

        s.upper_subtotal = s["1s"] + s["2s"] + s["3s"] + s["4s"] + s["5s"] + s["6s"];
        s.bonus = s.upper_subtotal >= 63 ? 35 : 0;
        s.upper_total = s.upper_subtotal + s.bonus;
        s.lower_total = s["3k"] + s["4k"] + s.full + s.sm + s.lg + s.yahtzee + s.yahtzee_bonuses * 100 + s.chance;
        s.grand_total = s.upper_total + s.lower_total;
      }
      else {
        console.error("Invalid sheet index.");
      }
    }
  };

window.addEventListener("load", function() {
  var svgNode = $id("score_card");

  if (svgNode && ((svgDOM = svgNode.contentDocument) || (svgDOM = svgNode.getSVGDocument()))) {
    var selectNodes = svgDOM.querySelectorAll("#selectable_region > rect"); // OR .getElementById("selectable_region").children;

    // add event handlers for ACTIVE selectable regions
    if (selectNodes) {
      var i, l = selectNodes.length, node;

      $card = svgDOM.getElementById.bind(svgDOM);

      // create underlying data structure for the scorecard
      SCORECARD.reset();

      for (i = 0; i < l; i++) {
        node = selectNodes[i];

        // assign click events only to scoring squares
        if (node.classList.contains("click")) {
          node.addEventListener("click", function() {
            /**
             * TODO
             * * modify to use custom graphic dialogs
             * - handle delete / cancel / #
             * - currently, selecting cancel returns null
             */
            var s = prompt("Enter a value.");

            if (s == null) return false;

            $card("text_" + this.id).textContent = s;


            if (this.id != "player_name") {
              var
                row = this.id.substring(3), // row text identifier
                col = this.id.substr(0, 2), // column text identifier
                index = col.charAt(1)*1 - 1, // active sheet index
                sheet = SCORECARD.sheets[index], // reference active scorecard column (or sheet)
                totals = $card(col + "_totals"); // sheet totals SVG group identifier

              sheet[row] = s*1; // update sheet cell JSON data
              SCORECARD.recalculate(index);

              totals.classList.add("hidden"); // hides the entire "totals" SVG group
              $card("text_" + col + "_upsub").textContent = sheet.upper_subtotal;
              $card("text_" + col + "_bonus").textContent = sheet.bonus;
              $card("text_" + col + "_upper").textContent = sheet.upper_total;
              $card("text_" + col + "_lower").textContent = sheet.lower_total;
              $card("text_" + col + "_upper_x").textContent = sheet.upper_total;
              $card("text_" + col + "_score").textContent = sheet.grand_total;
              totals.classList.remove("hidden");
            }
          });
        }
      }
    }

    svgNode.classList.add("fade-in");
    svgNode.classList.remove("invisible");
    console.log("READY");
  }
  else {
    console.error("WARNING: UNABLE TO LOAD SCORECARD SVG");
  }
});