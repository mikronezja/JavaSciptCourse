self.onmessage = function(message) {
    let iterations = message.data;
    let primes = [];
    for (let i = 0; i < iterations; i++) {
        let candidate = i * (1000000000 * Math.random());
        let isPrime = true;
        for (var c = 2; c <= Math.sqrt(candidate); ++c) {
            if (candidate % c === 0) {
                // not prime
                isPrime = false;
                break;
            }
        } 
        if (isPrime) {
            primes.push(candidate);
        }
    }
    self.postMessage(primes)
    self.close();
}