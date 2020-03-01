/**
 * --| simple javascript to expand / collapse sections |--
 *
 * - not quite like the jquery accordion (no animation)
 * - see "la-burger > original" HTML/CSS/JS for accordion transition
 */
var h3Nodes;

function buttonHandler() {
  var node;

  for (var i = 0, l = h3Nodes.length; i < l; i++) {
    node = h3Nodes[i].nextElementSibling;

    if (node) {
      if (node === this.nextElementSibling)
        node.classList.toggle("hidden"); // "toggle" required as clicking H3 2x should toggle visibility
      else
        node.classList.add("hidden");
    }
  }
}

document.addEventListener("DOMContentLoaded", function() {
  h3Nodes = document.getElementsByTagName("h3");

  if (h3Nodes) {
    for (var i = 0, l = h3Nodes.length; i < l; i++) {
      h3Nodes[i].onclick = buttonHandler;
    }
  }
});