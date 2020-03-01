UTIL.loggingEnabled = true;

window.addEventListener("load", main);

function main() {
  function drawStuff(ctx) {
    ctx.fillStyle = "rgb(200,0,0)";
    ctx.fillRect (10, 10, 55, 50);
  
    ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
    ctx.fillRect (30, 30, 55, 50);
    
    stage.canvas[0].erased = false;
  }
  
  function fullscreenCallback() {
    if (stage.canvas[0].erased) {
      drawStuff(stage.canvas[0].ctx);
    }
    
    stage.setFullscreenCallback(null);
  }
  
  function updateValues() {
    element.x.value = dimen.x;
    element.horizontal.selectedIndex = dimen.horizontal;
    element.y.value = dimen.y;
    element.vertical.selectedIndex = dimen.vertical;
    element.width.value = dimen.w;
    element.height.value = dimen.h;
    element.scale.value = dimen.ratio;
    
    if (dimen.x) {
      element.horizontal.selectedIndex = 0;
    }
    
    if (dimen.y) {
      element.vertical.selectedIndex = 0;
    }
  }
  
  var stageBorder = false;
  var stage = CANVAS.init("canvas_container", {w:300, h:150});
  var dimen = stage.getDimensions();
  
  var element = {
    horizontal: getElement("x_select"),
    vertical: getElement("y_select"),
    x: getElement("stage_x"),
    y: getElement("stage_y"),
    width: getElement("stage_width"),
    height: getElement("stage_height"),
    scale: getElement("scale_value")
  };
  
  stage.addCanvas();
  stage.addCanvas();
  stage.addBuffer();

  stage.canvas[0].obj.style.backgroundColor = "yellow";
  drawStuff(stage.canvas[0].ctx);
  updateValues();
  
  UTIL.log("ready");
  
  element.horizontal.addEventListener("change", function() {
    if (this.selectedIndex) {
      element.x.value = "";
    }
  });
  
  element.vertical.addEventListener("change", function() {
    if (this.selectedIndex) {
      element.y.value = "";
    }
  });
  
  getElement("position_button").addEventListener("click", function() {
    UTIL.log("set dimensions");
    
    dimen.x = element.x.value;
    dimen.y = element.y.value;
    dimen.horizontal = element.horizontal.selectedIndex;
    dimen.vertical = element.vertical.selectedIndex;
    dimen.w = Number(element.width.value);
    dimen.h = Number(element.height.value);
    
    var temp = Number(getElement("scale_value").value);
    stage.scale(CANVAS.SCALE.FACTOR, temp);
    
    if (stage.canvas[0].erased) {
      drawStuff(stage.canvas[0].ctx);
    }
  });
  
  getElement("scale_button").addEventListener("click", function() {
    UTIL.log("scale to factor");

    var temp = Number(getElement("scale_value").value);
    stage.scale(CANVAS.SCALE.FACTOR, temp);
    
    if (stage.canvas[0].erased) {
      drawStuff(stage.canvas[0].ctx);
    }
  });
  
  getElement("window_button").addEventListener("click", function() {
    UTIL.log("scale to window");
    stage.scale(CANVAS.SCALE.WINDOW);
    
    if (stage.canvas[0].erased) {
      drawStuff(stage.canvas[0].ctx);
    }
  });
  
  getElement("fullscreen_button").addEventListener("click", function() {
    UTIL.log("full screen");
    stage.setFullscreenCallback(fullscreenCallback);
    stage.scale(CANVAS.SCALE.FULLSCREEN);
  });
  
  getElement("match_screen_button").addEventListener("click", function() {
    UTIL.log("match screen ratio");
    stage.proportionate();
    
    if (stage.canvas[0].erased) {
      drawStuff(stage.canvas[0].ctx);
    }
    
    updateValues();
  });

  getElement("border_button").addEventListener("click", function() {
    UTIL.log("stage border");
    stage.obj.style.border = stageBorder ? "" : "1px solid blue";
    stageBorder = !stageBorder;
  });
}