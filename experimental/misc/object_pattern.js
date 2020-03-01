/*
  RE-WRITE THIS AFTER READING SOME JAVASCRIPT OBJECT MATERIAL

  useful links
  - http://addyosmani.com/resources/essentialjsdesignpatterns/book/ (open source javascript object patterns)
  - http://phrogz.net/JS/classes/OOPinJS.html
*/

var v1, v2;

var VEHICLE = {
  TYPE: {
    CAR: 0,
    TRUCK: 1,
    TANK: 2,
    SNOWMOBILE: 3
  },

  create: function(type, name) {
    /* private vars and members */
    function _lookup(item, enumList) {
      for (var i in enumList) {
        if (item === enumList[i]) {
          return true;
        }
      }

      return false;
    }

    function _drive() {
      console.log("driving my " + _name);
    }

    function _setName(name) {
      _name = name;
    }

    // validate inputs
    var _type = (_lookup(type, VEHICLE.TYPE)) ? type : VEHICLE.TYPE.CAR;
    var _name = name;


    /** OBJECT CONSTRUCTION **/
    var Vehicle = function() {
      /**
       * PUBLIC PROPERTIES
       *
       * using closures
       * - set initial value only, but does NOT establish a reference to the private variables
       */
      this.type = _type;
      this.name = _name;

      /**
       * PUBLIC METHOD DEFINED IN THE CONSTRUCTOR
       * - compared to PROTOTYPE method, code is duplicated for each object instance
       */
      this.drive = _drive;
    };

    /**
     * PUBLIC METHODS DEFINED IN THE PROTOTYPE
     * - more efficient for multiple object of the same class
     * - overall, this appears to be better
     */
    Vehicle.prototype.toString = function() {
      // return "Vehicle Object: " + this.name;
      return "Vehicle Object: " + this.name + " (public), " + _name + " (private)";
    };

    Vehicle.prototype.setName = _setName;

    return new Vehicle();
  }
};

window.onload = function() {
  v1 = VEHICLE.create(VEHICLE.TYPE.TANK, "Sherman");
  v2 = VEHICLE.create(VEHICLE.TYPE.TRUCK, "Earth Mover");

  v1.setName("M1 Abrams");

  v1.drive();
  v2.drive();

  console.log(v1.toString());
  console.log(v2.toString());

  v1.name = "Tiger Shark";

  v1.drive();
  v2.drive();

  console.log(v1.toString());
  console.log(v2.toString());

  console.log(v1);
};