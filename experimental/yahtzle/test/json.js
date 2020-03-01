var
  xhttp = new XMLHttpRequest();

window.addEventListener("load", function() {
  /* STEP 1: object literal stringified */
  // var x = {
  //   title: "json test",
  //   x: 10,
  //   y: 50,
  //   w: 100,
  //   h: 200,
  //   states: [0, 5, 21, 3]
  // };

  /* STEP 2: manually save following output to a file on the web server */
  // console.log(JSON.stringify(x));

  /**
   * STEP 3:
   * - comment out STEPS 1/2 for the remaining
   * - use STEPS 1/2 for similar JSON data file creation
   */

  /* STEP 4: request data file from the web server */
  xhttp.open("POST", "data.json", true);
  xhttp.send();
});

xhttp.onreadystatechange = function() {
  if (xhttp.readyState === xhttp.DONE && xhttp.status === 200) {
    /**
     * STEP 5:
     * - parse string data back into an object literal
     * - xhttp.responseText / .response appear to more or less contain the same unparsed string data
     */
    var x = JSON.parse(xhttp.responseText);

    console.log("OK");

    console.log(xhttp.response);
    console.log(x);
    console.log(x.states);
  }
};