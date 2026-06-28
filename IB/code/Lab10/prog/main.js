const fs = require('fs');

const text = 'КОРОБОВ ЕГОР ОЛЕГОВИЧ';
// const text = fs.readFileSync('input.txt', 'utf-8');


// =========================================

function gcd(a, b) {
    while (b !== 0n) {
        [a, b] = [b, a % b];
    }
    return a;
}

function modPow(base, exponent, mod) {

    base = BigInt(base);
    exponent = BigInt(exponent);
    mod = BigInt(mod);

    let result = 1n;

    while (exponent > 0n) {

        if (exponent % 2n === 1n) {
            result = (result * base) % mod;
        }

        base = (base * base) % mod;
        exponent /= 2n;
    }

    return result;
}

function modInverse(a, mod) {

    let t = 0n;
    let newT = 1n;

    let r = mod;
    let newR = a;

    while (newR !== 0n) {

        let q = r / newR;

        [t, newT] = [newT, t - q * newT];
        [r, newR] = [newR, r - q * newR];
    }

    if (t < 0n) {
        t += mod;
    }

    return t;
}


function textToCodes(text) {
    return [...text].map(c => BigInt(c.charCodeAt(0)));
}

function codesToText(codes) {
    return codes.map(c => String.fromCharCode(Number(c))).join('');
}

function measureTime(callback) {

    const start = performance.now();
    const result = callback();
    const end = performance.now();

    return {
        result,
        time: (end - start).toFixed(4)
    };
}



// =========================================
// RSA
// =========================================

function generateRSAKeys() {

    const p = 61n;
    const q = 53n;

    const n = p * q;

    const phi = (p - 1n) * (q - 1n);

    let e = 17n;

    while (gcd(e, phi) !== 1n) {
        e++;
    }

    const d = modInverse(e, phi);

    return {
        publicKey: { e, n },
        privateKey: { d, n }
    };
}

function encryptRSA(text, publicKey) {

    const codes = textToCodes(text);

    return codes.map(code =>
        modPow(code, publicKey.e, publicKey.n)
    );
}

function decryptRSA(cipher, privateKey) {

    const decrypted = cipher.map(c =>
        modPow(c, privateKey.d, privateKey.n)
    );

    return codesToText(decrypted);
}





// =========================================
// Эль-Гамаль
// =========================================

function generateElGamalKeys() {

    const p = 65537n;
    const g = 3n;

    const x = 127n;

    const y = modPow(g, x, p);

    return {
        publicKey: { p, g, y },
        privateKey: { p, g, x }
    };
}

function encryptElGamal(text, publicKey) {

    const codes = textToCodes(text);

    let result = [];

    for (let m of codes) {

        const k = 61n;

        const a = modPow(publicKey.g, k, publicKey.p);

        const b = (
            modPow(publicKey.y, k, publicKey.p) * m
        ) % publicKey.p;

        result.push([a, b]);
    }

    return result;
}

function decryptElGamal(cipher, privateKey) {

    let result = [];

    for (let [a, b] of cipher) {

        const s = modPow(a, privateKey.x, privateKey.p);

        const sInv = modInverse(s, privateKey.p);

        const m = (b * sInv) % privateKey.p;

        result.push(m);
    }

    return codesToText(result);
}



function getTextSize(text) {
    return Buffer.byteLength(text, 'utf8');
}

function getRSAEncryptSize(cipher) {
    return Buffer.byteLength(cipher.join(' '), 'utf8');
}

function getElGamalEncryptSize(cipher) {
    const serialized = JSON.stringify(
        cipher,
        (_, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value
    );

    return Buffer.byteLength(serialized, 'utf8');
}


// =========================================
// MAIN
// =========================================

const args = process.argv.slice(2);
const algorithm = args[0];

switch (algorithm) {

    case 'rsa': {

        console.log('===== RSA =====');

        console.log('size of text: ' + getTextSize(text) + ' bytes');

        const keys = generateRSAKeys();

        console.log('Public key:', keys.publicKey);
        console.log('Private key:', keys.privateKey);

        const enc = measureTime(() =>
            encryptRSA(text, keys.publicKey)
        );


        console.log('Ciphertext size:', getRSAEncryptSize(enc.result), 'bytes');

        const dec = measureTime(() =>
            decryptRSA(enc.result, keys.privateKey)
        );

        

        console.log('Encrypted:');
        console.log(enc.result);

        console.log('Decrypted:');
        console.log(dec.result);

        console.log('Encryption time:', enc.time, 'ms');
        console.log('Decryption time:', dec.time, 'ms');

        fs.writeFileSync(
            'rsa_encrypted.txt',
            enc.result.join(' ')
        );

        fs.writeFileSync(
            'rsa_decrypted.txt',
            dec.result
        );

        break;
    }


    case 'elgamal': {

        console.log('===== ElGamal =====');

        console.log('Text size:', getTextSize(text), 'bytes');

        const keys = generateElGamalKeys();

        console.log('Public key:', keys.publicKey);
        console.log('Private key:', keys.privateKey);

        const enc = measureTime(() =>
            encryptElGamal(text, keys.publicKey)
        );
        
        console.log('Ciphertext size:', getElGamalEncryptSize(enc.result), 'bytes');

        const dec = measureTime(() =>
            decryptElGamal(enc.result, keys.privateKey)
        );

        console.log('Encrypted:');
        console.log(enc.result);

        console.log('Decrypted:');
        console.log(dec.result);

        console.log('Encryption time:', enc.time, 'ms');
        console.log('Decryption time:', dec.time, 'ms');

        fs.writeFileSync(
            'elgamal_encrypted.txt',
            JSON.stringify(
                enc.result,
                (_, value) =>
                    typeof value === 'bigint'
                        ? value.toString()
                        : value
            )
        );

        fs.writeFileSync(
            'elgamal_decrypted.txt',
            dec.result
        );

        break;
    }

    default:

        console.log('Commands:');
        console.log('node main.js rsa');
        console.log('node main.js elgamal');
}
