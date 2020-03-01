var GRID = {
  instance: function(grid) {
    
    /*** PRIVATE VARIABLES ***/
    var _tag = "GRID.init()";
    var _canvas = null;
    
    var _const = {
      maxRows: 50, // constants
      maxCols: 50,
      
      minRows: 2, // constants
      minCols: 2,
      
      rows: 2, // calculated at run-time
      cols: 2
    };
    
    var _obj = {
      w: 0, // calculated and used internally
      h: 0,
      
      cell: {
        w: 60,
        h: 60
      },
      
      offset: {
        x: 0,
        y: 0
      },
      
      color: "#999966",
      scaleFactor: 1
    };
    
    var _highlightedCell = {
      row: null,
      col: null
    };
    
    /*** PRIVATE FUNCTIONS ***/

    function _createGrid() {
      // calculate canvas width and height
      _obj.w = _const.cols * _obj.cell.w + 1;
      _obj.h = _const.rows * _obj.cell.h + 1;
  
      // create "buffer" canvas in code
      _canvas = document.createElement("canvas");
      var ctx = _canvas.getContext("2d");
      var i = 0, l = 0;
  
      _canvas.width = _obj.w;
      _canvas.height = _obj.h;
  
      ctx.lineWidth = 1;
      ctx.fillStyle = _obj.color;
      ctx.strokeStyle = _obj.color;
  
      // draw vertical lines
      for (i = _obj.cell.w, l = _obj.w - _obj.cell.w; i <= l; i += _obj.cell.w) {
        ctx.fillRect(i, 0, 1, _obj.h);
      }
  
      // draw horizontal lines
      for (i = _obj.cell.h, l = _obj.h - _obj.cell.h; i <= l; i += _obj.cell.h) {
        ctx.fillRect(0, i, _obj.w, 1);
      }
  
      // draw border
      ctx.strokeRect(0.5, 0.5, _obj.w - 1, _obj.h - 1);
    }
    
    // draw grid on canvas - ctx (required), x/y offset (optional)
    function _draw(ctx, offset) {
      if (offset) {
        if (offset.x) {
          if (!UTIL.isInteger(offset.x)) throw _err("offset.x", offset.x);
          _obj.offset.x = offset.x;
        }
        
        if (offset.y) {
          if (!UTIL.isInteger(offset.y)) throw _err("offset.y", offset.y);
          _obj.offset.y = offset.y;
        }
      }
      
      // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
      ctx.drawImage(_canvas, _obj.offset.x, _obj.offset.y); 
    }
    
    // error helper - invalid parameters
    function _err(param, value, tag) {
      return UTIL.error("invalid parameter \"" + param + "\", value = \"" + value + "\"", (tag ? tag : _tag));
    }
    
    function _getCellPosition(x, y) {
      var _x = x / _obj.scaleFactor - _obj.offset.x - 1;
      var _y = y / _obj.scaleFactor - _obj.offset.y - 1;

      if (_x > 0 && _x < _obj.w - 1 && _y > 0 && _y < _obj.h - 1) {
        return {
          row: UTIL.floor(_y/_obj.cell.h),
          col: UTIL.floor(_x/_obj.cell.w)
        };
      }
      else {
        return null;
      }
    }
    
    function _highlightCell(ctx, pos) {
      if (pos) {
        if (pos.row != _highlightedCell.row || pos.col != _highlightedCell.col) {
          // clear the old highlighted cell
          _highlightClear(ctx);
          
          // draw new highlighted cell
          // ctx.save();
          // ctx.globalAlpha = 0.3;
          // ctx.fillStyle = "yellow";
          ctx.fillRect(_obj.offset.x + 1 + pos.col * _obj.cell.w, _obj.offset.y + 1 + pos.row * _obj.cell.h, _obj.cell.w - 1, _obj.cell.h - 1);
          // ctx.restore();
          
          _highlightedCell.row = pos.row;
          _highlightedCell.col = pos.col;
        }
        // else -- do nothing
      }
      else {
        // clear the old highlighted cell
        _highlightClear(ctx, true);
      }
    }
    
    // clear the old highlighted cell
    function _highlightClear(ctx, resetPos) {
      if (_highlightedCell.col !== null && _highlightedCell.row !== null) {
        ctx.clearRect(_obj.offset.x + 1 + _highlightedCell.col * _obj.cell.w, _obj.offset.y + 1 + _highlightedCell.row * _obj.cell.h, _obj.cell.w - 1, _obj.cell.h - 1);
        
        if (resetPos) {
          _highlightedCell.row = _highlightedCell.col = null;
        }
      }
    }
    
    function _toggleCell(ctx, pos) {
      ctx.fillRect(_obj.offset.x + 1 + pos.col * _obj.cell.w, _obj.offset.y + 1 + pos.row * _obj.cell.h, _obj.cell.w - 1, _obj.cell.h - 1);
    }
    
    function _toString() {
      return "GRID object: " + _const.rows + " rows x " + _const.cols + " cols";
    }

    /*** CONSTRUCTOR ***/

    // validate parameters
    if (grid) {
      if (grid.color) _obj.color = grid.color;
      
      if (grid.rows) {
        if (!UTIL.isInteger(grid.rows)) throw _err("grid.rows", grid.rows);
        
        if (grid.rows < _const.minRows) _const.rows = _const.minRows;
        else if (grid.rows > _const.maxRows) _const.rows = _const.maxRows;
        else _const.rows = grid.rows;
      }
      
      if (grid.cols) {
        if (!UTIL.isInteger(grid.cols)) throw _err("grid.cols", grid.cols);
        
        if (grid.cols < _const.minRows) _const.cols = _const.minCols;
        else if (grid.cols > _const.maxRows) _const.cols = _const.maxCols;
        else _const.cols = grid.cols;
      }
      
      if (grid.cell) {
        if (grid.cell.w) {
          if (!UTIL.isInteger(grid.cell.w)) throw _err("grid.cell.w", grid.cell.w);
          _obj.cell.w = grid.cell.w;
        }
        
        if (grid.cell.h) {
          if (!UTIL.isInteger(grid.cell.h)) throw _err("grid.cell.h", grid.cell.h);
          _obj.cell.h = grid.cell.h;
        }
      }
      
      if (grid.offset) {
        if (grid.offset.x) {
          if (!UTIL.isInteger(grid.offset.x)) throw _err("grid.offset.x", grid.offset.x);
          _obj.offset.x = grid.offset.x;
        }
        
        if (grid.offset.y) {
          if (!UTIL.isInteger(grid.offset.y)) throw _err("grid.offset.y", grid.offset.y);
          _obj.offset.y = grid.offset.y;
        }
      }
      
      if (grid.scaleFactor) {
        if (isNaN(grid.scaleFactor)) throw _err("grid.scaleFactor", grid.scaleFactor);
        _obj.scaleFactor = grid.scaleFactor;
      }
    }
    
    // create the grid in a canvas element
    _createGrid();

    /*** OBJECT INSTANCE TEMPLATE ***/

    var _instance = function() {
      /*** PUBLIC VARIABLES ***/
      this.canvas = _canvas; // canvas DOM object
      this.obj = _obj;
    };

    /*** PUBLIC FUNCTIONS ***/
    _instance.prototype.draw = _draw;
    _instance.prototype.getCellPosition = _getCellPosition;
    _instance.prototype.highlightCell = _highlightCell;
    _instance.prototype.toggleCell = _toggleCell;
    _instance.prototype.toString = _toString;

    return new _instance();
  }
}