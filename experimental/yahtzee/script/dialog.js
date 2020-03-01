/**
 *  TODO
 *  x handle dialog non-clickable areas
 *  - label-layout.html
 *    x add additional cells
 *    - incorporate generic score dialog (number pad)
 *  - animations
 *    - load animation
 *    - transition animation for overlay?
 *    - label-animate.html
 */

var
  $id = document.getElementById.bind(document),
  $svg,
  svgDOM,
  nodeSVG,
  nodeOverlay,
  activeScore;

Element.prototype.on = Element.prototype.addEventListener;

function fnClick(action) {
  // https://saswal.wordpress.com/2014/07/09/event-preventdefault-event-stoppropagation-return-false-event-stopimmediatepropagation/
  action.stopImmediatePropagation();

  if (this.id != "dialog") {
    nodeOverlay.classList.add("hidden");
    document.body.removeAttribute("class");

    // click outside the dialog (cancel)
    if (this.id == "overlay_container") {
      console.log("cancelled");
    }
    // click ok
    else if (this.id == "button_response") {
      console.log("OK button pressed");
      $svg(activeScore).textContent = "10";
    }
  }

  return false;
}

function showDialog() {
  // lock background content from scrolling
  // - http://stackoverflow.com/questions/16637031/completely-disable-scrolling-of-webpage
  document.body.classList.add("dialog-lock");

  nodeOverlay.classList.remove("hidden");
  activeScore = "text" + this.id.slice(4);

  // HERE - show generic dialog
}

window.addEventListener("load", function() {
  var loaded = false;

  nodeSVG = $id("scorecard");

  if (nodeSVG && ((svgDOM = nodeSVG.contentDocument) || (svgDOM = nodeSVG.getSVGDocument()))) {
    var scoreNodes = svgDOM.querySelectorAll("use[id]");

    if (scoreNodes) {
      var l = scoreNodes.length, node;

      $svg = svgDOM.getElementById.bind(svgDOM);
      nodeOverlay = $id("overlay_container");

      for (var i = 0; i < l; i++) {
        node = scoreNodes[i];

        if (node.id != "cell_total") {
          node.addEventListener("click", showDialog);
        }
      }

      $id("button_response").on("click", fnClick);
      $id("dialog").on("click", fnClick);
      nodeOverlay.on("click", fnClick);

      loaded = true;
    }
  }

  if (!loaded) {
    console.error("ERROR: FAILED TO INITIALIZE");
  }
});