const fs = require('fs');
const crypto = require('crypto');

const input = fs.readFileSync('input.txt', 'utf-8');


function measureTime(fn){
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    return { result, time: (end - start).toFixed(4) };
}

function randomBigInt(bits){
    const bytes = Math.ceil(bits / 8);
    return BigInt('0x' + crypto.randomBytes(bytes).toString('hex'));
}


function createSuperIncreasingSequence(z){

    let sequence = [];
    let sum = 0n;

    for(let i = 0; i < z; i++){
        let next = sum + randomBigInt(20) + 1n;
        sequence.push(next);
        sum += next;
    }

    sequence[z - 1] = sum + randomBigInt(100);

    return sequence;
}


function gcd(a, b){
    while(b !== 0n){
        [a, b] = [b, a % b];
    }
    return a;
}

function generateParams(privateKey){
    let sum = privateKey.reduce((acc, cur) => acc + cur, 0n);

    let n = sum + randomBigInt(100);
    let a = 2n;

    while(gcd(a, n) !== 1n){
        a++;
    }

    return {a, n};
}

function generatePublicKey(privateKey, a, n){
    return privateKey.map(x => (a * x) % n);
}


function textToBinary(text, mode){

    if(mode === 'base64'){
        text = Buffer.from(text).toString('base64');
    }

    return [...text].map(c =>
        c.charCodeAt(0).toString(2).padStart(8, '0')
    );
}

function binaryToText(binArray, mode){

    let text = binArray.map(b =>
        String.fromCharCode(parseInt(b, 2))
    ).join('');

    if(mode === 'base64'){
        return Buffer.from(text, 'base64').toString();
    }

    return text;
}


function countBackpack(key, charBinary){
    let sum = 0n;

    for(let i = 0; i < key.length; i++){
        if(charBinary[i] === '1'){
            sum += key[i];
        }
    }

    return sum;
}

function cipher(input, publicKey, mode){

    let binaryInput = textToBinary(input, mode);
    let result = [];

    for(let charBinary of binaryInput){
        result.push(countBackpack(publicKey, charBinary));
    }

    return result;
}

function modInverse(a, n){
    let t = 0n, newT = 1n;
    let r = n, newR = a;

    while(newR !== 0n){
        let q = r / newR;
        [t, newT] = [newT, t - q * newT];
        [r, newR] = [newR, r - q * newR];
    }

    if(t < 0n) t += n;

    return t;
}

function decipher(ciphered, privateKey, a, n, mode){

    let a_inv = modInverse(a, n);
    let result = [];

    for(let c of ciphered){

        let S = (c * a_inv) % n;

        let binary = new Array(privateKey.length).fill('0');

        for(let i = privateKey.length - 1; i >= 0; i--){
            if(privateKey[i] <= S){
                binary[i] = '1';
                S -= privateKey[i];
            }
        }

        result.push(binary.join(''));
    }

    return binaryToText(result, mode);
}


const mode = 'base64'; // 'ascii' или 'base64'
// const mode = 'ascii'; 
const z = mode === 'ascii' ? 8 : 6;


const privateKey = createSuperIncreasingSequence(z);
const {a, n} = generateParams(privateKey);
const publicKey = generatePublicKey(privateKey, a, n);

console.log("Mode:", mode);
console.log("Private key:", privateKey);
console.log("Public key:", publicKey);


const enc = measureTime(() => cipher(input, publicKey, mode));

console.log("\nEncrypted:", enc.result);
console.log("Encryption time:", enc.time, "ms");

const dec = measureTime(() => decipher(enc.result, privateKey, a, n, mode));

console.log("\nDecrypted:", dec.result);
console.log("Decryption time:", dec.time, "ms");