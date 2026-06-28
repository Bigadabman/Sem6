const fs = require('fs');

function writeCSV(filename, freq) {
    let content = "Symbol,Count\n";

    for (let key in freq) {
        content += `${key},${freq[key]}\n`;
    }

    fs.writeFileSync(filename, content, 'utf8');
}




const ROTORS = {
    II:  "AJDKSIRUXBLHWTMCQGZNPYFVOE",
    IV:  "ESOVPZJAYQUIRHXLNFTGKDCMWB",
    Gamma: "FSOKANUERHMBTIYCWLQPZXVGJD"
};

const REFLECTOR = {
    C: {
        A:'F', B:'V', C:'P', D:'J', E:'I', F:'A',
        G:'O', H:'Y', I:'E', J:'D', K:'R', L:'Z',
        M:'X', N:'W', O:'G', P:'C', Q:'T', R:'K',
        S:'U', T:'Q', U:'S', V:'B', W:'N', X:'M',
        Y:'H', Z:'L'
    }
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";


function forward(char, rotor, shift) {
    let index = (ALPHABET.indexOf(char) + shift) % 26;

    // console.log(`index = ${index}, char = ${char}, rotor[index] = ${rotor[index]}`);
    return rotor[index];
}

function backward(char, rotor, shift) {
    let index = rotor.indexOf(char);
    //  console.log(`index = ${index}, char = ${char}, rotor[index] = ${ALPHABET[index]}`);
    return ALPHABET[(index - shift + 26) % 26];
}

function letterToShift(letter) {
    return ALPHABET.indexOf(letter);
}

function encrypt(message, initialPositions) {
    let result = "";

    let LShift = letterToShift(initialPositions[0]);
    let MShift = letterToShift(initialPositions[1]);
    let RShift = letterToShift(initialPositions[2]);

    for (let char of message.toUpperCase()) {

        if (!ALPHABET.includes(char)) {
            result += char;
            continue;
        }


        let c = forward(char, ROTORS.IV, RShift);
        c = forward(c, ROTORS.Gamma, MShift);
        c = forward(c, ROTORS.II, LShift);


        c = REFLECTOR.C[c];


        c = backward(c, ROTORS.II, LShift);
        c = backward(c, ROTORS.Gamma, MShift);
        c = backward(c, ROTORS.IV, RShift);


        // LShift = (LShift + 1) % 26;
        // MShift = (MShift + 1) % 26;
        // RShift = (RShift + 1) % 26;


        result += c;
    }

    return result;
}


function countFrequencies(text) {
    const freq = {};
    
    for (let char of text) {
        if (!freq[char]) {
            freq[char] = 0;
        }
        freq[char]++;
    }

    return freq;
}

const args = process.argv.slice(2);

const message = args[0] || "AA";
const startPos = args[1] || "AAA";


if (startPos.length !== 3) {
    console.error("Start position must be 3 letters (e.g. ABC)");
    process.exit(1);
}

const encrypted = encrypt(message, startPos);

console.log("Message:", message);
console.log("Start position:", startPos);
console.log("Encrypted:", encrypted);

const encryptedFreq = countFrequencies(encrypted);
writeCSV("encrypted_frequency.csv", encryptedFreq);