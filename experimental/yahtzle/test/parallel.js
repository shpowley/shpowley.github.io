/**
 * create a row of cards on HTML5 canvas from svg assets
 * - maintains "sharp" images using oversize canvas, scaled down 50% with css transform
 *   - not sure about this technique overall, but frame rate performance should be less
 */
// create one canvas wrapped in a js object literal
function canvasObject(o) {
  if (o === undefined)
    o = $create("canvas");

  else if (o.nodeName !== "CANVAS")
    return null;

  if (o.getContext)
    return {
      canvas: o,
      ctx: o.getContext("2d")
    };

  else {
    console.error("CANVAS unsupported");
    return null;
  }
}

// create array of canvas-based js object literals
function canvasArray(n) {
  var
    i = 0,
    canvas_array = [];

  for (; i < n; i++) {
    canvas_array.push(canvasObject());
  }

  return canvas_array;
}

function imageLoad() {
  CARDS.number_loaded++;

  if (CARDS.number_loaded === CARDS.images.length) {
    /* INITIALIZATION */
    CARDS.w = CARDS.images[0].naturalWidth * CARDS.scale;
    CARDS.h = CARDS.images[0].naturalHeight * CARDS.scale;
    HAND.y = main.canvas.height - CARDS.h - 15;

    // staging[0] handles initial svg to canvas conversion
    staging[0].canvas.width = CARDS.w;
    staging[0].canvas.height = CARDS.h;

    // staging[1] required to create drop shadows on each card
    staging[1].canvas.height = CARDS.h + 4;
    staging[1].canvas.width = CARDS.w + 4;
    staging[1].ctx.shadowOffsetX = -1;
    staging[1].ctx.shadowOffsetY = 1;
    staging[1].ctx.shadowBlur = 3;
    staging[1].ctx.shadowColor = "rgba(0, 0, 0, 0.2)";

    /* COPY IMAGES TO CANVAS */
    for (var i = 0, l = CARDS.images.length; i < l; i++) {
      staging[0].ctx.drawImage(CARDS.images[i], 0, 0, CARDS.w, CARDS.h);
      staging[1].ctx.drawImage(staging[0].canvas, 4, 0);
      main.ctx.drawImage(staging[1].canvas, HAND.x, HAND.y);
      HAND.x += CARDS.w - HAND.overlap;
    }

    CARDS.images = [];
    main.canvas.hidden = false;
  }
}

function imageLoadError() {
  console.warn("Error loading image \"" + this.src +  "\"");
}

var
  $id = document.getElementById.bind(document),
  $create = document.createElement.bind(document),
  // image = new Image(),
  main = null,
  staging = null,

  CARDS = {
    scale: 0.6,

    h: 0,
    w: 0,

    number_loaded: 0,
    images: [],

    image_names: [
      "9_of_clubs.svg",
      "ace_of_clubs.svg",
      "queen_of_spades2.svg",
      "jack_of_diamonds2.svg",
      "king_of_hearts2.svg",
      "ace_of_diamonds.svg"],

    loadImages: function() {
      for (var i = 0, l = CARDS.image_names.length; i < l; i++) {
        var image = new Image();

        image.onload = imageLoad;
        image.onerror = imageLoadError;
        image.src = "images/" + CARDS.image_names[i];
        CARDS.images.push(image);
      }
    }
  },

  HAND = {
    x: 15,
    y: 15,
    overlap: 20
  };


window.addEventListener("load", function() {
  console.log(
    "screen avail height: " + screen.availHeight +
    "\nscreen avail width: " + screen.availWidth +
    "\nscreen height: " + screen.height +
    "\nscreen width: " + screen.width);

  console.log(
    "\ndocument height: " + document.body.clientHeight +
    "\ndocument width: " + document.body.clientWidth);

  console.log(
    "\ndocument scroll height: " + document.body.scrollHeight +
    "\ndocument scroll width: " + document.body.scrollWidth);

  main = canvasObject($id("canvas-main"));

  // TODO: alter this to use ratio and scale up a smaller canvas
  main.canvas.width = document.body.clientWidth * 2;
  main.canvas.height = document.body.clientHeight * 2;

  document.body.style.visibility = "visible";

  if (main !== null) {
    main.canvas.hidden = true;
    staging = canvasArray(2);
    CARDS.loadImages();
  }
});