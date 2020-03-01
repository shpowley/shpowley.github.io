var
  flat = document.getElementById("flat"),
  flatStyle = flat.style,
  _transform = "WebkitTransform" in flatStyle ? "WebkitTransform" :
    "MozTransform" in flatStyle ? "MozTransform" :
    "msTransform" in flatStyle ? "msTransform" : false;

_transform && window.addEventListener("deviceorientation",
  function(e) {
    // flatStyle[_transform] = "perspective(500px) rotateY(" + (-e.gamma) + "deg) rotateX(" + e.beta + "deg) rotateZ(" + -(e.alpha - 180) + "deg)";
    flatStyle[_transform] = "perspective(500px) rotateX(" + e.beta + "deg) rotateY(" + (-e.gamma) + "deg) rotateZ(" + (e.alpha) + "deg)";
  });
