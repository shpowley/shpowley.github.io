var
  $id = document.getElementById.bind(document),
  $CSS = document.querySelectorAll.bind(document),

  SCORE = {
    RESULT: 0,          // accumulated/running score flag settings
    DRP: 0x000001,  // double run diamonds / spades
    DRN: 0x000002,  // double run hearts / clubs
    A1K: 0x000004,  // 1000 aces
    K8H: 0x000008,  // 800 kings
    Q6H: 0x000010,  // 600 queens
    J4H: 0x000020,  // 400 jacks
    DPN: 0x000040,  // double pinochle
    DMG: 0x000080,  // double marriage in-suit
    ARD: 0x000100,  // 240 around the horn
    RUN: 0x000200,  // run
    A1H: 0x000400,  // 100 aces
    K80: 0x000800,  // 80 kings
    Q60: 0x001000,  // 60 queens
    PNC: 0x002000,  // pinochle
    J40: 0x004000,  // 40 jacks
    MGT: 0x008000,  // marriage in-suit
    MG1: 0x010000,  // marriage
    MG2: 0x020000,  // marriage
    MG3: 0x040000,  // marriage
    MG4: 0x080000,  // marriage
    MG5: 0x100000,  // marriage
    MG6: 0x200000,  // marriage
    NT1: 0x400000,  // nine in-suit
    NT2: 0x800000   // nine in-suit
  };

function binaryString(s) {
  var
    zeros = "000000000000000000000000",
    z_length = zeros.length,
    s_length = s.length;

  if (s_length > z_length) {
    return s;
  }
  else {
    var
      size = 4,
      _s = zeros.substr(0, z_length - s_length) + s, // original string now padded with zeros
      _s2 = _s.substr(0, size),
      i = 0,
      l = _s.length;

    for (i = size; i < l; i = i + size) {
      _s2 += " " + _s.substr(i, size);
    }

    return _s2;
  }
}

function hexString(s) {
  var
    zeros = "000000",
    z_length = zeros.length,
    s_length = s.length;

  if (s_length > z_length) {
    return s;
  }
  else {
    return "0x" + zeros.substr(0, z_length - s_length) + s.toUpperCase();
  }
}

window.addEventListener("load", function() {
  var x = $id("score_categories").children;

  for (var i = 0, l = x.length; i < l; i++) {
    x[i].children[0].addEventListener("click", function() {
      if (this.checked) {
        SCORE.RESULT |= SCORE[this.id];
      }
      else {
        SCORE.RESULT ^= SCORE[this.id];
      }

      $id("BIN_CODE").value = binaryString(SCORE.RESULT.toString(2));
      $id("HEX_CODE").value = hexString(SCORE.RESULT.toString(16));
    });
  }

  $id("BIN_CODE").addEventListener("click", function() {
    this.select();
  });

  $id("HEX_CODE").addEventListener("click", function() {
    this.select();
  });

  console.log("READY");
});