// https://www.freecodecamp.com/challenges/wherefore-art-thou
function whatIsInAName(collection, source) {
  var
    source_keys = Object.keys(source),

    filtered_collection = collection.filter(function(item) {
      var key;

      for (var i = 0, l = source_keys.length; i < l; i++) {
        key = source_keys[i];

        if (!item.hasOwnProperty(key) || item[key] !== source[key])
          return false;
      }

      return true;
    });

  return filtered_collection;
}

whatIsInAName([{ first: "Romeo", last: "Montague" }, { first: "Mercutio", last: null }, { first: "Tybalt", last: "Capulet" }], { last: "Capulet" });
