const isPrime = (num: number) => {
  for (let i = 2, s = Math.sqrt(num); i <= s; i++) {
    if (num % i === 0) return false;
  }
  return num > 1;
}
export function cpuIntensiveFunc() {
  console.log('Begin cpu intensive task: find prime number');
  const primeNumbers = [];
  for (let i = 0; i < 0.3e8; i++) {
    if (isPrime(i)) {
      primeNumbers.push(i);
    }
  }
  console.log(`Finished cpu intensive task: ${primeNumbers.length} prime numbers found`);
}
