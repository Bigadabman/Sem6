const crypto = require("crypto");
const fs = require("fs");

// ===============================
// Настройки
// ===============================

const DEFAULT_MESSAGE = "Korobov Egor Olegovich";
const BENCHMARK_SIZES = [512, 1024, 2048];
const BENCHMARK_ITERATIONS = 100;

// ===============================
// Общие функции
// ===============================

function measureTime(callback) {
    const start = performance.now();
    const result = callback();
    const end = performance.now();

    return {
        result,
        time: end - start
    };
}

function gcd(a, b) {
    while (b !== 0n) {
        [a, b] = [b, a % b];
    }
    return a;
}

function mod(a, n) {
    return ((a % n) + n) % n;
}

function modPow(base, exponent, modulus) {
    base = mod(BigInt(base), modulus);
    exponent = BigInt(exponent);
    modulus = BigInt(modulus);

    let result = 1n;

    while (exponent > 0n) {
        if (exponent % 2n === 1n) {
            result = (result * base) % modulus;
        }

        base = (base * base) % modulus;
        exponent /= 2n;
    }

    return result;
}

function modInverse(a, n) {
    let t = 0n;
    let newT = 1n;

    let r = n;
    let newR = mod(a, n);

    while (newR !== 0n) {
        const q = r / newR;

        [t, newT] = [newT, t - q * newT];
        [r, newR] = [newR, r - q * newR];
    }

    if (r > 1n) {
        throw new Error("Обратного элемента не существует");
    }

    if (t < 0n) {
        t += n;
    }

    return t;
}

function hashToBigInt(message) {
    const hash = crypto.createHash("sha256").update(message).digest("hex");
    return BigInt("0x" + hash);
}

function bitLength(n) {
    return n.toString(2).length;
}

function randomBigInt(maxExclusive) {
    if (maxExclusive <= 1n) {
        throw new Error("maxExclusive должен быть больше 1");
    }

    const bytes = Math.ceil(bitLength(maxExclusive) / 8);

    while (true) {
        const value = BigInt("0x" + crypto.randomBytes(bytes).toString("hex"));

        if (value > 0n && value < maxExclusive) {
            return value;
        }
    }
}

function randomBigIntRange(minInclusive, maxExclusive) {
    return minInclusive + randomBigInt(maxExclusive - minInclusive);
}

function bigIntToString(value) {
    return value.toString();
}

function pairToString(pair) {
    return `(${pair.a.toString()}, ${pair.b.toString()})`;
}

// ===============================
// RSA ЭЦП
// ===============================

function generateRSAKeys(bits = 512) {
    const e = 65537n;

    while (true) {
        const p = crypto.generatePrimeSync(Math.floor(bits / 2), {
            bigint: true
        });

        const q = crypto.generatePrimeSync(Math.floor(bits / 2), {
            bigint: true
        });

        if (p === q) {
            continue;
        }

        const n = p * q;
        const phi = (p - 1n) * (q - 1n);

        if (gcd(e, phi) !== 1n) {
            continue;
        }

        const d = modInverse(e, phi);

        return {
            publicKey: { e, n },
            privateKey: { d, n },
            bits
        };
    }
}

function createRSASignature(message, privateKey) {
    const h = hashToBigInt(message) % privateKey.n;
    return modPow(h, privateKey.d, privateKey.n);
}

function verifyRSASignature(message, signature, publicKey) {
    const h = hashToBigInt(message) % publicKey.n;
    const restoredHash = modPow(signature, publicKey.e, publicKey.n);

    return restoredHash === h;
}

// ===============================
// Эль-Гамаль ЭЦП
// ===============================

function generateSafePrime(bits = 512) {
    const p = crypto.generatePrimeSync(bits, {
        bigint: true,
        safe: true
    });

    const q = (p - 1n) / 2n;

    return { p, q };
}

function findPrimitiveRootForSafePrime(p, q) {
    for (let g = 2n; g < 1000n; g++) {
        if (modPow(g, 2n, p) !== 1n && modPow(g, q, p) !== 1n) {
            return g;
        }
    }

    throw new Error("Не удалось найти первообразный корень");
}

function generateElGamalKeys(bits = 512) {
    const { p, q } = generateSafePrime(bits);
    const g = findPrimitiveRootForSafePrime(p, q);

    const x = randomBigIntRange(2n, p - 2n);
    const y = modPow(g, x, p);

    return {
        publicKey: { p, g, y },
        privateKey: { p, g, x },
        bits
    };
}

function createElGamalSignature(message, privateKey) {
    const { p, g, x } = privateKey;

    const h = hashToBigInt(message) % (p - 1n);

    let k;

    do {
        k = randomBigIntRange(2n, p - 2n);
    } while (gcd(k, p - 1n) !== 1n);

    const a = modPow(g, k, p);
    const kInv = modInverse(k, p - 1n);

    const b = mod((h - x * a) * kInv, p - 1n);

    return { a, b };
}

function verifyElGamalSignature(message, signature, publicKey) {
    const { p, g, y } = publicKey;
    const { a, b } = signature;

    if (a <= 0n || a >= p) {
        return false;
    }

    const h = hashToBigInt(message) % (p - 1n);

    const left = (modPow(y, a, p) * modPow(a, b, p)) % p;
    const right = modPow(g, h, p);

    return left === right;
}

// ===============================
// Шнорр ЭЦП
// ===============================

function generateSchnorrKeys(bits = 512) {
    const { p, q } = generateSafePrime(bits);

    const primitiveRoot = findPrimitiveRootForSafePrime(p, q);

    // g имеет порядок q
    const g = modPow(primitiveRoot, 2n, p);

    const x = randomBigIntRange(1n, q);
    const y = modPow(g, x, p);

    return {
        publicKey: { p, q, g, y },
        privateKey: { p, q, g, x },
        bits
    };
}


function schnorrSignatureToString(signature) {
    return `(${signature.e.toString()}, ${signature.s.toString()})`;
}


function createSchnorrSignature(message, privateKey) {
    const { p, q, g, x } = privateKey;

    const r = randomBigIntRange(1n, q);
    const a = modPow(g, r, p);

    const e = hashToBigInt(message + a.toString()) % q;
    const s = mod(r + x * e, q);

    return { e, s };
}

function verifySchnorrSignature(message, signature, publicKey) {
    const { p, q, g, y } = publicKey;
    const { e, s } = signature;

    if (e < 0n || e >= q || s < 0n || s >= q) {
        return false;
    }

    const yPowE = modPow(y, e, p);
    const yPowEInv = modInverse(yPowE, p);

    const a = (modPow(g, s, p) * yPowEInv) % p;

    const checkE = hashToBigInt(message + a.toString()) % q;

    return checkE === e;
}

// ===============================
// Запуск одного алгоритма
// ===============================

function runRSA(message, bits = 512) {
    console.log("===== RSA =====");
    console.log("Message:", message);
    console.log("Key size:", bits, "bits");

    const keys = generateRSAKeys(bits);

    const sign = measureTime(() =>
        createRSASignature(message, keys.privateKey)
    );

    const verify = measureTime(() =>
        verifyRSASignature(message, sign.result, keys.publicKey)
    );

    console.log("Signature:", sign.result.toString());
    console.log("Verification:", verify.result);
    console.log("Signature generation time:", sign.time.toFixed(4), "ms");
    console.log("Verification time:", verify.time.toFixed(4), "ms");
}

function runElGamal(message, bits = 512) {
    console.log("===== ElGamal =====");
    console.log("Message:", message);
    console.log("Key size:", bits, "bits");

    const keys = generateElGamalKeys(bits);

    const sign = measureTime(() =>
        createElGamalSignature(message, keys.privateKey)
    );

    const verify = measureTime(() =>
        verifyElGamalSignature(message, sign.result, keys.publicKey)
    );

    console.log("Signature:", pairToString(sign.result));
    console.log("Verification:", verify.result);
    console.log("Signature generation time:", sign.time.toFixed(4), "ms");
    console.log("Verification time:", verify.time.toFixed(4), "ms");
}

function runSchnorr(message, bits = 512) {
    console.log("===== Schnorr =====");
    console.log("Message:", message);
    console.log("Key size:", bits, "bits");

    const keys = generateSchnorrKeys(bits);

    const sign = measureTime(() =>
        createSchnorrSignature(message, keys.privateKey)
    );

    const verify = measureTime(() =>
        verifySchnorrSignature(message, sign.result, keys.publicKey)
    );

    console.log("Signature:", schnorrSignatureToString(sign.result));
    console.log("Verification:", verify.result);
    console.log("Signature generation time:", sign.time.toFixed(4), "ms");
    console.log("Verification time:", verify.time.toFixed(4), "ms");
}

function runAll(message, bits = 512) {
    runRSA(message, bits);
    console.log();
    runElGamal(message, bits);
    console.log();
    runSchnorr(message, bits);
}

// ===============================
// Benchmark
// ===============================

function average(values) {
    return values.reduce((a, b) => a + b, 0) / values.length;
}

function benchmarkAlgorithm(name, bits, message) {
    let keys;
    let createSignature;
    let verifySignature;

    if (name === "rsa") {
        keys = generateRSAKeys(bits);
        createSignature = () => createRSASignature(message, keys.privateKey);
        verifySignature = (signature) =>
            verifyRSASignature(message, signature, keys.publicKey);
    }

    if (name === "elgamal") {
        keys = generateElGamalKeys(bits);
        createSignature = () => createElGamalSignature(message, keys.privateKey);
        verifySignature = (signature) =>
            verifyElGamalSignature(message, signature, keys.publicKey);
    }

    if (name === "schnorr") {
        keys = generateSchnorrKeys(bits);
        createSignature = () => createSchnorrSignature(message, keys.privateKey);
        verifySignature = (signature) =>
            verifySchnorrSignature(message, signature, keys.publicKey);
    }

    const signTimes = [];
    const verifyTimes = [];

    for (let i = 0; i < BENCHMARK_ITERATIONS; i++) {
        const sign = measureTime(() => createSignature());

        const verify = measureTime(() =>
            verifySignature(sign.result)
        );

        signTimes.push(sign.time);
        verifyTimes.push(verify.time);
    }

    return {
        algorithm: name,
        bits,
        avgSignTime: average(signTimes),
        avgVerifyTime: average(verifyTimes),
        avgTotalTime: average(signTimes) + average(verifyTimes)
    };
}

function runBenchmark(message) {
    console.log("===== Benchmark =====");
    console.log("Message:", message);
    console.log("Iterations:", BENCHMARK_ITERATIONS);

    const algorithms = ["rsa", "elgamal", "schnorr"];
    const rows = [];

    for (const bits of BENCHMARK_SIZES) {
        for (const algorithm of algorithms) {
            console.log(`Testing ${algorithm}, ${bits} bits...`);

            const result = benchmarkAlgorithm(algorithm, bits, message);

            rows.push(result);

            console.log(
                `${algorithm}; ${bits} bits; sign=${result.avgSignTime.toFixed(4)} ms; verify=${result.avgVerifyTime.toFixed(4)} ms; total=${result.avgTotalTime.toFixed(4)} ms`
            );
        }
    }

    const csv = [
        "algorithm,bits,avgSignTimeMs,avgVerifyTimeMs,avgTotalTimeMs",
        ...rows.map(row =>
            `${row.algorithm},${row.bits},${row.avgSignTime.toFixed(4)},${row.avgVerifyTime.toFixed(4)},${row.avgTotalTime.toFixed(4)}`
        )
    ].join("\n");

    fs.writeFileSync("benchmark.csv", csv, "utf8");

    console.log("\nBenchmark saved to benchmark.csv");
}

// ===============================
// MAIN
// ===============================

const args = process.argv.slice(2);

const command = args[0];
const bits = args[1] ? Number(args[1]) : 512;
const message = args.slice(2).join(" ") || DEFAULT_MESSAGE;

switch (command) {
    case "rsa":
        runRSA(message, bits);
        break;

    case "elgamal":
        runElGamal(message, bits);
        break;

    case "schnorr":
        runSchnorr(message, bits);
        break;

    case "all":
        runAll(message, bits);
        break;

    case "bench":
        runBenchmark(message);
        break;

    default:
        console.log("Commands:");
        console.log("node main.js rsa [bits] [message]");
        console.log("node main.js elgamal [bits] [message]");
        console.log("node main.js schnorr [bits] [message]");
        console.log("node main.js all [bits] [message]");
        console.log("node main.js bench [message]");
        console.log();
        console.log("Examples:");
        console.log("node main.js rsa 512 \"Korobov Egor Olegovich\"");
        console.log("node main.js elgamal 512 \"Korobov Egor Olegovich\"");
        console.log("node main.js schnorr 512 \"Korobov Egor Olegovich\"");
        console.log("node main.js all 512 \"Korobov Egor Olegovich\"");
        console.log("node main.js bench \"Korobov Egor Olegovich\"");
}