/**
 * Rules / Scoring: https://en.wikipedia.org/wiki/Pinochle
 */

var
  $id = document.getElementById.bind(document), // alias to document.getElementById()
  $CSS = document.querySelectorAll.bind(document),

  UTIL = {
    // get a random integer between min/max inclusive
    getRandom: function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // check if variable is an integer
    isInteger: function(n) {
      return (!isNaN(n) && n === (n | 0));
    }
  },

  CARD = {
    SUITS: {
      HEARTS: "&hearts;",
      CLUBS: "&clubs;",
      DIAMONDS: "&diams;",
      SPADES: "&spades;"
    },

    VALUES: {
      ACE: "A",
      TEN: "10",
      KING: "K",
      QUEEN: "Q",
      JACK: "J",
      NINE: "9"
    },

    copy: function(card) {
      return CARD.create(card.value, card.suit, card.id);
    },

    create: function(value, suit, id) {
      function card(value, suit, id) {
        this.value = value;
        this.suit = suit;
        this.id = id;
      }

      return new card(value, suit, id);
    }
  },

  YAHTZLE = {
    DECK: [],

    // temp "buckets" for shuffling
    SPLIT_1: [],
    SPLIT_2: [],

    HAND: [],

    // keep track of # draws
    DEAL_MAX: 3,
    DEAL_COUNT: 0,

    // track # cards discarded
    DISCARD_COUNT: 0,

    // chunk sizes when shuffling
    CHUNK_MIN: 1,
    CHUNK_MAX: 4,

    HAND_SIZE: 12,
    BUNCH_COUNT: 5,

    TRUMP: null,

    ROLY_POLY_SCORING: true,

    SCORING: {
      DOUBLE_RUN_DIAMONDS: {
        SET: false,
        POINTS: 1500,
        ID: 0
      },
      DOUBLE_RUN_SPADES: {
        SET: false,
        POINTS: 1500,
        ID: 1
      },
      DOUBLE_RUN_HEARTS: {
        SET: false,
        POINTS: 1500,
        ID: 2
      },
      DOUBLE_RUN_CLUBS: {
        SET: false,
        POINTS: 1500,
        ID: 3
      },
      ACES_1000: {
        SET: false,
        POINTS: 1000,
        ID: 4
      },
      KINGS_800: {
        SET: false,
        POINTS: 800,
        ID: 5
      },
      QUEENS_600: {
        SET: false,
        POINTS: 600,
        ID: 6
      },
      JACKS_400: {
        SET: false,
        POINTS: 400,
        ID: 7
      },
      DOUBLE_PINOCHLE: {
        SET: false,
        POINTS: 300,
        ID: 8
      },
      DOUBLE_MARRIAGE_DIAMONDS: {
        SET: false,
        POINTS: 300,
        ID: 9
      },
      DOUBLE_MARRIAGE_SPADES: {
        SET: false,
        POINTS: 300,
        ID: 10
      },
      DOUBLE_MARRIAGE_HEARTS: {
        SET: false,
        POINTS: 300,
        ID: 11
      },
      DOUBLE_MARRIAGE_CLUBS: {
        SET: false,
        POINTS: 300,
        ID: 12
      },
      AROUND_240: {
        SET: false,
        POINTS: 240,
        ID: 13
      },
      RUN_DIAMONDS: {
        SET: false,
        POINTS: 150,
        ID: 14
      },
      RUN_SPADES: {
        SET: false,
        POINTS: 150,
        ID: 15
      },
      RUN_HEARTS: {
        SET: false,
        POINTS: 150,
        ID: 16
      },
      RUN_CLUBS: {
        SET: false,
        POINTS: 150,
        ID: 17
      },
      ACES_100: {
        SET: false,
        POINTS: 100,
        ID: 18
      },
      KINGS_80: {
        SET: false,
        POINTS: 80,
        ID: 19
      },
      QUEENS_60: {
        SET: false,
        POINTS: 60,
        ID: 20
      },
      JACKS_40: {
        SET: false,
        POINTS: 40,
        ID: 21
      },
      PINOCHLE: {
        SET: false,
        POINTS: 40,
        ID: 22
      },
      MARRIAGE_TRUMP_DIAMONDS: {
        SET: false,
        POINTS: 40,
        ID: 23
      },
      MARRIAGE_TRUMP_SPADES: {
        SET: false,
        POINTS: 40,
        ID: 24
      },
      MARRIAGE_TRUMP_HEARTS: {
        SET: false,
        POINTS: 40,
        ID: 25
      },
      MARRIAGE_TRUMP_CLUBS: {
        SET: false,
        POINTS: 40,
        ID: 26
      },
      MARRIAGE_DIAMONDS_1: {
        SET: false,
        POINTS: 20,
        ID: 27
      },
      MARRIAGE_DIAMONDS_2: {
        SET: false,
        POINTS: 20,
        ID: 28
      },
      MARRIAGE_SPADES_1: {
        SET: false,
        POINTS: 20,
        ID: 29
      },
      MARRIAGE_SPADES_2: {
        SET: false,
        POINTS: 20,
        ID: 30
      },
      MARRIAGE_HEARTS_1: {
        SET: false,
        POINTS: 20,
        ID: 31
      },
      MARRIAGE_HEARTS_2: {
        SET: false,
        POINTS: 20,
        ID: 32
      },
      MARRIAGE_CLUBS_1: {
        SET: false,
        POINTS: 20,
        ID: 33
      },
      MARRIAGE_CLUBS_2: {
        SET: false,
        POINTS: 20,
        ID: 34
      },
      NINE_TRUMP_1: {
        SET: false,
        POINTS: 10,
        ID: 35
      },
      NINE_TRUMP_2: {
        SET: false,
        POINTS: 10,
        ID: 36
      }
    },

    CHANCE_MAPS: {
      CATEGORY_COUNT: 37,

      // mimic 2D array: array[row][column] = array[row * cols + col]
      // lookup determines # of cards gained when combining 2 score categories
      // - NOTE: chance function only looks at -2, -1; cards from SCORE_BOX are used instead of #cards gained -- this allows better re-use; while extra data is unnecessay, it's here
      // -1 denotes that the combination does not exist
      // -2 denotes a lookup "mirror", as 1/2 the array mirrors the other side and row ID / column ID should be switched; this mirror saves repeating many values (error-prone)
      //D   E   F   G   H   I   J   K   L   M   N   O   P   Q   R   S   T   U   V   W   X   Y   Z   AA  AB  AC  AD  AE  AF  AG  AH  AI  AJ  AK  AL  AM  AN
      //0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19  20  21  22  23  24  25  26  27  28  29  30  31  32  33  34  35  36
      GAIN: [
        -1, -1, -1, -1,  6,  6,  6,  6,  2, -1, -1, -1, -1,  6, -1, -1, -1, -1,  3,  3,  3,  3,  1, -1, -1, -1, -1, -1, -1,  2,  4,  2,  4,  2,  4,  1,  2, // 3  0
        -2, -1, -1, -1,  6,  6,  6,  6,  2, -1, -1, -1, -1,  6, -1, -1, -1, -1,  3,  3,  3,  3,  1, -1, -1, -1, -1,  2,  4, -1, -1,  2,  4,  2,  4,  1,  2, // 4  1
        -2, -2, -1, -1,  6,  6,  6,  6,  4, -1, -1, -1, -1,  6, -1, -1, -1, -1,  3,  3,  3,  3,  2, -1, -1, -1, -1,  2,  4,  2,  4, -1, -1,  2,  4,  1,  2, // 5  2
        -2, -2, -2, -1,  6,  6,  6,  6,  4, -1, -1, -1, -1,  6, -1, -1, -1, -1,  3,  3,  3,  3,  2, -1, -1, -1, -1,  2,  4,  2,  4,  2,  4, -1, -1,  1,  2, // 6  3
        -2, -2, -2, -2, -1,  8,  8,  8,  4,  4,  4,  4,  4,  8,  4,  4,  4,  4, -1,  4,  4,  4,  2,  2,  2,  2,  2,  2,  4,  2,  4,  2,  4,  2,  4,  1,  2, // 7  4
        -2, -2, -2, -2, -2, -1,  8,  8,  4,  2,  2,  2,  2,  4,  4,  4,  4,  4,  4, -1,  4,  4,  2,  1,  1,  1,  1,  1,  3,  1,  3,  1,  3,  1,  3,  1,  2, // 8  5
        -2, -2, -2, -2, -2, -2, -1,  8,  2,  2,  2,  2,  2,  4,  4,  4,  4,  4,  4,  4, -1,  4,  1,  1,  1,  1,  1,  1,  3,  1,  3,  1,  3,  1,  3,  1,  2, // 9  6
        -2, -2, -2, -2, -2, -2, -2, -1,  2,  4,  4,  4,  4,  8,  4,  4,  4,  4,  4,  4,  4, -1,  1,  2,  2,  2,  2,  2,  4,  2,  4,  2,  4,  2,  4,  1,  2, // 10 7
        -2, -2, -2, -2, -2, -2, -2, -2, -1,  4,  2,  4,  4,  7,  4,  4,  5,  5,  4,  4,  3,  3, -1,  2,  1,  2,  2,  2,  4,  1,  3,  2,  4,  2,  4,  1,  2, // 11 8
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -1, -1, -1, -1,  6,  3,  5,  5,  5,  4,  3,  3,  4,  2, -1, -1, -1, -1, -1, -1,  2,  4,  2,  4,  2,  4,  1,  2, // 12 9
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -1, -1, -1,  6,  5,  3,  5,  5,  4,  3,  3,  4,  1, -1, -1, -1, -1,  2,  4, -1, -1,  2,  4,  2,  4,  1,  2, // 13 10
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -1, -1,  6,  5,  5,  3,  5,  4,  3,  3,  4,  2, -1, -1, -1, -1,  2,  4,  2,  4, -1, -1,  2,  4,  1,  2, // 14 11
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -1,  6,  5,  5,  5,  3,  4,  3,  3,  4,  2, -1, -1, -1, -1,  2,  4,  2,  4,  2,  4, -1, -1,  1,  2, // 15 12
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2,  8,  3,  3,  3,  3,  4, -1, -1,  4,  1, -1, -1, -1, -1, -1,  2, -1,  2, -1,  2, -1,  2,  1,  2, // 16 13
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -1, -1, -1, -1,  3,  3,  3,  3,  1, -1, -1, -1, -1, -1,  2,  2,  4,  2,  4,  2,  4,  1,  2, // 17 14
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -1, -1, -1,  3,  3,  3,  3,  1, -1, -1, -1, -1,  2,  4, -1,  2,  2,  4,  2,  4,  1,  2, // 18 15
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -1, -1,  3,  3,  3,  3,  2, -1, -1, -1, -1,  2,  4,  2,  4, -1,  2,  2,  4,  1,  2, // 19 16
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -1,  3,  3,  3,  3,  2, -1, -1, -1, -1,  2,  4,  2,  4,  2,  4, -1,  2,  1,  2, // 20 17
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -1,  4,  4,  4,  2,  2,  2,  2,  2,  2,  4,  2,  4,  2,  4,  2,  4,  1,  2, // 21 18
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -1,  4,  4,  2,  1,  1,  1,  1,  1,  4,  1,  4,  1,  4,  1,  4,  1,  2, // 22 19
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -1,  4,  1,  1,  1,  1,  1,  1,  4,  1,  4,  1,  4,  1,  4,  1,  2, // 23 20
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -1,  1,  2,  2,  2,  2,  2,  4,  2,  4,  2,  4,  2,  4,  1,  2, // 24 21
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -1,  2,  1,  2,  2,  2,  4,  1,  4,  2,  4,  2,  4,  1,  2, // 25 22
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -1, -1, -1, -1, -1, -1,  2,  4,  2,  4,  2,  4,  1,  2, // 26 23
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -1, -1, -1,  2,  4, -1, -1,  2,  4,  2,  4,  1,  2, // 27 24
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -1, -1,  2,  4,  2,  4, -1, -1,  2,  4,  1,  2, // 28 25
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -1,  2,  4,  2,  4,  2,  4, -1, -1,  1,  2, // 29 26
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -1,  4,  2,  4,  2,  4,  2,  4,  1,  2, // 30 27
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -1,  2,  4,  2,  4,  2,  4,  1,  2, // 31 28
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -1,  4,  2,  4,  2,  4,  1,  2, // 32 29
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -1,  2,  4,  2,  4,  1,  2, // 33 30
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -1,  4,  2,  4,  1,  2, // 34 31
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -1,  2,  4,  1,  2, // 35 32
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -1,  4,  1,  2, // 36 33
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -1,  1,  2, // 37 34
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -1,  1, // 38 35
        -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -1  // 39 36
      ],
      //0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19  20  21  22  23  24  25  26  27  28  29  30  31  32  33  34  35  36
      //D   E   F   G   H   I   J   K   L   M   N   O   P   Q   R   S   T   U   V   W   X   Y   Z   AA  AB  AC  AD  AE  AF  AG  AH  AI  AJ  AK  AL  AM  AN

      cardGain: function(row, column) {
        // return YAHTZLE.CHANCE_MAP.CARDS_GAINED[row * YAHTZLE.CHANCE_MAP.COLUMN_COUNT + column];
        var result = this.GAIN[row * this.CATEGORY_COUNT + column];

        // -2 denotes a lookup "mirror", as 1/2 the array mirrors the other side and row ID / column ID should be switched
        if (result !== -2) {
          return result;
        }
        else {
          return this.GAIN[column * this.CATEGORY_COUNT + row];
        }
      }
    },

    // card arrays required for score matching once the trump suit is specified
    SCORE_BOX: {
      NINES: {
        CARDS: null,
        SCORE: null,
        POSSIBLE: null
      },
      JACKS: {
        CARDS: null,
        SCORE: null,
        POSSIBLE: null
      },
      QUEENS: {
        CARDS: null,
        SCORE: null,
        POSSIBLE: null
      },
      KINGS: {
        CARDS: null,
        SCORE: null,
        POSSIBLE: null
      },
      ACES: {
        CARDS: null,
        SCORE: null,
        POSSIBLE: null
      },
      MARRIAGES: {
        CARDS: null,
        MATCH_TEMPLATE: null, // potential marriage pairs in order
        SCORE: null,
        POSSIBLE: null
      },
      SCORE_240: {
        CARDS: null,
        SCORE: null,
        POSSIBLE: null
      },
      PINOCHLES: {
        CARDS: null,
        SCORE: null,
        POSSIBLE: null
      },
      RUNS: {
        CARDS: null,
        SCORE: null,
        POSSIBLE: null
      },
      CHANCE: {
        CARDS: null,
        SCORE: null,
        POSSIBLE: null
      },
      BONUS: {
        SCORE: null,
        POSSIBLE: 300
      },
      TOTAL: 0
    },

    // # sections assigned a score in a game session
    SCORES_COUNTER: 0,
    SCORES_COUNTER_MAX: 10,

    // card matching categories -- utilized to categorize CARDS in SCORE_BOX
    SCORE_CATEGORY: {
      CAUTION: 1,
      PROCEED: 2,
      MATCH: 3
    },

    // TODO - add as option; game must restarted
    adjustDoubleMarriage: function() {
      var S = YAHTZLE.SCORING;

      S.DOUBLE_MARRIAGE_CLUBS.POINTS
      = S.DOUBLE_MARRIAGE_DIAMONDS.POINTS
      = S.DOUBLE_MARRIAGE_HEARTS.POINTS
      = S.DOUBLE_MARRIAGE_SPADES.POINTS = (YAHTZLE.ROLY_POLY_SCORING === true ? 300 : 80);
    },

    helperBuildChance: function(flag, category) {
      if (flag === false) {
        var
          SC = YAHTZLE.SCORE_CATEGORY,
          CHANCE = YAHTZLE.SCORE_BOX.CHANCE,
          i = 0,
          // j = 0,
          l = category.CARDS.length,
          // l2 = 0,
          card = null;

        for (i = 0; i < l; i++) {
          card = category.CARDS[i];

          if (card.category === SC.PROCEED || card.category === SC.MATCH) {
            // bug fix: when combining score categories for chance, some duplicate cards may exist. replace the alternate if possible.
            // for (j = 0, l2 = CHANCE.CARDS.length; j < l2; j++) {
            //   if (card.id === CHANCE.CARDS[j]) { // duplicate already exists, find the alternate
            //     // MARK C - chance duplicates
            //     break;
            //   }
            // }

            card = CARD.copy(card);
            card.category = SC.PROCEED;
            CHANCE.CARDS.push(card);
          }
        }

        CHANCE.POSSIBLE += category.POSSIBLE;

        return true;
      }
      else {
        return flag;
      }
    },

    helperMatchMixed: function(scoring) {
      var
        i = 0,
        j = 0,
        l_hand = YAHTZLE.HAND_SIZE,
        l_scoring = scoring.length,
        hand = YAHTZLE.HAND;

      // reset each scoring card category
      YAHTZLE.helperResetScorebox(scoring);

      // find matches between the dealt hand and scoring category - designate non-scoring matches
      for (i = 0; i < l_hand; i++) {
        for (j = 0; j < l_scoring; j++) {
          if (!scoring[j].category && hand[i].value === scoring[j].value && hand[i].suit === scoring[j].suit) {
            scoring[j].category = YAHTZLE.SCORE_CATEGORY.CAUTION;
            scoring[j].id = hand[i].id;
            scoring[j].discard = (hand[i].discard === true);
            break;
          }
        }
      }
    },

    helperMatchValue: function(match, scoring) {
      var
        i = 0,
        j = 0,
        l_hand = YAHTZLE.HAND_SIZE,
        l_scoring = scoring.length,
        hand = YAHTZLE.HAND;

      // reset each scoring card category
      YAHTZLE.helperResetScorebox(scoring);

      // find matches between the dealt hand and scoring category - designate non-scoring matches
      for (i = 0; i < l_hand; i++) {
        if (hand[i].value === match) {
          for (j = 0; j < l_scoring; j++) {
            if (!scoring[j].category && hand[i].suit === scoring[j].suit) {
              scoring[j].category = YAHTZLE.SCORE_CATEGORY.CAUTION;
              scoring[j].id = hand[i].id;
              scoring[j].discard = (hand[i].discard === true);
              break;
            }
          }
        }
      }
    },

    helperResetScorebox: function(scoring) {
      for (var i = 0, l = scoring.length; i < l; i++) {
        if (scoring[i].category) {
          delete scoring[i].category;
          scoring[i].id = undefined;
        }
      }
    },

    initialize: function() {
      var
        id = 0,
        i = 0,
        j = null,
        k = null;

      YAHTZLE.DEAL_LOCK = false;
      YAHTZLE.DEAL_COUNT = YAHTZLE.DISCARD_COUNT = YAHTZLE.SCORES_COUNTER = 0;

      // re-initialize card "buckets"
      YAHTZLE.HAND = [];
      YAHTZLE.DECK = [];

      for (; i < 2; i++) {
        for (j in CARD.SUITS) {
          for (k in CARD.VALUES) {
            YAHTZLE.DECK.push(CARD.create(CARD.VALUES[k], CARD.SUITS[j], id++));
          }
        }
      }
    },

    initScorebox: function() {
      function initFace(arr, value) {
        for (var i = 0; i < 2; i++) {
          for (var j in CARD.SUITS) {
            arr.push(CARD.create(value, CARD.SUITS[j]));
          }
        }
      }

      function initEmpties(arr, n) {
        for (var i = 0; i < n; i++) {
          arr.push(CARD.create(null, null));
        }
      }

      var
        i = 0,
        j = 0,
        arr = null;

      initEmpties(this.SCORE_BOX.NINES.CARDS = [], 1);
      initFace(this.SCORE_BOX.JACKS.CARDS = [], CARD.VALUES.JACK);
      initFace(this.SCORE_BOX.QUEENS.CARDS = [], CARD.VALUES.QUEEN);
      initFace(this.SCORE_BOX.KINGS.CARDS = [], CARD.VALUES.KING);
      initFace(this.SCORE_BOX.ACES.CARDS = [], CARD.VALUES.ACE);

      // marriages
      initEmpties(this.SCORE_BOX.MARRIAGES.CARDS = [], 1);
      arr = this.SCORE_BOX.MARRIAGES.MATCH_TEMPLATE = [];

      for (i = 0; i < 2; i++) {
        for (j in CARD.SUITS) {
          arr.push(CARD.create(CARD.VALUES.KING, CARD.SUITS[j]));
          arr.push(CARD.create(CARD.VALUES.QUEEN, CARD.SUITS[j]));
        }
      }

      // 240 around the house
      arr = this.SCORE_BOX.SCORE_240.CARDS = [];

      for (i in CARD.SUITS) {
        arr.push(CARD.create(CARD.VALUES.KING, CARD.SUITS[i]));
        arr.push(CARD.create(CARD.VALUES.QUEEN, CARD.SUITS[i]));
      }

      // yahtzle
      arr = this.SCORE_BOX.PINOCHLES.CARDS = [];

      arr.push(CARD.create(CARD.VALUES.QUEEN, CARD.SUITS.SPADES));
      arr.push(CARD.create(CARD.VALUES.JACK, CARD.SUITS.DIAMONDS));
      arr.push(CARD.create(CARD.VALUES.QUEEN, CARD.SUITS.SPADES));
      arr.push(CARD.create(CARD.VALUES.JACK, CARD.SUITS.DIAMONDS));

      initEmpties(this.SCORE_BOX.RUNS.CARDS = [], 1);
      initEmpties(this.SCORE_BOX.CHANCE.CARDS = [], 1);
    },

    matchNines: function() {
      var
        NINES = YAHTZLE.SCORE_BOX.NINES,
        CARDS = NINES.CARDS,
        SCORING = YAHTZLE.SCORING,
        CATEGORY = YAHTZLE.SCORE_CATEGORY;

      YAHTZLE.helperMatchValue(CARD.VALUES.NINE, CARDS);

      if (CARDS[0].category === CATEGORY.CAUTION) {
        CARDS[0].category = CATEGORY.PROCEED;
        NINES.POSSIBLE = SCORING.NINE_TRUMP_1.POINTS;
        SCORING.NINE_TRUMP_1.SET = true;

        if (CARDS[1].category === CATEGORY.CAUTION) {
          CARDS[1].category = CATEGORY.PROCEED;
          NINES.POSSIBLE += SCORING.NINE_TRUMP_2.POINTS;
          SCORING.NINE_TRUMP_2.SET = true;
        }
      }
      else {
        NINES.POSSIBLE = 0;
      }
    },

    matchJacks: function() {
      var
        JACKS = YAHTZLE.SCORE_BOX.JACKS,
        CARDS = JACKS.CARDS,
        SCORING = YAHTZLE.SCORING,
        CATEGORY = YAHTZLE.SCORE_CATEGORY;

      YAHTZLE.helperMatchValue(CARD.VALUES.JACK, CARDS);

      if (CARDS[0].category === CATEGORY.CAUTION
        && CARDS[1].category === CATEGORY.CAUTION
        && CARDS[2].category === CATEGORY.CAUTION
        && CARDS[3].category === CATEGORY.CAUTION) {

        CARDS[0].category = CARDS[1].category = CARDS[2].category = CARDS[3].category = CATEGORY.PROCEED;

        if (CARDS[4].category === CATEGORY.CAUTION
          && CARDS[5].category === CATEGORY.CAUTION
          && CARDS[6].category === CATEGORY.CAUTION
          && CARDS[7].category === CATEGORY.CAUTION) {

          CARDS[4].category = CARDS[5].category = CARDS[6].category = CARDS[7].category = CATEGORY.PROCEED;
          JACKS.POSSIBLE = SCORING.JACKS_400.POINTS;
          SCORING.JACKS_400.SET = true;
        }
        else {
          JACKS.POSSIBLE = SCORING.JACKS_40.POINTS;
          SCORING.JACKS_40.SET = true;
        }
      }
      else {
        JACKS.POSSIBLE = 0;
      }
    },

    matchQueens: function() {
      var
        QUEENS = YAHTZLE.SCORE_BOX.QUEENS,
        CARDS = QUEENS.CARDS,
        SCORING = YAHTZLE.SCORING,
        CATEGORY = YAHTZLE.SCORE_CATEGORY;

      YAHTZLE.helperMatchValue(CARD.VALUES.QUEEN, CARDS);

      if (CARDS[0].category === CATEGORY.CAUTION
        && CARDS[1].category === CATEGORY.CAUTION
        && CARDS[2].category === CATEGORY.CAUTION
        && CARDS[3].category === CATEGORY.CAUTION) {

        CARDS[0].category = CARDS[1].category = CARDS[2].category = CARDS[3].category = CATEGORY.PROCEED;

        if (CARDS[4].category === CATEGORY.CAUTION
          && CARDS[5].category === CATEGORY.CAUTION
          && CARDS[6].category === CATEGORY.CAUTION
          && CARDS[7].category === CATEGORY.CAUTION) {

          CARDS[4].category = CARDS[5].category = CARDS[6].category = CARDS[7].category = CATEGORY.PROCEED;
          QUEENS.POSSIBLE = SCORING.QUEENS_600.POINTS;
          SCORING.QUEENS_600.SET = true;
        }
        else {
          QUEENS.POSSIBLE = SCORING.QUEENS_60.POINTS;
          SCORING.QUEENS_60.SET = true;
        }
      }
      else {
        QUEENS.POSSIBLE = 0;
      }
    },

    matchKings: function() {
      var
        KINGS = YAHTZLE.SCORE_BOX.KINGS,
        CARDS = KINGS.CARDS,
        SCORING = YAHTZLE.SCORING,
        CATEGORY = YAHTZLE.SCORE_CATEGORY;

      YAHTZLE.helperMatchValue(CARD.VALUES.KING, CARDS);

      if (CARDS[0].category === CATEGORY.CAUTION
        && CARDS[1].category === CATEGORY.CAUTION
        && CARDS[2].category === CATEGORY.CAUTION
        && CARDS[3].category === CATEGORY.CAUTION) {

        CARDS[0].category = CARDS[1].category = CARDS[2].category = CARDS[3].category = CATEGORY.PROCEED;

        if (CARDS[4].category === CATEGORY.CAUTION
          && CARDS[5].category === CATEGORY.CAUTION
          && CARDS[6].category === CATEGORY.CAUTION
          && CARDS[7].category === CATEGORY.CAUTION) {

          CARDS[4].category = CARDS[5].category = CARDS[6].category = CARDS[7].category = CATEGORY.PROCEED;
          KINGS.POSSIBLE = SCORING.KINGS_800.POINTS;
          SCORING.KINGS_800.SET = true;
        }
        else {
          KINGS.POSSIBLE = SCORING.KINGS_80.POINTS;
          SCORING.KINGS_80.SET = true;
        }
      }
      else {
        KINGS.POSSIBLE = 0;
      }
    },

    matchAces: function() {
      var
        ACES = YAHTZLE.SCORE_BOX.ACES,
        CARDS = ACES.CARDS,
        SCORING = YAHTZLE.SCORING,
        CATEGORY = YAHTZLE.SCORE_CATEGORY;

      YAHTZLE.helperMatchValue(CARD.VALUES.ACE, CARDS);

      if (CARDS[0].category === CATEGORY.CAUTION
        && CARDS[1].category === CATEGORY.CAUTION
        && CARDS[2].category === CATEGORY.CAUTION
        && CARDS[3].category === CATEGORY.CAUTION) {

        CARDS[0].category = CARDS[1].category = CARDS[2].category = CARDS[3].category = CATEGORY.PROCEED;

        if (CARDS[4].category === CATEGORY.CAUTION
          && CARDS[5].category === CATEGORY.CAUTION
          && CARDS[6].category === CATEGORY.CAUTION
          && CARDS[7].category === CATEGORY.CAUTION) {

          CARDS[4].category = CARDS[5].category = CARDS[6].category = CARDS[7].category = CATEGORY.PROCEED;
          ACES.POSSIBLE = SCORING.ACES_1000.POINTS;
          SCORING.ACES_1000.SET = true;
        }
        else {
          ACES.POSSIBLE = SCORING.ACES_100.POINTS;
          SCORING.ACES_100.SET = true;
        }
      }
      else {
        ACES.POSSIBLE = 0;
      }
    },

    matchMarriages: function() {
      var
        MARRIAGES = YAHTZLE.SCORE_BOX.MARRIAGES,
        i = 0,
        l = YAHTZLE.HAND_SIZE,
        n_in_suit = 0,
        CARDS = MARRIAGES.MATCH_TEMPLATE,
        SCORING = YAHTZLE.SCORING,
        CATEGORY = YAHTZLE.SCORE_CATEGORY;

      YAHTZLE.helperMatchMixed(CARDS); // match potential cards
      MARRIAGES.POSSIBLE = 0;

      for (l = CARDS.length; i < l; i = i + 2) {
        if (CARDS[i].category === CATEGORY.CAUTION && CARDS[i + 1].category === CATEGORY.CAUTION && CARDS[i].suit === CARDS[i + 1].suit) {
          CARDS[i].category = CARDS[i + 1].category = CATEGORY.PROCEED;

          if (CARDS[i].suit === YAHTZLE.TRUMP) {
            n_in_suit++;

            if (n_in_suit === 1) {
              MARRIAGES.POSSIBLE = SCORING.MARRIAGE_TRUMP_DIAMONDS.POINTS; // all marriages in trump are identical points

              switch(YAHTZLE.TRUMP) {
                case CARD.SUITS.DIAMONDS:
                  SCORING.MARRIAGE_TRUMP_DIAMONDS.SET = true;
                  break;
                case CARD.SUITS.SPADES:
                  SCORING.MARRIAGE_TRUMP_SPADES.SET = true;
                  break;
                case CARD.SUITS.HEARTS:
                  SCORING.MARRIAGE_TRUMP_HEARTS.SET = true;
                  break;
                case CARD.SUITS.CLUBS:
                  SCORING.MARRIAGE_TRUMP_CLUBS.SET = true;
              }
            }
            else {
              MARRIAGES.POSSIBLE = MARRIAGES.POSSIBLE - SCORING.MARRIAGE_TRUMP_DIAMONDS.POINTS + SCORING.DOUBLE_MARRIAGE_DIAMONDS.POINTS;  // all dbl marriages in trump are identical points

              switch(YAHTZLE.TRUMP) {
                case CARD.SUITS.DIAMONDS:
                  SCORING.MARRIAGE_TRUMP_DIAMONDS.SET = false;
                  SCORING.DOUBLE_MARRIAGE_DIAMONDS.SET = true;
                  break;
                case CARD.SUITS.SPADES:
                  SCORING.MARRIAGE_TRUMP_SPADES.SET = false;
                  SCORING.DOUBLE_MARRIAGE_SPADES.SET = true;
                  break;
                case CARD.SUITS.HEARTS:
                  SCORING.MARRIAGE_TRUMP_HEARTS.SET = false;
                  SCORING.DOUBLE_MARRIAGE_HEARTS.SET = true;
                  break;
                case CARD.SUITS.CLUBS:
                  SCORING.MARRIAGE_TRUMP_CLUBS.SET = false;
                  SCORING.DOUBLE_MARRIAGE_CLUBS.SET = true;
              }
            }
          }
          else {
            MARRIAGES.POSSIBLE += SCORING.MARRIAGE_DIAMONDS_1.POINTS; // all off-suit marriages are identical points

            switch(CARDS[i].suit) {
              case CARD.SUITS.DIAMONDS:
                if (SCORING.MARRIAGE_DIAMONDS_1.SET === false) {
                  SCORING.MARRIAGE_DIAMONDS_1.SET = true;
                }
                else {
                  SCORING.MARRIAGE_DIAMONDS_2.SET = true;
                }

                break;

              case CARD.SUITS.SPADES:
                if (SCORING.MARRIAGE_SPADES_1.SET === false) {
                  SCORING.MARRIAGE_SPADES_1.SET = true;
                }
                else {
                  SCORING.MARRIAGE_SPADES_2.SET = true;
                }

                break;

              case CARD.SUITS.HEARTS:
                if (SCORING.MARRIAGE_HEARTS_1.SET === false) {
                  SCORING.MARRIAGE_HEARTS_1.SET = true;
                }
                else {
                  SCORING.MARRIAGE_HEARTS_2.SET = true;
                }

                break;

              case CARD.SUITS.CLUBS:
                if (SCORING.MARRIAGE_CLUBS_1.SET === false) {
                  SCORING.MARRIAGE_CLUBS_1.SET = true;
                }
                else {
                  SCORING.MARRIAGE_CLUBS_2.SET = true;
                }
            }
          }
        }
      }

      MARRIAGES.CARDS = CARDS.slice(); // shallow copy of marriages array template
      CARDS = MARRIAGES.CARDS; // CARDS now points to MARRIAGES.CARDS instead of the template

      // remove cards that don't belong in marriage pairs - show just marriages and partial
      for (i = 0; i < CARDS.length; i++) {
        if (!CARDS[i].category) {
          CARDS.splice(i--, 1);
        }
      }
    },

    matchAround: function() {
      var
        AROUND = YAHTZLE.SCORE_BOX.SCORE_240,
        CARDS = AROUND.CARDS,
        SCORING = YAHTZLE.SCORING,
        CATEGORY = YAHTZLE.SCORE_CATEGORY;

      YAHTZLE.helperMatchMixed(CARDS);

      if (CARDS[0].category === CATEGORY.CAUTION
        && CARDS[1].category === CATEGORY.CAUTION
        && CARDS[2].category === CATEGORY.CAUTION
        && CARDS[3].category === CATEGORY.CAUTION
        && CARDS[4].category === CATEGORY.CAUTION
        && CARDS[5].category === CATEGORY.CAUTION
        && CARDS[6].category === CATEGORY.CAUTION
        && CARDS[7].category === CATEGORY.CAUTION)
      {
        CARDS[0].category = CARDS[1].category = CARDS[2].category = CARDS[3].category = CARDS[4].category = CARDS[5].category = CARDS[6].category = CARDS[7].category = CATEGORY.PROCEED;
        AROUND.POSSIBLE = SCORING.AROUND_240.POINTS;
        SCORING.AROUND_240.SET = true;
      }
      else {
        AROUND.POSSIBLE = 0;
      }
    },

    matchPinochles: function() {
      var
        PINOCHLES = YAHTZLE.SCORE_BOX.PINOCHLES,
        CARDS = PINOCHLES.CARDS,
        SCORING = YAHTZLE.SCORING,
        CATEGORY = YAHTZLE.SCORE_CATEGORY;

      YAHTZLE.helperMatchMixed(CARDS);

      if (CARDS[0].category === CATEGORY.CAUTION && CARDS[1].category === CATEGORY.CAUTION) {
        CARDS[0].category = CARDS[1].category = CATEGORY.PROCEED;

        if (CARDS[2].category === CATEGORY.CAUTION && CARDS[3].category === CATEGORY.CAUTION) {
          CARDS[2].category = CARDS[3].category = CATEGORY.PROCEED;
          PINOCHLES.POSSIBLE = SCORING.DOUBLE_PINOCHLE.POINTS;
          SCORING.PINOCHLE.SET = false;
          SCORING.DOUBLE_PINOCHLE.SET = true;
        }
        else {
          PINOCHLES.POSSIBLE = SCORING.PINOCHLE.POINTS;
          SCORING.PINOCHLE.SET = true;
        }
      }
      else {
        PINOCHLES.POSSIBLE = 0;
      }
    },

    matchRuns: function() {
      var
        RUNS = YAHTZLE.SCORE_BOX.RUNS,
        CARDS = RUNS.CARDS,
        SCORING = YAHTZLE.SCORING,
        CATEGORY = YAHTZLE.SCORE_CATEGORY;

      YAHTZLE.helperMatchMixed(CARDS);

      if (CARDS[0].category === CATEGORY.CAUTION
        && CARDS[1].category === CATEGORY.CAUTION
        && CARDS[2].category === CATEGORY.CAUTION
        && CARDS[3].category === CATEGORY.CAUTION
        && CARDS[4].category === CATEGORY.CAUTION)
      {
        CARDS[0].category = CARDS[1].category = CARDS[2].category = CARDS[3].category = CARDS[4].category = CATEGORY.PROCEED;

        if (CARDS[5].category === CATEGORY.CAUTION
          && CARDS[6].category === CATEGORY.CAUTION
          && CARDS[7].category === CATEGORY.CAUTION
          && CARDS[8].category === CATEGORY.CAUTION
          && CARDS[9].category === CATEGORY.CAUTION)
        {
          CARDS[5].category = CARDS[6].category = CARDS[7].category = CARDS[8].category = CARDS[0].category = CATEGORY.PROCEED;
          RUNS.POSSIBLE = SCORING.DOUBLE_RUN_DIAMONDS.POINTS; // all runs have identical point values

          switch (YAHTZLE.TRUMP) {
            case CARD.SUITS.DIAMONDS:
              SCORING.DOUBLE_RUN_DIAMONDS.SET = true;
              break;
            case CARD.SUITS.SPADES:
              SCORING.DOUBLE_RUN_SPADES.SET = true;
              break;
            case CARD.SUITS.HEARTS:
              SCORING.DOUBLE_RUN_HEARTS.SET = true;
              break;
            case CARD.SUITS.CLUBS:
              SCORING.DOUBLE_RUN_CLUBS.SET = true;
          }
        }
        else {
          RUNS.POSSIBLE = SCORING.RUN_DIAMONDS.POINTS; // all runs have identical point values

          switch (YAHTZLE.TRUMP) {
            case CARD.SUITS.DIAMONDS:
              SCORING.RUN_DIAMONDS.SET = true;
              break;
            case CARD.SUITS.SPADES:
              SCORING.RUN_SPADES.SET = true;
              break;
            case CARD.SUITS.HEARTS:
              SCORING.RUN_HEARTS.SET = true;
              break;
            case CARD.SUITS.CLUBS:
              SCORING.RUN_CLUBS.SET = true;
          }
        }
      }
      else {
        RUNS.POSSIBLE = 0;
      }
    },

    // create best possible score for chance category
    matchChance: function() {
      var
        S = YAHTZLE.SCORING,
        SB = YAHTZLE.SCORE_BOX,
        points = [],
        i = 0,
        j = 0,
        l = 0,
        id = 0,
        stored_key = "",
        roly_poly_adjust = false;

      // loop through all SCORING keys to see which ones are set
      for (var key in S) {
        if (S.hasOwnProperty(key) && S[key].SET === true) {
          // for the double marriage(s) that are set, test the point value or ROLY_POLY_SCORING flag and place prior to 80 kings (should honestly be only one double marriage)
          if (YAHTZLE.ROLY_POLY_SCORING === false) {
            id = S[key].ID;

            if (id === S.DOUBLE_MARRIAGE_DIAMONDS.ID || id === S.DOUBLE_MARRIAGE_SPADES.ID || id === S.DOUBLE_MARRIAGE_HEARTS.ID || id === S.DOUBLE_MARRIAGE_CLUBS.ID) {
              roly_poly_adjust = true;
              stored_key = key;
            }
            else if (roly_poly_adjust === true && id === S.ACES_100.ID) {
              points.push(key);
              points.push(stored_key);
              roly_poly_adjust = false;
            }
            else if (roly_poly_adjust === true && id > S.ACES_100.ID) {
              points.push(stored_key);
              points.push(key);
              roly_poly_adjust = false;
            }
            else {
              points.push(key);
            }
          }
          else {
            points.push(key); // store keys into an array (these should already be in descending point order)
          }
        }
      }

      // outlier case: double marriage worth traditional points (80) and current hand contains no other scoring categories
      // ..push double marriage onto the points array so that it is not lost
      if (YAHTZLE.ROLY_POLY_SCORING === false && points.length === 0 && roly_poly_adjust === true) {
        points.push(stored_key);
      }

      // remove array keys that conflict with higher scoring keys (work from low point value to high)
      if (points.length >= 2) {
        for (i = 0; i < points.length - 1; i++) {
          for (j = 1; j < points.length - 1; j++) {
            if (i !== j && YAHTZLE.CHANCE_MAPS.cardGain(S[points[j]].ID, S[points[i]].ID) === -1) { // MARK A - overlapping scores counted that shouldn't be?
              points.splice(j--, 1);
            }
          }
        }
      }

      SB.CHANCE.POSSIBLE = 0;

      // generate chance cards
      if (points.length === 0) {
        SB.CHANCE.CARDS = [CARD.create(null, null)];
      }
      else {
        var
          SC = YAHTZLE.SCORE_CATEGORY,
          HC = YAHTZLE.HAND.slice(),
          card = null,
          match_found = false,

          // create flags for each major score category combined with case statement
          CATEGORIES = {
            RUNS: false,
            ACES: false,
            KINGS: false,
            QUEENS: false,
            JACKS: false,
            MARRIAGES: false,
            PINOCHLES: false,
            AROUND_240: false,
            NINES: false,
          };

          SB.CHANCE.CARDS = [];

        for (i = 0, l = points.length; i < l; i++) {
          switch(S[points[i]].ID) {
            case S.DOUBLE_RUN_DIAMONDS.ID:
            case S.DOUBLE_RUN_SPADES.ID:
            case S.DOUBLE_RUN_HEARTS.ID:
            case S.DOUBLE_RUN_CLUBS.ID:
            case S.RUN_DIAMONDS.ID:
            case S.RUN_SPADES.ID:
            case S.RUN_HEARTS.ID:
            case S.RUN_CLUBS.ID:
              CATEGORIES.RUNS = YAHTZLE.helperBuildChance(CATEGORIES.RUNS, SB.RUNS);
              break;

            case S.ACES_1000.ID:
            case S.ACES_100.ID:
              CATEGORIES.ACES = YAHTZLE.helperBuildChance(CATEGORIES.ACES, SB.ACES);
              break;

            case S.KINGS_800.ID:
            case S.KINGS_80.ID:
              CATEGORIES.KINGS = YAHTZLE.helperBuildChance(CATEGORIES.KINGS, SB.KINGS);
              break;

            case S.QUEENS_600.ID:
            case S.QUEENS_60.ID:
              CATEGORIES.QUEENS = YAHTZLE.helperBuildChance(CATEGORIES.QUEENS, SB.QUEENS);
              break;

            case S.JACKS_400.ID:
            case S.JACKS_40.ID:
              CATEGORIES.JACKS = YAHTZLE.helperBuildChance(CATEGORIES.JACKS, SB.JACKS);
              break;

            case S.DOUBLE_MARRIAGE_DIAMONDS.ID:
            case S.DOUBLE_MARRIAGE_SPADES.ID:
            case S.DOUBLE_MARRIAGE_HEARTS.ID:
            case S.DOUBLE_MARRIAGE_CLUBS.ID:
            case S.MARRIAGE_DIAMONDS_1.ID:
            case S.MARRIAGE_DIAMONDS_2.ID:
            case S.MARRIAGE_SPADES_1.ID:
            case S.MARRIAGE_SPADES_2.ID:
            case S.MARRIAGE_HEARTS_1.ID:
            case S.MARRIAGE_HEARTS_2.ID:
            case S.MARRIAGE_CLUBS_1.ID:
            case S.MARRIAGE_CLUBS_2.ID:
              CATEGORIES.MARRIAGES = YAHTZLE.helperBuildChance(CATEGORIES.MARRIAGES, SB.MARRIAGES);
              break;

            case S.DOUBLE_PINOCHLE.ID:
            case S.PINOCHLE.ID:
              CATEGORIES.PINOCHLES = YAHTZLE.helperBuildChance(CATEGORIES.PINOCHLES, SB.PINOCHLES);
              break;

            case S.AROUND_240.ID:
              CATEGORIES.AROUND_240 = YAHTZLE.helperBuildChance(CATEGORIES.AROUND_240, SB.SCORE_240);
              break;

            case S.NINE_TRUMP_1.ID:
            case S.NINE_TRUMP_2.ID:
              CATEGORIES.NINES = YAHTZLE.helperBuildChance(CATEGORIES.NINES, SB.NINES);
          }
        }

        // as the chance score box cards are built, there should occasionally be some duplicates. compare to the original hand and remove extra cards
        for (i = 0; i < SB.CHANCE.CARDS.length; i++) {
          card = SB.CHANCE.CARDS[i];
          match_found = false;

          for (j = 0; j < HC.length; j++) { // remember: HC is only a "copy" of HAND
            if (card.value === HC[j].value && card.suit === HC[j].suit) {
              card.discard = (HC[j].discard === true);

              // match found - remove the card in HAND
              HC.splice(j, 1);
              match_found = true;
              break;
            }
          }

          if (match_found === false) {
            // no match found - remove the card in CHANCE
            SB.CHANCE.CARDS.splice(i, 1);
            i--;
          }
        }

        // at the end, # CHANCE cards <= 12..TODO - improve error handling or remove?
        if (SB.CHANCE.CARDS.length > YAHTZLE.HAND_SIZE) {
          console.error("ERROR: too many cards in Chance - " + SB.CHANCE.CARDS.length);
        }
      }
    },

    resetScoreTotals: function() {
      var SB = YAHTZLE.SCORE_BOX;

      SB.NINES.SCORE = SB.NINES.POSSIBLE = SB.JACKS.SCORE = SB.JACKS.POSSIBLE = SB.QUEENS.SCORE = SB.QUEENS.POSSIBLE
      = SB.KINGS.SCORE = SB.KINGS.POSSIBLE = SB.ACES.SCORE = SB.ACES.POSSIBLE = SB.BONUS.SCORE = SB.MARRIAGES.SCORE
      = SB.MARRIAGES.POSSIBLE = SB.SCORE_240.SCORE = SB.SCORE_240.POSSIBLE = SB.PINOCHLES.SCORE = SB.PINOCHLES.POSSIBLE
      = SB.RUNS.SCORE = SB.RUNS.POSSIBLE = SB.CHANCE.SCORE = SB.CHANCE.POSSIBLE = null;

      SB.TOTAL = 0;
    },

    updateScoreboxTrump: function() {
      if (this.TRUMP) {
        var arr = null;

        // update nines score category for selected trump suit
        arr = this.SCORE_BOX.NINES.CARDS = [];
        arr.push(CARD.create(CARD.VALUES.NINE, this.TRUMP));
        arr.push(CARD.create(CARD.VALUES.NINE, this.TRUMP));

        // update runs score category for selected trump suit
        arr = this.SCORE_BOX.RUNS.CARDS = [];

        for (var i = 0; i < 2; i++) {
          arr.push(CARD.create(CARD.VALUES.ACE, this.TRUMP));
          arr.push(CARD.create(CARD.VALUES.TEN, this.TRUMP));
          arr.push(CARD.create(CARD.VALUES.KING, this.TRUMP));
          arr.push(CARD.create(CARD.VALUES.QUEEN, this.TRUMP));
          arr.push(CARD.create(CARD.VALUES.JACK, this.TRUMP));
        }
      }
    },

    // get random deck "chunk" of cards; shuffle() helper
    chunk: function(a) {
      var
        l = a.length,
        chunk_size = 0;

      if (l > 0) {
        chunk_size = UTIL.getRandom(this.CHUNK_MIN, this.CHUNK_MAX);

        return a.splice(l - 1 - chunk_size, chunk_size);
      }
    },

    // split deck "approximately" 50/50
    split: function() {
      var
        l = this.DECK.length,
        half = 0;

      if (l > 0) {
        half = Math.floor(l / 2);

        this.SPLIT_1 = this.DECK.splice(0, half + UTIL.getRandom(-3, 3));
        this.SPLIT_2 = this.DECK.splice(0, this.DECK.length);
      }
    },

    // "shuffle" the deck n-times, logically imitating a real card shuffle
    shuffle: function(n) {
      var current_split = 0;

      for (var i = 0; i < n; i++) {
        this.split(); // split the deck

        current_split = UTIL.getRandom(1, 2); // randomly choose a side of the split deck to kick off the shuffle

        // shuffle the cards
        while(this.SPLIT_1.length || this.SPLIT_2.length) {
          if (current_split === 1) {
            Array.prototype.splice.apply(this.DECK, [0, 0].concat(this.chunk(this.SPLIT_1)));
            if (this.SPLIT_2.length) current_split = 2;
          }
          else {
            Array.prototype.splice.apply(this.DECK, [0, 0].concat(this.chunk(this.SPLIT_2)));
            if (this.SPLIT_1.length) current_split = 1;
          }
        }
      }
    },

    // TODO imitate mixing cards sometimes performed at the end of a shuffle, repeat n-times
    mix: function(n) {
      // split
      // chunk 1 half between top / bottom of the other split
      console.log("TODO");
    },

    // TODO imitate cutting a deck at position or random if not specified
    cut: function(n) {
      // split
      // move one split at the start of the other
      console.log("TODO");
    },

    deal: function(redealAll) { // MARK
      function drawAllNew() {
        for (var i = 0; i < YAHTZLE.HAND_SIZE; i++) {
          YAHTZLE.HAND.push(YAHTZLE.DECK.splice(UTIL.getRandom(0, YAHTZLE.DECK.length - 1), 1)[0]);
          YAHTZLE.HAND[i].discard = true;
        }
      }

      var
        i = 0,
        l = YAHTZLE.HAND_SIZE,
        discard_count = 0;

      if (YAHTZLE.DEAL_COUNT < YAHTZLE.DEAL_MAX) {
        YAHTZLE.DEAL_COUNT++;

        // reset scoring flags used in chance
        if (!YAHTZLE.SCORE_BOX.CHANCE.SCORE) {
          for (var key in YAHTZLE.SCORING) {
            if (YAHTZLE.SCORING.hasOwnProperty(key)) {
              YAHTZLE.SCORING[key].SET = false;
            }
          }
        }

        // draw all new cards
        if (YAHTZLE.DEAL_COUNT === 1) {
          drawAllNew();
          YAHTZLE.DISCARD_COUNT = l;
        }

        // discard all and redeal
        else if (redealAll === true) {
          YAHTZLE.discardAll();
          YAHTZLE.shuffle(3);
          drawAllNew();
          YAHTZLE.DISCARD_COUNT = l;
        }

        // discard only selected and deal to replace
        else if (YAHTZLE.DISCARD_COUNT > 0) {
          // TODO - control via an option
          // discard only the cards designated back into the deck
          for (i = 0; i < l; i++) {
            if (YAHTZLE.HAND[i].discard) {
              YAHTZLE.DECK.push(CARD.copy(YAHTZLE.HAND[i]));
              discard_count++;

              if (discard_count === YAHTZLE.DISCARD_COUNT) break;
            }
          }

          YAHTZLE.shuffle(3);
          discard_count = 0;

          // draw only for cards that are marked "discard"
          for (i = 0; i < l; i++) {
            if (YAHTZLE.HAND[i].discard) {
              Array.prototype.splice.apply(YAHTZLE.HAND, [i, 1].concat(YAHTZLE.DECK.splice(UTIL.getRandom(0, YAHTZLE.DECK.length - 1), 1)));
              YAHTZLE.HAND[i].discard = true;
              discard_count++;

              if (discard_count === YAHTZLE.DISCARD_COUNT) break;
            }
          }
        }
      }
    },

    // discard entire hand
    discardAll: function() {
      var
        i = 0,
        l = YAHTZLE.HAND.length;

      if (l > 0) {
        for (; i < l; i++) {
          if (YAHTZLE.HAND[i].discard) delete YAHTZLE.HAND[i].discard; // reset discard flag before placing it back into the deck

          YAHTZLE.DECK.push(YAHTZLE.HAND[i]);
        }

        YAHTZLE.HAND = [];
      }
    },

    countNines: function() {
      var
        n = 0,
        i = 0,
        l = this.HAND_SIZE;

      if (this.HAND.length === l) {
        for (; i < l; i++) {
          if (this.HAND[i].value === CARD.VALUES.NINE) n++;
        }

        return n;
      }
      else {
        console.log("INVALID CHECK");
        return -1;
      }
    }
  },

  UI = {
    // DOM references
    DOM: {
      buttonNew: null,
      buttonToggle: null,
      buttonShuffle: null,
      buttonDeal: null,
      deals: null,
      suits: null,
      suitHearts: null,
      suitClubs: null,
      suitDiamonds: null,
      suitSpades: null,
      buttonSetTrump: null,
      cardDeck: null,
      cardHand: null,
      scoreNines: null,
      scoreJacks: null,
      scoreQueens: null,
      scoreKings: null,
      scoreAces: null,
      scoreMarriages: null,
      score240: null,
      scorePinochles: null,
      scoreRuns: null,
      scoreChance: null,
      textNines: null,
      textJacks: null,
      textQueens: null,
      textKings: null,
      textAces: null,
      textBonus: null,
      textMarriages: null,
      text240: null,
      textPinochles: null,
      textRuns: null,
      textChance: null,
      textTotal: null
    },

    // DOM reference IDs
    IDS: {
      NINES: "score_nines",
      JACKS: "score_jacks",
      QUEENS: "score_queens",
      KINGS: "score_kings",
      ACES: "score_aces",
      MARRIAGES: "score_marriages",
      SCORE_240: "score_240",
      PINOCHLE: "score_pinochle",
      RUNS: "score_runs",
      CHANCE: "score_chance"
    },

    DECK_TOGGLE_LABELS: {
      hide: "Hide",
      show: "Show"
    },

    DECK_VISIBLE: false,

    CARD_TYPE: {
      BLANK: 1,
      DECK: 2,
      HAND: 3,
      SCORING: 4
    },

    CSS_SCORING: {
      CAUTION: "scoring_caution",
      PROCEED: "scoring_proceed",
      TRANSPARENT: "transparent",
      SELECTED_CAUTION: "selected_caution",
      SELECTED_PROCEED: "selected_proceed"
    },

    FIRST_RUN: true,

    buttonDeal: function(redealAll, bunch) { // MARK
      YAHTZLE.deal(redealAll);

      if (bunch === true) {
        UI.resetDeals();
        YAHTZLE.DEAL_COUNT = 1;
      }

      if (YAHTZLE.DEAL_COUNT > 0 && YAHTZLE.DEAL_COUNT <= YAHTZLE.DEAL_MAX) {
        UI.DOM.deals[YAHTZLE.DEAL_COUNT - 1].checked = true;
      }

      UI.DOM.buttonBunch.disabled = true;

      if (YAHTZLE.DEAL_COUNT === YAHTZLE.DEAL_MAX) {
        UI.DOM.buttonDeal.disabled = true;
        UI.DOM.buttonRedeal.disabled = true;
      }
      else {
        UI.DOM.buttonDeal.disabled = (YAHTZLE.DISCARD_COUNT === 0);
        UI.DOM.buttonRedeal.disabled = false;

        if (YAHTZLE.DEAL_COUNT === 1) {
          UI.DOM.buttonBunch.disabled = (YAHTZLE.countNines() < YAHTZLE.BUNCH_COUNT);
        }
      }

      UI.showHand(redealAll);
      UI.showDeck();

      UI.matchNines();
      UI.matchJacks();
      UI.matchQueens();
      UI.matchKings();
      UI.matchAces();
      UI.matchMarriages();
      UI.matchAround();
      UI.matchPinochles();
      UI.matchRuns();
      UI.matchChance();
    },

    buttonRedeal: function() {
      UI.buttonDeal(true);
    },

    buttonBunch: function() {
      UI.buttonDeal(true, true);
    },

    buttonNew: function() {
      var DOM = UI.DOM;

      // de-select suits
      for (var i = 0, l = UI.DOM.suits.length; i < l; i++) {
        DOM.suits[i].checked = false;
      }

      UI.resetDeals(); // reset deal counter

      // reset UI controls
      UI.suitSelect(true);
      DOM.buttonDeal.disabled = UI.DOM.buttonRedeal.disabled = UI.DOM.buttonBunch.disabled = true;
      DOM.cardHand.innerHTML = "";
      UI.helperTransparentLabel(true, UI.DOM.scoreNines);
      UI.helperTransparentLabel(true, UI.DOM.scoreJacks);
      UI.helperTransparentLabel(true, UI.DOM.scoreQueens);
      UI.helperTransparentLabel(true, UI.DOM.scoreKings);
      UI.helperTransparentLabel(true, UI.DOM.scoreAces);
      UI.helperTransparentLabel(true, UI.DOM.textBonus);
      UI.helperTransparentLabel(true, UI.DOM.scoreMarriages);
      UI.helperTransparentLabel(true, UI.DOM.score240);
      UI.helperTransparentLabel(true, UI.DOM.scorePinochles);
      UI.helperTransparentLabel(true, UI.DOM.scoreRuns);
      UI.helperTransparentLabel(true, UI.DOM.scoreChance);
      UI.helperTransparentLabel(true, UI.DOM.textTotal);

      DOM.textNines.innerHTML = DOM.textJacks.innerHTML = DOM.textQueens.innerHTML = DOM.textKings.innerHTML
      = DOM.textAces.innerHTML = DOM.textBonus.innerHTML = DOM.textMarriages.innerHTML = DOM.text240.innerHTML
      = DOM.textPinochles.innerHTML = DOM.textRuns.innerHTML = DOM.textTotal.innerHTML = DOM.textTotal.innerHTML = "";

      // reset score categories
      if (UI.FIRST_RUN) {
        UI.FIRST_RUN = false;
      }
      else {
        YAHTZLE.initialize();
        YAHTZLE.shuffle(5);
        YAHTZLE.initScorebox();
        YAHTZLE.resetScoreTotals();
        UI.showScorebox();
      }

      UI.showDeck();
    },

    buttonShuffle: function() {
      YAHTZLE.shuffle(5);
      UI.showDeck();
    },

    buttonSuitVerify: function() {
      UI.DOM.buttonSetTrump.style.visibility = "hidden";
      UI.suitSelect(false);
      YAHTZLE.updateScoreboxTrump();
      UI.buildScoreboxHTML(UI.DOM.scoreNines, YAHTZLE.SCORE_BOX.NINES.CARDS);
      UI.buildScoreboxHTML(UI.DOM.scoreRuns, YAHTZLE.SCORE_BOX.RUNS.CARDS);
    },

    buttonToggleDeck: function() {
      UI.DECK_VISIBLE = !UI.DECK_VISIBLE;
      UI.DOM.buttonToggle.textContent = UI.DECK_VISIBLE ? UI.DECK_TOGGLE_LABELS.hide : UI.DECK_TOGGLE_LABELS.show;
      UI.showDeck();
    },

    buildCardHTML: function(card, type, index) {
      var s = "<div class='card";

      if (type === UI.CARD_TYPE.SCORING) {
        s += " transparent";
      }

      if (type === UI.CARD_TYPE.HAND && card.discard === true) {
        s += " discard";
      }

      if (card.value && card.suit) {
        if (UTIL.isInteger(index)) {
          switch(type) {
            case UI.CARD_TYPE.HAND:
              s += "' id='hand_" + index;
              break;

            case UI.CARD_TYPE.DECK:
              s += "' id='deck_" + index;
          }
        }

        s += "'>" + UI.helperCardHTML(card) + "</div>";
      }
      else {
        s += "'></div>";
      }

      return s;
    },

    buildScoreboxHTML: function(element, cards) {
      var s = "";

      for (var i = 0, l = cards.length; i < l; i++) {
        s += UI.buildCardHTML(cards[i], UI.CARD_TYPE.SCORING);
      }

      element.innerHTML = s;
    },

    checkSuit: function() {
      UI.DOM.buttonSetTrump.style.visibility = "visible";

      switch(this.id) {
        case "select_hearts":
          YAHTZLE.TRUMP = CARD.SUITS.HEARTS;
          break;
        case "select_clubs":
          YAHTZLE.TRUMP = CARD.SUITS.CLUBS;
          break;
        case "select_diamonds":
          YAHTZLE.TRUMP = CARD.SUITS.DIAMONDS;
          break;
        default:
          YAHTZLE.TRUMP = CARD.SUITS.SPADES;
      }
    },

    helperTransparentLabel: function(set, element) {
      if (set === true) {
        element.previousElementSibling.classList.add(UI.CSS_SCORING.TRANSPARENT);
      }
      else {
        element.previousElementSibling.classList.remove(UI.CSS_SCORING.TRANSPARENT);
      }
    },

    helperCardHTML: function(card) {
      return "<span class='card_value'>" + card.value
        + "</span><span class='card_suit "
        + ((card.suit === CARD.SUITS.DIAMONDS || card.suit === CARD.SUITS.HEARTS) ? "red'>" : "black'>")
        + card.suit + "</span>";
    },

    helperMatchDiscard: function(card) {
      switch(card.value) {
        case CARD.VALUES.NINE:
          UI.helperMatchDiscardEx(card, YAHTZLE.SCORE_BOX.NINES, UI.DOM.scoreNines.children);
          break;

        case CARD.VALUES.JACK:
          UI.helperMatchDiscardEx(card, YAHTZLE.SCORE_BOX.JACKS, UI.DOM.scoreJacks.children);
          UI.helperMatchDiscardEx(card, YAHTZLE.SCORE_BOX.PINOCHLES, UI.DOM.scorePinochles.children);
          UI.helperMatchDiscardEx(card, YAHTZLE.SCORE_BOX.RUNS, UI.DOM.scoreRuns.children);
          break;

        case CARD.VALUES.QUEEN:
          UI.helperMatchDiscardEx(card, YAHTZLE.SCORE_BOX.QUEENS, UI.DOM.scoreQueens.children);
          UI.helperMatchDiscardEx(card, YAHTZLE.SCORE_BOX.MARRIAGES, UI.DOM.scoreMarriages.children);
          UI.helperMatchDiscardEx(card, YAHTZLE.SCORE_BOX.SCORE_240, UI.DOM.score240.children);
          UI.helperMatchDiscardEx(card, YAHTZLE.SCORE_BOX.PINOCHLES, UI.DOM.scorePinochles.children);
          UI.helperMatchDiscardEx(card, YAHTZLE.SCORE_BOX.RUNS, UI.DOM.scoreRuns.children);
          break;

        case CARD.VALUES.KING:
          UI.helperMatchDiscardEx(card, YAHTZLE.SCORE_BOX.KINGS, UI.DOM.scoreKings.children);
          UI.helperMatchDiscardEx(card, YAHTZLE.SCORE_BOX.MARRIAGES, UI.DOM.scoreMarriages.children);
          UI.helperMatchDiscardEx(card, YAHTZLE.SCORE_BOX.SCORE_240, UI.DOM.score240.children);
          UI.helperMatchDiscardEx(card, YAHTZLE.SCORE_BOX.RUNS, UI.DOM.scoreRuns.children);
          break;

        case CARD.VALUES.TEN:
          UI.helperMatchDiscardEx(card, YAHTZLE.SCORE_BOX.RUNS, UI.DOM.scoreRuns.children);
          break;

        case CARD.VALUES.ACE:
          UI.helperMatchDiscardEx(card, YAHTZLE.SCORE_BOX.ACES, UI.DOM.scoreAces.children);
          UI.helperMatchDiscardEx(card, YAHTZLE.SCORE_BOX.RUNS, UI.DOM.scoreRuns.children);
          break;

        default:
          return;
      }

      UI.helperMatchDiscardEx(card, YAHTZLE.SCORE_BOX.CHANCE, UI.DOM.scoreChance.children);
    },

    // NEW - DELETE / REWRITE THIS SECTION IF IT DOESN'T WORK ---------------
    helperMatchDiscardEx: function(card, category, arr) {
      // always check if a card is duplicated
      // squish cards left

      var
        CSS = UI.CSS_SCORING,
        SC = YAHTZLE.SCORE_CATEGORY,
        score_box = category.CARDS,
        i = 0,
        l = score_box.length;

      if (category.SCORE !== null) return;

      // for discards: right > left
      if (card.discard === true) { // MARK B | combine loops for discard/keep?
        // for (i = l - 1; i >= 0; i--) {
        for (i = 0; i < l; i++) {
          if (card.id === score_box[i].id) {
            arr[i].classList.remove(CSS.SELECTED_CAUTION, CSS.SELECTED_PROCEED);
            arr[i].classList.add(CSS.TRANSPARENT);
            break;
          }
        }
      }

      // for cards selected for "keep": left > right
      else {
        for (i = 0; i < l; i++) {
          if (card.id === score_box[i].id) {
            arr[i].classList.remove(CSS.TRANSPARENT);
            arr[i].classList.add(score_box[i].category === SC.CAUTION ? CSS.SELECTED_CAUTION : CSS.SELECTED_PROCEED);
            break;
          }
        }
      }
    },

    helperMatchColors: function(DOM_score_box, scoring) {
      var
        CSS = UI.CSS_SCORING,
        SC = YAHTZLE.SCORE_CATEGORY,
        cards = DOM_score_box.children,
        card = null,
        i = 0,
        l = scoring.length;

      DOM_score_box.classList.add("hidden");

      for (; i < l; i++) {
        card = cards[i];

        card.classList.remove(CSS.CAUTION, CSS.PROCEED, CSS.SELECTED_CAUTION, CSS.SELECTED_PROCEED);
        card.classList.add(CSS.TRANSPARENT);

        if (scoring[i].category === SC.CAUTION) {
          card.classList.remove(CSS.PROCEED);
          card.classList.add(CSS.CAUTION);

          if (scoring[i].discard === false) {
            card.classList.remove(CSS.TRANSPARENT);
            card.classList.add(CSS.SELECTED_CAUTION);
          }
        }
        else if (scoring[i].category === SC.PROCEED) {
          card.classList.remove(CSS.CAUTION);
          card.classList.add(CSS.PROCEED);

          if (scoring[i].discard === false) {
            card.classList.remove(CSS.TRANSPARENT);
            card.classList.add(CSS.SELECTED_PROCEED);
          }
        }
      }

      DOM_score_box.classList.remove("hidden");
    },

    helperMatchSelected: function(id, cards, scoring) {
      var
        category = null,
        CSS = UI.CSS_SCORING;

      for (var i = 0; i < scoring.length; i++) {
        category = scoring[i].category;
        cards[i].classList.remove(CSS.CAUTION, CSS.PROCEED, CSS.SELECTED_CAUTION, CSS.SELECTED_PROCEED);

        if (category === YAHTZLE.SCORE_CATEGORY.CAUTION) {
          cards[i].classList.add(CSS.TRANSPARENT);

          if (id === UI.IDS.MARRIAGES) {
            cards[i].remove();
            scoring.splice(i, 1);
            i--;
          }
          else {
            delete scoring[i].category;
          }
        }
        else if (category === YAHTZLE.SCORE_CATEGORY.PROCEED) {
          cards[i].classList.remove(CSS.TRANSPARENT);
          category = YAHTZLE.SCORE_CATEGORY.MATCH;
        }
      }
    },

    helperBlankNonScoring: function(score_label, category) {
      score_label.innerHTML = "";
      category.CARDS = [CARD.create(null, null)];
    },

    helperResetNonScoring: function(UI_score_box, score_label, category) {
      // reset all other non-scoring scoreboxes
      if (category.SCORE === null) {
        score_label.innerHTML = "";
        YAHTZLE.helperResetScorebox(category.CARDS);
        UI.helperMatchColors(UI_score_box, category.CARDS);
      }
    },

    matchNines: function() {
      var NINES = YAHTZLE.SCORE_BOX.NINES;

      if (NINES.SCORE === null || YAHTZLE.SCORE_BOX.CHANCE.SCORE === null) {
        YAHTZLE.matchNines();
      }

      if (NINES.SCORE === null) {
        UI.helperMatchColors(UI.DOM.scoreNines, NINES.CARDS);
        UI.DOM.textNines.innerHTML = NINES.POSSIBLE;
      }
    },

    matchJacks: function() {
      var JACKS = YAHTZLE.SCORE_BOX.JACKS;

      if (JACKS.SCORE === null || YAHTZLE.SCORE_BOX.CHANCE.SCORE === null) {
        YAHTZLE.matchJacks();
      }

      if (JACKS.SCORE === null) {
        UI.helperMatchColors(UI.DOM.scoreJacks, JACKS.CARDS);
        UI.DOM.textJacks.innerHTML = JACKS.POSSIBLE;
      }
    },

    matchQueens: function() {
      var QUEENS = YAHTZLE.SCORE_BOX.QUEENS;

      if (QUEENS.SCORE === null || YAHTZLE.SCORE_BOX.CHANCE.SCORE === null) {
        YAHTZLE.matchQueens();
      }

      if (QUEENS.SCORE === null) {
        UI.helperMatchColors(UI.DOM.scoreQueens, QUEENS.CARDS);
        UI.DOM.textQueens.innerHTML = QUEENS.POSSIBLE;
      }
    },

    matchKings: function() {
      var KINGS = YAHTZLE.SCORE_BOX.KINGS;

      if (KINGS.SCORE === null || YAHTZLE.SCORE_BOX.CHANCE.SCORE === null) {
        YAHTZLE.matchKings();
      }

      if (KINGS.SCORE === null) {
        UI.helperMatchColors(UI.DOM.scoreKings, KINGS.CARDS);
        UI.DOM.textKings.innerHTML = KINGS.POSSIBLE;
      }
    },

    matchAces: function() {
      var ACES = YAHTZLE.SCORE_BOX.ACES;

      if (ACES.SCORE === null || YAHTZLE.SCORE_BOX.CHANCE.SCORE === null) {
        YAHTZLE.matchAces();
      }

      if (ACES.SCORE === null) {
        UI.helperMatchColors(UI.DOM.scoreAces, ACES.CARDS);
        UI.DOM.textAces.innerHTML = ACES.POSSIBLE;
      }
    },

    matchMarriages: function() {
      var MARRIAGES = YAHTZLE.SCORE_BOX.MARRIAGES;

      if (MARRIAGES.SCORE === null || YAHTZLE.SCORE_BOX.CHANCE.SCORE === null) {
        YAHTZLE.matchMarriages();
      }

      if (MARRIAGES.SCORE === null) {
        this.buildScoreboxHTML(UI.DOM.scoreMarriages, MARRIAGES.CARDS);
        UI.helperMatchColors(UI.DOM.scoreMarriages, MARRIAGES.CARDS);
        UI.DOM.textMarriages.innerHTML = MARRIAGES.POSSIBLE;
      }
    },

    matchAround: function() {
      var AROUND = YAHTZLE.SCORE_BOX.SCORE_240;

      if (AROUND.SCORE === null || YAHTZLE.SCORE_BOX.CHANCE.SCORE === null) {
        YAHTZLE.matchAround();
      }

      if (AROUND.SCORE === null) {
        UI.helperMatchColors(UI.DOM.score240, AROUND.CARDS);
        UI.DOM.text240.innerHTML = AROUND.POSSIBLE;
      }
    },

    matchPinochles: function() {
      var PINOCHLES = YAHTZLE.SCORE_BOX.PINOCHLES;

      if (PINOCHLES.SCORE === null || YAHTZLE.SCORE_BOX.CHANCE.SCORE === null) {
        YAHTZLE.matchPinochles();
      }

      if (PINOCHLES.SCORE === null) {
        UI.helperMatchColors(UI.DOM.scorePinochles, PINOCHLES.CARDS);
        UI.DOM.textPinochles.innerHTML = PINOCHLES.POSSIBLE;
      }
    },

    matchRuns: function() {
      var RUNS = YAHTZLE.SCORE_BOX.RUNS;

      if (RUNS.SCORE === null || YAHTZLE.SCORE_BOX.CHANCE.SCORE === null) {
        YAHTZLE.matchRuns();
      }

      if (RUNS.SCORE === null) {
        UI.helperMatchColors(UI.DOM.scoreRuns, RUNS.CARDS);
        UI.DOM.textRuns.innerHTML = RUNS.POSSIBLE;
      }
    },

    matchChance: function() {
      var CHANCE = YAHTZLE.SCORE_BOX.CHANCE;

      if (CHANCE.SCORE === null) {
        YAHTZLE.matchChance();
        this.buildScoreboxHTML(UI.DOM.scoreChance, CHANCE.CARDS);
        UI.helperMatchColors(UI.DOM.scoreChance, CHANCE.CARDS);
        UI.DOM.textChance.innerHTML = CHANCE.POSSIBLE;
      }
    },

    resetDeals: function() {
      var deals = UI.DOM.deals;

      for (var i = 0, l = deals.length; i < l; i++) {
        deals[i].checked = false;
      }

      YAHTZLE.DEAL_COUNT = 0;
    },

    // score category select after drawing cards
    selectScore: function () {
      if (YAHTZLE.SCORES_COUNTER < YAHTZLE.SCORES_COUNTER_MAX && YAHTZLE.HAND.length) {
        var
          selectedScore = null,
          element = null,
          SCORE_BOX = YAHTZLE.SCORE_BOX,
          DOM = UI.DOM,
          ID = UI.IDS;

        switch(this.id) {
          case ID.NINES:
            selectedScore = SCORE_BOX.NINES;
            element = DOM.scoreNines;
            break;
          case ID.JACKS:
            selectedScore = SCORE_BOX.JACKS;
            element = DOM.scoreJacks;
            break;
          case ID.QUEENS:
            selectedScore = SCORE_BOX.QUEENS;
            element = DOM.scoreQueens;
            break;
          case ID.KINGS:
            selectedScore = SCORE_BOX.KINGS;
            element = DOM.scoreKings;
            break;
          case ID.ACES:
            selectedScore = SCORE_BOX.ACES;
            element = DOM.scoreAces;
            break;
          case ID.MARRIAGES:
            selectedScore = SCORE_BOX.MARRIAGES;
            element = DOM.scoreMarriages;
            break;
          case ID.SCORE_240:
            selectedScore = SCORE_BOX.SCORE_240;
            element = DOM.score240;
            break;
          case ID.PINOCHLE:
            selectedScore = SCORE_BOX.PINOCHLES;
            element = DOM.scorePinochles;
            break;
          case ID.RUNS:
            selectedScore = SCORE_BOX.RUNS;
            element = DOM.scoreRuns;
            break;
          case ID.CHANCE:
            selectedScore = SCORE_BOX.CHANCE;
            element = DOM.scoreChance;
        }

        if (selectedScore && selectedScore.SCORE === null) {
          YAHTZLE.SCORES_COUNTER++;
          selectedScore.SCORE = selectedScore.POSSIBLE;
          DOM.textTotal.innerHTML = SCORE_BOX.TOTAL += selectedScore.SCORE;
          UI.resetDeals();
          DOM.buttonRedeal.disabled = true;
          DOM.buttonBunch.disabled = true;
          YAHTZLE.discardAll();
          YAHTZLE.shuffle(3);
          DOM.cardHand.innerHTML = "";
          UI.showDeck();
          UI.helperTransparentLabel(false, element);

          if (YAHTZLE.SCORES_COUNTER === 1) {
            UI.helperTransparentLabel(false, DOM.textTotal);
          }

          // reset all other non-scoring scoreboxes
          UI.helperResetNonScoring(DOM.scoreNines, DOM.textNines, SCORE_BOX.NINES);
          UI.helperResetNonScoring(DOM.scoreJacks, DOM.textJacks, SCORE_BOX.JACKS);
          UI.helperResetNonScoring(DOM.scoreQueens, DOM.textQueens, SCORE_BOX.QUEENS);
          UI.helperResetNonScoring(DOM.scoreKings, DOM.textKings, SCORE_BOX.KINGS);
          UI.helperResetNonScoring(DOM.scoreAces, DOM.textAces, SCORE_BOX.ACES);
          UI.helperResetNonScoring(DOM.score240, DOM.text240, SCORE_BOX.SCORE_240);
          UI.helperResetNonScoring(DOM.scorePinochles, DOM.textPinochles, SCORE_BOX.PINOCHLES);
          UI.helperResetNonScoring(DOM.scoreRuns, DOM.textRuns, SCORE_BOX.RUNS);

          if (SCORE_BOX.MARRIAGES.SCORE === null) {
            UI.helperBlankNonScoring(DOM.textMarriages, SCORE_BOX.MARRIAGES);
            UI.buildScoreboxHTML(UI.DOM.scoreMarriages, SCORE_BOX.MARRIAGES.CARDS);
          }

          if (SCORE_BOX.CHANCE.SCORE === null) {
            UI.helperBlankNonScoring(DOM.textChance, SCORE_BOX.CHANCE);
            UI.buildScoreboxHTML(UI.DOM.scoreChance, SCORE_BOX.CHANCE.CARDS);
          }

          UI.helperMatchSelected(this.id, element.children, selectedScore.CARDS);

          // end of game round
          if (YAHTZLE.SCORES_COUNTER === YAHTZLE.SCORES_COUNTER_MAX) {
            DOM.buttonDeal.disabled = true;
          }
          else {
            DOM.buttonDeal.disabled = false;
          }
        }
      }
    },

    // display / hide deck contents
    showDeck: function() {
      var
        i = 0,
        l = YAHTZLE.DECK.length,
        s = "";

      UI.DOM.cardDeck.innerHTML = "";

      if (UI.DECK_VISIBLE && l > 0) {
        for (; i < l; i++) {
          s += UI.buildCardHTML(YAHTZLE.DECK[i], UI.CARD_TYPE.DECK, i);

          if (i > 10 && i < l - 10 && ((i + 1) % 12 === 0)) {
            s += "<br>";
          }
        }

        UI.DOM.cardDeck.innerHTML = s;
      }
    },

    showHand: function(redealAll) {
      var
        i = 0,
        l = YAHTZLE.HAND.length,
        DOM = UI.DOM;

      if (l > 0) {
        if (YAHTZLE.DEAL_COUNT === 1 || redealAll === true) {
          var s = "";

          // dynamically create html
          for (; i < l; i++) {
            s += UI.buildCardHTML(YAHTZLE.HAND[i], UI.CARD_TYPE.HAND, i);
          }

          DOM.cardHand.innerHTML = s;

          // add click listener for each card
          var hand = DOM.cardHand.children;

          for (i = 0; i < l; i++) {
            hand[i].addEventListener("click", function() {
              var card = YAHTZLE.HAND[parseInt(this.id.substring(5), 10)];

              // keep track of which card to discard / keep
              if (card.discard) {
                delete card.discard;
                this.classList.remove("discard");
                YAHTZLE.DISCARD_COUNT--;
              }
              else {
                card.discard = true;
                this.classList.add("discard");
                YAHTZLE.DISCARD_COUNT++;
              }

              UI.helperMatchDiscard(card);

              if (YAHTZLE.DEAL_COUNT < YAHTZLE.DEAL_MAX) {
                // enable deal button only if card are being discarded
                if (YAHTZLE.DISCARD_COUNT === 0 && !UI.DOM.buttonDeal.disabled) {
                  DOM.buttonDeal.disabled = true;
                }
                else if (DOM.buttonDeal.disabled) {
                  DOM.buttonDeal.disabled = false;
                }
              }
            });
          }
        }
        else if (YAHTZLE.DEAL_COUNT <= YAHTZLE.DEAL_MAX) {
          for (i = 0; i < l; i++) {
            if (YAHTZLE.HAND[i].discard === true) {
              DOM.cardHand.children[i].innerHTML = UI.helperCardHTML(YAHTZLE.HAND[i]);
            }
          }
        }
      }
    },

    // display scorebox cards
    showScorebox: function() {
      var DOM = UI.DOM;

      this.buildScoreboxHTML(DOM.scoreNines, YAHTZLE.SCORE_BOX.NINES.CARDS);
      this.buildScoreboxHTML(DOM.scoreJacks, YAHTZLE.SCORE_BOX.JACKS.CARDS);
      this.buildScoreboxHTML(DOM.scoreQueens, YAHTZLE.SCORE_BOX.QUEENS.CARDS);
      this.buildScoreboxHTML(DOM.scoreKings, YAHTZLE.SCORE_BOX.KINGS.CARDS);
      this.buildScoreboxHTML(DOM.scoreAces, YAHTZLE.SCORE_BOX.ACES.CARDS);
      this.buildScoreboxHTML(DOM.scoreMarriages, YAHTZLE.SCORE_BOX.MARRIAGES.CARDS);
      this.buildScoreboxHTML(DOM.score240, YAHTZLE.SCORE_BOX.SCORE_240.CARDS);
      this.buildScoreboxHTML(DOM.scorePinochles, YAHTZLE.SCORE_BOX.PINOCHLES.CARDS);
      this.buildScoreboxHTML(DOM.scoreRuns, YAHTZLE.SCORE_BOX.RUNS.CARDS);
      this.buildScoreboxHTML(DOM.scoreChance, YAHTZLE.SCORE_BOX.CHANCE.CARDS);
    },

    // toggle suit selection
    suitSelect: function(set) {
      var
        DOM = this.DOM,
        s = DOM.suits;

      for (var i = 0; i < s.length; i++) {
        s[i].disabled = !set;
      }

      DOM.buttonNew.disabled = set;
      DOM.buttonDeal.disabled = set;
    }
  };

window.addEventListener("load", function() {
  var
    DOM = UI.DOM,
    ID = UI.IDS;

  DOM.buttonNew = $id("button_new");
  DOM.buttonToggle = $id("button_toggle");
  DOM.buttonShuffle = $id("button_shuffle");
  DOM.buttonDeal = $id("button_deal");
  DOM.buttonRedeal = $id("button_redeal");
  DOM.buttonBunch = $id("button_bunch");
  DOM.deals = $id("deal_count").children;
  DOM.suits = $CSS("input[name='suit']");
  DOM.suitHearts = $id("select_hearts");
  DOM.suitClubs = $id("select_clubs");
  DOM.suitDiamonds = $id("select_diamonds");
  DOM.suitSpades = $id("select_spades");
  DOM.buttonSetTrump = $id("button_set_trump");
  DOM.cardDeck = $id("card_deck");
  DOM.cardHand = $id("card_hand");
  DOM.scoreNines = $id(ID.NINES);
  DOM.scoreJacks = $id(ID.JACKS);
  DOM.scoreQueens = $id(ID.QUEENS);
  DOM.scoreKings = $id(ID.KINGS);
  DOM.scoreAces = $id(ID.ACES);
  DOM.scoreMarriages = $id(ID.MARRIAGES);
  DOM.score240 = $id(ID.SCORE_240);
  DOM.scorePinochles = $id(ID.PINOCHLE);
  DOM.scoreRuns = $id(ID.RUNS);
  DOM.scoreChance = $id(ID.CHANCE);
  DOM.textNines = DOM.scoreNines.previousElementSibling.children[0];
  DOM.textJacks = DOM.scoreJacks.previousElementSibling.children[0];
  DOM.textQueens = DOM.scoreQueens.previousElementSibling.children[0];
  DOM.textKings = DOM.scoreKings.previousElementSibling.children[0];
  DOM.textAces = DOM.scoreAces.previousElementSibling.children[0];
  DOM.textBonus = $id("score_bonus");
  DOM.textMarriages = DOM.scoreMarriages.previousElementSibling.children[0];
  DOM.text240 = DOM.score240.previousElementSibling.children[0];
  DOM.textPinochles = DOM.scorePinochles.previousElementSibling.children[0];
  DOM.textRuns = DOM.scoreRuns.previousElementSibling.children[0];
  DOM.textChance = DOM.scoreChance.previousElementSibling.children[0];
  DOM.textTotal = $id("score_total");

  DOM.buttonNew.addEventListener("click", UI.buttonNew);
  DOM.buttonToggle.addEventListener("click", UI.buttonToggleDeck);
  DOM.buttonShuffle.addEventListener("click", UI.buttonShuffle);
  DOM.buttonDeal.addEventListener("click", UI.buttonDeal);
  DOM.buttonRedeal.addEventListener("click", UI.buttonRedeal);
  DOM.buttonBunch.addEventListener("click", UI.buttonBunch);

  DOM.scoreNines.addEventListener("click", UI.selectScore);
  DOM.scoreJacks.addEventListener("click", UI.selectScore);
  DOM.scoreQueens.addEventListener("click", UI.selectScore);
  DOM.scoreKings.addEventListener("click", UI.selectScore);
  DOM.scoreAces.addEventListener("click", UI.selectScore);
  DOM.scoreMarriages.addEventListener("click", UI.selectScore);
  DOM.score240.addEventListener("click", UI.selectScore);
  DOM.scorePinochles.addEventListener("click", UI.selectScore);
  DOM.scoreRuns.addEventListener("click", UI.selectScore);
  DOM.scoreChance.addEventListener("click", UI.selectScore);

  // trump suit selection
  for (var i = 0; i < DOM.suits.length; i++) {
    DOM.suits[i].addEventListener("click", UI.checkSuit);
  }

  DOM.buttonSetTrump.addEventListener("click", UI.buttonSuitVerify);

  YAHTZLE.initialize();
  YAHTZLE.shuffle(5);
  YAHTZLE.initScorebox();
  UI.showScorebox();

  console.log("READY");
});