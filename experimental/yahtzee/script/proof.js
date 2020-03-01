var $id = document.getElementById.bind(document);

function getNumber() {
  var n = ~~(Math.random() * 130) + 1;

  return n > 100 ? NaN : n;
}

window.addEventListener("load", function() {
// document.addEventListener("DOMContentLoaded", function() { // SVG is not loaded and valid using this
  var
    svgNode = $id("proof"),
    svgDOM;

  // https://jwatt.org/svg/demos/getSVGDocument.html
  if (svgNode && ((svgDOM = svgNode.contentDocument) || (svgDOM = svgNode.getSVGDocument()))) {
    var
      $svg = svgDOM.getElementById.bind(svgDOM),

      text1 = $svg("text_1"),
      text2 = $svg("text_2"),
      text3 = $svg("text_3"),
      textTotal = $svg("text_total");

    $svg("cell_1").addEventListener("click", function() {
      text1.textContent = getNumber();
    });

    $svg("cell_2").addEventListener("click", function() {
      text2.textContent = getNumber();
    });

    $svg("cell_3").addEventListener("click", function() {
      text3.textContent = getNumber();
    });

    $svg("cell_total").addEventListener("click", function() {
      // cast string to number
      // http://phrogz.net/JS/string_to_number.html
      // https://coderwall.com/p/5tlhmw
      var total = text1.textContent * 1 + text2.textContent * 1 + text3.textContent * 1;
      console.log("total = " + total);

      // cast string to number (alternate)
      // var total2 = ~~text1.textContent + ~~text2.textContent + ~~text3.textContent;
      // console.log("total 2 = " + total2);

      textTotal.textContent = total;
    });

    console.log("READY");
  }
  else {
    console.error("WARNING: UNABLE TO LOAD SVG");
  }
});