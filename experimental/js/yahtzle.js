/**
 * version 0.1
 *
 * - 2016-02-16: initial version
 */

/* global UTIL */
var
  YAHTZLE = (function() {
    function _initialize() {
      _HIGH_SCORES.refresh();
      _SCOREBOX.initialize();
      _DECK.initialize();
      _DECK.shuffle();
      _SETTINGS.restore();
      _GAME.playersInitialize();
    }

    var
      _CARD = (function() {
        function _card(value, suit, id) {
          this.value = value ? value : null;
          this.suit = suit ? suit : null;
          this.code = _codeLookup(null, value, suit);
          this.id = UTIL.isInteger(id) ? id : null;
        }

        // returns a card object based on a 2-letter string (ex. 9H = card { value: 9, suit: HEARTS } )
        function _codeCreate(s) {
          if (typeof(s) === "string" && s.length === 2) {
            var
              value = null,
              suit = null;

            switch(s.substr(0, 1)) {
              case "A":
                value = _VALUES.ACE;
                break;

              case "T":
                value = _VALUES.TEN;
                break;

              case "K":
                value = _VALUES.KING;
                break;

              case "Q":
                value = _VALUES.QUEEN;
                break;

              case "J":
                value = _VALUES.JACK;
                break;

              case "9":
                value = _VALUES.NINE;
                break;
            }

            switch(s.substr(1, 1)) {
              case "D":
                suit = _SUITS.DIAMONDS;
                break;

              case "S":
                suit = _SUITS.SPADES;
                break;

              case "H":
                suit = _SUITS.HEARTS;
                break;

              case "C":
                suit = _SUITS.CLUBS;
            }

            if (value !== null && suit !== null) return _create(value, suit);
          }

          return null;
        }

        // returns a 2-letter code from card
        function _codeLookup(card, value, suit) {
          if (card) {
            value = card.value;
            suit = card.suit;
          }

          switch(value) {
            case _VALUES.ACE:
              value = "A";
              break;

            case _VALUES.TEN:
              value = "T";
              break;

            case _VALUES.KING:
              value = "K";
              break;

            case _VALUES.QUEEN:
              value = "Q";
              break;

            case _VALUES.JACK:
              value = "J";
              break;

            case _VALUES.NINE:
              value = "9";
          }

          switch(suit) {
            case _SUITS.DIAMONDS:
              suit = "D";
              break;

            case _SUITS.SPADES:
              suit = "S";
              break;

            case _SUITS.HEARTS:
              suit = "H";
              break;

            case _SUITS.CLUBS:
              suit = "C";
          }

          return (!value || !suit ? null : value + suit);
        }

        function _copy(card) {
          var new_card = _create(card.value, card.suit, card.id);

          if (card.hasOwnProperty("discard"))
            new_card.discard = card.discard;

          return new_card;
        }

        function _create(value, suit, id) {
          return new _card(value, suit, id);
        }

        /* PRIVATE */
        var
          _SUITS = {
            DIAMONDS: "♦",
            SPADES: "♠",
            HEARTS: "♥",
            CLUBS: "♣"
          },

          _VALUES = {
            ACE: "A",
            TEN: "10",
            KING: "K",
            QUEEN: "Q",
            JACK: "J",
            NINE: "9"
          };

        /* PUBLIC */
        return {
          SUITS: _SUITS,
          VALUES: _VALUES,

          codeCreate: _codeCreate,
          codeLookup: _codeLookup,
          copy: _copy,
          create: _create
        };
      })(),

      _DECK = (function() {
        // initialize deck suits & values for double deck pinochle
        function _initialize() {
          var
            C = YAHTZLE.CARD,
            id = 0,
            i, j, k;

          _CARDS.length = 0;

          for (i = 0; i < 2; i++) {
            for (j in C.SUITS) {
              for (k in C.VALUES) {
                _CARDS.push(C.create(C.VALUES[k], C.SUITS[j], id++));
              }
            }
          }
        }

        /* ---------------------------| SHUFFLING |--------------------------- */
        // get random deck "chunk" of cards; shuffle() helper
        function _chunk(a) {
          var
            l = a.length,
            chunk_size = 0;

          if (l > 0) {
            chunk_size = UTIL.getRandom(_CHUNK_MIN, _CHUNK_MAX);

            return a.splice(l - 1 - chunk_size, chunk_size);
          }
        }

        function _shuffle(n) {
          var
            current_split = 0;

          if (!UTIL.isInteger(n))
            n = UTIL.getRandom(_SHUFFLE_MIN, _SHUFFLE_MAX);

          for (var i = 0; i < n; i++) {
            _split(); // split the deck

            current_split = UTIL.getRandom(1, 2); // randomly choose a side of the split deck to kick off the shuffle

            // shuffle the cards
            while (_SPLIT_1.length || _SPLIT_2.length) {
              if (current_split === 1) {
                Array.prototype.splice.apply(_CARDS, [0, 0].concat(_chunk(_SPLIT_1)));
                if (_SPLIT_2.length) current_split = 2;
              }
              else {
                Array.prototype.splice.apply(_CARDS, [0, 0].concat(_chunk(_SPLIT_2)));
                if (_SPLIT_1.length) current_split = 1;
              }
            }
          }
        }

        function _split() {
          var
            l = _CARDS.length;

          if (l > 0) {
            _SPLIT_1 = _CARDS.splice(0, Math.floor(l / 2) + UTIL.getRandom(-4, 4));
            _SPLIT_2 = _CARDS.splice(0, _CARDS.length);
          }
        }

        /* PRIVATE */
        var
          _CARDS = [],
          _DISCARDS = [],

          // temp "buckets" for shuffling
          _SPLIT_1 = [],
          _SPLIT_2 = [],

          // chunk sizes when shuffling
          _CHUNK_MIN = 1,
          _CHUNK_MAX = 4,

          _SHUFFLE_MIN = 5,
          _SHUFFLE_MAX = 10;

        /* PUBLIC */
        return {
          CARDS: _CARDS,
          DISCARDS: _DISCARDS,
          VISIBLE: false, // show deck / discard pile (developer mode)

          initialize: _initialize,
          shuffle: _shuffle
        };
      })(),

      _GAME = (function() {
        function _currentPlayer() {
          return _PLAYERS[YAHTZLE.GAME.CURRENT_PLAYER];
        }

        function _gameOverTest() {
          for (var i = 0, l = _PLAYERS.length; i < l; i++) {
            if (_PLAYERS[i].game_complete === false)
              return;
          }

          YAHTZLE.GAME.IN_PROGRESS = false;
        }

        function _initialize() {
          YAHTZLE.GAME.IN_PROGRESS = true;
          YAHTZLE.SCOREBOX.update();
        }

        function _playersInitialize() {
          var P = YAHTZLE.PLAYER;

          if (_PLAYERS.length === 0)
            _PLAYERS.push(P.create("Player 1", P.TYPE.HUMAN));
        }

        function _playersResize(n) {
          var
            P = YAHTZLE.PLAYER,
            l = _PLAYERS.length,
            i = 0;

          if (n != l && n > 0 && n <= YAHTZLE.GAME.PLAYERS_MAX) {
            YAHTZLE.GAME.PLAYER_COUNT = n;

            // shrink
            if (l > n) {
              // remove scorecard object from removed players..not really sure, but just leave it
              for (i = n - 1; i < l; i++) {
                delete _PLAYERS[i].scorecard;
              }

              _PLAYERS.length = n;
            }

            // grow
            else {
              for (i = l + 1; i <= n; i++) {
                _PLAYERS.push(P.create("Player " + i, P.TYPE.HUMAN));
              }
            }
          }
        }

        function _reset() {
          var
            player = null,
            THIS = YAHTZLE.GAME;

          THIS.IN_PROGRESS = false;
          THIS.TRUMP_SUIT = null;
          THIS.CURRENT_PLAYER = 0;

          YAHTZLE.SCOREBOX.reset();
          YAHTZLE.HAND.reset();

          // player scorecards
          // - actual players are left alone; administered in player setup screen
          for (var i = 0, l = _PLAYERS.length; i < l; i++) {
            player = _PLAYERS[i];
            player.game_complete = false;
            player.scorecard.restore();
          }
        }

        function _setSuit(suit) {
          var S = YAHTZLE.CARD.SUITS;

          if (suit === S.DIAMONDS || suit === S.SPADES || suit === S.HEARTS || suit === S.CLUBS) {
            YAHTZLE.GAME.TRUMP_SUIT = suit;
            return true;
          }
          else
            return false;
        }

        function _setSuitRandom() {
          var
            S = YAHTZLE.CARD.SUITS,
            THIS = YAHTZLE.GAME;

          switch(UTIL.getRandom(0, 3)) {
            case 0:
              THIS.TRUMP_SUIT = S.DIAMONDS;
              break;

            case 1:
              THIS.TRUMP_SUIT = S.SPADES;
              break;

            case 2:
              THIS.TRUMP_SUIT = S.HEARTS;
              break;

            case 3:
              THIS.TRUMP_SUIT = S.CLUBS;
          }
        }

        var
          _PLAYERS = [];

        /* PUBLIC */
        return {
          CURRENT_PLAYER: 0, // index # of current player in PLAYERS array
          IN_PROGRESS: false,
          PLAYERS: _PLAYERS,
          PLAYER_COUNT: 1,
          PLAYERS_MAX: 4,
          TRUMP_SUIT: null,

          currentPlayer: _currentPlayer,
          gameOverTest: _gameOverTest,
          initialize: _initialize,
          playersInitialize: _playersInitialize,
          playersResize: _playersResize,
          reset: _reset,
          setSuit: _setSuit,
          setSuitRandom: _setSuitRandom
        };
      })(),

      _HAND = (function() {
        function _bunch() {
          var
            Y = YAHTZLE;

          Y.SCOREBOX.reset();
          Y.SCORECARD.resetHand(Y.GAME.currentPlayer().scorecard);
          _reset();
          Y.GAME.DEAL_COUNT = 0;
        }

        function _deal(arr) {
          if (arr === undefined || arr === null || arr.length <= 1)
            _dealNormal();
          else
            _dealDebug(arr); // DEVELOPER mode

          _testBunch();
          YAHTZLE.SCOREBOX.matchCards();
        }

        function _dealAllNew() {
          var
            THIS = YAHTZLE.HAND,
            D = YAHTZLE.DECK,
            i = 0;

          _discard(true);
          D.shuffle();

          for (; i < THIS.CARDS_MAX; i++) {
            _CARDS.push(_helperDrawCard());
            _CARDS[i].discard = THIS.DISCARD_NEW;
          }
        }

        /*
          DEAL (DEBUG MODE)
          -----------------
          D=DIAMONDS, S=SPADES, H=HEARTS, C=CLUBS
          A=ACE, T=TEN, K=KING, Q=QUEEN, J=JACK, 9=NINE

          sample | AS QH QS TD 9H 9S JD AD KS KD QD TC
        */
        function _dealDebug(arr) {
          var
            THIS = YAHTZLE.HAND,
            D = YAHTZLE.DECK,
            C = YAHTZLE.CARD,
            card = null,
            i = 0,
            j = 0;

          _discard(true);
          D.shuffle();

          for (i = 1; i < arr.length; i++) {
            card = C.codeCreate(arr[i]);

            // if this is a valid card code, attempt to draw it from the deck
            if (card !== null) {
              for (j = 0; j < D.CARDS.length; j++) {
                if (card.value === D.CARDS[j].value && card.suit === D.CARDS[j].suit) {
                  card = D.CARDS.splice(j, 1)[0];
                  card.discard = THIS.DISCARD_NEW;
                  _CARDS.push(card);
                  break;
                }
              }
            }
          }

          // randomly draw remaining cards
          for (i = _CARDS.length; i < THIS.CARDS_MAX; i++) {
            _CARDS.push(_helperDrawCard());
            _CARDS[i].discard = THIS.DISCARD_NEW;
          }
        }

        function _dealNormal() {
          var
            THIS = YAHTZLE.HAND,
            D = YAHTZLE.DECK;

          if (THIS.DEAL_COUNT === 1)
            _dealAllNew();

          else {
            _discard(false);
            D.shuffle();

            for (var i = 0, l = _CARDS.length; i < l; i++) {
              if (_CARDS[i].discard === true) {
                _CARDS[i] = _helperDrawCard();
                _CARDS[i].discard = THIS.DISCARD_NEW;
              }
            }
          }
        }

        function _discard(discard_all) {
          var
            THIS = YAHTZLE.HAND,
            D = YAHTZLE.DECK;

          if (_CARDS.length > 0) {
            var
              card = null,
              i = 0,
              l = D.DISCARDS.length;

            // place remix pile back into the deck
            if (THIS.REMIX_DISCARDS && l > 0) {
              for (i = 0; i < l; i++) {
                D.CARDS.push(D.DISCARDS[i]);
              }

              D.DISCARDS.length = 0;
            }

            l = _CARDS.length;

            // discard all cards
            if (discard_all === true) {
              for (i = 0; i < l; i++) {
                card = _CARDS[i];
                delete card.discard;

                // place discards into the deck
                if (THIS.REMIX_DISCARDS)
                  D.CARDS.push(card);

                // place discards into discard area
                else
                  D.DISCARDS.push(card);
              }

              _CARDS.length = 0;
            }

            // discard only cards designated
            else {
              var copy;

              for (i = 0; i < l; i++) {
                card = _CARDS[i];

                if (card.discard === true) {
                  copy = YAHTZLE.CARD.copy(card);
                  delete copy.discard;

                  if (THIS.REMIX_DISCARDS)
                    D.CARDS.push(copy);
                  else
                    D.DISCARDS.push(copy);
                }
              }
            }
          }
        }

        function _generateCode() {
          var
            l = _CARDS.length;

          if (l > 0) {
            var
              lookup = YAHTZLE.CARD.codeLookup,
              s = lookup(_CARDS[0]);

            for (var i = 1; i < l; i++) {
              s += " " + lookup(_CARDS[i]);
            }

            return s;
          }
        }

        function _helperDrawCard() {
          return YAHTZLE.DECK.CARDS.splice(UTIL.getRandom(0, YAHTZLE.DECK.CARDS.length - 1), 1)[0];
        }

        function _moveCard(pos, new_pos) {
          var
            l = _CARDS.length;

          if (
            l > 0 &&
            UTIL.isInteger(pos) && UTIL.isInteger(new_pos) &&
            pos !== new_pos &&
            pos >= 0 && pos < l &&
            new_pos >= 0 && new_pos < l) {

            var
              card = YAHTZLE.CARD.copy(_CARDS[pos]);

            _CARDS[pos] = _CARDS[new_pos];
            _CARDS[new_pos] = card;
          }
        }

        function _moveLeft(n) {
          var
            l = _CARDS.length;

          if (l > 0 && UTIL.isInteger(n) && n > 0 && n < l)
            _moveCard(n, n - 1);
        }

        function _moveRight(n) {
          var
            l = _CARDS.length;

          if (l > 0 && UTIL.isInteger(n) && n >= 0 && n < l - 1)
            _moveCard(n, n + 1);
        }

        function _preDeal() {
          if (YAHTZLE.GAME.currentPlayer().game_complete === true)
            return false;

          var
            THIS = YAHTZLE.HAND,
            status = false;

          if (THIS.DEAL_COUNT >= _DEALS_MAX)
            status = false;

          else if (THIS.DEAL_COUNT === 0) {
            THIS.DEAL_COUNT++;
            status = true;
          }

          else {
            // find at least one card marked as discard
            for (var i = 0, l = _CARDS.length; i < l; i++) {
              if (_CARDS[i].discard === true) {
                THIS.DEAL_COUNT++;
                status = true;
                break;
              }
            }
          }

          // reset (chance) scoring flags
          if (status === true && YAHTZLE.GAME.currentPlayer().scorecard.CHANCE.SCORE === null) {
            var SCORING = YAHTZLE.SCOREBOX.SCORING;

            for (var key in SCORING) {
              if (SCORING.hasOwnProperty(key))
                SCORING[key].SET = false;
            }
          }

          return status;
        }

        function _reset() {
          var
            THIS = YAHTZLE.HAND,
            remix = THIS.REMIX_DISCARDS;

          THIS.REMIX_DISCARDS = true;
          _discard(true);
          THIS.REMIX_DISCARDS = remix;
          _CARDS.length = 0;
          THIS.BUNCH_EXISTS = false;
          THIS.DEAL_COUNT = 0;
        }

        function _testBunch() {
          var
            THIS = YAHTZLE.HAND,
            l = _CARDS.length;

          if (THIS.DEAL_COUNT === 1 && l === THIS.CARDS_MAX) {
            var
              i = 0,
              num_nines = 0;

            for (; i < l; i++) {
              if (_CARDS[i].value === YAHTZLE.CARD.VALUES.NINE)
                num_nines++;

              if (num_nines >= _BUNCH_COUNT) {
                THIS.BUNCH_EXISTS = true;
                return;
              }
            }
          }

          THIS.BUNCH_EXISTS = false;
        }

        function _toggleDiscard(n) {
          if (_CARDS.length > 0) {
            n = UTIL.toInteger(n);

            if (UTIL.isInteger(n) && n > 0 && n <= YAHTZLE.HAND.CARDS_MAX) {
              var card = _CARDS[n - 1];

              card.discard = !card.discard;
            }
          }
        }

        function _toggleDiscardAll() {
          var
            l = _CARDS.length;

          if (l > 0) {
            var
              i = 0,
              keep_found = false;

            // check if any cards are designated "keep"
            for (i = 0; i < l; i++) {
              if (_CARDS[i].discard === false) {
                keep_found = true;
                break;
              }
            }

            // toggle hand to all discard or keep
            for (i = 0; i < l; i++) {
              _CARDS[i].discard = keep_found;
            }
          }
        }

        /* PRIVATE */
        var
          _BUNCH_COUNT = 5,
          _CARDS = [],
          _DEALS_MAX = 3;

        /* PUBLIC */
        return {
          BUNCH_EXISTS: false,
          CARDS: _CARDS,
          CARDS_MAX: 12,
          DEAL_COUNT: 0,
          DISCARD_NEW: true,
          REMIX_DISCARDS: false, // controls if discards are placed into the deck or discard area

          bunch: _bunch,
          deal: _deal,
          generateCode: _generateCode,
          moveLeft: _moveLeft,
          moveRight: _moveRight,
          preDeal: _preDeal,
          reset: _reset,
          toggleDiscard: _toggleDiscard,
          toggleDiscardAll: _toggleDiscardAll
        };
      })(),

      _HIGH_SCORES = (function() {
        function _add(name, score) {
          var
            THIS = YAHTZLE.HIGH_SCORES,
            DB = UTIL.STORAGE,
            l = _SESSION.length,
            result = _ADD_RESULT.NONE,

            record = {
              NAME: name,
              SCORE: score
            };

          // HIGH SCORES FOR THE SESSION
          if (l < THIS.MAX_RECORDS || score > _SESSION[l - 1].SCORE) {
            result = _ADD_RESULT.SESSION_HIGH_SCORE;
            _SESSION.push(record);
            _SESSION.sort(_sortByScore);

            if (_SESSION.length > THIS.MAX_RECORDS)
              _SESSION.pop();
          }

          // HIGH SCORES FOR THE DEVICE
          _DEVICE.length = 0;
          _DEVICE = DB.get(_STORAGE_ID); // read from localStorage

          if (_DEVICE === null)
            _DEVICE = [];

          l = _DEVICE.length;

          if (l < THIS.MAX_RECORDS || score > _DEVICE[l - 1].SCORE) {
            result = _ADD_RESULT.DEVICE_HIGH_SCORE;
            _DEVICE.push(record);
            _DEVICE.sort(_sortByScore);

            if (_DEVICE.length > THIS.MAX_RECORDS)
              _DEVICE.pop();

            DB.set(_STORAGE_ID, _DEVICE); // write scores back to localStorage
          }

          return result;
        }

        function _clear() {
          _SESSION.length = 0;
          _DEVICE.length = 0;
          UTIL.STORAGE.clear(_STORAGE_ID);
        }

        function _refresh() {
          _DEVICE.length = 0;
          _DEVICE = UTIL.STORAGE.get(_STORAGE_ID);

          if (_DEVICE === null)
            _DEVICE = [];
        }

        // sort descending
        function _sortByScore(a, b) {
          if (a.SCORE === b.SCORE)
            return 0;

          return a.SCORE > b.SCORE ? -1 : 1;
        }

        /* PRIVATE */
        var
          // result codes for add new high score function
          _ADD_RESULT = {
            NONE: 0,
            DEVICE_HIGH_SCORE: 1,
            SESSION_HIGH_SCORE: 2
          },

          _DEVICE = [],
          _SESSION = [],
          _STORAGE_ID = "HIGH SCORES";

        /* PUBLIC */
        return {
          DEVICE: _DEVICE,
          SESSION: _SESSION,
          MAX_RECORDS: 10,

          add: _add,
          clear: _clear,
          refresh: _refresh
        };
      })(),

      _PLAYER = (function() {
        function _create(name, type) {
          return new _player(name, type);
        }

        function _player(name, type) {
          this.name = name;
          this.type = (type === _TYPE.CPU ? _TYPE.CPU : _TYPE.HUMAN);
          this.scorecard = YAHTZLE.SCORECARD.create();
          this.game_complete = false;
        }

        /* PRIVATE */
        var
          _TYPE = {
            HUMAN: 0,
            CPU: 1
          };

        /* PUBLIC */
        return {
          TYPE: _TYPE,

          create: _create
        };
      })(),

      // score-matching + support functions
      _SCOREBOX = (function() {
        // adds portion of upper score; used by MATCHCARD-BONUS calculation
        function _helperAddUpper(o, section) {
          if (UTIL.isInteger(section.SCORE))
            o.UPPER_SCORE += section.SCORE;

          else if (o.POSSIBLE_USED === false && UTIL.isInteger(section.POSSIBLE)) {
            o.POSSIBLE_USED = true;
            o.UPPER_SCORE += section.POSSIBLE;
          }
        }

        // copy basic cards (value, suit, id) from one container to another, on a range or specific indexes
        // 1) idx - start index range
        //    end_idx - end index range (optional parameter, copies to the end of source array if not provided)
        // 2) idx - array of specific indexes (end_idx is not required and not used at all)
        function _helperCopyCards(destination, source, idx, end_idx) {
          var
            i = 0,
            l = 0,
            copy = YAHTZLE.CARD.copy;

          if (Array.isArray(idx)) {
            for (i = 0, l = idx.length; i < l; i++) {
              destination.push(copy(source[idx[i]]));
            }
          }
          else {
            for (i = (UTIL.isInteger(idx) ? idx : 0), l = (UTIL.isInteger(end_idx) ? end_idx + 1 : source.length); i < l; i++) {
              destination.push(copy(source[i]));
            }
          }
        }

        function _helperCreateCard(value, suit) {
          var
            card = YAHTZLE.CARD.create(value, suit);

          card.category = YAHTZLE.SCOREBOX.STATUS.NONE;

          return card;
        }

        function _helperCreateCategory(section, title, points, id) {
          YAHTZLE.SCOREBOX.SCORING[section] = {
            TITLE: title,
            SET: false,
            POINTS: points,
            ID: id,
            CARDS: []
          };
        }

        // create new scoring category composite object literal
        function _helperCreateRecord(record) {
          return {
            ID: record.ID,
            CARDS: record.CARDS.slice()
          };
        }

        function _helperInitEmpties(arr) {
          arr.push(_helperCreateCard());
        }

        function _helperInitFaces(arr, value) {
          var
            C = YAHTZLE.CARD,
            j = null;

          for (var i = 0; i < 2; i++) {
            for (j in C.SUITS)
              arr.push(_helperCreateCard(value, C.SUITS[j]));
          }
        }

        function _helperMatchSectionCards(section) {
          var
            H = YAHTZLE.HAND.CARDS,
            card_hand = null,
            card_section = null,
            i = 0,
            j = 0,
            l_section = 0,
            l_hand = H.length;

          // try to match each card in hand to score section cards
          for (i = 0; i < l_hand; i++) {
            card_hand = H[i];

            for (j = 0, l_section = section.length; j < l_section; j++) {
              card_section = section[j];

              if (card_section.id === null && card_hand.value === card_section.value && card_hand.suit === card_section.suit) {
                card_section.id = card_hand.id;
                card_section.category = _STATUS.CAUTION;
                break;
              }
            }
          }
        }

        function _helperScoringAdjust(section, record, remove_id) {
          if (section.SCORE === null) {
            for (var i = 0, l = section.SCORING.length; i < l; i++) {
              if (section.SCORING[i].ID === remove_id) {
                section.SCORING.splice(i, 1);
                break;
              }
            }

            section.SCORING.push(_helperCreateRecord(record));
          }
        }

        function _helperScoringReset(section) {
          if (section.SCORE === null)
            section.SCORING.length = 0;
        }

        // push new scoring category composite object literal
        // section - scorecard section
        function _helperScoringSet(section, record) {
          if (section.SCORE === null)
            section.SCORING.push(_helperCreateRecord(record));
        }

        function _initialize() {
          var
            i = 0,
            j = null,
            C = YAHTZLE.CARD;

          // INITIALIZE ALL SCOREBOX SECTIONS WITH APPROPRIATE ARRAY OF CARDS
          _SECTION.NINES.length = 0;
          _SECTION.JACKS.length = 0;
          _SECTION.QUEENS.length = 0;
          _SECTION.KINGS.length = 0;
          _SECTION.ACES.length = 0;

          _helperInitEmpties(_SECTION.NINES);
          _helperInitFaces(_SECTION.JACKS, C.VALUES.JACK);
          _helperInitFaces(_SECTION.QUEENS, C.VALUES.QUEEN);
          _helperInitFaces(_SECTION.KINGS, C.VALUES.KING);
          _helperInitFaces(_SECTION.ACES, C.VALUES.ACE);

          // marriages
          _SECTION.MARRIAGES.length = 0;

          for (i = 0; i < 2; i++) {
            for (j in C.SUITS) {
              _SECTION.MARRIAGES.push(_helperCreateCard(C.VALUES.KING, C.SUITS[j]));
              _SECTION.MARRIAGES.push(_helperCreateCard(C.VALUES.QUEEN, C.SUITS[j]));
            }
          }

          // 240 around the house
          _SECTION.AROUND_240.length = 0;

          for (j in C.SUITS) {
            _SECTION.AROUND_240.push(_helperCreateCard(C.VALUES.KING, C.SUITS[j]));
            _SECTION.AROUND_240.push(_helperCreateCard(C.VALUES.QUEEN, C.SUITS[j]));
          }

          // pinochles
          _SECTION.PINOCHLES.length = 0;
          _SECTION.PINOCHLES.push(_helperCreateCard(C.VALUES.QUEEN, C.SUITS.SPADES));
          _SECTION.PINOCHLES.push(_helperCreateCard(C.VALUES.JACK, C.SUITS.DIAMONDS));
          _SECTION.PINOCHLES.push(_helperCreateCard(C.VALUES.QUEEN, C.SUITS.SPADES));
          _SECTION.PINOCHLES.push(_helperCreateCard(C.VALUES.JACK, C.SUITS.DIAMONDS));

          _SECTION.RUNS.length = 0;
          _SECTION.CHANCE.length = 0;

          _helperInitEmpties(_SECTION.RUNS);
          _helperInitEmpties(_SECTION.CHANCE);
          _helperInitEmpties(_SECTION.YAHTZLE);

          // INITIALIZE ALL SCOREBOX SCORING CATEGORIES
          _helperCreateCategory("DOUBLE_RUN_DIAMONDS", "Double Run (Diamonds)", 1500, 0);
          _helperCreateCategory("DOUBLE_RUN_SPADES", "Double Run (Spades)", 1500, 1);
          _helperCreateCategory("DOUBLE_RUN_HEARTS", "Double Run (Hearts)", 1500, 2);
          _helperCreateCategory("DOUBLE_RUN_CLUBS", "Double Run (Clubs)", 1500, 3);
          _helperCreateCategory("ACES_1000", "1000 Aces", 1000, 4);
          _helperCreateCategory("KINGS_800", "800 Kings", 800, 5);
          _helperCreateCategory("QUEENS_600", "600 Queens", 600, 6);
          _helperCreateCategory("JACKS_400", "400 Jacks", 400, 7);
          _helperCreateCategory("DOUBLE_PINOCHLE", "Double Pinochle", 300, 8);
          _helperCreateCategory("DOUBLE_MARRIAGE_DIAMONDS", "Double Marriage (Diamonds)", 300, 9);
          _helperCreateCategory("DOUBLE_MARRIAGE_SPADES", "Double Marriage (Spades)", 300, 10);
          _helperCreateCategory("DOUBLE_MARRIAGE_HEARTS", "Double Marriage (Hearts)", 300, 11);
          _helperCreateCategory("DOUBLE_MARRIAGE_CLUBS", "Double Marriage (Clubs)", 300, 12);
          _helperCreateCategory("AROUND_240", "240 Around the Horn", 240, 13);
          _helperCreateCategory("RUN_DIAMONDS", "Run (Diamonds)", 150, 14);
          _helperCreateCategory("RUN_SPADES", "Run (Spades)", 150, 15);
          _helperCreateCategory("RUN_HEARTS", "Run (Hearts)", 150, 16);
          _helperCreateCategory("RUN_CLUBS", "Run (Clubs)", 150, 17);
          _helperCreateCategory("ACES_100", "100 Aces", 100, 18);
          _helperCreateCategory("KINGS_80", "80 Kings", 80, 19);
          _helperCreateCategory("QUEENS_60", "60 Queens", 60, 20);
          _helperCreateCategory("JACKS_40", "40 Jacks", 40, 21);
          _helperCreateCategory("PINOCHLE", "Pinochle", 40, 22);
          _helperCreateCategory("MARRIAGE_TRUMP_DIAMONDS", "Marriage (Diamonds - TRUMP)", 40, 23);
          _helperCreateCategory("MARRIAGE_TRUMP_SPADES", "Marriage (Spades - TRUMP)", 40, 24);
          _helperCreateCategory("MARRIAGE_TRUMP_HEARTS", "Marriage (Hearts - TRUMP)", 40, 25);
          _helperCreateCategory("MARRIAGE_TRUMP_CLUBS", "Marriage (Clubs - TRUMP)", 40, 26);
          _helperCreateCategory("MARRIAGE_DIAMONDS_1", "Marriage (Diamonds)", 20, 27);
          _helperCreateCategory("MARRIAGE_DIAMONDS_2", "Marriage (Diamonds)", 20, 28);
          _helperCreateCategory("MARRIAGE_SPADES_1", "Marriage (Spades)", 20, 29);
          _helperCreateCategory("MARRIAGE_SPADES_2", "Marriage (Spades)", 20, 30);
          _helperCreateCategory("MARRIAGE_HEARTS_1", "Marriage (Hearts)", 20, 31);
          _helperCreateCategory("MARRIAGE_HEARTS_2", "Marriage (Hearts)", 20, 32);
          _helperCreateCategory("MARRIAGE_CLUBS_1", "Marriage (Clubs)", 20, 33);
          _helperCreateCategory("MARRIAGE_CLUBS_2", "Marriage (Clubs)", 20, 34);
          _helperCreateCategory("NINE_TRUMP_1", "Nine (Trump)", 10, 35);
          _helperCreateCategory("NINE_TRUMP_2", "Nine (Trump)", 10, 36);
        }

        function _matchCards() {
          var
            i = 0,
            j = 0,
            l = 0,
            THIS = YAHTZLE.SCOREBOX,
            TRUMP = YAHTZLE.GAME.TRUMP_SUIT,
            CARD = YAHTZLE.CARD,
            SUITS = CARD.SUITS,
            VALUES = CARD.VALUES,
            scorecard = YAHTZLE.GAME.currentPlayer().scorecard,
            section = null,
            CARDS = null, // cards
            card = null,
            chance_unset = scorecard.CHANCE.SCORE === null,
            copy = YAHTZLE.CARD.copy,
            is_YAHTZLE_BONUS = false;

          _reset();

          // potential matches - YAHTZLE (always the 1st test)
          section = scorecard.YAHTZLE;
          CARDS = _SECTION.YAHTZLE;

          if (section.SCORE !== 0) {
            var
              HAND = YAHTZLE.HAND.CARDS,
              is_YAHTZLE = false,
              match_count = 0,
              no_match_count = 0,
              l_hand = HAND.length,
              value_checklist = {},
              key = null;

            // track possible values; mark complete as each is tested
            for (key in CARD.VALUES) {
              value_checklist[CARD.VALUES[key]] = false;
            }

            // test for all 8 of any 1 type of card (ie. all TENS)
            // - use the first 5 cards as card "YAHTZLE candidates" needing 8 other like cards; > 5 YAHTZLE is not possible
            for (i = 0; i < 5; i++) {
              card = HAND[i];

              if (value_checklist[card.value] === false) {
                match_count = 1;
                no_match_count = 0;

                for (j = i + 1; j < l_hand; j++) {
                  if (card.value === HAND[j].value)
                    match_count++;

                  else {
                    no_match_count++;

                    if (no_match_count >= 4)
                      break;
                  }
                }

                if (match_count === 8) {
                  is_YAHTZLE = true;
                  break;
                }

                value_checklist[card.value] = true;
              }
            }

            if (is_YAHTZLE) {
              _SECTION.YAHTZLE.length = 0;
              _helperInitFaces(CARDS, card.value);
              _helperMatchSectionCards(CARDS); // CARDS should always contain ordered list of matched cards

              // YAHTZLE
              if (section.SCORE === null)
                section.POSSIBLE = THIS.YAHTZLE_POINTS;

              // YAHTZLE BONUS
              else {
                is_YAHTZLE_BONUS = true;
                section = scorecard.YAHTZLE_BONUS;

                if (section.POSSIBLE === null)
                  section.POSSIBLE = THIS.YAHTZLE_BONUS_POINTS;
                else
                  section.POSSIBLE += THIS.YAHTZLE_BONUS_POINTS;
              }
            }
            else if (section.SCORE === null)
              section.POSSIBLE = 0;
          }

          // potential matches - NINES
          section = scorecard.NINES;
          CARDS = _SECTION.NINES;

          if (section.SCORE === null || chance_unset) {
            _helperMatchSectionCards(CARDS);
            _helperScoringReset(section);

            if (CARDS[0].category === _STATUS.CAUTION) {
              CARDS[0].category = _STATUS.PROCEED;
              section.POSSIBLE = _SCORING.NINE_TRUMP_1.POINTS;
              _SCORING.NINE_TRUMP_1.SET = true;
              _SCORING.NINE_TRUMP_1.CARDS.push(copy(CARDS[0]));
              _helperScoringSet(section, _SCORING.NINE_TRUMP_1);

              if (CARDS[1].category === _STATUS.CAUTION) {
                CARDS[1].category = _STATUS.PROCEED;
                section.POSSIBLE += _SCORING.NINE_TRUMP_2.POINTS;
                _SCORING.NINE_TRUMP_2.SET = true;
                _SCORING.NINE_TRUMP_2.CARDS.push(copy(CARDS[1]));
                _helperScoringSet(section, _SCORING.NINE_TRUMP_2);
              }
            }
            else if (section.SCORE === null)
              section.POSSIBLE = 0;
          }

          // potential _helperMatchSectionCardses - JACKS
          section = scorecard.JACKS;
          CARDS = _SECTION.JACKS;

          if (section.SCORE === null || chance_unset) {
            _helperMatchSectionCards(CARDS);
            _helperScoringReset(section);

            if (CARDS[0].category === _STATUS.CAUTION && CARDS[1].category === _STATUS.CAUTION && CARDS[2].category === _STATUS.CAUTION && CARDS[3].category === _STATUS.CAUTION) {
              CARDS[0].category = CARDS[1].category = CARDS[2].category = CARDS[3].category = _STATUS.PROCEED;

              if (CARDS[4].category === _STATUS.CAUTION && CARDS[5].category === _STATUS.CAUTION && CARDS[6].category === _STATUS.CAUTION && CARDS[7].category === _STATUS.CAUTION) {
                CARDS[4].category = CARDS[5].category = CARDS[6].category = CARDS[7].category = _STATUS.PROCEED;
                section.POSSIBLE = _SCORING.JACKS_400.POINTS;
                _SCORING.JACKS_400.SET = true;
                _helperCopyCards(_SCORING.JACKS_400.CARDS, CARDS);
                _helperScoringSet(section, _SCORING.JACKS_400);
              }
              else {
                section.POSSIBLE = _SCORING.JACKS_40.POINTS;
                _SCORING.JACKS_40.SET = true;
                _helperCopyCards(_SCORING.JACKS_40.CARDS, CARDS, 0, 3);
                _helperScoringSet(section, _SCORING.JACKS_40);
              }
            }
            else if (section.SCORE === null)
              section.POSSIBLE = 0;
          }

          // potential _helperMatchSectionCardses - QUEENS
          section = scorecard.QUEENS;
          CARDS = _SECTION.QUEENS;

          if (section.SCORE === null || chance_unset) {
            _helperMatchSectionCards(CARDS);
            _helperScoringReset(section);

            if (CARDS[0].category === _STATUS.CAUTION && CARDS[1].category === _STATUS.CAUTION && CARDS[2].category === _STATUS.CAUTION && CARDS[3].category === _STATUS.CAUTION) {
              CARDS[0].category = CARDS[1].category = CARDS[2].category = CARDS[3].category = _STATUS.PROCEED;

              if (CARDS[4].category === _STATUS.CAUTION && CARDS[5].category === _STATUS.CAUTION && CARDS[6].category === _STATUS.CAUTION && CARDS[7].category === _STATUS.CAUTION) {
                CARDS[4].category = CARDS[5].category = CARDS[6].category = CARDS[7].category = _STATUS.PROCEED;
                section.POSSIBLE = _SCORING.QUEENS_600.POINTS;
                _SCORING.QUEENS_600.SET = true;
                _helperCopyCards(_SCORING.QUEENS_600.CARDS, CARDS);
                _helperScoringSet(section, _SCORING.QUEENS_600);
              }
              else {
                section.POSSIBLE = _SCORING.QUEENS_60.POINTS;
                _SCORING.QUEENS_60.SET = true;
                _helperCopyCards(_SCORING.QUEENS_60.CARDS, CARDS, 0, 3);
                _helperScoringSet(section, _SCORING.QUEENS_60);
              }
            }
            else if (section.SCORE === null)
              section.POSSIBLE = 0;
          }

          // potential _helperMatchSectionCardses - KINGS
          section = scorecard.KINGS;
          CARDS = _SECTION.KINGS;

          if (section.SCORE === null || chance_unset) {
            _helperMatchSectionCards(CARDS);
            _helperScoringReset(section);

            if (CARDS[0].category === _STATUS.CAUTION && CARDS[1].category === _STATUS.CAUTION && CARDS[2].category === _STATUS.CAUTION && CARDS[3].category === _STATUS.CAUTION) {
              CARDS[0].category = CARDS[1].category = CARDS[2].category = CARDS[3].category = _STATUS.PROCEED;

              if (CARDS[4].category === _STATUS.CAUTION && CARDS[5].category === _STATUS.CAUTION && CARDS[6].category === _STATUS.CAUTION && CARDS[7].category === _STATUS.CAUTION) {
                CARDS[4].category = CARDS[5].category = CARDS[6].category = CARDS[7].category = _STATUS.PROCEED;
                section.POSSIBLE = _SCORING.KINGS_800.POINTS;
                _SCORING.KINGS_800.SET = true;
                _helperCopyCards(_SCORING.KINGS_800.CARDS, CARDS);
                _helperScoringSet(section, _SCORING.KINGS_800);
              }
              else {
                section.POSSIBLE = _SCORING.KINGS_80.POINTS;
                _SCORING.KINGS_80.SET = true;
                _helperCopyCards(_SCORING.KINGS_80.CARDS, CARDS, 0, 3);
                _helperScoringSet(section, _SCORING.KINGS_80);
              }
            }
            else if (section.SCORE === null)
              section.POSSIBLE = 0;
          }

          // potential _helperMatchSectionCardses - ACES
          section = scorecard.ACES;
          CARDS = _SECTION.ACES;

          if (section.SCORE === null || chance_unset) {
            _helperMatchSectionCards(CARDS);
            _helperScoringReset(section);

            if (CARDS[0].category === _STATUS.CAUTION && CARDS[1].category === _STATUS.CAUTION && CARDS[2].category === _STATUS.CAUTION && CARDS[3].category === _STATUS.CAUTION) {
              CARDS[0].category = CARDS[1].category = CARDS[2].category = CARDS[3].category = _STATUS.PROCEED;

              if (CARDS[4].category === _STATUS.CAUTION && CARDS[5].category === _STATUS.CAUTION && CARDS[6].category === _STATUS.CAUTION && CARDS[7].category === _STATUS.CAUTION) {

                CARDS[4].category = CARDS[5].category = CARDS[6].category = CARDS[7].category = _STATUS.PROCEED;
                section.POSSIBLE = _SCORING.ACES_1000.POINTS;
                _SCORING.ACES_1000.SET = true;
                _helperCopyCards(_SCORING.ACES_1000.CARDS, CARDS);
                _helperScoringSet(section, _SCORING.ACES_1000);
              }
              else {
                section.POSSIBLE = _SCORING.ACES_100.POINTS;
                _SCORING.ACES_100.SET = true;
                _helperCopyCards(_SCORING.ACES_100.CARDS, CARDS, 0, 3);
                _helperScoringSet(section, _SCORING.ACES_100);
              }
            }
            else if (section.SCORE === null)
              section.POSSIBLE = 0;
          }

          // potential _helperMatchSectionCardses - MARRIAGES
          // KD QD KS QS KH QH KC QC KD QD KS QS KH QH KC QC
          // 0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
          section = scorecard.MARRIAGES;
          CARDS = _SECTION.MARRIAGES;

          if (section.SCORE === null || chance_unset) {
            var n_in_suit = 0;

            _helperMatchSectionCards(CARDS);
            _helperScoringReset(section);
            section.POSSIBLE = 0;

            for (i = 0, l = CARDS.length; i < l; i += 2) {
              if (CARDS[i].category === _STATUS.CAUTION && CARDS[i + 1].category === _STATUS.CAUTION && CARDS[i].suit === CARDS[i + 1].suit) {
                CARDS[i].category = CARDS[i + 1].category = _STATUS.PROCEED;

                if (CARDS[i].suit === TRUMP) {
                  n_in_suit++;

                  if (n_in_suit === 1) {
                    section.POSSIBLE += _SCORING.MARRIAGE_TRUMP_DIAMONDS.POINTS; // all marriage in trump are identical points

                    switch (TRUMP) {
                      case SUITS.DIAMONDS:
                        _SCORING.MARRIAGE_TRUMP_DIAMONDS.SET = true;
                        _helperCopyCards(_SCORING.MARRIAGE_TRUMP_DIAMONDS.CARDS, CARDS, 0, 1);
                        _helperScoringSet(section, _SCORING.MARRIAGE_TRUMP_DIAMONDS);
                        break;

                      case SUITS.SPADES:
                        _SCORING.MARRIAGE_TRUMP_SPADES.SET = true;
                        _helperCopyCards(_SCORING.MARRIAGE_TRUMP_SPADES.CARDS, CARDS, 2, 3);
                        _helperScoringSet(section, _SCORING.MARRIAGE_TRUMP_SPADES);
                        break;

                      case SUITS.HEARTS:
                        _SCORING.MARRIAGE_TRUMP_HEARTS.SET = true;
                        _helperCopyCards(_SCORING.MARRIAGE_TRUMP_HEARTS.CARDS, CARDS, 4, 5);
                        _helperScoringSet(section, _SCORING.MARRIAGE_TRUMP_HEARTS);
                        break;

                      case SUITS.CLUBS:
                        _SCORING.MARRIAGE_TRUMP_CLUBS.SET = true;
                        _helperCopyCards(_SCORING.MARRIAGE_TRUMP_CLUBS.CARDS, CARDS, 6, 7);
                        _helperScoringSet(section, _SCORING.MARRIAGE_TRUMP_CLUBS);
                    }
                  }
                  else {
                    section.POSSIBLE = section.POSSIBLE - _SCORING.MARRIAGE_TRUMP_DIAMONDS.POINTS + _SCORING.DOUBLE_MARRIAGE_DIAMONDS.POINTS;

                    switch (TRUMP) {
                      case SUITS.DIAMONDS:
                        _SCORING.MARRIAGE_TRUMP_DIAMONDS.SET = false;
                        _SCORING.MARRIAGE_TRUMP_DIAMONDS.CARDS.length = 0;
                        _SCORING.DOUBLE_MARRIAGE_DIAMONDS.SET = true;
                        _helperCopyCards(_SCORING.DOUBLE_MARRIAGE_DIAMONDS.CARDS, CARDS, [0, 1, 8, 9]);
                        _helperScoringAdjust(section, _SCORING.DOUBLE_MARRIAGE_DIAMONDS, _SCORING.MARRIAGE_TRUMP_DIAMONDS.ID);
                        break;

                      case SUITS.SPADES:
                        _SCORING.MARRIAGE_TRUMP_SPADES.SET = false;
                        _SCORING.MARRIAGE_TRUMP_SPADES.CARDS.length = 0;
                        _SCORING.DOUBLE_MARRIAGE_SPADES.SET = true;
                        _helperCopyCards(_SCORING.DOUBLE_MARRIAGE_SPADES.CARDS, CARDS, [2, 3, 10, 11]);
                        _helperScoringAdjust(section, _SCORING.DOUBLE_MARRIAGE_SPADES, _SCORING.MARRIAGE_TRUMP_SPADES.ID);
                        break;

                      case SUITS.HEARTS:
                        _SCORING.MARRIAGE_TRUMP_HEARTS.SET = false;
                        _SCORING.MARRIAGE_TRUMP_HEARTS.CARDS.length = 0;
                        _SCORING.DOUBLE_MARRIAGE_HEARTS.SET = true;
                        _helperCopyCards(_SCORING.DOUBLE_MARRIAGE_HEARTS.CARDS, CARDS, [4, 5, 12, 13]);
                        _helperScoringAdjust(section, _SCORING.DOUBLE_MARRIAGE_HEARTS, _SCORING.MARRIAGE_TRUMP_HEARTS.ID);
                        break;

                      case SUITS.CLUBS:
                        _SCORING.MARRIAGE_TRUMP_CLUBS.SET = false;
                        _SCORING.MARRIAGE_TRUMP_CLUBS.CARDS.length = 0;
                        _SCORING.DOUBLE_MARRIAGE_CLUBS.SET = true;
                        _helperCopyCards(_SCORING.DOUBLE_MARRIAGE_CLUBS.CARDS, CARDS, [6, 7, 14, 15]);
                        _helperScoringAdjust(section, _SCORING.DOUBLE_MARRIAGE_CLUBS, _SCORING.MARRIAGE_TRUMP_CLUBS.ID);
                    }
                  }
                }
                else {
                  section.POSSIBLE += _SCORING.MARRIAGE_DIAMONDS_1.POINTS; // all off-suit marriages are identical points

                  switch (CARDS[i].suit) {
                    case SUITS.DIAMONDS:
                      if (_SCORING.MARRIAGE_DIAMONDS_1.SET === false) {
                        _SCORING.MARRIAGE_DIAMONDS_1.SET = true;
                        _helperCopyCards(_SCORING.MARRIAGE_DIAMONDS_1.CARDS, CARDS, 0, 1);
                        _helperScoringSet(section, _SCORING.MARRIAGE_DIAMONDS_1);
                      }
                      else {
                        _SCORING.MARRIAGE_DIAMONDS_2.SET = true;
                        _helperCopyCards(_SCORING.MARRIAGE_DIAMONDS_2.CARDS, CARDS, 8, 9);
                        _helperScoringSet(section, _SCORING.MARRIAGE_DIAMONDS_2);
                      }

                      break;

                    case SUITS.SPADES:
                      if (_SCORING.MARRIAGE_SPADES_1.SET === false) {
                        _SCORING.MARRIAGE_SPADES_1.SET = true;
                        _helperCopyCards(_SCORING.MARRIAGE_SPADES_1.CARDS, CARDS, 2, 3);
                        _helperScoringSet(section, _SCORING.MARRIAGE_SPADES_1);
                      }
                      else {
                        _SCORING.MARRIAGE_SPADES_2.SET = true;
                        _helperCopyCards(_SCORING.MARRIAGE_SPADES_2.CARDS, CARDS, 10, 11);
                        _helperScoringSet(section, _SCORING.MARRIAGE_SPADES_2);
                      }

                      break;

                    case SUITS.HEARTS:
                      if (_SCORING.MARRIAGE_HEARTS_1.SET === false) {
                        _SCORING.MARRIAGE_HEARTS_1.SET = true;
                        _helperCopyCards(_SCORING.MARRIAGE_HEARTS_1.CARDS, CARDS, 4, 5);
                        _helperScoringSet(section, _SCORING.MARRIAGE_HEARTS_1);
                      }
                      else {
                        _SCORING.MARRIAGE_HEARTS_2.SET = true;
                        _helperCopyCards(_SCORING.MARRIAGE_HEARTS_2.CARDS, CARDS, 12, 13);
                        _helperScoringSet(section, _SCORING.MARRIAGE_HEARTS_2);
                      }

                      break;

                    case SUITS.CLUBS:
                      if (_SCORING.MARRIAGE_CLUBS_1.SET === false) {
                        _SCORING.MARRIAGE_CLUBS_1.SET = true;
                        _helperCopyCards(_SCORING.MARRIAGE_CLUBS_1.CARDS, CARDS, 6, 7);
                        _helperScoringSet(section, _SCORING.MARRIAGE_CLUBS_1);
                      }
                      else {
                        _SCORING.MARRIAGE_CLUBS_2.SET = true;
                        _helperCopyCards(_SCORING.MARRIAGE_CLUBS_2.CARDS, CARDS, 14, 15);
                        _helperScoringSet(section, _SCORING.MARRIAGE_CLUBS_2);
                      }
                  }
                }
              }
            }
          }

          // potential _helperMatchSectionCardses - 240 AROUND THE HOUSE
          section = scorecard.AROUND_240;
          CARDS = _SECTION.AROUND_240;

          if (section.SCORE === null || chance_unset) {
            _helperMatchSectionCards(CARDS);
            _helperScoringReset(section);

            if (CARDS[0].category === _STATUS.CAUTION && CARDS[1].category === _STATUS.CAUTION && CARDS[2].category === _STATUS.CAUTION && CARDS[3].category === _STATUS.CAUTION && CARDS[4].category === _STATUS.CAUTION && CARDS[5].category === _STATUS.CAUTION && CARDS[6].category === _STATUS.CAUTION && CARDS[7].category === _STATUS.CAUTION) {
              CARDS[0].category = CARDS[1].category = CARDS[2].category = CARDS[3].category = CARDS[4].category = CARDS[5].category = CARDS[6].category = CARDS[7].category = _STATUS.PROCEED;
              section.POSSIBLE = _SCORING.AROUND_240.POINTS;
              _SCORING.AROUND_240.SET = true;
              _helperCopyCards(_SCORING.AROUND_240.CARDS, CARDS);
              _helperScoringSet(section, _SCORING.AROUND_240);
            }
            else if (is_YAHTZLE_BONUS) {
              section.POSSIBLE = _SCORING.AROUND_240.POINTS;
              _SCORING.AROUND_240.SET = true;
              _helperCopyCards(_SCORING.AROUND_240.CARDS, _SECTION.YAHTZLE);
              _helperScoringSet(section, _SCORING.AROUND_240);
            }
            else if (section.SCORE === null)
              section.POSSIBLE = 0;
          }

          // potential _helperMatchSectionCardses - PINOCHLES
          section = scorecard.PINOCHLES;
          CARDS = _SECTION.PINOCHLES;

          if (section.SCORE === null || chance_unset) {
            _helperMatchSectionCards(CARDS);
            _helperScoringReset(section);

            if (CARDS[0].category === _STATUS.CAUTION && CARDS[1].category === _STATUS.CAUTION) {
              CARDS[0].category = CARDS[1].category = _STATUS.PROCEED;

              if (CARDS[2].category === _STATUS.CAUTION && CARDS[3].category === _STATUS.CAUTION) {
                CARDS[2].category = CARDS[3].category = _STATUS.PROCEED;
                section.POSSIBLE = _SCORING.DOUBLE_PINOCHLE.POINTS;
                _SCORING.DOUBLE_PINOCHLE.SET = true;
                _helperCopyCards(_SCORING.DOUBLE_PINOCHLE.CARDS, CARDS);
                _helperScoringAdjust(section, _SCORING.DOUBLE_PINOCHLE, _SCORING.PINOCHLE.ID);
              }
              else {
                section.POSSIBLE = _SCORING.PINOCHLE.POINTS;
                _SCORING.PINOCHLE.SET = true;
                _helperCopyCards(_SCORING.PINOCHLE.CARDS, CARDS, 0, 1);
                _helperScoringSet(section, _SCORING.PINOCHLE);
              }
            }
            else if (section.SCORE === null)
              section.POSSIBLE = 0;
          }

          // potential _helperMatchSectionCardses - RUNS
          section = scorecard.RUNS;
          CARDS = _SECTION.RUNS;

          if (section.SCORE === null || chance_unset) {
            _helperMatchSectionCards(CARDS);
            _helperScoringReset(section);

            if (CARDS[0].category === _STATUS.CAUTION && CARDS[1].category === _STATUS.CAUTION && CARDS[2].category === _STATUS.CAUTION && CARDS[3].category === _STATUS.CAUTION && CARDS[4].category === _STATUS.CAUTION) {
              CARDS[0].category = CARDS[1].category = CARDS[2].category = CARDS[3].category = CARDS[4].category = _STATUS.PROCEED;

              if (CARDS[5].category === _STATUS.CAUTION && CARDS[6].category === _STATUS.CAUTION && CARDS[7].category === _STATUS.CAUTION && CARDS[8].category === _STATUS.CAUTION && CARDS[9].category === _STATUS.CAUTION) {
                CARDS[5].category = CARDS[6].category = CARDS[7].category = CARDS[8].category = CARDS[9].category = _STATUS.PROCEED;
                section.POSSIBLE = _SCORING.DOUBLE_RUN_DIAMONDS.POINTS; // all runs have identical point values

                switch (TRUMP) {
                  case SUITS.DIAMONDS:
                    _SCORING.DOUBLE_RUN_DIAMONDS.SET = true;
                    _helperCopyCards(_SCORING.DOUBLE_RUN_DIAMONDS.CARDS, CARDS);
                    _helperScoringAdjust(section, _SCORING.DOUBLE_RUN_DIAMONDS, _SCORING.RUN_DIAMONDS.ID);
                    break;

                  case SUITS.SPADES:
                    _SCORING.DOUBLE_RUN_SPADES.SET = true;
                    _helperCopyCards(_SCORING.DOUBLE_RUN_SPADES.CARDS, CARDS);
                    _helperScoringAdjust(section, _SCORING.DOUBLE_RUN_SPADES, _SCORING.RUN_SPADES.ID);
                    break;

                  case SUITS.HEARTS:
                    _SCORING.DOUBLE_RUN_HEARTS.SET = true;
                    _helperCopyCards(_SCORING.DOUBLE_RUN_HEARTS.CARDS, CARDS);
                    _helperScoringAdjust(section, _SCORING.DOUBLE_RUN_HEARTS, _SCORING.RUN_HEARTS.ID);
                    break;

                  case SUITS.CLUBS:
                    _SCORING.DOUBLE_RUN_CLUBS.SET = true;
                    _helperCopyCards(_SCORING.DOUBLE_RUN_CLUBS.CARDS, CARDS);
                    _helperScoringAdjust(section, _SCORING.DOUBLE_RUN_CLUBS, _SCORING.RUN_CLUBS.ID);
                }
              }
              else {
                section.POSSIBLE = _SCORING.RUN_DIAMONDS.POINTS; // all runs have identical point values

                switch (TRUMP) {
                  case SUITS.DIAMONDS:
                    _SCORING.RUN_DIAMONDS.SET = true;
                    _helperCopyCards(_SCORING.RUN_DIAMONDS.CARDS, CARDS, 0, 4);
                    _helperScoringSet(section, _SCORING.RUN_DIAMONDS);
                    break;

                  case SUITS.SPADES:
                    _SCORING.RUN_SPADES.SET = true;
                    _helperCopyCards(_SCORING.RUN_SPADES.CARDS, CARDS, 0, 4);
                    _helperScoringSet(section, _SCORING.RUN_SPADES);
                    break;

                  case SUITS.HEARTS:
                    _SCORING.RUN_HEARTS.SET = true;
                    _helperCopyCards(_SCORING.RUN_HEARTS.CARDS, CARDS, 0, 4);
                    _helperScoringSet(section, _SCORING.RUN_HEARTS);
                    break;

                  case SUITS.CLUBS:
                    _SCORING.RUN_CLUBS.SET = true;
                    _helperCopyCards(_SCORING.RUN_CLUBS.CARDS, CARDS, 0, 4);
                    _helperScoringSet(section, _SCORING.RUN_CLUBS);
                }
              }
            }
            else if (section.SCORE === null)
              section.POSSIBLE = 0;
          }

          // potential _helperMatchSectionCardses - CHANCE
          section = scorecard.CHANCE;
          CARDS = _SECTION.CHANCE;

          if (chance_unset) {
            var
              id = 0,
              points = [],
              stored_key = "",
              adjust_double_marriage = false,
              score_adjusted = false,
              ROLY_POLY_SCORING = YAHTZLE.SETTINGS.DOUBLE_MARRIAGE.getValue() === 300;

            // builds a list of keys from YAHTZLE.SCOREBOX.SCORING that are SET, in descending point value
            for (var key in _SCORING) {
              if (_SCORING[key].SET === true) {
                id = _SCORING[key].ID;

                if (ROLY_POLY_SCORING) // not much to do as this is the default order
                  points.push(key);

                else if (!ROLY_POLY_SCORING && !score_adjusted) {
                  // adjust position of the double marriage (there can only be one double marriage in trump) based on it's point value
                  if (id === _SCORING.DOUBLE_MARRIAGE_DIAMONDS.ID || id === _SCORING.DOUBLE_MARRIAGE_SPADES.ID || id === _SCORING.DOUBLE_MARRIAGE_HEARTS.ID || id === _SCORING.DOUBLE_MARRIAGE_CLUBS.ID) {
                    adjust_double_marriage = true;
                    stored_key = key;
                  }
                  else if (adjust_double_marriage) {
                    if (id === _SCORING.ACES_100.ID) {
                      points.push(key);
                      points.push(stored_key);
                      score_adjusted = true;
                    }
                    else if (id > _SCORING.ACES_100.ID) {
                      points.push(stored_key);
                      points.push(key);
                      score_adjusted = true;
                    }
                  }
                }
              }
            }

            // make sure not to lose a DOUBLE MARRIAGE ID which is a possibility under certain conditions (only ID set OR set after higher point IDs)
            if (adjust_double_marriage && !score_adjusted)
              points.push(stored_key);

            // remove array keys that conflict with higher scoring keys (work from low point value to high)
            // TODO - this NEEDS testing for different card combinations
            if (points.length >= 2) {
              var
                row = 0,
                column = 0;

              for (row = 0; row < points.length - 1; row++) {
                for (column = 1; column < points.length; column++) {
                  if (row !== column && _CHANCE_MAPS.cardGain(_SCORING[points[row]].ID, _SCORING[points[column]].ID) === -1) {
                    points.splice(column--, 1);
                  }
                }
              }
            }

            section.POSSIBLE = 0;

            if (points.length === 0)
              _SECTION.CHANCE = [CARD.create()];

            else {
              var subcategory = null;

              _SECTION.CHANCE.length = 0;
              _helperScoringReset(section);

              // generate chance cards and possible score
              for (i = 0; i < points.length; i++) {
                var SECTION_CARDS = null;

                subcategory = _SCORING[points[i]];
                SECTION_CARDS = subcategory.CARDS;
                _helperScoringSet(section, subcategory);

                for (j = 0, l = SECTION_CARDS.length; j < l; j++) {
                  card = copy(SECTION_CARDS[j]);
                  card.category = _STATUS.PROCEED;
                  CARDS.push(card);
                }

                scorecard.CHANCE.POSSIBLE += subcategory.POINTS;
              }

              // remove duplicates from chance score box cards
              for (i = 0; i < CARDS.length - 1; i++) {
                for (j = i + 1; j < CARDS.length; j++) {
                  if (CARDS[i].id === CARDS[j].id)
                    CARDS.splice(j, 1);
                }
              }

              // check if too many CHANCE cards
              if (CARDS.length > YAHTZLE.HAND.CARDS_MAX)
                console.error("Too many cards in CHANCE - " + CARDS.length);
            }

            if (scorecard.CHANCE.POSSIBLE === 0)
              scorecard.CHANCE.POSSIBLE = null;
          }

          // potential BONUS score
          if (scorecard.BONUS.SCORE === null) {
            // use only one POSSIBLE score, every other score must be an actual score
            var
              obj = {
                UPPER_SCORE: 0,
                POSSIBLE_USED: false
              };

            _helperAddUpper(obj, scorecard.NINES);
            _helperAddUpper(obj, scorecard.JACKS);
            _helperAddUpper(obj, scorecard.QUEENS);
            _helperAddUpper(obj, scorecard.KINGS);
            _helperAddUpper(obj, scorecard.ACES);

            scorecard.BONUS.POSSIBLE = (obj.UPPER_SCORE >= THIS.BONUS_MINIMUM_REQUIRED ? THIS.BONUS_POINTS : null);
          }
        }

        function _reset() {
          var
            CARDS = null,
            key = null,
            record = null,
            i = 0,
            l = 0;

          // reset all SCOREBOX SECTION cards
          for (key in _SECTION) {
            CARDS = _SECTION[key];

            if (CARDS !== _SECTION.CHANCE) {
              for (i = 0, l = CARDS.length; i < l; i++) {
                CARDS[i].category = _STATUS.NONE;
                CARDS[i].id = null;
              }
            }

            else
              _SECTION.CHANCE = [_helperCreateCard()];
          }

          // reset all SCOREBOX SCORING sections
          for (key in _SCORING) {
            record = _SCORING[key];
            record.CARDS.length = 0;
            record.SET = false;
          }
        }

        // called once trump suit is known
        function _update() {
          var T = YAHTZLE.GAME.TRUMP_SUIT;

          if (T) {
            var
              C = YAHTZLE.CARD.VALUES;

            _SECTION.NINES.length = 0;
            _SECTION.NINES.push(_helperCreateCard(C.NINE, T));
            _SECTION.NINES.push(_helperCreateCard(C.NINE, T));

            _SECTION.RUNS.length = 0;

            for (var i = 0; i < 2; i++) {
              _SECTION.RUNS.push(_helperCreateCard(C.ACE, T));
              _SECTION.RUNS.push(_helperCreateCard(C.TEN, T));
              _SECTION.RUNS.push(_helperCreateCard(C.KING, T));
              _SECTION.RUNS.push(_helperCreateCard(C.QUEEN, T));
              _SECTION.RUNS.push(_helperCreateCard(C.JACK, T));
            }
          }
        }

        /* PRIVATE */
        var
          _CHANCE_MAPS = (function() {
            function _cardGain(row, column) {
              var
                result = _GAIN[row * _CHANCE_MAPS.CATEGORY_COUNT + column];

              // TODO - verify _CHANCE_MAPS is valid

              // -2 denotes a lookup "mirror", as 1/2 the array mirrors the other side and row ID / column ID should be switched
              return (result === -2 ? _GAIN[column * _CHANCE_MAPS.CATEGORY_COUNT + row] : result);
            }

            /* PRIVATE */
            var
              // mimic 2D array: array[row][column] = array[row * cols + col]
              // lookup determines # of cards gained when combining 2 score categories
              // - NOTE: chance function only looks at -2, -1; cards from SCORE_BOX are used instead of #cards gained -- this allows better re-use; while extra data is unnecessay, it's here
              // -1 denotes that the combination does not exist
              // -2 denotes a lookup "mirror", as 1/2 the array mirrors the other side and row ID / column ID should be switched; this mirror saves repeating many values (error-prone)
              //D   E   F   G   H   I   J   K   L   M   N   O   P   Q   R   S   T   U   V   W   X   Y   Z   AA  AB  AC  AD  AE  AF  AG  AH  AI  AJ  AK  AL  AM  AN
              //0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19  20  21  22  23  24  25  26  27  28  29  30  31  32  33  34  35  36
              _GAIN = [
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
              ];
              //0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19  20  21  22  23  24  25  26  27  28  29  30  31  32  33  34  35  36
              //D   E   F   G   H   I   J   K   L   M   N   O   P   Q   R   S   T   U   V   W   X   Y   Z   AA  AB  AC  AD  AE  AF  AG  AH  AI  AJ  AK  AL  AM  AN

            /* PUBLIC (_CHANCE_MAPS) */
            return {
              CATEGORY_COUNT: 37,
              GAIN: _GAIN,

              cardGain: _cardGain
            };
          })(),

          // score categories (SCOREBOX.initialize() function creates the following section / IDs that correspond to the CHANCE MAP
          /*
          0   DOUBLE_RUN_DIAMONDS
          1   DOUBLE_RUN_SPADES
          2   DOUBLE_RUN_HEARTS
          3   DOUBLE_RUN_CLUBS
          4   ACES_1000
          5   KINGS_800
          6   QUEENS_600
          7   JACKS_400
          8   DOUBLE_PINOCHLE
          9   DOUBLE_MARRIAGE_DIAMONDS
          10  DOUBLE_MARRIAGE_SPADES
          11  DOUBLE_MARRIAGE_HEARTS
          12  DOUBLE_MARRIAGE_CLUBS
          13  AROUND_240
          14  RUN_DIAMONDS
          15  RUN_SPADES
          16  RUN_HEARTS
          17  RUN_CLUBS
          18  ACES_100
          19  KINGS_80
          20  QUEENS_60
          21  JACKS_40
          22  PINOCHLE
          23  MARRIAGE_TRUMP_DIAMONDS
          24  MARRIAGE_TRUMP_SPADES
          25  MARRIAGE_TRUMP_HEARTS
          26  MARRIAGE_TRUMP_CLUBS
          27  MARRIAGE_DIAMONDS_1
          28  MARRIAGE_DIAMONDS_2
          29  MARRIAGE_SPADES_1
          30  MARRIAGE_SPADES_2
          31  MARRIAGE_HEARTS_1
          32  MARRIAGE_HEARTS_2
          33  MARRIAGE_CLUBS_1
          34  MARRIAGE_CLUBS_2
          35  NINE_TRUMP_1
          36  NINE_TRUMP_2
          */
          _SCORING = {},

          // score-matching card templates
          // - each section only contains an array of cards
          _SECTION = {
            NINES: [],
            JACKS: [],
            QUEENS: [],
            KINGS: [],
            ACES: [],
            MARRIAGES: [],
            AROUND_240: [],
            PINOCHLES: [],
            RUNS: [],
            CHANCE: [],
            YAHTZLE: []
          },

          // card statuses
          _STATUS = {
            NONE: 0,
            CAUTION: 1,
            PROCEED: 2,
            MATCH: 3
          };

        /* PUBLIC */
        return {
          BONUS_MINIMUM_REQUIRED: 290,
          BONUS_POINTS: 300,
          SCORING: _SCORING,
          SECTION: _SECTION,
          STATUS: _STATUS,
          YAHTZLE_POINTS: 750,
          YAHTZLE_BONUS_POINTS: 1500,

          initialize: _initialize,
          matchCards: _matchCards,
          reset: _reset,
          update: _update
        };
      })(),

      // holds actual scores; 1 per player
      _SCORECARD = (function() {
        // create a blank scorecard or with initial data
        function _create(o) {
          return new _scorecard(o);
        }

        function _pick(index) {
          var
            GAME = YAHTZLE.GAME,
            player = GAME.currentPlayer();

          if (player.game_complete === true)
            return false;

          var
            scorecard = player.scorecard,
            category = null,
            HAND = YAHTZLE.HAND,
            section_key = Object.keys(_CATEGORIES)[index];

          switch(section_key) {
            case _CATEGORIES.NINES:
            case _CATEGORIES.JACKS:
            case _CATEGORIES.QUEENS:
            case _CATEGORIES.KINGS:
            case _CATEGORIES.ACES:
            case _CATEGORIES.MARRIAGES:
            case _CATEGORIES.AROUND_240:
            case _CATEGORIES.PINOCHLES:
            case _CATEGORIES.RUNS:
            case _CATEGORIES.CHANCE:
            case _CATEGORIES.YAHTZLE:
              category = scorecard[section_key];

              if (category.SCORE === null) {
                category.SCORE = category.POSSIBLE;
                category.HAND = HAND.CARDS.slice();
                category.SECTION = YAHTZLE.SCOREBOX.SECTION[section_key].slice();
              }

              category = scorecard.YAHTZLE_BONUS;

              if (UTIL.isInteger(category.POSSIBLE) && category.POSSIBLE > category.SCORE) {
                category.SCORE = category.POSSIBLE;
                category.HAND.push(HAND.CARDS.slice());
                category.SECTION.push(YAHTZLE.SCOREBOX.SECTION[section_key].slice());
              }

              break;

            default:
              return false;
          }

          HAND.reset();
          _resetHand(scorecard);
          scorecard.update();

          if (scorecard.isComplete()) {
            if (player.type === YAHTZLE.PLAYER.TYPE.HUMAN)
              YAHTZLE.HIGH_SCORES.add(player.name, scorecard.TOTAL); // TODO - how to deal with HIGH SCORE result code

            player.game_complete = true;
            YAHTZLE.GAME.gameOverTest();
          }

          // advance to the next player
          if (GAME.IN_PROGRESS && GAME.PLAYER_COUNT > 1) {
            while (true) {
              GAME.CURRENT_PLAYER++;
              GAME.CURRENT_PLAYER %= GAME.PLAYER_COUNT;

              if (GAME.currentPlayer().game_complete) {
                YAHTZLE.GAME.gameOverTest();
                continue;
              }
              else
                break;
            }
          }

          return true;
        }

        // reset scorecard for a new hand (all unscored sections)
        function _resetHand(scorecard) {
          var
            key = null,
            section = null;

          for (key in scorecard) {
            if (scorecard.hasOwnProperty(key) &&
              key !== _CATEGORIES.BONUS &&
              key !== _CATEGORIES.YAHTZLE_BONUS &&
              key !== _CATEGORIES.UPPER &&
              key !== _CATEGORIES.LOWER &&
              key !== _CATEGORIES.TOTAL) {

              section = scorecard[key];

              if (section.SCORE === null) {
                section.POSSIBLE = null;

                if (key === _CATEGORIES.YAHTZLE)
                  section.SECTION.length = 0; // YAHTZLE doesn't have "SCORING" container array
                else
                  section.SCORING.length = 0;
              }
            }
          }
        }

        function _scorecard(o) {
          this.NINES = null;
          this.JACKS = null;
          this.QUEENS = null;
          this.KINGS = null;
          this.ACES = null;
          this.MARRIAGES = null;
          this.AROUND_240 = null;
          this.PINOCHLES = null;
          this.RUNS = null;
          this.CHANCE = null;
          this.YAHTZLE = null;
          this.BONUS = null;
          this.YAHTZLE_BONUS = null;
          this.UPPER = null;
          this.LOWER = null;
          this.TOTAL = null;
          this.restore(o);
        }

        function _scorecardIsComplete() {
          return UTIL.isInteger(this.NINES.SCORE) &&
            UTIL.isInteger(this.JACKS.SCORE) &&
            UTIL.isInteger(this.QUEENS.SCORE) &&
            UTIL.isInteger(this.KINGS.SCORE) &&
            UTIL.isInteger(this.ACES.SCORE) &&
            UTIL.isInteger(this.MARRIAGES.SCORE) &&
            UTIL.isInteger(this.AROUND_240.SCORE) &&
            UTIL.isInteger(this.PINOCHLES.SCORE) &&
            UTIL.isInteger(this.RUNS.SCORE) &&
            UTIL.isInteger(this.CHANCE.SCORE) &&
            UTIL.isInteger(this.YAHTZLE.SCORE);
        }

        // restore the scorecard directly from a json string or pre-parsed object
        function _scorecardRestore(o) {
          var
            type = typeof(o),
            scorecard = null,
            validData = false;

          if (type === "string")
            scorecard = JSON.parse(o);

          validData = !(type === "undefined" || scorecard === null || scorecard.hasOwnProperty(_CATEGORIES.BONUS) === false);

          for (var section in this) {
            // restoring scorecard
            if (validData && scorecard.hasOwnProperty(section))
              this[section] = scorecard[section];

            // new scorecard
            else {
              if (section === _CATEGORIES.BONUS) {
                this.BONUS = {
                  SCORE: null,
                  POSSIBLE: YAHTZLE.SCORECARD.BONUS_POINTS
                };
              }

              else if (section === _CATEGORIES.YAHTZLE || section === _CATEGORIES.YAHTZLE_BONUS) {
                this[section] = {
                  HAND: [], // all the cards in HAND at score designation (BONUS has multiple sets)
                  SECTION: [], // template of scoring card combinations specific to a category (BONUS has multiple sets)
                  POSSIBLE: null,
                  SCORE: null
                };
              }

              else if (section === _CATEGORIES.UPPER)
                this.UPPER = null;

              else if (section === _CATEGORIES.LOWER)
                this.LOWER = null;

              else if (section === _CATEGORIES.TOTAL)
                this.TOTAL = null;

              else if (this.hasOwnProperty(section))
                this[section] = {
                  HAND: [],     // all the cards in HAND at score designation
                  SCORING: [],  // all scoring meld categories
                  SECTION: [],  // template of scoring card combinations specific to a category
                  POSSIBLE: null,
                  SCORE: null
                };
            }
          }
        }

        function _scorecardStringify() {
          return JSON.stringify(this);
        }

        // updates scores
        function _scorecardUpdate() {
          var
            SB = YAHTZLE.SCOREBOX,
            upper = 0,
            lower = 0;

          for (var key in this) {
            switch (key) {
              case "NINES":
              case "JACKS":
              case "QUEENS":
              case "KINGS":
              case "ACES":
                upper += this[key].SCORE;
                break;

              case "MARRIAGES":
              case "AROUND_240":
              case "PINOCHLES":
              case "RUNS":
              case "CHANCE":
              case "YAHTZLE":
                lower += this[key].SCORE;
            }
          }

          this.BONUS.SCORE = (upper >= SB.BONUS_MINIMUM_REQUIRED ? SB.BONUS_POINTS : null);
          this.UPPER = upper;
          this.LOWER = lower;
          this.TOTAL = upper + this.BONUS.SCORE + lower + this.YAHTZLE_BONUS.SCORE;
        }

        _scorecard.prototype.isComplete = _scorecardIsComplete;
        _scorecard.prototype.restore = _scorecardRestore;
        _scorecard.prototype.stringify = _scorecardStringify;
        _scorecard.prototype.update = _scorecardUpdate;

        /* PRIVATE */
        var
          _CATEGORIES = {
            NINES: "NINES",
            JACKS: "JACKS",
            QUEENS: "QUEENS",
            KINGS: "KINGS",
            ACES: "ACES",
            MARRIAGES: "MARRIAGES",
            AROUND_240: "AROUND_240",
            PINOCHLES: "PINOCHLES",
            RUNS: "RUNS",
            CHANCE: "CHANCE",
            YAHTZLE: "YAHTZLE",
            BONUS: "BONUS",
            YAHTZLE_BONUS: "YAHTZLE_BONUS",
            UPPER: "UPPER",
            LOWER: "LOWER",
            TOTAL: "TOTAL"
          };

        /* PUBLIC */
        return {
          CATEGORIES: _CATEGORIES,

          create: _create,
          pick: _pick,
          resetHand: _resetHand
        };
      })(),

      _SETTINGS = (function() {
        function _restore() {
          var
            Y = YAHTZLE,
            DATA = UTIL.STORAGE.get(_STORAGE_ID);

          if (DATA) {
            YAHTZLE.SETTINGS.DEVELOPER_MODE = DATA.DEVELOPER_MODE;
            _DISPLAY_CARD_ID = DATA.DISPLAY_CARD_ID;
            Y.DECK.VISIBLE = DATA.SHOW_DECK;

            if (_DOUBLE_MARRIAGE.getValue() !== DATA.DOUBLE_MARRIAGE_VALUE)
              _DOUBLE_MARRIAGE.toggle();

            Y.HAND.DISCARD_NEW = DATA.DISCARD_NEW;
            Y.HAND.REMIX_DISCARDS = DATA.REMIX_CARDS;

            // restore player data
            // NOTE: scorecards stored separately (game session)
            if (DATA.PLAYERS) {
              var
                i = 0,
                l = DATA.PLAYERS.length;

              Y.GAME.PLAYER_COUNT = l;

              for (; i < l; i++) {
                DATA.PLAYERS[i].scorecard = Y.SCORECARD.create();
                Y.GAME.PLAYERS.push(DATA.PLAYERS[i]);
              }
            }

            return true;
          }

          return false;
        }

        function _save() {
          var
            Y = YAHTZLE,
            P = Y.GAME.PLAYERS,
            player_array = [],
            o = null,
            i = 0,
            l = P.length;

          for (; i < l; i++) {
            o = P[i];

            player_array.push({
              name: o.name,
              type: o.type,
              game_complete: o.game_complete
            });
          }

          UTIL.STORAGE.set(_STORAGE_ID, {
            DEVELOPER_MODE: YAHTZLE.SETTINGS.DEVELOPER_MODE,
            DISPLAY_CARD_ID: _DISPLAY_CARD_ID,
            SHOW_DECK: Y.DECK.VISIBLE,
            DOUBLE_MARRIAGE_VALUE: _DOUBLE_MARRIAGE.getValue(),
            DISCARD_NEW: Y.HAND.DISCARD_NEW,
            REMIX_CARDS: Y.HAND.REMIX_DISCARDS,
            PLAYERS: player_array
          });
        }

        /* PRIVATE */
        var
          _DISPLAY_CARD_ID = false,

          _DOUBLE_MARRIAGE = (function() {
            function _getValue() {
              return _OPTION[_INDEX];
            }

            function _toggle() {
              var S = YAHTZLE.SCOREBOX.SCORING;

              _INDEX = _INDEX === 0 ? 1 : 0;
              S.DOUBLE_MARRIAGE_DIAMONDS.POINTS = S.DOUBLE_MARRIAGE_SPADES.POINTS = S.DOUBLE_MARRIAGE_HEARTS.POINTS = S.DOUBLE_MARRIAGE_CLUBS.POINTS = _getValue();
            }

            /* PRIVATE */
            var
              _INDEX = 1,
              _OPTION = [80, 300];

            /* PUBLIC */
            return {
              getValue: _getValue,
              toggle: _toggle
            };
          })(),

          _STORAGE_ID = "SETTINGS";

        /* PUBLIC */
        return {
          DEVELOPER_MODE: false,
          DOUBLE_MARRIAGE: _DOUBLE_MARRIAGE,

          restore: _restore,
          save: _save
        };
      })(),

      _STATES = (function() {
        function _getState() {
          if (_STACK.length === 0)
            _STACK.push(_STATE_CODES.INVALID);

          return _STACK[_STACK.length - 1];
        }

        function _getPrevState() {
          switch(_STACK.length) {
            case 0:
              _STACK.push(_STATE_CODES.INVALID);

            case 1:
              console.warn("WARNING - NO PREVIOUS STATE");
              return _STACK[_STACK.length - 1];

            default:
              return _STACK[_STACK.length - 2];
          }
        }

        function _resetStates() {
          _STACK.length = 0;
        }

        function _setNextState(next_state) {
          var
            current_state = null;

          switch(_verifyNextState(next_state)) {
            case _MAP_CODES.OK:
              var l = _STACK.length;

              if (l === 1 && _STACK[0] === _STATE_CODES.INVALID || _STACK[0] === _STATE_CODES.TODO)
                l = _STACK.length = 0;

              current_state = _getState();

              if (l === 0 || next_state !== current_state) {
                if (l > 1 && next_state === _STACK[l - 2])
                  _STACK.pop();  // if next state is the same as previous state, don't keep adding alternating duplicate states

                else { // NOTE: don't combine this else line + next if; note the STACK.push()
                  // quit / new game - reset state stacks
                  if ((next_state === _STATE_CODES.MAIN_MENU || next_state === _STATE_CODES.NEW_GAME) && current_state === _STATE_CODES.PLAY_MODE) {
                    YAHTZLE.GAME.reset();

                    switch(next_state) {
                      case _STATE_CODES.MAIN_MENU:
                        _STACK.length = 0;
                        break;

                      case _STATE_CODES.NEW_GAME:
                        _STACK = [_STATE_CODES.MAIN_MENU];
                    }
                  }

                  _STACK.push(next_state);
                }
              }

              return true;

            case _MAP_CODES.TODO:
              _STACK.push(_STATE_CODES.TODO);
              return true;

            case _MAP_CODES.INVALID:
              _STACK.push(_STATE_CODES.INVALID);
              return true;

            case _MAP_CODES.BACK:
              _setPrevState();
              return true;

            default:
              return false;
          }
        }

        function _setPrevState() {
          switch(_STACK.length) {
            case 0:
              _STACK.push(_STATE_CODES.INVALID);

            case 1:
              console.warn("WARNING - NO PREVIOUS STATE");
              break;

            default:
              _STACK.pop();
          }
        }

        function _verifyNextState(next_state) {
          return _MAP[_getState() * _COUNT + next_state];
        }

        /* PRIVATE */
        var
          _COUNT = 14, // total # of possible states

          // mimic 2D array: array[row][column] = array[row * cols + col]
          //  0   denotes state transition is not possible
          //  1   state-transition OK
          //  2   in progress
          //  3   invalid (INVALID != FAIL; INVALID refers to an invalid choice / menu selection)
          //  4   indicates state should revert back to previous state
          _MAP = [
              0,  1,  1,  1,  1,  0,  0,  0,  1,  1,  1,  0,  1,  3,  //  0
              4,  0,  0,  0,  0,  1,  1,  0,  0,  0,  0,  0,  1,  3,  //  1
              4,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  //  2
              4,  0,  0,  1,  0,  0,  0,  4,  0,  0,  0,  0,  1,  3,  //  3
              4,  0,  0,  0,  1,  0,  0,  4,  0,  0,  0,  0,  0,  0,  //  4
              0,  0,  0,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  3,  //  5
              0,  4,  0,  0,  0,  0,  0,  1,  0,  0,  0,  0,  1,  3,  //  6   CURRENT STATE (ROWS)
              1,  1,  0,  1,  0,  4,  0,  1,  1,  1,  0,  1,  1,  3,  //  7
              4,  0,  0,  0,  0,  0,  0,  4,  0,  1,  0,  0,  1,  3,  //  8
              4,  0,  0,  0,  0,  0,  0,  4,  1,  0,  0,  0,  1,  3,  //  9
              4,  0,  0,  0,  0,  0,  0,  4,  0,  0,  1,  0,  1,  3,  //  10
              0,  0,  0,  0,  0,  0,  0,  4,  0,  0,  0,  1,  0,  0,  //  11
              0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  //  12
              1,  1,  0,  1,  0,  0,  0,  0,  0,  1,  1,  0,  0,  0   //  13
          ],
          //  0   1   2   3   4   5   6   7   8   9   10  11  12  13
          //                  NEXT STATE (COLUMNS)

          _MAP_CODES = {
            FAIL: 0,
            OK: 1,
            TODO: 2,
            INVALID: 3,
            BACK: 4
          },

          _STACK = [], // game states (treated as a stack)

          _STATE_CODES = {
            MAIN_MENU: 0,
            NEW_GAME: 1,
            PLAYER_SETUP: 2,
            GAME_SETTINGS: 3,
            HIGH_SCORES: 4,
            RANDOM_SUIT: 5,
            SELECT_SUIT: 6,
            PLAY_MODE: 7,
            RULES: 8,
            SCORING: 9,
            DECK: 10,
            SCORING_DETAIL: 11,
            TODO: 12,
            INVALID: 13
          };

        /* PUBLIC */
        return {
          STACK: _STACK,
          STATE_CODES: _STATE_CODES,
          QUIT_STATE: null, // intended for quit verify function

          getState: _getState,
          getPrevState: _getPrevState,
          resetStates: _resetStates,
          setNextState: _setNextState,
          setPrevState: _setPrevState,
          verifyNextState: _verifyNextState
        };
      })();

    return {
      CARD: _CARD,
      DECK: _DECK,
      GAME: _GAME,
      HAND: _HAND,
      HIGH_SCORES: _HIGH_SCORES,
      PLAYER: _PLAYER,
      SCOREBOX: _SCOREBOX,
      SCORECARD: _SCORECARD,
      SETTINGS: _SETTINGS,
      STATES: _STATES,
      initialize: _initialize
    };
  })();