/**
 * card sprite namespace that builds on top of SPRITES namespace
 */

/* global CANVAS CONST SPRITES */
var
  CARD_SPRITES = (function() {
    // function _draw(canvas_id, card_id, x, y, scale) {
    //   SPRITES.draw(CANVAS.LIBRARY[canvas_id], _sheet.id, card_id, x, y, scale);
    // }

    // returns a card map for a single card
    function _getCardMap(card_id) {
      return _sheet.map[card_id];
    }

    // loads card sprite sheet
    // - TODO: possibly load more than one cardset at lower resolution????
    function _initialize(fn_callback) {
      function fnPreCallback() {
        _initialized = true;
        _sheet = SPRITES.SPRITE_SHEETS[CARD_SPRITES.SHEET_ID];
        fn_callback();
      }

      if (_initialized)
        return null;

      // if sprite sheet is cached in localStorage load that image + map (built in .loadCached())
      // - note that CARD_SPRITES.VERSION requires a non-NULL value to successfully load cached data
      if (!SPRITES.loadCached(CARD_SPRITES.SHEET_ID, _version, fnPreCallback))
        SPRITES.downloadSpritesheet(CARD_SPRITES.SHEET_ID, _sprite_url.high, null, fnPreCallback);
    }

    var
      _initialized = false,
      _sheet = null,

      _sprite_url = {
        high: "images/combo_map_04.json",
        normal: "images/combo_map_02.json"
      },

      _version = "0.1";

    return {
      SHEET_ID: "card-sprites",

      // draw: _draw,
      getCardMap: _getCardMap,
      initialize: _initialize
    };
  })();