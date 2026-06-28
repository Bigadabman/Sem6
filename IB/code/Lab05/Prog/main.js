const fs = require('fs');

function writeCSV(filename, freq) {
    let content = "Symbol,Count\n";

    for (let key in freq) {
        content += `${key},${freq[key]}\n`;
    }

    fs.writeFileSync(filename, content, 'utf8');
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

const COLS = 10;


let input = fs.readFileSync('./input.txt', 'utf8');

const REQUIRED_LENGTH = 500;
if(input.length < REQUIRED_LENGTH ){
    throw new Error('Input text is too short');
}

writeCSV('./input_freq.csv', countFrequencies(input));


let start = performance.now();
let encrypted = encryptRoute(input, COLS);
let end = performance.now();
fs.writeFileSync('./encrypted.txt', encrypted, 'utf8');

console.log(`Encryption took ${(end - start).toFixed(2)} ms`);

writeCSV('./encrypted_freq.csv', countFrequencies(encrypted));

start = performance.now();
let decrypted = decryptRoute(encrypted, COLS);
end = performance.now();
fs.writeFileSync('./decrypted.txt', decrypted, 'utf8');
console.log(`Decryption took ${(end - start).toFixed(2)} ms`);

start = performance.now();
let doubleEncrypted = encryptDoublePermutation(input);
end = performance.now();
fs.writeFileSync('./double_encrypted.txt', doubleEncrypted, 'utf8');
console.log(`Double permutation encryption took ${(end - start).toFixed(2)} ms`);

writeCSV('./double_encrypted_freq.csv', countFrequencies(doubleEncrypted));

start = performance.now();
let doubleDecrypted = decryptDoublePermutation(doubleEncrypted);
end = performance.now();
fs.writeFileSync('./double_decrypted.txt', doubleDecrypted, 'utf8');
console.log(`Double permutation decryption took ${(end - start).toFixed(2)} ms`);

// console.log('ecnrypted character counts:', countCharacters(encrypted));
// console.log('Double ecnrypted character counts:', countCharacters(doubleEncrypted));


function countCharacters(text) {
    const counts = {};
    for (let char of text) {
        counts[char] = (counts[char] || 0) + 1;
    }
    return counts;
}



function encryptRoute(text, cols) {
    const rows = Math.ceil(text.length / cols);
    const total = rows * cols;

    const padded = text.padEnd(total, ' ');

    let result = '';

    for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
            const index = row * cols + col;
            result += padded[index];
        }
    }

    return result;
}



function decryptRoute(text, cols) {
    const rows = Math.ceil(text.length / cols);
    const total = rows * cols;

    let result = new Array(total);
    let k = 0;

    // заполняем по столбцам (как читали при шифровании)
    for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
            const index = row * cols + col;
            result[index] = text[k++];
        }
    }

    return result.join('').trimEnd(); // убираем padding
}


function getOrder(key) {
    return key
        .split('')
        .map((ch, i) => ({ ch, i }))
        .sort((a, b) => {
            if (a.ch < b.ch) return -1;
            if (a.ch > b.ch) return 1;
            return a.i - b.i; // стабильность
        })
        .map(obj => obj.i);
}


function encryptDoublePermutation(text) {
    const colKey = "Коробов";
    const rowKey = "Егор";

    const cols = colKey.length;
    const rows = Math.ceil(text.length / cols);
    const total = rows * cols;

    const padded = text.padEnd(total, ' ');

    const colOrder = getOrder(colKey);
    const rowOrder = getOrder(rowKey);


    let afterCols = new Array(total);

    for (let r = 0; r < rows; r++) {
        for (let newC = 0; newC < cols; newC++) {
            let oldC = colOrder[newC];
            let from = r * cols + oldC;
            let to = r * cols + newC;
            afterCols[to] = padded[from];
        }
    }


    let result = new Array(total);

    for (let newR = 0; newR < rows; newR++) {
        let oldR = rowOrder[newR % rowKey.length];

        oldR += Math.floor(newR / rowKey.length) * rowKey.length;

        if (oldR >= rows) continue;

        for (let c = 0; c < cols; c++) {
            let from = oldR * cols + c;
            let to = newR * cols + c;
            result[to] = afterCols[from];
        }
    }

    return result.join('');
}


function decryptDoublePermutation(text) {
    const colKey = "Коробов";
    const rowKey = "Егор";

    const cols = colKey.length;
    const rows = Math.ceil(text.length / cols);
    const total = rows * cols;

    const colOrder = getOrder(colKey);
    const rowOrder = getOrder(rowKey);

    let afterRows = new Array(total);

    for (let newR = 0; newR < rows; newR++) {
        let oldR = rowOrder[newR % rowKey.length];
        oldR += Math.floor(newR / rowKey.length) * rowKey.length;

        if (oldR >= rows) continue;

        for (let c = 0; c < cols; c++) {
            let from = newR * cols + c;
            let to = oldR * cols + c;
            afterRows[to] = text[from];
        }
    }

    let result = new Array(total);

    for (let r = 0; r < rows; r++) {
        for (let newC = 0; newC < cols; newC++) {
            let oldC = colOrder[newC];
            let from = r * cols + newC;
            let to = r * cols + oldC;
            result[to] = afterRows[from];
        }
    }

    return result.join('').trimEnd();
}
