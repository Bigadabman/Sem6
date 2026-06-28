const fs = require('fs');

function writeCSV(filename, freq) {
    let content = "Symbol,Count\n";

    for (let key in freq) {
        content += `${key},${freq[key]}\n`;
    }

    fs.writeFileSync(filename, content, 'utf8');
}


const ALPHABET = `АБВГДЕЁЖЗІЙКЛМНОПРСТУЎФХЦЧШЫЬЭЮЯабвгдеёжзійклмнопрстуўфхцчшыьэюя .,-`;

const KEY = "Ягор";
const TRISEMUS_ALPHABET = buildAlphabet(KEY, ALPHABET);

const MOVEMENT = 21;

let input = fs.readFileSync('./input.txt', 'utf8');
writeCSV('./input_freq.csv', countFrequencies(input));

const REQUIRED_LENGTH = 5000;
if(input.length < REQUIRED_LENGTH ){
    throw new Error('Input text is too short');
}


let start = performance.now();
let sifrContent = encrypt(input);
let end = performance.now();
fs.writeFileSync('./sifr.txt', sifrContent);
console.log(`Encryption time: ${end - start} ms`);
writeCSV('./sifr_freq.csv', countFrequencies(sifrContent));

let desifrStart = performance.now();
let desifrContent = decrypt(sifrContent);
let desifrEnd = performance.now();
fs.writeFileSync('./desifr.txt', desifrContent);
console.log(`Decryption time: ${desifrEnd - desifrStart} ms`);


start = performance.now();
let trisemusSifr = encryptTrisemus(input);
end = performance.now();
fs.writeFileSync('./trisemus_sifr.txt', trisemusSifr);
console.log(`Trisemus Encryption time: ${end - start} ms`);
writeCSV('./trisemus_sifr_freq.csv', countFrequencies(trisemusSifr));

desifrStart = performance.now();
let trisemusDesifr = decryptTrisemus(trisemusSifr);
desifrEnd = performance.now();
fs.writeFileSync('./trisemus_desifr.txt', trisemusDesifr);
console.log(`Trisemus Decryption time: ${desifrEnd - desifrStart} ms`);



function encrypt(input) {
    let result = '';

    for(let i = 0; i < input.length; i++){

        let char = input[i];

        if(ALPHABET.includes(char)){
            let index = (ALPHABET.indexOf(char) + MOVEMENT % ALPHABET.length) % ALPHABET.length;
            char = ALPHABET[index];
        }
        result += char;

    }

    return result;
}   

function decrypt(input) {
    let result = '';

    for(let i = 0; i < input.length; i++){
        let char = input[i];

        if(ALPHABET.includes(char)){
            let index = (ALPHABET.indexOf(char) - MOVEMENT % ALPHABET.length + ALPHABET.length) % ALPHABET.length;
            char = ALPHABET[index];
        }
        result += char;
    }
    return result;

}

function countFrequencies(text) {
    const freq = {};
    let alphabetset = 'АБВГДЕЁЖЗІЙКЛМНОПРСТУЎФХЦЧШЫЬЭЮЯ';

    text = text.toUpperCase();

    for (let char of text) {
        if (!alphabetset.includes(char)) {
            continue;
        }

        if (!freq[char]) {
            freq[char] = 0;
        }
        freq[char]++;
    }

    return freq;
}



function encryptTrisemus(input) {
    let result = '';
    const n = TRISEMUS_ALPHABET.length;

    for (let i = 0; i < input.length; i++) {
        let char = input[i];
        let index = TRISEMUS_ALPHABET.indexOf(char);

        if (index === -1) {
            throw new Error(`Unknown char: ${char}`);
        }

        let newIndex = (index + i) % n;
        result += TRISEMUS_ALPHABET[newIndex];
    }

    return result;
}

function decryptTrisemus(input) {
    let result = '';
    const n = TRISEMUS_ALPHABET.length;

    for (let i = 0; i < input.length; i++) {
        let char = input[i];
        let index = TRISEMUS_ALPHABET.indexOf(char);

        if (index === -1) {
            throw new Error(`Unknown char: ${char}`);
        }

        let newIndex = (index - i % n + n) % n;
        result += TRISEMUS_ALPHABET[newIndex];
    }

    return result;
}



function buildAlphabet(key, base) {
    let result = '';


    for (let ch of key) {
        if (!result.includes(ch)) {
            result += ch;
        }
    }

    for (let ch of base) {
        if (!result.includes(ch)) {
            result += ch;
        }
    }

    return result;
}

