// https://www.freecodecamp.com/challenges/sum-all-primes

// isPrime copied from https://stackoverflow.com/a/40200710
function isPrime(num) {
  for (var i = 2, s = Math.sqrt(num); i <= s; i++) {
    if (num % i === 0)
      return false;
  }

  return num !== 1;
}

function sumPrimes(num) {
  var
    arr = [];

  // build array prime numbers up to and including "num"
  for (var i = 2; i <= num; i++) {
    if (isPrime(i))
      arr.push(i);
  }

  // calculate sum
  return arr.reduce((acc, e) => acc + e);
}

sumPrimes(10);
