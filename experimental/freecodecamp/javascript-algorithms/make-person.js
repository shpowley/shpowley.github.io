// https://www.freecodecamp.com/challenges/make-a-person
var
  Person = function(firstAndLast) {
    var
      _first,
      _last;

    this.getFirstName = function() {
      return _first;
    };

    this.getLastName = function() {
      return _last;
    };

    this.getFullName = function() {
      return _first + " " + _last;
    };

    this.setFirstName = function(first) {
      _first = first;
    };

    this.setLastName = function(last) {
      _last = last;
    };

    this.setFullName = function(firstAndLast) {
      var
        i = firstAndLast.indexOf(" ");

      _first = firstAndLast.slice(0, i),
      _last = firstAndLast.slice(i + 1);
    };

    this.setFullName(firstAndLast);

    return firstAndLast;
  };

var
  bob = new Person('Bob Ross');

bob.getFullName();
