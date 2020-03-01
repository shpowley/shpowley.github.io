UTIL.loggingEnabled = true;

window.addEventListener("load", function() {
  var _grid = new GRID.instance({
    color: "#999966",
    rows: 10,
    cols: 20,
    cell: {
      w: 20,
      h: 20
    },
    offset: {
      x: 0,
      y: 0
    },
    scaleFactor: 2
  });
  
  var _gridObj = _grid.obj; // alias
  
  var _stage = new CANVAS.init("container", {
    w: _gridObj.w + _gridObj.offset.x,
    h: _gridObj.h + _gridObj.offset.y,
    scale: CANVAS.SCALE.FACTOR,
    ratio: _gridObj.scaleFactor,
    offset: _gridObj.offset
  });
  
  var _timerID;
  
  function main() {
    var _cellCanvas = _stage.canvas[0];
    var _gridCanvas = _stage.addCanvas();
    var _rect = _gridCanvas.obj.getBoundingClientRect();
    
    _gridObj.scaleFactor = _stage.getScaleFactor();
    _grid.draw(_gridCanvas.ctx);
    
    // mouse position highlight
    _gridCanvas.ctx.globalAlpha = 0.3;
    _gridCanvas.ctx.fillStyle = "yellow";
    
    UTIL.log("ready");
    
    function clickEvt(e) {
      e.stopPropagation();
      
      var pos = _grid.getCellPosition(e.clientX - _rect.left, e.clientY - _rect.top);
      
      if (pos) {
        // create / destroy cell
        _grid.toggleCell(_cellCanvas.ctx, pos);
        
        UTIL.log("row: " + pos.row + ", col: " + pos.col);
      }
    }
    
    function mouseEvt(e) {
      e.stopPropagation();
      
      var pos = _grid.getCellPosition(e.clientX - _rect.left, e.clientY - _rect.top);
      
      _grid.highlightCell(_gridCanvas.ctx, pos);
    }
    
    function resizeCallback() {
      _gridObj.scaleFactor = _stage.getScaleFactor();
      _rect = _gridCanvas.obj.getBoundingClientRect();
    }
    
    document.addEventListener("mousemove", mouseEvt); // mousemove on the document better determines grid coordinates
    // document.addEventListener("click", clickEvt);
    _gridCanvas.obj.addEventListener("click", clickEvt);
    _stage.setResizeCallback(resizeCallback);
  }
  
  main();
});