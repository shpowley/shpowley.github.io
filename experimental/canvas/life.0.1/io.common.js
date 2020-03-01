var IO = {
  // pass in canvas object or name of canvas element
  getCanvasContext: function(canvas) {
    var ctx;
    
    try {
      if (typeof(canvas) == "object") {
        ctx = canvas.getContext("2d");
      }
      else {
        ctx = document.getElementById(canvas).getContext("2d");
      }
      
      return ctx;
    }
    catch(e) {
      this.log(e);
      return;
    }
  },
  
  // check if variable is an integer
  isInteger: function(n) {
    return (!isNaN(n) && n === ~~n); // "n === ~~n" equivalent to "Math.floor(n)")
  },
  
  // send message to browser console
  log: function(message) {
    try {
      console.log(message);
    }
    catch(exception) {
      return;
    }
  }
};