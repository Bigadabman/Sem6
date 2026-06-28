const fs = require('fs');
const path = require('path');
const util = require('./utils');


function analyzeText(fileName) {
    const filePath = path.join(__dirname, fileName);
    let text = fs.readFileSync(filePath, 'utf-8');

    text = util.cleanText(text);

    const freq = util.getFrequencies(text);
    const probs = util.getProbabilities(freq);
    const H = util.entropy(probs);

    console.log("Длина текста:", text.length);

    console.log("\nСимвол | Частота | Вероятность");
    for (let char in freq) {
        console.log(`   ${char}   |    ${freq[char]}    | ${probs[char].toFixed(4)}`);
    }

    console.log("\nЭнтропия:", H.toFixed(4));

    return H;
}

const H_lat = analyzeText('input_lat.txt');

console.log('------------------------------');

const H_cyr = analyzeText('input_cyr.txt');


console.log("\n===== БИНАРНЫЙ АЛФАВИТ =====");

const binPath = path.join(__dirname, 'bin.bin');
const buffer = fs.readFileSync(binPath);


const { zeros, ones } = util.getBinaryFrequencies(buffer);


const { H: H_bin, p0, p1 } = util.binaryEntropyFromCounts(zeros, ones);

console.log("Количество бит:");
console.log("0:", zeros);
console.log("1:", ones);

console.log("\nВероятности:");
console.log("p(0):", p0.toFixed(6));
console.log("p(1):", p1.toFixed(6));

console.log("\nЭнтропия бинарного алфавита:", H_bin.toFixed(6));

console.log("\nФИО");

const fio = "Коробов Егор Олегович";
const length = fio.replace(/ /g, '').length;

console.log("Длина ФИО:", length);

console.log("I (латиница):", util.information(H_lat, length).toFixed(4));
console.log("I (кириллица):", util.information(H_cyr, length).toFixed(4));
console.log("I (бинарный код):", util.information(H_bin, length*16).toFixed(4));

console.log("\КАНАЛ С ОШИБКАМИ");

[0.1, 0.5, 1.0].forEach(p => {
    const He = util.effectiveEntropy(p);
    console.log(`p = ${p} Hэ = ${He.toFixed(4)}`);
    console.log(`   I = ${fio.length * 16 * He}`);
});