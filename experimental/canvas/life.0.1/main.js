/**
  TODO:
  - create LIFE.init(), key handler, clean-up code
  - move all script to separate javascript file
  - moved code for created fixed canvas layers to a separate function / object
  
  - use jQuery slider plugin (0 - title, 1 - grid + commands, 2 - options)
  - load images for grass / herbivore
  - place images at random locations to see visual effect
  - data structure for herbivores and grass (similar c++)
  - function for grass / herbivore placement using temp data
  - set canvas style attributes in code except ID
  - scale canvas to window width??
*/
window.onload = main;

function main() {
  IO.log("Log messages - OK");

  if (!Modernizr.canvas) {
    IO.log("Canvas - FAIL");
    return;
  }

  var canvas, context;

  /* top canvas - fixed-grid (created only once) */
  canvas = LIFE.drawGrid();

  if (canvas) {
    var canvasGrid = document.getElementById(LIFE.canvas.id[2]);
    canvasGrid.width = LIFE.grid.w;
    canvasGrid.height = LIFE.grid.h;

    context = IO.getCanvasContext(canvasGrid);
    context.drawImage(canvas, 0, 0); // ** fast blit-type operation ***
  }

  /*
    bottom canvas - bare dirt
    - fixed
    - created only once
    - "canvas-ground" canvas element created in html
  */
  canvas = document.getElementById(LIFE.canvas.id[0]);
  canvas.width = LIFE.canvas.w = LIFE.grid.w;
  canvas.height = LIFE.canvas.h = LIFE.grid.h;

  context = IO.getCanvasContext(canvas);
  context.globalAlpha = 0.6;
  context.fillStyle = "#996633";
  context.fillRect(0, 0, LIFE.canvas.w, LIFE.canvas.h);

  /*
    test code by drawing one entity within the grid cells + moving around
  */
  canvas = document.getElementById(LIFE.canvas.id[1]);
  canvas.width = LIFE.grid.w;
  canvas.height = LIFE.grid.h;

  LIFE.entities.context = IO.getCanvasContext(canvas);
  //entity_ctx.fillStyle = "#2E9AFE";
  LIFE.entities.context.fillStyle = "yellow";
  //entity_ctx.strokeStyle = "yellow";
  //entity_ctx.lineWidth = 0;

  // draw circle
  LIFE.drawCircle(0, 0);

  document.addEventListener("keydown", keyFunction);
};

function keyFunction(event) {
  var key = event.keyCode;

  if (key < 37 || key > 40) return; // check arrow keys

  var inBounds = true;
  var row = LIFE.entities.row;
  var column = LIFE.entities.col;

  switch (key) {
  case (37):
    // left
    IO.log("LEFT");
    column--;

    if (column < 0) {
      column = 0;
      inBounds = false;
    }

    break;

  case (38):
    // up
    IO.log("UP");
    row--;

    if (row < 0) {
      row = 0;
      inBounds = false;
    }

    break;

  case (39):
    // right
    IO.log("RIGHT");
    column++;

    if (column > LIFE.grid.cols - 1) {
      column = LIFE.grid.cols - 1;
      inBounds = false;
    }

    break;

  case (40):
    // down
    IO.log("DOWN");
    row++;

    if (row > LIFE.grid.rows - 1) {
      row = LIFE.grid.rows - 1;
      inBounds = false;
    }

    break;

  default:
    // ignore other keys
  }

  if (inBounds) {
    LIFE.entities.context.clearRect(LIFE.entities.col * LIFE.grid.cell.w, LIFE.entities.row * LIFE.grid.cell.h, LIFE.grid.cell.w, LIFE.grid.cell.h);
    LIFE.drawCircle(row, column);
  }
}