// https://www.freecodecamp.com/challenges/inventory-update
function updateInventory(arr1, arr2) {
  var
    item_description,
    match_index;

  arr1.forEach(e => {
    item_description = e[1];

    match_index = arr2.findIndex(e => {
      return e[1] === item_description;
    });

    if (match_index > -1) {
      e[0] += arr2[match_index][0];
      arr2.splice(match_index, 1);
    }
  });

  arr1 = arr1.concat(arr2).sort((a, b) => {
    return a[1] > b[1];
  });

  return arr1;
}

// Example inventory lists
var curInv = [
  [21, "Bowling Ball"],
  [2, "Dirty Sock"],
  [1, "Hair Pin"],
  [5, "Microphone"]
];

var newInv = [
  [2, "Hair Pin"],
  [3, "Half-Eaten Apple"],
  [67, "Bowling Ball"],
  [7, "Toothpaste"]
];

updateInventory(curInv, newInv);
