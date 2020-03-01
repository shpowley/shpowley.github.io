/**
 * - converts SVG image to a scaled bitmap onto a "staging" HTML5 canvas
 * - hidden canvas for import + scaling pre-render
 * - secondary canvas used for rendering shadow effect (required for chrome)
 *
 * - 3 images:
 *   - (1) canvas top image from staging canvases
 *   - (2) far right image is an image html element created from canvas top image (1)
 *   - (3) canvas bottom image from image element (2)
 */
var
  $id = document.getElementById.bind(document),
  $create = document.createElement.bind(document);

window.addEventListener("load", function() {
  var
    canvas_main = $id("canvas-main"),

    // (1) don't add cache canvas(es) to the DOM
    // - NOTE: this is much cleaner with no additional HTML/CSS and hiding the elements
    // - http://www.slideshare.net/deanhudson/stupid-canvas-tricks
    canvas_hidden = $create("canvas"),
    canvas_staging = $create("canvas");

  if (canvas_main.getContext && canvas_hidden.getContext && canvas_staging.getContext) {
    var
      ctx_canvas = canvas_main.getContext("2d"),
      ctx_hidden = canvas_hidden.getContext("2d"),
      ctx_staging = canvas_staging.getContext("2d"),
      img_export = $id("img-exported"),
      img_original = new Image();

    img_original.src = "images/jack_of_diamonds2.svg";

    canvas_main.hidden = true;
    img_export.hidden = true;

    img_original.onload = function() {
      var
        SCALE = 3.5,
        w = Math.round(img_original.naturalWidth / SCALE),
        h = Math.round(img_original.naturalHeight / SCALE);

      console.log(
        "scaled image:" +
        "\nw: " + w + "px" +
        "\nh: " + h + "px");

      // (2) "snug" source canvas size to reduce pixel count (performance)
      canvas_staging.width = w;
      canvas_staging.height = h;

      // (3) pre-render a source image from SVG onto "spritesheet-like" canvas
      ctx_staging.drawImage(img_original, 0, 0, w, h); // SVG is scaled down 50%

      // (4) images copied from staging canvas to cached area for drop shadow effects
      // - NOTE: intermediate "staging" canvas for chrome browser
      // - http://stackoverflow.com/questions/17469260/how-to-draw-image-shadow-with-html5-canvas-in-chrome-browser
      h += 3;
      w += 3;
      canvas_hidden.height = h;
      canvas_hidden.width = w;
      ctx_hidden.shadowOffsetX = 1;
      ctx_hidden.shadowOffsetY = 1;
      ctx_hidden.shadowBlur = 2;
      ctx_hidden.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx_hidden.drawImage(canvas_staging, 0, 0);

      // (5) copy cached image (other canvas) onto main canvas
      // - NOTE: SVG image requires height / width specified for the svg root element for firefox (see wiggly.svg code)
      ctx_canvas.drawImage(canvas_hidden, 0, 0, w, h, 15, 15, w, h);

      // (6) export pre-rendered image as an image element
      img_export.src = canvas_hidden.toDataURL();
    };

    // (7) copy cached image (exported image) onto main canvas
    // - NOTE: .onload() method is required to work on firefox
    img_export.onload = function() {
      ctx_canvas.drawImage(img_export, 15, 210);
      canvas_main.hidden = false;
      img_export.hidden = false;
    };
  }
  else
    console.log("canvas unsupported");
});