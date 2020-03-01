// https://www.freecodecamp.com/challenges/record-collection
var
  collection = {
    "2548": {
      "album": "Slippery When Wet",
      "artist": "Bon Jovi",
      "tracks": [
        "Let It Rock",
        "You Give Love a Bad Name"
      ]
    },
    "2468": {
      "album": "1999",
      "artist": "Prince",
      "tracks": [
        "1999",
        "Little Red Corvette"
      ]
    },
    "1245": {
      "artist": "Robert Palmer",
      "tracks": [ ]
    },
    "5439": {
      "album": "ABBA Gold"
    }
  },

  // Keep a copy of the collection for tests
  collectionCopy = JSON.parse(JSON.stringify(collection));

function updateRecords(id, prop, value) {
  // if value is empty (""), delete the given prop property from the album.
  if (value === "" && collection[id].hasOwnProperty(prop))
    delete collection[id][prop];

  else {
    if (prop === "tracks") {
      // if prop is "tracks" but the album doesn't have a "tracks" property, create an empty array before adding the new value to the album's corresponding property.
      if (!collection[id].hasOwnProperty("tracks"))
        collection[id].tracks = [];

      // if prop is "tracks" and value isn't empty (""), push the value onto the end of the album's existing tracks array.
      collection[id].tracks.push(value);
    }

    // if prop isn't "tracks" and value isn't empty (""), update or set the value for that record album's property.
    else
      collection[id][prop] = value;
  }

  return collection;
}

// Alter values below to test your code
updateRecords(5439, "artist", "ABBA");