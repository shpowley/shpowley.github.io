// https://www.freecodecamp.com/challenges/exact-change
var
  CURRENCY_LOOKUP = {
    "ONE HUNDRED": 100.0,
    TWENTY: 20.0,
    TEN: 10.0,
    FIVE: 5.0,
    ONE: 1.0,
    QUARTER: 0.25,
    DIME: 0.1,
    NICKEL: 0.05,
    PENNY: 0.01
  };

function roundToPenny(n) {
  return Math.ceil(n * 100) / 100;
}

function checkCashRegister(price, cash, cid) {
  var
    total_cid = 0,
    change_amount = cash - price,
    change_array = [];


  // CALCULATE TOTAL $ IN DRAWER
  cid.forEach(e => {
    total_cid += e[1];
  });


  // DETERMINE IF "INSUFFICIENT FUNDS" OR "CLOSED" CONDITIONS MET
  if (total_cid < change_amount)
    return "Insufficient Funds";

  else if (total_cid === change_amount)
    return "Closed";



  cid.reverse().forEach(e => {
    let
      currency_value = CURRENCY_LOOKUP[e[0]],
      currency_in_drawer = e[1],
      currency_change_qty = Math.floor(roundToPenny(change_amount) / currency_value),
      currency_change = currency_change_qty * currency_value;

    if (currency_change > 0 && currency_in_drawer > 0) {
      if (currency_in_drawer < currency_change)
        currency_change = currency_in_drawer;

      e[1] -= currency_change; // remove $ from drawer
      change_array.push([e[0], currency_change]); // add money to change handed back
      change_amount -= currency_change;
    }
  });

  if (change_amount > 0.01)
    return "Insufficient Funds";

  // Here is your change, ma'am.
  return change_array;
}

// Example cash-in-drawer array:
// [["PENNY", 1.01],
// ["NICKEL", 2.05],
// ["DIME", 3.10],
// ["QUARTER", 4.25],
// ["ONE", 90.00],
// ["FIVE", 55.00],
// ["TEN", 20.00],
// ["TWENTY", 60.00],
// ["ONE HUNDRED", 100.00]]

// checkCashRegister(price, cash, cash-in-drawer (cid))
// - returns: "Insufficient Funds", "Closed" or change sorted highest to lowest
checkCashRegister(19.50, 20.00, [["PENNY", 1.01], ["NICKEL", 2.05], ["DIME", 3.10], ["QUARTER", 4.25], ["ONE", 90.00], ["FIVE", 55.00], ["TEN", 20.00], ["TWENTY", 60.00], ["ONE HUNDRED", 100.00]]);