const crypto = require('crypto');
const fs = require('fs');


const WEAK_KEYS = [
    "0101010101010101",
    "FEFEFEFEFEFEFEFE",
    "E0E0E0E0F1F1F1F1",
    "1F1F1F1F0E0E0E0E"
];


function getKey(name) {
    return Buffer.from(name.padEnd(8, '0').slice(0, 8));
}


function encryptDES(text, keyStr) {
    const key = getKey(keyStr);
    const cipher = crypto.createCipheriv('DES-ECB', key, null);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
}


function decryptDES(encrypted, keyStr) {
    const key = getKey(keyStr);
    const decipher = crypto.createDecipheriv('DES-ECB', key, null);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}


function encryptWithHexKey(text, hexKey) {
    const key = Buffer.from(hexKey, 'hex');
    const cipher = crypto.createCipheriv('DES-ECB', key, null);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
}

function decryptWithHexKey(encrypted, hexKey) {
    const key = Buffer.from(hexKey, 'hex');
    const decipher = crypto.createDecipheriv('DES-ECB', key, null);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}


function measureTime(fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    return { result, time: end - start };
}


function countHexDifferences(hex1, hex2) {
    let diff = 0;
    let len = Math.min(hex1.length, hex2.length);

    for (let i = 0; i < len; i++) {
        if (hex1[i] !== hex2[i]) diff++;
    }

    return diff;
}

function avalancheAverage(message, encryptFn) {
    const originalCipher = encryptFn(message);

    let totalDiff = 0;
    let count = 0;

    for (let i = 0; i < message.length; i++) {

        let char = message[i];

        let newChar = char === 'A' ? 'B' : 'A';

        let modifiedMessage =
            message.slice(0, i) +
            newChar +
            message.slice(i + 1);

        let modifiedCipher = encryptFn(modifiedMessage);

        let diff = countHexDifferences(originalCipher, modifiedCipher);

        totalDiff += diff;
        count++;
    }

    return (totalDiff / count).toFixed(2);
}

function avalancheFullAnalysis(message, keyStr) {
    console.log("\--- Avalanche ---");

    const originalCipher = encryptDES(message, keyStr);

    let totalDiff = 0;
    let count = 0;

    for (let i = 0; i < message.length; i++) {

        let char = message[i];


        let newChar = char === 'A' ? 'B' : 'A';

        let modifiedMessage =
            message.slice(0, i) +
            newChar +
            message.slice(i + 1);

        let modifiedCipher = encryptDES(modifiedMessage, keyStr);

        let diff = countHexDifferences(originalCipher, modifiedCipher);

        totalDiff += diff;
        count++;

        console.log(`Position ${i}: diff = ${diff}/${originalCipher.length}`);
    }

    let avg = (totalDiff / count).toFixed(2);

    console.log("\nAverage diff:", avg);
}


function analyzeWeakKeys(message, originalCipher) {
    console.log("\n--- Weak Keys ----");

    for (let hexKey of WEAK_KEYS) {

        const encryptFn = (text) => encryptWithHexKey(text, hexKey);


        let encrypted1 = encryptFn(message);

        let intermediate = Buffer.from(encrypted1, 'hex').toString('utf8');
        let encrypted2 = encryptFn(intermediate);

        let isWeak = encrypted2 === message;

        let diff = countHexDifferences(originalCipher, encrypted1);


        let avalancheAvg = avalancheAverage(message, encryptFn);

        console.log(`Key: ${hexKey}`);
        console.log(`Diff from original cipher: ${diff}/${originalCipher.length}`);
        console.log(`E(E(P)) == P: ${isWeak}`);
        console.log(`Average avalanche: ${avalancheAvg}/${originalCipher.length}`);
        console.log("-------------------------");
    }
}


const message = fs.readFileSync('message.txt', 'utf8');


const key = "KorobovE";


const enc = measureTime(() => encryptDES(message, key));


const dec = measureTime(() => decryptDES(enc.result, key));


fs.writeFileSync('encrypted.txt', enc.result, 'utf8');
fs.writeFileSync('decrypted.txt', dec.result, 'utf8');


console.log("Key:", key);
console.log("Encryption time:", enc.time, "ms");
console.log("Decryption time:", dec.time, "ms");


console.log("\nDecryption correct:", dec.result === message);


// avalancheFullAnalysis(message, key);


// analyzeWeakKeys(message, enc.result);