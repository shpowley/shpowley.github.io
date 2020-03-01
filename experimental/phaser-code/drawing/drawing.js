/**
 * DESCRIPTION
 *
 * - traditional XY layout "sprite" sheet
 * - composed of SVG graphics instead of traditional bitmap-style
 *
 * - note the SVG file / graphics and script also experiments with "drop-shadow" filter effect implementations
 *   - (1) combines a graphic and drop shadow into one graphic using SVG filter effects
 *   - (2) separate graphic and shadow images overlayed to look exactly like (1)
 *     - shadow image must be drawn 1st and then the image casting the shadow, for correct z-ordering
 *     - XY positioning must be manually specified, but allows for granular control of the shadow's relative position through script
 */

/* global CANVAS Image */
var
  $id = document.getElementById.bind(document),
  my_canvas, my_canvas_ctx;

window.addEventListener("load", function() {
  var
    img = new Image();

  // additional setup
  my_canvas = $id("svg_test_canvas");
  my_canvas_ctx = my_canvas.getContext("2d");

  img.src = "logo.svg";

  img.addEventListener("load", function() {
    console.log("image w: " + this.width + ", h: " + this.height);

    my_canvas.width = 600;
    my_canvas.height = 700;

    // (1) COMBINED LOGO + DROP SHADOW
    my_canvas_ctx.drawImage(this, 0, 0, 982, 512, 0, 0, 491, 256);

    // (2) SEPARATE LOGO AND SHADOW
    my_canvas_ctx.drawImage(this, 0, 520, 960, 508, 10, 262, 480, 254); // SHADOW (must be drawn 1st)
    my_canvas_ctx.drawImage(this, 0, 1048, 952, 474, 0, 260, 476, 237); // LOGO
  });
});