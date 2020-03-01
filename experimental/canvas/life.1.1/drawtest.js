UTIL.loggingEnabled = true;

window.addEventListener("load", main);

function main() {
  var sprites = [{name:"androsyn",x:59,y:37,w:34,h:40},{name:"chmmr",x:59,y:0,w:34,h:36},{name:"kor-ah",x:34,y:44,w:21,h:38},{name:"shofixti",x:31,y:0,w:27,h:42},{name:"ur-quan",x:0,y:44,w:33,h:40},{name:"vux",x:0,y:0,w:30,h:43}];
  var stage = CANVAS.init("container", {w:600, h:300});
  // var dimen = stage.getDimensions();
  
  var loc = {
    x: 50,
    y: 80
  };
  
  var control = {
    thrust: false,
    left: false,
    right: false
  };
  
  var speed = 0, turnSpeed = 10 * Math.PI / 180;
  var timerID;
  var step = 0, angle = 0;
  var spritesheet = new Image();

  stage.obj.style.border = "1px solid blue";
  spritesheet.src = "images/uqm.png";
  
  spritesheet.addEventListener("load", function() {
    UTIL.log("spritesheet loaded..");
    
    // var s = sprites[1];

    // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    // stage.canvas[0].ctx.drawImage(spritesheet, s.x, s.y, s.w, s.h, loc.x, loc.y, s.w, s.h);
    drawSprite(stage.canvas[0].ctx, loc.x, loc.y);
  });
  
  document.addEventListener("keydown", function (event) {
    var key = event.keyCode;

    if (key < 37 || key > 40) return; // check arrow keys
  
    switch (key) {
      case (37): // left
        if (!control.left && step >= 0) {
          UTIL.log("LEFT");
          control.left = true;
        }
        break;
    
      case (38): // up
        if (!control.thrust) control.thrust = true;
        break;
    
      case (39): // right
        if (!control.right && step <= 0) {
          UTIL.log("RIGHT");
          control.right = true;
        }
        break;
  
      // case (40): // down -- ignore
      default:
        // ignore other keys
    }
    
    if (!timerID && (control.right || control.left)) {
      UTIL.log("TIMER init");
      timerID = TIMER.intervalRequest(turnFn, 16);
    }
  });
  /*
  document.addEventListener("keyup", function (event) {
    var key = event.keyCode;
  
    if (key < 37 || key > 40) return; // check arrow keys
  
    switch (key) {
      case (37): // left
        if (control.left) control.left = false;
        break;
    
      case (38): // up
        if (control.thrust) control.thrust = false;
        break;
    
      case (39): // right
        if (control.right) control.right = false;
        break;
  
      // case (40): // down -- ignore
      default:
        // ignore other keys
    }
  });
  */
  
  UTIL.log("ready");
  
  function turnFn() {
    
    if (!(control.right && control.left)) { // both left & right arrows press (cancels each)
      // UTIL.log("right: " + control.right + ", left: " + control.left);
      
      if (control.left) {
        step = step > 0 ? 0 : -turnSpeed;
        control.left = false; // clear the flag
      }
      else if (control.right) {
        step = step < 0 ? 0 : turnSpeed;
        control.right = false; // clear the flag
      }
    }
    else {
      TIMER.timeoutRequest(function() {
        control.right = control.left = false;
      }, 1000);
    }
    
    if (!step) return;
    
    var x = stage.canvas[0].ctx;
    var s = sprites[1];
    var tX = loc.x + s.w / 2;
    var tY = loc.y + s.h * 0.65;
    var originalAngle = angle;
    
    angle += step;
    
    // clear the old sprite
    x.save();
    x.translate(tX, tY);
    if (originalAngle) x.rotate(originalAngle.toFixed(2));
    x.translate(-tX, -tY);
    x.clearRect(loc.x - 1, loc.y - 1, s.w + 2, s.h + 2); // clear rectangle 1px larger than the original sprite (leaves no unerased pixels)
    x.restore();

    // draw new rotated sprite
    x.save();
    x.translate(tX, tY);
    if (angle) x.rotate(angle.toFixed(2));
    x.translate(-tX, -tY);
    drawSprite(stage.canvas[0].ctx, loc.x, loc.y);
    x.restore();
  }
  
  function drawSprite(ctx, _x, _y) {
    var s = sprites[1];
    
    // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    ctx.drawImage(spritesheet, s.x, s.y, s.w, s.h, _x, _y, s.w, s.h);
  }
}