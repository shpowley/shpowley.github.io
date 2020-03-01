var
  $id = document.getElementById.bind(document),
  xhttp = new XMLHttpRequest();

window.addEventListener("load", function() {
  xhttp.open("POST", "data.json", true);
  xhttp.send();
});

xhttp.onreadystatechange = function() {
  if (xhttp.readyState === xhttp.DONE && xhttp.status === 200) {
    var
      data = JSON.parse(xhttp.responseText),
      result_div = $id("result");

    result_div.innerHTML = "title: " + data.title + "<br>"
      + "x: " + data.x + "<br>"
      + "y: " + data.y + "<br>"
      + "states[1]: " + data.states[1] + "<br>"
      + "states: " + data.states;
  }
};