/* global YAHTZLE UTIL */
var
  $id = document.getElementById.bind(document),
  $Y = YAHTZLE,
  $B = $Y.SCOREBOX,
  $D = $Y.DECK,
  $G = $Y.GAME,
  $H = $Y.HAND,
  $S = $Y.STATES,
  $T = $Y.SETTINGS,
  CODE = $S.STATE_CODES,
  SUITS = $Y.CARD.SUITS,
  text_data = null,
  prompt_verify = false,

  CSS = {
    FONT_BOLD: "font-weight: bold",
    FONT_NORMAL: "font-weight: normal"
  },

  INPUT = {
    fnBack: function() {
      var l = $S.STACK.length;

      if (l > 1) MENU.main($S.STACK[l - 2]);
    },

    fnDeck: function(s) {
      switch(s) {
        case "1": // 1) Shuffle
          $D.shuffle();
          MENU.main(CODE.DECK);
          break;

        case "2": // 2) Back (default)
        case "":
          INPUT.fnBack();
      }
    },

    fnHighScore: function(s) {
      switch(s) {
        case "1": // 1) Reset High Scores
          var H = $Y.HIGH_SCORES;

          if (H.DEVICE.length > 0 || H.SESSION.length > 0)
            MENU.showHighScoresResetVerify();

          break;

        case "2": // 2) Back (default)
        case "":
          INPUT.fnBack();
      }
    },

    fnHighScoresReset: function(s) {
      switch(s) {
        case "Y":
        case "y":
          $Y.HIGH_SCORES.clear();
      }

      MENU.main(CODE.HIGH_SCORES);
      prompt_verify = false;
    },

    fnMainMenu: function(s) {
      switch(s) {
        case "1": // 1) Play A New Game
          MENU.main(CODE.NEW_GAME);
          break;

        case "2": // 2) Player Setup
          MENU.main(CODE.PLAYER_SETUP);
          break;

        case "3": // 3) Game Settings
          MENU.main(CODE.GAME_SETTINGS);
          break;

        case "4": // 4) High Scores
          MENU.main(CODE.HIGH_SCORES);
          break;

        case "5": // 5) Rules
          MENU.main(CODE.RULES);
          break;

        case "6": // 6) Scoring
          MENU.main(CODE.SCORING);
          break;

        case "7": // 7) Show Deck
          MENU.main(CODE.DECK);
      }
    },

    fnNewGame: function(s) {
      switch(s) {
        case "1": // 1) Random Trump Suit (default)
        case "":
          MENU.main(CODE.RANDOM_SUIT);
          break;

        case "2": // 2) Select Suit
          MENU.main(CODE.SELECT_SUIT);
          break;

        case "3": // 3) Back
          MENU.main(CODE.MAIN_MENU);
      }
    },

    fnPlay: function(s) {
      var A = s.split(' ');

      // Toggle Keep/Discard a Card
      switch (A[0].toUpperCase()) {
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
        case "10":
        case "11":
        case "12":
          if (A.length <= 2) {
            var refresh = false;

            if (A.length === 1) {
              if ($H.CARDS.length > 0) {
                $H.toggleDiscard(s);
                refresh = true;
              }
            }

            else if (A[1].toUpperCase() === "D") { // Section Details
              var
                section_id = UTIL.toInteger(A[0]) - 1,
                categories = $Y.SCORECARD.CATEGORIES,
                section_key = Object.keys(categories)[section_id];

              switch(section_key) {
                case "undefined":
                case categories.BONUS:
                case categories.TOTAL:
                  break;

                default:
                  var section = $G.currentPlayer().scorecard[section_key];

                  if (UTIL.isInteger(section.SCORE) || UTIL.isInteger(section.POSSIBLE)) {
                    MENU.DETAIL_SECTION = section_key;
                    MENU.main(CODE.SCORING_DETAIL);
                  }
              }

              refresh = false;
            }

            else if ($H.CARDS.length > 0) {
              switch(A[1].toUpperCase()) {
                case "L": // Re-arrange Hand - Move Card Left
                  $H.moveLeft(UTIL.toInteger(A[0]) - 1);
                  refresh = true;
                  break;

                case "P": // Pick Score (# = SCORING Category #)
                  refresh = $Y.SCORECARD.pick(UTIL.toInteger(A[0]) - 1);
                  break;

                case "R": // Re-arrange Hand - Move Card Right
                  $H.moveRight(UTIL.toInteger(A[0]) - 1);
                  refresh = true;
                  break;

                default:
                  refresh = false;
              }
            }

            if (refresh)
              MENU.main(CODE.PLAY_MODE);
          }

          break;

        case "B":
          if ($H.BUNCH_EXISTS) {
            $H.bunch();
            MENU.main(CODE.PLAY_MODE);
          }

          break;

        // Scoring
        case "C":
          MENU.main(CODE.SCORING);
          break;

        case "D":
          if ((A.length === 1 || $T.DEVELOPER_MODE) && $H.preDeal()) {
            $H.deal(A);
            MENU.main(CODE.PLAY_MODE);
          }

          break;

        // Settings
        case "E":
          MENU.main(CODE.GAME_SETTINGS);
          break;

        // Get Hand Code (DEVELOPER MODE)
        case "G":
          if ($T.DEVELOPER_MODE) {
            if ($H.CARDS.length > 0) {
              console.log(
                "SPECIAL CODE IDENTIFYING CARDS IN HAND:\n\n" +
                $H.generateCode());
            }
            else
              console.log("NO CARDS CURRENTLY IN HAND!");
          }

          break;

        // Refresh Play Screen
        case "H":
          MENU.main(CODE.PLAY_MODE);
          break;

        // Show Deck: ON/OFF
        case "K":
          if ($T.DEVELOPER_MODE) {
            $D.VISIBLE = !$D.VISIBLE;
            $T.save();
            MENU.main(CODE.PLAY_MODE);
          }

          break;

        // New Game
        case "N":
          if ($G.IN_PROGRESS) {
            $S.QUIT_STATE = CODE.NEW_GAME;
            MENU.showQuitVerify();
          }
          else
            MENU.main(CODE.NEW_GAME);

          break;

        // Quit
        case "Q":
          if ($G.IN_PROGRESS) {
            $S.QUIT_STATE = CODE.MAIN_MENU;
            MENU.showQuitVerify();
          }
          else
            MENU.main(CODE.MAIN_MENU);

          break;

        // Rules
        case "R":
          MENU.main(CODE.RULES);
          break;

        // Toggle Keep/Discard All
        case "T":
          $H.toggleDiscardAll();
          MENU.main(CODE.PLAY_MODE);
          break;

        // Remix Discards: ON/OFF
        case "X":
          $H.REMIX_DISCARDS = !$H.REMIX_DISCARDS;
          $T.save();
          MENU.main(CODE.PLAY_MODE);
      }
    },

    fnPlayerSetup: function(s) {
      var
        A = s.split(' '),
        n = 0;

      switch (A[0].toUpperCase()) {
        // Specify Number of Players (1-4)
        case "P":
          if (A.length === 2) {
            n = UTIL.toInteger(A[1]);

            if (UTIL.isInteger(n) && n > 0 && n <= $G.PLAYERS_MAX) {
              $G.playersResize(n);
              $T.save();
              MENU.main(CODE.PLAYER_SETUP);
            }
          }

          break;

        case "1":
        case "2":
        case "3":
        case "4":
          n = UTIL.toInteger(A[0]) - 1;

          if (n <= $G.PLAYERS.length) {
            if (A.length === 2) {
              switch (A[1].toUpperCase()) {
                case "H":
                  $G.PLAYERS[n].type = $Y.PLAYER.TYPE.HUMAN;
                  $T.save();
                  MENU.main(CODE.PLAYER_SETUP);
                  break;

                case "C":
                  $G.PLAYERS[n].type = $Y.PLAYER.TYPE.CPU;
                  $T.save();
                  MENU.main(CODE.PLAYER_SETUP);
              }
            }
            else if (A.length === 3 && A[1].toUpperCase() === "N") {
              $G.PLAYERS[n].name = A[2].substr(0, 20);
              $T.save();
              MENU.main(CODE.PLAYER_SETUP);
            }
          }

          break;

        case "X":
        default:
          INPUT.fnBack();
      }
    },

    fnQuit: function(s) {
      switch(s) {
        case "Y":
        case "y":
          MENU.main($S.QUIT_STATE);
          break;

        case "N":
        case "n":
          INPUT.fnBack();
      }

      prompt_verify = false;
    },

    fnRules: function(s) {
      switch(s) {
        case "1": // 1) Scoring
          MENU.main(CODE.SCORING);
          break;

        case "2": // 2) Back (default)
        case "":
          INPUT.fnBack();
      }
    },

    fnScoring: function(s) {
      switch(s) {
        case "1": // 1) Rules
          MENU.main(CODE.RULES);
          break;

        default:
          INPUT.fnBack();
      }
    },

    fnScoringDetail: function(s) {
      switch(s) {
        case "1": // 1) Display Card ID
          if ($T.DEVELOPER_MODE)
            $T.DISPLAY_CARD_ID = !$T.DISPLAY_CARD_ID;

          MENU.main(CODE.SCORING_DETAIL);
          break;

        default:
          INPUT.fnBack();
      }
    },

    fnSelectSuit: function(s) {
      switch(s) {
        case "1": // 1) ♦ DIAMONDS
          $G.setSuit(SUITS.DIAMONDS);
          $G.initialize();
          MENU.main(CODE.PLAY_MODE);
          break;

        case "2": // 2) ♠ SPADES
          $G.setSuit(SUITS.SPADES);
          $G.initialize();
          MENU.main(CODE.PLAY_MODE);
          break;

        case "3": // 3) ♥ HEARTS
          $G.setSuit(SUITS.HEARTS);
          $G.initialize();
          MENU.main(CODE.PLAY_MODE);
          break;

        case "4": // 4) ♣ CLUBS
          $G.setSuit(SUITS.CLUBS);
          $G.initialize();
          MENU.main(CODE.PLAY_MODE);
          break;

        case "5": // 5) Back
          INPUT.fnBack();
      }
    },

    fnSettings: function(s) {
      switch(s) {
        case "1": // 1) Developer Mode
          $T.DEVELOPER_MODE = !$T.DEVELOPER_MODE;
          MENU.main(CODE.GAME_SETTINGS);
          break;

        case "2": // 2) Display Card ID (Detail View)
          if ($T.DEVELOPER_MODE) {
            $T.DISPLAY_CARD_ID = !$T.DISPLAY_CARD_ID;
            MENU.main(CODE.GAME_SETTINGS);
          }

          break;

        case "3": // 3) Show Deck
          if ($T.DEVELOPER_MODE) {
            $D.VISIBLE = !$D.VISIBLE;
            MENU.main(CODE.GAME_SETTINGS);
          }

          break;

        case "4": // 4) Double Marriage Value
          if ($G.IN_PROGRESS === false) {
            $T.DOUBLE_MARRIAGE.toggle();
            MENU.main(CODE.GAME_SETTINGS);
          }

          break;

        case "5": // 5) New Cards Initial State
          $H.DISCARD_NEW = !$H.DISCARD_NEW;
          MENU.main(CODE.GAME_SETTINGS);
          break;

        case "6": // 6) Remix Discards
          $H.REMIX_DISCARDS = !$H.REMIX_DISCARDS;
          MENU.main(CODE.GAME_SETTINGS);
          break;

        default:
          INPUT.fnBack();
          return;
      }

      $T.save();
    },

    main: function() {
      var s = text_data.value;

      text_data.value = "";

      switch($S.getState()) {
        case CODE.DECK:
          INPUT.fnDeck(s);
          break;

        case CODE.GAME_SETTINGS:
          INPUT.fnSettings(s);
          break;

        case CODE.HIGH_SCORES:
          if (prompt_verify)
            INPUT.fnHighScoresReset(s);
          else
            INPUT.fnHighScore(s);

          break;

        case CODE.MAIN_MENU:
          INPUT.fnMainMenu(s);
          break;

        case CODE.NEW_GAME:
          INPUT.fnNewGame(s);
          break;

        case CODE.PLAY_MODE:
          if (prompt_verify)
            INPUT.fnQuit(s);
          else
            INPUT.fnPlay(s);

          break;

        case CODE.PLAYER_SETUP:
          INPUT.fnPlayerSetup(s);
          break;

        case CODE.RULES:
          INPUT.fnRules(s);
          break;

        case CODE.SCORING:
          INPUT.fnScoring(s);
          break;

        case CODE.SCORING_DETAIL:
          INPUT.fnScoringDetail(s);
          break;

        case CODE.SELECT_SUIT:
          INPUT.fnSelectSuit(s);
          break;

        default:
          console.warn("WARNING - UNHANDLED INPUT"); // TODO - show current state / next state
      }
    }
  },

  MENU = {
    DETAIL_SECTION: null, // identifies scoring detail

    /* ===========================| FUNCTIONS |=========================== */
    fnCard: function(card) {
      return card.value + card.suit;
    },

    fnInvalid: function() {
      console.log(
        "Invalid Choice.\n" +
        "Please make another selection.");

      $S.setPrevState();
    },

    fnToDo: function() {
      console.log(
        "TO DO..\n" +
        "Please make another selection.");

      $S.setPrevState();
    },

    helperBuildDeck: function() {
      var
        D = $D,
        i = 0,
        l = D.CARDS.length,
        s = "DECK:";

      for (; i < l; i++) {
        s += UTIL.pad(MENU.fnCard(D.CARDS[i]), 4);

        if (i > 10 && i < l - 1 && ((i + 1) % 12 === 0))
          s += "\n\n     ";
      }

      return s + "\n\n";
    },

    helperBuildDiscards: function() {
      var
        D = $D,
        i = 0,
        l = D.DISCARDS.length,
        s = "DISCARDS:";

      for (; i < l; i++) {
        s += UTIL.pad(MENU.fnCard(D.DISCARDS[i]), 4);

        if (i > 10 && i < l - 1 && ((i + 1) % 12 === 0))
          s += "\n\n         ";
      }

      return s + "\n\n";
    },

    // settings menu
    helperDeckOption: function() {
      if ($T.DEVELOPER_MODE)
        return $D.VISIBLE ? "ON\n" : "OFF\n";
      else
        return "DISABLED\n";
    },

    helperGameOver: function() {
      if ($G.IN_PROGRESS === false)
        console.log("GAME OVER");
    },

    // play menu
    helperPlayDeckOption: function() {
      if ($T.DEVELOPER_MODE)
        return $D.VISIBLE ? "ON\n\n" : "OFF\n\n";
      else
        return "DISABLED\n\n";
    },

    helperRemixOption: function() {
      return $H.REMIX_DISCARDS ? "ON\n" : "OFF\n";
    },

    // return a simple string representation of cards; used in showScoringDetail()
    helperShowCards: function(CARDS) {
      var
        card = null,
        s = "",
        i = 0,
        l = CARDS.length;

      for (; i < l; i++) {
        card = CARDS[i];

        if (i > 0)
          s += " ";

        if ($T.DEVELOPER_MODE && $T.DISPLAY_CARD_ID)
          s += MENU.fnCard(card) + ":" + (card.id === null ? "X" : card.id);
        else
          s += MENU.fnCard(card);
      }

      return s;
    },

    helperShowCategory: function(category) {
      var
        C = $Y.SCORECARD.CATEGORIES,
        S = $G.currentPlayer().scorecard,
        CARDS = null,
        section = null,
        label = null,
        score_width = 5,
        flag = " ",
        score = "_",
        partial_check = true;

      switch(category) {
        case C.NINES:
          CARDS = $B.SECTION.NINES;
          section = S.NINES;
          label = "Nines:";
          break;

        case C.JACKS:
          CARDS = $B.SECTION.JACKS;
          section = S.JACKS;
          label = "Jacks:";
          break;

        case C.QUEENS:
          CARDS = $B.SECTION.QUEENS;
          section = S.QUEENS;
          label = "Queens:";
          break;

        case C.KINGS:
          CARDS = $B.SECTION.KINGS;
          section = S.KINGS;
          label = "Kings:";
          break;

        case C.ACES:
          CARDS = $B.SECTION.ACES;
          section = S.ACES;
          label = "Aces:";
          break;

        case C.MARRIAGES:
          CARDS = $B.SECTION.MARRIAGES;
          section = S.MARRIAGES;
          label = "Marriages:";
          break;

        case C.AROUND_240:
          CARDS = $B.SECTION.AROUND_240;
          section = S.AROUND_240;
          label = "240 Around:";
          break;

        case C.PINOCHLES:
          CARDS = $B.SECTION.PINOCHLES;
          section = S.PINOCHLES;
          label = "Pinochle:";
          break;

        case C.RUNS:
          CARDS = $B.SECTION.RUNS;
          section = S.RUNS;
          label = "Runs:";
          break;

        case C.CHANCE:
          CARDS = $B.SECTION.CHANCE;
          section = S.CHANCE;
          label = "Chance:";
          break;

        case C.YAHTZLE:
          CARDS = $B.SECTION.YAHTZLE;
          section = S.YAHTZLE;
          label = "Yahtzle:";
          break;

        case C.YAHTZLE_BONUS:
          partial_check = false;
          section = S.YAHTZLE_BONUS;
          label = "Bonus²:";
          break;
          // return UTIL.pad(UTIL.isInteger(S.YAHTZLE_BONUS.SCORE) ? S.YAHTZLE_BONUS.SCORE : "_", score_width, ' ');

        case C.BONUS:
          partial_check = false;
          section = S.BONUS;
          label = "Bonus¹:";
          break;

        case C.UPPER:
          return UTIL.pad(UTIL.isInteger(S.UPPER) ? S.UPPER : "_", score_width, ' ');

        case C.LOWER:
          return UTIL.pad(UTIL.isInteger(S.LOWER) ? S.LOWER : "_", score_width, ' ');

        case C.TOTAL:
          return UTIL.pad(UTIL.isInteger(S.TOTAL) ? S.TOTAL : "_", score_width, ' ');
      }

      if (UTIL.isInteger(section.SCORE) && (category !== C.YAHTZLE_BONUS || (category === C.YAHTZLE_BONUS && section.SCORE >= section.POSSIBLE))) {
        flag = "x";
        score = UTIL.pad(section.SCORE, score_width, ' ');
      }

      else if (UTIL.isInteger(section.POSSIBLE) && section.POSSIBLE > 0) {
        flag = "o";
        score = UTIL.pad(section.POSSIBLE, score_width, ' ');
      }

      // check each card for a partial match
      else if (partial_check && $H.CARDS.length > 0) {
        for (var i = 0; i < CARDS.length; i++) {
          if (CARDS[i].category === $B.STATUS.CAUTION) {
            flag = "~";
            break;
          }
        }
      }

      return flag + " " + UTIL.pad(label, 12, ' ', true) + UTIL.pad(score, score_width, ' ');
    },

    helperShowHand: function() {
      var
        C = $H.CARDS,
        l = C.length,
        s = "HAND:";

      if (l === 0) {
        s = "HAND:                                                  DISCARD\n" +
            "                                                       KEEP\n";
      }
      else {
        var
          i = 0,
          card = null;

        // 1st row
        for (; i < l; i++) {
          card = C[i];
          s += (card.discard === true ? UTIL.pad(MENU.fnCard(card), 4) : "    ");
        }

        s += "  DISCARD\n     ";

        // 2nd row
        for (i = 0; i < l; i++) {
          card = C[i];
          s += (card.discard === false ? UTIL.pad(MENU.fnCard(card), 4) : "    ");
        }

        s += "  KEEP\n";
      }

      return s;
    },

    helperShowPlayerList: function() {
      var l = $G.PLAYERS.length;

      if (l > 1) {
        var
          i = 0,
          s = null,
          player = null;

        s = "SCORE BOARD:\n\n";

        for (; i < l; i++) {
          player = $G.PLAYERS[i];

          s += (i === $G.CURRENT_PLAYER ? $G.TRUMP_SUIT + " " : "  ") +
            UTIL.pad(player.name, 21, ' ', true) +
            (player.scorecard.TOTAL === null ? "" : player.scorecard.TOTAL) + "\n";
        }

        console.log(s + "\n");
      }
    },

    main: function(next_state) {
      if ($S.setNextState(next_state)) {
        switch($S.getState()) {
          case CODE.DECK:
            MENU.showDeck();
            break;

          case CODE.GAME_SETTINGS:
            MENU.showSettings();
            break;

          case CODE.HIGH_SCORES:
            MENU.showHighScores();
            break;

          case CODE.INVALID:
            MENU.fnInvalid();
            break;

          case CODE.MAIN_MENU:
            MENU.showMainMenu();
            break;

          case CODE.NEW_GAME:
            MENU.showNewGameOptions();
            break;

          case CODE.PLAY_MODE:
            MENU.showPlay();
            break;

          case CODE.PLAYER_SETUP:
            MENU.showPlayerSetup();
            break;

          case CODE.RANDOM_SUIT:
            // TODO - show an actual screen with animated suit randomizer
            $G.setSuitRandom();
            $G.initialize();
            MENU.main(CODE.PLAY_MODE);
            break;

          case CODE.RULES:
            MENU.showRules();
            break;

          case CODE.SCORING:
            MENU.showScoring();
            break;

          case CODE.SCORING_DETAIL:
            MENU.showScoringDetail();
            break;

          case CODE.SELECT_SUIT:
            MENU.showSelectSuit();
            break;

          case CODE.TODO:
            MENU.fnToDo();
        }
      }
      else {
        console.warn("WARNING - INVALID STATE");
      }
    },

    showDeck: function() {
      MENU.showTitle();

      console.log(MENU.helperBuildDeck());

      console.log(
        "OPTIONS:\n\n" +
        "1) Shuffle\n" +
        "2) Back (default)\n\n");
    },

    showHighScores: function() {
      var
        HS = $Y.HIGH_SCORES,
        SCORES = HS.DEVICE,
        i = 0,
        s = "HIGH SCORE: ",
        s_blank = "-      -";

      if (SCORES.length === 0)
        SCORES = HS.SESSION;

      s += (SCORES.length > 0 ? SCORES[0].SCORE : "0") + "\n\n";

      s += "RANK  SCORE  NAME\n" +
           "----  -----  ----\n" +
           "1ST   " + (SCORES.length > 0 ? (UTIL.pad(SCORES[0].SCORE, 5) + "  " + SCORES[0].NAME) : s_blank) + "\n" +
           "2ND   " + (SCORES.length > 1 ? (UTIL.pad(SCORES[1].SCORE, 5) + "  " + SCORES[1].NAME) : s_blank) + "\n" +
           "3RD   " + (SCORES.length > 2 ? (UTIL.pad(SCORES[2].SCORE, 5) + "  " + SCORES[2].NAME) : s_blank) + "\n";

      for (i = 3; i < HS.MAX_RECORDS; i++) {
        s += UTIL.pad((i + 1) + "TH", 6, " ", true) + (SCORES.length > i ? (UTIL.pad(SCORES[i].SCORE, 5) + "  " + SCORES[i].NAME) : s_blank) + "\n";
      }

      MENU.showTitle();
      console.log(s + "\n");

      console.log(
        "OPTIONS:\n\n" +
        "1) Reset High Scores\n" +
        "2) Back (default)\n\n");
    },

    showMainMenu: function() {
      MENU.showTitle();

      console.log(
        "MENU OPTIONS:\n\n" +
        "1) Play A New Game\n" +
        "2) Player Setup\n" +
        "3) Game Settings\n" +
        "4) High Scores\n" +
        "5) Rules\n" +
        "6) Scoring\n" +
        "7) Show Deck\n\n");
    },

    showNewGameOptions: function() {
      MENU.showTitle();

      console.log(
        "NEW GAME OPTIONS:\n\n" +
        "1) Random Trump Suit (default)\n" +
        "2) Select Suit (in the future, only available in developer mode)\n" +
        "3) Back\n\n");
    },

    showPlay: function() {
      var
        s,
        C = $Y.SCORECARD.CATEGORIES;

      MENU.showTitle();

      if ($T.DEVELOPER_MODE && $D.VISIBLE) {
        console.log(MENU.helperBuildDeck());
        console.log(MENU.helperBuildDiscards());
      }

      console.log(
        "TRUMP SUIT: " + UTIL.pad($G.TRUMP_SUIT, 17, ' ', true) +
        "DEALS: " + UTIL.pad($H.DEAL_COUNT + "/3", 21, ' ', true) +
        ($H.BUNCH_EXISTS ? "BUNCH" : "") + "\n\n" );

      MENU.helperShowPlayerList();

      console.log(
        MENU.helperShowHand() +
        "      -----------------------------------------------\n" +
        "       1   2   3   4   5   6   7   8   9   10  11  12  CARD #\n\n");

      console.log(
        "SCORE CARD:\n" +
        "\n1) " + MENU.helperShowCategory(C.NINES) + "                6) " + MENU.helperShowCategory(C.MARRIAGES) +
        "\n2) " + MENU.helperShowCategory(C.JACKS) + "                7) " + MENU.helperShowCategory(C.AROUND_240) +
        "\n3) " + MENU.helperShowCategory(C.QUEENS) + "                8) " + MENU.helperShowCategory(C.PINOCHLES) +
        "\n4) " + MENU.helperShowCategory(C.KINGS) + "                9) " + MENU.helperShowCategory(C.RUNS) +
        "\n5) " + MENU.helperShowCategory(C.ACES) + "               10) " + MENU.helperShowCategory(C.CHANCE) +
        "\n                                     11) " + MENU.helperShowCategory(C.YAHTZLE) +
        "\n\n     Upper:      " + MENU.helperShowCategory(C.UPPER) + "                     Lower:      " + MENU.helperShowCategory(C.LOWER) +
        "\n   " + MENU.helperShowCategory(C.BONUS) + "                   " + MENU.helperShowCategory(C.YAHTZLE_BONUS) +
        "\n\n                                           Total:      " + MENU.helperShowCategory(C.TOTAL) +
        "\n\nBonus¹ = " + $Y.SCOREBOX.BONUS_POINTS + ", if Upper Score > " + $Y.SCOREBOX.BONUS_MINIMUM_REQUIRED +
        "\nBonus² = 1500 for each additional Yahtzle" +
        "\n\nLEGEND: x = complete | o = possible | ~ = partial\n\n");

      s = "OPTIONS:\n\n";

      if ($T.DEVELOPER_MODE)
        s += "D code - Deal (DEVELOPER MODE)             G      - Get Hand Code (DEVELOPER MODE)\n";

      s += "D      - Deal                              B      - " + ($H.BUNCH_EXISTS ? "Bunch\n" : "Bunch (DISABLED)\n") +
           "#      - Keep/Discard One Card             T      - Keep/Discard All Cards\n" +
           "# L    - Move Card Left                    # R    - Move Card Right\n" +
           "# P    - Assign SCORING Points             # D    - Section Details\n" +
           "E      - Settings                          X      - Remix Discards: " + MENU.helperRemixOption() +
           "C      - Scoring                           R      - Rules\n" +
           "Q      - Quit Game                         N      - New Game\n" +
           "H      - Refresh Play Screen               K      - Show Deck: " + MENU.helperPlayDeckOption();

      console.log(s);

      MENU.helperGameOver();
    },

    showPlayerSetup: function() {
      MENU.showTitle();

      var
        P = $Y.PLAYER,
        i = 0,
        l = $G.PLAYERS.length,

        s = "PLAYER SETUP:\n\n" +
        "NUMBER OF PLAYERS: " + $G.PLAYER_COUNT + "\n\n" +
        "PLAYER #      TYPE      NAME\n" +
        "--------      ----      ----\n";

      for (; i < l; i++) {
        s += "Player " + (i + 1) +
          "      " + ($G.PLAYERS[i].type === P.TYPE.HUMAN ? "Human" : "CPU  ") +
          "     " + $G.PLAYERS[i].name + "\n";
      }

      console.log(s + "\n");

      console.log(
        "OPTIONS:\n\n" +
        "P #         - Specify Number of Players (1-4)\n" +
        "# H         - Set Player # to HUMAN\n" +
        "# C         - Set Player # to CPU\n" +
        "# N <name>  - Set NAME for Player #\n" +
        "X           - Exit Player Setup (default)\n\n");
    },

    showQuitVerify: function() {
      prompt_verify = true;
      MENU.showTitle();

      console.log(
        "Do you wish to quit the game currently in progress?\n\n" +
        "OPTIONS: Y/N\n\n");
    },

    showHighScoresResetVerify: function() {
      prompt_verify = true;
      MENU.showTitle();

      console.log(
        "Are you sure you want to reset the High Scores?\n\n" +
        "OPTIONS: Y/N\n\n");
    },

    // TODO - add more detail on rules
    showRules: function() {
      MENU.showTitle();

      console.log(
        "HOW TO PLAY YAHTZLE\n" +
        "TO DO..\n\n");

      console.log(
        "OPTIONS:\n\n" +
        "1) Scoring\n" +
        "2) Back (default)\n\n");
    },

    showScoring: function() {
      MENU.showTitle();

      console.log(
        "SCORING:\n\n" +
        "Category:                       Points:        Example:\n" +
        "------------------------        -------        -------------------------------\n" +
        "YAHTZLE Bonus²³                  1500          K♦ K♠ K♥ K♣ K♦ K♠ K♥ K♣\n" +
        "YAHTZLE²:                         750          9♦ 9♠ 9♥ 9♣ 9♦ 9♠ 9♥ 9♣\n" +
        "Double Run¹:                     1500          A♦ 10♦ K♦ Q♦ J♦ A♦ 10♦ K♦ Q♦ J♦\n" +
        "1000 Aces:                       1000          A♦ A♠ A♥ A♣ A♦ A♠ A♥ A♣\n" +
        "800 Kings:                        800          K♦ K♠ K♥ K♣ K♦ K♠ K♥ K♣\n" +
        "600 Queens:                       600          Q♦ Q♠ Q♥ Q♣ Q♦ Q♠ Q♥ Q♣\n" +
        "400 Jacks:                        400          J♦ J♠ J♥ J♣ J♦ J♠ J♥ H♣\n" +
        "Double Pinochle:                  300          Q♠ J♦ Q♠ J♦\n" +
        "Double Marriage¹:                 300          K♦ Q♦ K♦ Q♦\n" +
        "240 Around the Horn:              240          K♦ Q♦ K♠ Q♠ K♥ Q♥ K♣ Q♣\n" +
        "Run¹:                             150          A♦ 10♦ K♦ Q♦ J♦\n" +
        "100 Aces:                         100          A♦ A♠ A♥ A♣\n" +
        "80 Kings:                          80          K♦ K♠ K♥ K♣\n" +
        "6o Queens:                         60          Q♦ Q♠ Q♥ Q♣\n" +
        "40 Jacks:                          40          J♦ J♠ J♥ J♣\n" +
        "Pinochle:                          40          Q♠ J♦\n" +
        "Marriage¹:                         40          K♦ Q♦\n" +
        "Marriage:                          20          K♥ Q♥\n" +
        "Nine¹:                             10          9♦\n\n" +
        "¹ All examples use ♦ as the Trump suit\n" +
        "² YAHTZLE and YAHTZLE Bonus:\n" +
        "  - Require all 8 of any one face/value (i.e. all Aces, Tens, etc.)\n" +
        "  - Are special score categories that don't exist in the actual game of Pinochle,\n" +
        "    and as such don't count toward CHANCE composite score category.\n" +
        "³ YAHTZLE Bonus requires scoring in the YAHTZLE category first\n\n");

      console.log(
        "OPTIONS:\n\n" +
        "1) Rules\n" +
        "2) Back (default)\n\n");
    },

    showScoringDetail: function() {
      var
        SCORE_TYPE = {
          NONE: 0,
          PARTIAL: 1,
          POSSIBLE: 2,
          SCORE: 3
        },

        i = 0,
        l = 0,
        CARDS = null,
        categories = $Y.SCORECARD.CATEGORIES,
        category = null,
        scorecard = $G.currentPlayer().scorecard,
        scoreType = SCORE_TYPE.NONE,
        scoreTypeLabel = "NONE",
        showCards = MENU.helperShowCards;

      MENU.showTitle();

      switch(MENU.DETAIL_SECTION) {
        case categories.NINES:
          category = scorecard.NINES;
          CARDS = $B.SECTION.NINES;
          break;

        case categories.JACKS:
          category = scorecard.JACKS;
          CARDS = $B.SECTION.JACKS;
          break;

        case categories.QUEENS:
          category = scorecard.QUEENS;
          CARDS = $B.SECTION.QUEENS;
          break;

        case categories.KINGS:
          category = scorecard.KINGS;
          CARDS = $B.SECTION.KINGS;
          break;

        case categories.ACES:
          category = scorecard.ACES;
          CARDS = $B.SECTION.ACES;
          break;

        case categories.MARRIAGES:
          category = scorecard.MARRIAGES;
          CARDS = $B.SECTION.MARRIAGES;
          break;

        case categories.AROUND_240:
          category = scorecard.AROUND_240;
          CARDS = $B.SECTION.AROUND_240;
          break;

        case categories.PINOCHLES:
          category = scorecard.PINOCHLES;
          CARDS = $B.SECTION.PINOCHLES;
          break;

        case categories.RUNS:
          category = scorecard.RUNS;
          CARDS = $B.SECTION.RUNS;
          break;

        case categories.CHANCE:
          category = scorecard.CHANCE;
          CARDS = $B.SECTION.CHANCE;
          break;

        case categories.YAHTZLE:
          category = scorecard.YAHTZLE;
          CARDS = $B.SECTION.YAHTZLE;
      }

      // determine what type of score is being handled
      // - SCORE_TYPE.SCORE = scorecard "recorded" data
      // - or score box "live" data for the current hand
      if (UTIL.isInteger(category.SCORE)) {
        scoreType = SCORE_TYPE.SCORE;
        scoreTypeLabel = "SCORE";
      }
      else if (UTIL.isInteger(category.POSSIBLE) && category.POSSIBLE > 0) {
        scoreType = SCORE_TYPE.POSSIBLE;
        scoreTypeLabel = "POSSIBLE MATCH";
      }
      else {
        for (i = 0, l = CARDS.length; i < l; i++) {
          if (CARDS[i].category === $B.STATUS.CAUTION) {
            scoreType = SCORE_TYPE.PARTIAL;
            scoreTypeLabel = "PARTIAL MATCH";
            break;
          }
        }
      }

      console.log(
        "SCORING DETAIL: " + MENU.DETAIL_SECTION + (MENU.DETAIL_SECTION === categories.YAHTZLE ? " + BONUSES" : "" ) + "\n\n" +
        "TYPE: " + UTIL.pad(scoreTypeLabel, 22, " ", true) + "TRUMP SUIT: " + $G.TRUMP_SUIT + "\n\n" +
        "HAND: " + showCards(scoreType === SCORE_TYPE.SCORE ? category.HAND : $H.CARDS) + "\n\n");

      if (scoreType !== SCORE_TYPE.NONE) {
        var s = "SCORING CATEGORY:               POINTS:   CARDS:\n" +
                "-----------------------------   -------   ----------------------------------------------------\n";

        if (MENU.DETAIL_SECTION === categories.YAHTZLE) {
          var total = $B.YAHTZLE_POINTS;

          s += UTIL.pad("YAHTZLE", 32, " ", true);

          if (scoreType === SCORE_TYPE.SCORE) {
            // yahtzle
            s += UTIL.pad(category.SCORE, 7) + "   " +
            showCards(category.SECTION) + "\n";

            // yahtzle bonuses (SCORED)
            category = scorecard.YAHTZLE_BONUS;
            l = category.SECTION.length;

            for (i = 0; i < l; i++) {
              total += $B.YAHTZLE_BONUS_POINTS;

              s += UTIL.pad("YAHTZLE BONUS", 32, " ", true) +
                UTIL.pad($B.YAHTZLE_BONUS_POINTS, 7) + "   " +
                showCards(category.SECTION[i]) + "\n";
            }

            // display running total
            s += "-----------------------------   -------\n" +
              UTIL.pad("TOTAL SCORE", 32, " ", true) + UTIL.pad(total, 7) + "\n";

            // yahtzle bonuses (POSSIBLE w/ current hand)
            if (UTIL.isInteger(category.POSSIBLE) && (category.SCORE === null || category.POSSIBLE > category.SCORE)) {
              total += $B.YAHTZLE_BONUS_POINTS;

              s += "\n" + UTIL.pad("+YAHTZLE BONUS (POSSIBLE)", 32, " ", true) +
                UTIL.pad($B.YAHTZLE_BONUS_POINTS, 7) + "   " +
                showCards($B.SECTION.YAHTZLE) + "\n";

              // display running total
              s += "-----------------------------   -------\n" +
                UTIL.pad("TOTAL SCORE (POSSIBLE)", 32, " ", true) + UTIL.pad(total, 7) + "\n";
            }
          }
          else {
            s += UTIL.pad(category.POSSIBLE, 7) + "   " +
            showCards($B.SECTION.YAHTZLE) + "\n" +
            "-----------------------------   -------\n" +
            UTIL.pad("TOTAL SCORE", 32, " ", true) + UTIL.pad(total, 7) + "\n";
          }

          console.log(s + "\n");
        }
        else {
          var
            score = null,
            keys = Object.keys($B.SCORING);

          // SCORING category match
          switch(scoreType) {
            case SCORE_TYPE.SCORE:
            case SCORE_TYPE.POSSIBLE:
              for (i = 0, l = category.SCORING.length; i < l; i++) {
                score = $B.SCORING[keys[category.SCORING[i].ID]];

                s += UTIL.pad(score.TITLE, 32, " ", true) +
                  UTIL.pad(score.POINTS, 7) + "   " +
                  showCards(scoreType === SCORE_TYPE.SCORE ? category.SCORING[i].CARDS : score.CARDS) + "\n";
              }

              s += "-----------------------------   -------\n" +
                UTIL.pad("TOTAL SCORE", 32, " ", true) + UTIL.pad(category.POSSIBLE, 7) + "\n\n";

            console.log(s);
          }


          // CATEGORY CARDS (SCORING + NON-SCORING)
          switch(scoreType) {
            case SCORE_TYPE.SCORE:
            case SCORE_TYPE.POSSIBLE:
            case SCORE_TYPE.PARTIAL:
              CARDS = (scoreType === SCORE_TYPE.SCORE ? category.SECTION : CARDS).filter(function(card) {
                return UTIL.isInteger(card.id);
              });

              console.log(
                "CATEGORY CARDS (SCORING + NON-SCORING):\n" +
                "----------------------------------------------------------------------------------------------\n" +
                showCards(CARDS) + "\n\n");
          }
        }
      }

      console.log(
        "OPTIONS:\n\n" +
        "1) Display Card ID: " + ($T.DISPLAY_CARD_ID ? "ON\n" : "OFF\n") +
        "2) Back (default)\n\n");
    },

    showSelectSuit: function() {
      MENU.showTitle();

      console.log(
        "SELECT A SUIT:\n\n" +
        "1) ♦ DIAMONDS\n" +
        "2) ♠ SPADES\n" +
        "3) ♥ HEARTS\n" +
        "4) ♣ CLUBS\n" +
        "5) Back\n\n");
    },

    showSettings: function() {
      MENU.showTitle();

      console.log(
        "GAME SETTINGS:\n\n" +
        "1) Developer Mode: " + ($T.DEVELOPER_MODE ? "ON\n" : "OFF\n") +
        "2) Display Card ID (Detail View): " + ($T.DISPLAY_CARD_ID ? "ON\n" : "OFF\n") +
        "3) Show Deck: " + MENU.helperDeckOption() +
        "4) Double Marriage Value: " + $T.DOUBLE_MARRIAGE.getValue() + ($G.IN_PROGRESS ? " (DISABLED WHILE GAME IS IN-PROGRESS)\n" : "\n") +
        "5) New Cards Initial State: " + ($H.DISCARD_NEW ? "DISCARD\n" : "KEEP\n") +
        "6) Remix Discards Back into the Deck: " + ($H.REMIX_DISCARDS ? "ON\n" : "OFF\n") +
        "7) Back (default)\n\n");
    },

    showTitle: function() {
      console.clear();
      console.log("%cYAHTZLE%c Logic Program\n\n", CSS.FONT_BOLD, CSS.FONT_NORMAL);
    }
  };

window.addEventListener("load", function() {
  text_data = $id("text_data");

  $id("input_area").addEventListener("submit", function(e) {
    e.preventDefault();
    INPUT.main();
    return false;
  });

  $id("main").addEventListener("click", function() {
    text_data.focus();
  });

  text_data.focus();
  MENU.main(CODE.MAIN_MENU);
  $Y.initialize();
});