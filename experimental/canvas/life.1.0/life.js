UTIL.loggingEnabled = true;

window.addEventListener("load", function() {
  var _grid = new GRID.instance({
    color: "#999966",
    rows: 5,
    cols: 5,
    cell: {
      w: 40,
      h: 40
    },
    offset: {
      x: 0,
      y: 0
    },
    scaleFactor: 1.5
  });
  
  var _gridObj = _grid.obj; // alias
  
  var _stage = new CANVAS.init("container", {
    w: _gridObj.w + _gridObj.offset.x,
    h: _gridObj.h + _gridObj.offset.y,
    scale: CANVAS.SCALE.FACTOR,
    ratio: _gridObj.scaleFactor,
    offset: _gridObj.offset
  });
  
  var _life = {
    src: "images/life.png",
    image: new Image(),
    data: [{name:"tyrannosaur",x:0,y:0,w:94,h:88},{name:"cow",x:21,y:88,w:17,h:22},{name:"bull",x:0,y:88,w:21,h:23},{name:"heart",x:38,y:88,w:7,h:6}],
    isLoaded: false
  };
  
  var _grass = {
    src: "images/grass.png",
    image: new Image(),
    data: [{x:0,y:0,w:16,h:16},{x:0,y:17,w:16,h:16},{x:17,y:0,w:16,h:16},{x:17,y:17,w:16,h:16},{x:0,y:34,w:16,h:16},{x:17,y:34,w:16,h:16},{x:34,y:0,w:16,h:16}],
    isLoaded: false
  };

  var _timerID;
  
  function main() {
    var _grassCanvas = _stage.canvas[0];
    var _spriteCanvas = _stage.addCanvas();
    var _gridCanvas = _stage.addCanvas();
    var _rect = _gridCanvas.obj.getBoundingClientRect();
    
    _gridObj.scaleFactor = _stage.getScaleFactor();
    _grid.draw(_gridCanvas.ctx);
    
    // function drawSprite(ctx, src, index, _x, _y) {
    drawSprite(_spriteCanvas.ctx, _life, 1, 10, 10);
    drawSprite(_spriteCanvas.ctx, _life, 2, 30, 10);
    
    UTIL.log("ready");
    
    function clickEvt(e) {
      e.stopPropagation();
      
      // var pos = _grid.getCellPosition((e.clientX - _rect.left) / _gridObj.scaleFactor, (e.clientY - _rect.top) / _gridObj.scaleFactor);
      var pos = _grid.getCellPosition(e.clientX - _rect.left, e.clientY - _rect.top);
      
      if (pos) {
        UTIL.log("row: " + pos.row + ", col: " + pos.col);
      }
    }
    
    function mouseEvt(e) {
      e.stopPropagation();
      
      // var pos = _grid.getCellPosition((e.clientX - _rect.left) / _gridObj.scaleFactor, (e.clientY - _rect.top) / _gridObj.scaleFactor);
      var pos = _grid.getCellPosition(e.clientX - _rect.left, e.clientY - _rect.top);
      
      _grid.highlightCell(_gridCanvas.ctx, pos);
      // _grid.highlightCell(_gridCanvas.ctx, {row:0, col:0});
    }
    
    function resizeCallback() {
      _gridObj.scaleFactor = _stage.getScaleFactor();
      _rect = _gridCanvas.obj.getBoundingClientRect();
    }
    
    document.addEventListener("mousemove", mouseEvt); // mousemove on the document better determines grid coordinates
    _gridCanvas.obj.addEventListener("click", clickEvt);
    _stage.setResizeCallback(resizeCallback);
  }
  
  function drawSprite(ctx, src, index, _x, _y) {
    var s = src.data[index];
    
    // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    ctx.drawImage(src.image, s.x, s.y, s.w, s.h, _x, _y, s.w, s.h);
  }
  
  function initCheck() {
    if (_life.isLoaded && _grass.isLoaded) main();
  }

  function grassLoadHandler() {
    _grass.image.removeEventListener("load", grassLoadHandler);
    _grass.isLoaded = true;
    initCheck();
  }
  
  function lifeLoadHandler() {
    _life.image.removeEventListener("load", lifeLoadHandler);
    _life.isLoaded = true;
    initCheck();
  }

  // _stage.obj.style.border = "1px solid blue";
  
  _grass.image.addEventListener("load", grassLoadHandler);
  _life.image.addEventListener("load", lifeLoadHandler);
  
  _grass.image.src = _grass.src;
  _life.image.src = _life.src;
});