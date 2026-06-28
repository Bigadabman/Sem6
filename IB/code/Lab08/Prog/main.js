const A = 430, C = 2531, N = 11979;

const KEY = [1, 11, 21, 31, 41, 51];
const N2 = 6;

function CreateArraytoN(n) {
    let arr = [];
    for (let i = 0; i < n; i++) {
        arr.push(i);
    }
    return arr;
}

function PSP(seed, count) {
    let result = [];
    let x = seed;

    for (let i = 0; i < count; i++) {
        x = (A * x + C) % N;
        result.push(x);
    }

    return result;
}

function RC4(data) {

    let S = CreateArraytoN(256);

    let j = 0;
    for (let i = 0; i < 256; i++) {
        j = (j + S[i] + KEY[i % N2]) % 256;
        [S[i], S[j]] = [S[j], S[i]];
    }

    let prgaStart = performance.now();

    let i = 0;
    j = 0;

    let result = [];

    for (let idx = 0; idx < data.length; idx++) {

        i = (i + 1) % 256;
        j = (j + S[i]) % 256;

        [S[i], S[j]] = [S[j], S[i]];

        let k = S[(S[i] + S[j]) % 256];

        result.push(String.fromCharCode(data.charCodeAt(idx) ^ k));
    }

    let prgaEnd = performance.now();

    return {
        result: result.join(''),
        prgaTime: (prgaEnd - prgaStart).toFixed(2)
    };
}

function measureTime(callback) {
    let start = performance.now();
    callback();
    let finish = performance.now();
    return finish - start;
}

//-------------- main -----------------

const args = process.argv.slice(2);
const command = args[0];

switch (command) {

    case 'psp':
        let seed = parseInt(args[1]);
        let count = parseInt(args[2]);

        console.log(
            "Time for PSP(seed = " + seed + ", count = " + count + "): ",
            measureTime(() => res = PSP(seed, count)).toFixed(2)
        );

        console.log("Result: ", res);
        break;

    case 'rc4':
        let data = args[1];
        let res = RC4(data);

        console.log("Time for PRGA RC4: ", res.prgaTime, " ms");
        console.log("Result: ", res.result);
        console.log("Decrypted: ", RC4(res.result).result);
        break;

    default:
        console.log("Команды:");
        console.log("psp [seed] [count] — генерация псевдослучайных чисел");
        console.log("rc4 [data] — шифрование/дешифрование данных");
}