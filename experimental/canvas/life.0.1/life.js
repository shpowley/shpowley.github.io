var LIFE = {
  /* DATA */

  // corresponds to pre-existing placeholder html elements
  canvas: {
    id: ["canvas-ground","canvas-entities","canvas-grid"], // index corresponds to z-index (not set in code)
    h: 400,
    w: 600
  },

  grid: { // this is "read-only"
    max_rows: 50,
    max_cols: 50,

    rows: 5,
    cols: 5,

    // placehoder (determined later)
    h: 0,
    w: 0,

    cell: {
      w: 60,
      h: 60
    },

    color: "#999966"
  },

  // this will evolve - right now just one circle entity
  entities: {
    context: null, // canvas context
    row: 0,
    col: 0
  },

  /* FUNCTIONS */

  drawCircle: function(row, col) {
    var grid = LIFE.grid;
    var entity = LIFE.entities;

    var offset = grid.cell.w / 2;
    var x = col * grid.cell.w + offset;
    var y = row * grid.cell.h + offset;

    entity.context.beginPath();

    entity.context.arc(
        x + 0.5       // x-position
      , y + 0.5       // y-position
      , offset - 0.5  // arc radius
      , 0             // start angle
      , 2 * Math.PI   // end angle
    );

    entity.context.fill();
    //entity_ctx.stroke();

    entity.row = row;
    entity.col = col;
  },

  // draw dynamic grid
  drawGrid: function() {
    var grid = LIFE.grid;

    if (IO.isInteger(grid.rows) && IO.isInteger(grid.cols) && grid.rows > 0 && grid.cols > 0) {
      // calculate canvas width and height
      grid.w = (grid.cols <= grid.max_cols ? grid.cols : grid.max_cols) * grid.cell.w + 1;
      grid.h = (grid.rows <= grid.max_rows ? grid.rows : grid.max_rows) * grid.cell.h + 1;

      // create "buffer" canvas in code
      var canvas = document.createElement("canvas");
      var ctx = IO.getCanvasContext(canvas);
      var i = 0;

      canvas.width = grid.w;
      canvas.height = grid.h;

      ctx.lineWidth = 1;
      ctx.fillStyle = grid.color;
      ctx.strokeStyle = grid.color;

      // draw vertical lines
      for (i = grid.cell.w; i <= grid.w - grid.cell.w; i += grid.cell.w) {
        ctx.fillRect(i, 0, 1, grid.h);
      }

      // draw horizontal lines
      for (i = grid.cell.h; i <= grid.h - grid.cell.h; i += grid.cell.h) {
        ctx.fillRect(0, i, grid.w, 1);
      }

      // draw border
      ctx.strokeRect(0.5, 0.5, grid.w - 1, grid.h - 1);

      return canvas;
    }
    else {
      IO.log("ERROR: unable to create grid.");

      return null;
    }
  }
};