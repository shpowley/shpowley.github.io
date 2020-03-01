var CANVAS = {
  SCALE: {
    FACTOR: 0,
    WINDOW: 1,
    FULLSCREEN: 2
  },

  POSITION: {
    XY: 0,
    START: 1,
    CENTER: 2,
    END: 3
  },

  // container - div element string id or dom object
  // dimen - div container "stage" location and size (optional)
  //       - object literal
  //         - horizonal, vertical (optional, type CANVAS.POSITION)
  //         - x, y coordinates (optional, integer, has precedence over horizontal / vertical)
  //         - w, h of div container (optional, integer)
  //         - scale (optional, type CANVAS.SCALE)
  //         - ratio (optional, scale factor)
  init: function(container, dimen) {
    /*** PRIVATE VARIABLES ***/
    var _tag = "CANVAS.init()";
    var _obj = null, _guide = null;
    var _canvas = []; // array of canvas DOM elements (visually stacked by array index / css z-index)
    var _buffer = []; // array of canvas DOM elements (invisible "buffer" drawing surfaces)
    var _scalePrevious = CANVAS.SCALE.FACTOR;
    var _resizeTimer; // helps prevent setDimensions event triggering 2x
    var _isFullscreen = false;
    var _CP = CANVAS.POSITION; // shortcut reference
    var _fullscreenCallback, _resizeCallback;

    var _dimen = {
      horizontal: _CP.CENTER,
      vertical: _CP.CENTER,
      x: null,
      y: null,
      w: 300,
      h: 150,
      scale: CANVAS.SCALE.FACTOR,
      ratio: 1
    };

    /*** PRIVATE FUNCTIONS ***/

    function _addBuffer() {
      var _temp = new _createCanvas();
      
      _buffer.push(_temp);
      
      return _temp;
    }

    function _addCanvas() {
      var _temp = new _createCanvas();
      var _s = _temp.obj.style;

      _temp.obj.height = _dimen.h;
      _temp.obj.width = _dimen.w;
      _s.height = _dimen.h + "px";
      _s.width = _dimen.w + "px";
      _s.position = "absolute";
      _s.zIndex = _canvas.length;

      _obj.appendChild(_temp.obj);
      _canvas.push(_temp);
      
      return _temp;
    }
    
    // adjusts internal scale ratio so that it accurately reports the scaled image
    function _adjustScaleRatio(fullscreen) {
      var scaleX = (fullscreen ? screen.width : window.innerWidth) / _canvas[0].obj.width;
      var scaleY = (fullscreen ? screen.height : window.innerHeight) / _canvas[0].obj.height;
      
      // var scaleX = (fullscreen ? screen.width : document.body.clientWidth) / _canvas[0].obj.width;
      // var scaleY = (fullscreen ? screen.height : document.body.clientHeight) / _canvas[0].obj.height;
      
      _dimen.ratio = Math.min(scaleX, scaleY);
    }

    function _createCanvas() {
      var _obj = document.createElement("CANVAS");
      var _ctx = _obj.getContext("2d");
      var _erased = false;

      var _instance = function() {
        this.obj = _obj;
        this.ctx = _ctx;
        this.erased = _erased;
      };

      return new _instance();
    }

    // error helper - invalid parameters
    function _err(param, value, tag) {
      return UTIL.error("invalid parameter \"" + param + "\", value = \"" + value + "\"", (tag ? tag : _tag));
    }

    function _getDimensions() {
      var _instance = function() {
        this.horizontal = _dimen.horizontal;
        this.vertical = _dimen.vertical;
        this.x = _dimen.x;
        this.y = _dimen.y;
        this.w = _dimen.w;
        this.h = _dimen.h;
        this.scale = _dimen.scale;
        this.ratio = _dimen.ratio;
      };
      
      return new _instance();
    }
    
    function _getScaleFactor() {
      return _dimen.ratio;
    }

    // scale helper function
    function _originX() {
      if (_dimen.x || _dimen.horizontal == CANVAS.POSITION.START) {
        return "0";
      }
      else if (_dimen.horizontal == CANVAS.POSITION.END) {
        return "100%";
      }
      else {
        return "50%";
      }
    }

    function _originY() {
      if (_dimen.y || _dimen.vertical == CANVAS.POSITION.START) {
        return "0";
      }
      else if (_dimen.vertical == CANVAS.POSITION.END) {
        return "100%";
      }
      else {
        return "50%";
      }
    }
    
    function _proportionate() {
      _dimen.h = UTIL.floor((_dimen.w * screen.height / screen.width));
      var h = _dimen.h + "px";
      
      _obj.style.height = h;
      
      for (var i = 0, len = _canvas.length; i < len; i++) {
        _canvas[i].obj.height = _dimen.h;
        _canvas[i].obj.style.height = h;
        _canvas[i].erased = true; // flag indicating previous drawing erased
      }
    }
    
    function _resizeHandler() {
      switch (_dimen.scale) {
        case CANVAS.SCALE.WINDOW:
          _scaleToWindow();
          break;
          
        case CANVAS.SCALE.FULLSCREEN:
          if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) {
            _isFullscreen = true;
          }
          else if (_isFullscreen) {
            _isFullscreen = false;
            _scale(_scalePrevious, _dimen.ratio); // reset to previous state
            
            if (_fullscreenCallback) {
              _fullscreenCallback();
            }
          }
      }
      
      if (_resizeCallback) {
        _resizeCallback();
      }
    }

    function _scale(type, factor) {
      var _tag = "CANVAS.scale()";
      var _numArgs = arguments.length;
      var _CS = CANVAS.SCALE;

      // verify input parameters
      if (_numArgs === 0) {
        throw UTIL.error("missing scale \"type\" parameter", _tag);
      }
      else {
        if (!UTIL.checkEnum(type, _CS)) {
          throw _err("type", type, _tag);
        }

        if (type === _CS.FACTOR) {
          if (_numArgs < 2) {
            throw UTIL.error("missing scale \"factor\" parameter", _tag);
          }

          if (isNaN(factor) || typeof(factor) !== "number" || factor < 0.5) {
            throw _err("factor", factor, _tag);
          }
        }
      }

      // scale canvas
      _obj.display = "none";
      _scalePrevious = _dimen.scale;

      switch (type) {
        case _CS.FACTOR:
          _scaleToFactor(factor);
          break;

        case _CS.WINDOW:
          if (_dimen.scale !== CANVAS.SCALE.WINDOW) {
            _scaleToWindow();
          }
          break;

        case _CS.FULLSCREEN:
          if (_dimen.scale !== CANVAS.SCALE.FULLSCREEN) {
            _scaleToFullscreen();
          }
      }

      _dimen.scale = type;
      _obj.display = "flex";

      return true;
    }

    function _scaleToFactor(factor) {
      _dimen.ratio = factor;
      _setDimensions(_dimen);

      if (factor == 1) { // reset css scale transforms
        _obj.style[UTIL.getSupported("transformOrigin")] = "";
        _obj.style[UTIL.getSupported("transform")] = "";
      }
      else {
        _obj.style[UTIL.getSupported("transformOrigin")] = _originX() + " " + _originY();
        _obj.style[UTIL.getSupported("transform")] = "scale(" + factor + ")";
      }
    }
    
    function _scaleToFullscreen() {
      if (_obj.requestFullscreen) {
        _obj.requestFullscreen();
      }
      else if (_obj.webkitRequestFullscreen) {
        _scaleToWindow(true);
        _obj.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        return;
      }
      else if (_obj.mozRequestFullScreen) {
        _obj.mozRequestFullScreen();
      }
      else if (_obj.msRequestFullscreen) {
        _obj.msRequestFullscreen();
      }
      
      _adjustScaleRatio(true);
    }

    function _scaleToWindow(fullscreen) {
      _obj.style.top = "";
      _obj.style.left = "";
      _guide.style.alignItems = "center";
      _guide.style.justifyContent = "center";
      
      _adjustScaleRatio(fullscreen);
      _obj.style[UTIL.getSupported("transform")] = "scale(" + _dimen.ratio + ")";
    }
    
    // set stage position and dimensions
    function _setDimensions(dimen) {
      if (dimen) { // dimen (optional)
        if (dimen.w) { // w (optional)
          if (!UTIL.isInteger(dimen.w)) throw _err("dimen.w", dimen.w); // w must be numeric integer
          _dimen.w = dimen.w;
        }

        if (dimen.h) { // h (optional)
          if (!UTIL.isInteger(dimen.h)) throw _err("dimen.h", dimen.h); // h must be numeric integer
          _dimen.h = dimen.h;
        }

        if (dimen.x) { // x (optional) (has precedence)
          _dimen.x = dimen.x;
          _dimen.horizontal = _CP.XY;
        }
        else if (dimen.horizontal) { // horizontal position (optional)
          if (!UTIL.checkEnum(dimen.horizontal, _CP)) throw _err("dimen.horizontal", dimen.horizontal); // enum must be valid
          _dimen.horizontal = dimen.horizontal;
        }

        if (dimen.y) { // y (optional) (has precendence)
          _dimen.y = dimen.y;
          _dimen.vertical = _CP.XY;
        }
        else if (dimen.vertical) { // vertical position (optional)
          if (!UTIL.checkEnum(dimen.vertical, _CP)) throw _err("dimen.vertical", dimen.vertical); // enum must be valid
          _dimen.vertical = dimen.vertical;
        }
      }

      var _s = _obj.style;
      
      // resize container div
      _s.top = _s.left = "";
      _s.height = _dimen.h + "px";
      _s.width = _dimen.w + "px";
      _s.position = "relative";
      
      // resize canvas children
      for (var i = 0, len = _canvas.length; i < len; i++) {
        _canvas[i].obj.height = _dimen.h;
        _canvas[i].obj.width = _dimen.w;
        _canvas[i].obj.style.height = _dimen.h + "px";
        _canvas[i].obj.style.width = _dimen.w + "px";
        _canvas[i].erased = true; // flag indicating previous drawing erased
      }

      // position container vertically
      switch (_dimen.vertical) {
        case _CP.XY:
          _s.top = (Number(_dimen.y)) ? _dimen.y + "px" : _dimen.y;
          _guide.style.alignItems = "";
          break;
        case _CP.START:
          _guide.style.alignItems = "flex-start";
          break;
        case _CP.CENTER:
          _guide.style.alignItems = "center";
          break;
        case _CP.END:
          _guide.style.alignItems = "flex-end";
      }

      // position container horizontally
      switch (_dimen.horizontal) {
        case _CP.XY:
          _s.left = (Number(_dimen.x)) ? _dimen.x + "px" : _dimen.x;
          _guide.style.justifyContent = "";
          break;
        case _CP.START:
          _guide.style.justifyContent = "flex-start";
          break;
        case _CP.CENTER:
          _guide.style.justifyContent = "center";
          break;
        case _CP.END:
          _guide.style.justifyContent = "flex-end";
      }
    }
    
    function _setFullscreenCallback(callback) {
      _fullscreenCallback = callback;
    }
    
    function _setResizeCallback(callback) {
      _resizeCallback = callback;
    }

    function _toString() {
      return "CANVAS object: " + _guide.id;
    }

    /*** CONSTRUCTOR ***/

    // validate parameters
    if (!container) throw _err("container", container);

    // initialize references to canvas dom object and 2d context
    switch (typeof(container)) {
      case "object":
        _guide = container;
        break;

      case "string":
        _guide = getElement(container);
        if (_guide === null) throw _err("container", container);
        break;

      default:
        throw UTIL.error("invalid container \"" + typeof(container) + "\"", _tag);
    }

    // verify object type
    if (_guide.nodeName != "DIV") throw UTIL.error("invalid container \"" + _guide.nodeName + "\", expecting \"DIV\" element", _tag);

    // div > div > canvases; top-most div helps position main div container
    var _s = _guide.style;

    _s.width = _s.height = "100%";
    _s.display = "flex";
    _s.position = "absolute";
    _s.zIndex = "50";

    // create canvas container
    _obj = document.createElement("DIV");
    _guide.appendChild(_obj);

    _obj.style.display = "none";
    
    _setDimensions(dimen);
    _addCanvas(); // create 1 main canvas
    _addBuffer(); // create 1 main invisible "buffer" canvas -- for drawing / fast-blitting

    // if (dimen && dimen.scale) {
    if (dimen) {
      if (dimen.scale === CANVAS.SCALE.FACTOR && dimen.ratio && dimen.ratio !== 1) {
        _scale(dimen.scale, dimen.ratio);
      }
      else if (dimen.scale === CANVAS.SCALE.WINDOW) {
        _scale(dimen.scale);
      }
    }

    _obj.style.display = "";
    
    // window resize listener for handling FULLSCREEN and SCALE-TO-WINDOW
    // TODO - consider moving this _scale function - remove for normal scale & add for window/fullscreen
    window.addEventListener("resize", function() {
      if (_resizeTimer) clearTimeout(_resizeTimer);
      
      _resizeTimer = setTimeout(_resizeHandler, 50);
    });

    /*** OBJECT INSTANCE TEMPLATE ***/

    var _instance = function() {
      /*** PUBLIC VARIABLES ***/
      this.canvas = _canvas; // stage canvas children (array)
      this.buffer = _buffer; // fast-blit buffers (array)
      this.obj = _obj;
    };

    /*** PUBLIC FUNCTIONS ***/
    _instance.prototype.addCanvas = _addCanvas;
    _instance.prototype.addBuffer = _addBuffer;
    _instance.prototype.getDimensions = _getDimensions;
    _instance.prototype.getScaleFactor = _getScaleFactor;
    _instance.prototype.proportionate = _proportionate;
    _instance.prototype.scale = _scale;
    _instance.prototype.setDimensions = _setDimensions;
    _instance.prototype.setFullscreenCallback = _setFullscreenCallback;
    _instance.prototype.setResizeCallback = _setResizeCallback;
    _instance.prototype.toString = _toString;

    return new _instance();
  }
}