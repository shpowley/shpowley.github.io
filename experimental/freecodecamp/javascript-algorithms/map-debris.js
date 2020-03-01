// https://www.freecodecamp.com/challenges/map-the-debris
function orbitalPeriod(arr) {
  var
    GM = 398600.4418,
    earthRadius = 6367.4447;

  arr.forEach(e => {
    e.orbitalPeriod = Math.round(2 * Math.PI * Math.sqrt(Math.pow(earthRadius + e.avgAlt, 3) / GM));
    delete e.avgAlt;
  });

  return arr;
}

orbitalPeriod([{name : "sputnik", avgAlt : 35873.5553}]);
