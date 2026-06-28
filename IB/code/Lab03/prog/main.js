#!/usr/bin/env node

function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);

    while (b !== 0) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

function gcdThree(a, b, c) {
    return gcd(gcd(a, b), c);
}


function isPrime(n) {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;

    for (let i = 3; i <= Math.sqrt(n); i += 2) {
        if (n % i === 0) return false;
    }
    return true;
}


function findPrimes(start, length) {
    let primes = [];

    for (let i = start; i < start + length; i++) {
        if (isPrime(i)) {
            primes.push(i);
        }
    }

    return primes;
}


const args = process.argv.slice(2);
const command = args[0];

switch (command) {

    case "gcd":
        if (args.length === 3) {
            let a = Number(args[1]);
            let b = Number(args[2]);
            console.log("НОД =", gcd(a, b));
        } else if (args.length === 4) {
            let a = Number(args[1]);
            let b = Number(args[2]);
            let c = Number(args[3]);
            console.log("НОД =", gcdThree(a, b, c));
        } else {
            console.log("Использование:");
            console.log("node app.js gcd a b");
            console.log("node app.js gcd a b c");
        }
        break;

    case "prime":
        let n = Number(args[1]);
        if (isPrime(n)) {
            console.log(n + " — простое число");
        } else {
            console.log(n + " — составное число");
        }
        break;

    case "range":
        let start = Number(args[1]);
        let length = Number(args[2]);

        let primes = findPrimes(start, length);

        console.log("Простые числа:", primes.join(", "));
        console.log("Количество:", primes.length);
        break;

    default:
        console.log("Команды:");
        console.log("gcd a b [c]  — НОД");
        console.log("prime n      — проверка на простоту");
        console.log("range s l    — простые на интервале");
}