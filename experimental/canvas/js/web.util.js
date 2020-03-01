// shortcut in global namespace
var getElement = document.getElementById.bind(document);

// general purpose UTIL object literal
var UTIL = {
  loggingEnabled: false,
  
  // check if enum matches
  checkEnum: function(item, enumList) {
    for (var i in enumList) {
      if (item === enumList[i]) {
        return true;
      }
    }
    
    return false;
  },

  error: function(msg, tag) {
    UTIL.log(msg, tag);
    return "ERROR: " + msg;
  },

  // faster equivalent to "Math.floor(n)"
  floor: function(n) {
    return n | 0;
  },
  
  // returns supported css property from a list of candidates
  // adapted from: http://www.javascriptkit.com/javatutors/setcss3properties.shtml
  getSupported: function(prop) {
    var _prop = prop[0].toUpperCase() + prop.slice(1);
    var _root = document.documentElement;
    var _propset = ["Webkit","Moz","ms","O"];

    if (prop in _root.style) {
      return prop;
    }
    else {
      for (var i = 0, len = _propset.length; i < len; i++) {
        _propset[i] += _prop;
        
        if (_propset[i] in _root.style) {
          return _propset[i];
        }
      }
    }
    
    throw UTIL.error("no supported CSS tag found", "UTIL.getSupported()");
  },

  // check if variable is an integer
  isInteger: function(n) {
    return (!isNaN(n) && n === (n | 0));
  },
  
  // log message to browser console
  log: function(msg, tag) {
    if (UTIL.loggingEnabled) {
      try {
        console.log(tag ? (tag + ": " + msg) : msg);
      }
      catch(e) {
        return;
      }
    }
  },
  
  swap: function(a, b) {
    var temp = a;
    a = b;
    b = temp;
  }
};