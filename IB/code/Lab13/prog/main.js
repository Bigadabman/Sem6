const fs = require('fs');
const crypto = require('crypto');
const { PNG } = require('pngjs');

// ===============================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ===============================

function measureTime(callback) {
    const start = performance.now();
    const result = callback();
    const end = performance.now();

    return {
        result,
        time: (end - start).toFixed(4)
    };
}

function loadPNG(path) {
    return PNG.sync.read(fs.readFileSync(path));
}

function savePNG(png, path) {
    fs.writeFileSync(path, PNG.sync.write(png));
}

function textToPayloadBits(text) {
    const message = Buffer.from(text, 'utf8');

    // Первые 4 байта — длина сообщения
    const lengthBuffer = Buffer.alloc(4);
    lengthBuffer.writeUInt32BE(message.length);

    const payload = Buffer.concat([lengthBuffer, message]);

    const bits = [];

    for (let byte of payload) {
        for (let i = 7; i >= 0; i--) {
            bits.push((byte >> i) & 1);
        }
    }

    return bits;
}

function bitsToText(bits) {
    const bytes = [];

    for (let i = 0; i < bits.length; i += 8) {
        let byte = 0;

        for (let j = 0; j < 8; j++) {
            byte = (byte << 1) | bits[i + j];
        }

        bytes.push(byte);
    }

    const buffer = Buffer.from(bytes);

    const messageLength = buffer.readUInt32BE(0);
    const messageBuffer = buffer.slice(4, 4 + messageLength);

    return messageBuffer.toString('utf8');
}

// Индексы только RGB-каналов, alpha не трогаем
function getRGBIndexes(png) {
    const indexes = [];

    for (let i = 0; i < png.data.length; i += 4) {
        indexes.push(i);     // R
        indexes.push(i + 1); // G
        indexes.push(i + 2); // B
    }

    return indexes;
}

function createSeed(password) {
    const hash = crypto.createHash('sha256').update(password).digest();

    let seed = 0;

    for (let i = 0; i < 4; i++) {
        seed = (seed << 8) | hash[i];
    }

    return seed >>> 0;
}

// Простой генератор псевдослучайных чисел
function random(seed) {
    let x = seed;

    return function () {
        x = (1664525 * x + 1013904223) >>> 0;
        return x / 0xffffffff;
    };
}

// Если пароль задан — перемешиваем позиции
function getPositions(png, password = '') {
    const indexes = getRGBIndexes(png);

    if (!password) {
        return indexes;
    }

    const rand = random(createSeed(password));

    for (let i = indexes.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
    }

    return indexes;
}

// ===============================
// ОСНОВНЫЕ ФУНКЦИИ LSB
// ===============================

function embedMessage(inputImage, outputImage, message, password = '') {
    const png = loadPNG(inputImage);
    const bits = textToPayloadBits(message);
    const positions = getPositions(png, password);

    if (bits.length > positions.length) {
        throw new Error(
            `Сообщение слишком большое. Нужно ${bits.length} бит, доступно ${positions.length} бит.`
        );
    }

    let changedBytes = 0;

    for (let i = 0; i < bits.length; i++) {
        const index = positions[i];

        const oldValue = png.data[index];

        // очищаем последний бит и записываем бит сообщения
        png.data[index] = (png.data[index] & 0b11111110) | bits[i];

        if (png.data[index] !== oldValue) {
            changedBytes++;
        }
    }

    savePNG(png, outputImage);

    return {
        width: png.width,
        height: png.height,
        capacityBits: positions.length,
        messageBits: bits.length,
        changedBytes
    };
}

function extractMessage(imagePath, password = '') {
    const png = loadPNG(imagePath);
    const positions = getPositions(png, password);

    // Сначала читаем 32 бита длины
    const lengthBits = [];

    for (let i = 0; i < 32; i++) {
        lengthBits.push(png.data[positions[i]] & 1);
    }

    let messageLength = 0;

    for (let bit of lengthBits) {
        messageLength = (messageLength << 1) | bit;
    }

    const totalBits = 32 + messageLength * 8;

    if (totalBits > positions.length) {
        throw new Error('Ошибка извлечения: длина сообщения больше вместимости контейнера.');
    }

    const bits = [];

    for (let i = 0; i < totalBits; i++) {
        bits.push(png.data[positions[i]] & 1);
    }

    return bitsToText(bits);
}

function analyzeContainer(imagePath) {
    const png = loadPNG(imagePath);
    const capacityBits = png.width * png.height * 3;
    const capacityBytes = Math.floor(capacityBits / 8);

    return {
        width: png.width,
        height: png.height,
        capacityBits,
        capacityBytes
    };
}

function compareImages(originalPath, stegoPath) {
    const original = loadPNG(originalPath);
    const stego = loadPNG(stegoPath);

    if (
        original.width !== stego.width ||
        original.height !== stego.height
    ) {
        throw new Error('Изображения имеют разные размеры.');
    }

    let changedChannels = 0;
    let sumSquaredError = 0;
    let totalChannels = 0;

    for (let i = 0; i < original.data.length; i += 4) {
        for (let c = 0; c < 3; c++) {
            const a = original.data[i + c];
            const b = stego.data[i + c];

            if (a !== b) {
                changedChannels++;
            }

            const diff = a - b;
            sumSquaredError += diff * diff;
            totalChannels++;
        }
    }

    const mse = sumSquaredError / totalChannels;
    const psnr = mse === 0
        ? Infinity
        : 10 * Math.log10((255 * 255) / mse);

    return {
        changedChannels,
        totalChannels,
        mse,
        psnr
    };
}

function saveLsbMatrix(imagePath, outputPath) {
    const png = loadPNG(imagePath);
    const matrix = new PNG({ width: png.width, height: png.height });

    for (let i = 0; i < png.data.length; i += 4) {
        matrix.data[i] = (png.data[i] & 1) ? 255 : 0;
        matrix.data[i + 1] = (png.data[i + 1] & 1) ? 255 : 0;
        matrix.data[i + 2] = (png.data[i + 2] & 1) ? 255 : 0;
        matrix.data[i + 3] = 255;
    }

    savePNG(matrix, outputPath);

    return {
        width: png.width,
        height: png.height
    };
}

function createTestContainer(path, width, height) {
    const png = new PNG({ width, height });

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;

            png.data[index] = (x + y) % 256;       // R
            png.data[index + 1] = (x * 2) % 256;   // G
            png.data[index + 2] = (y * 2) % 256;   // B
            png.data[index + 3] = 255;             // Alpha
        }
    }

    savePNG(png, path);

    return {
        width,
        height,
        capacityBits: width * height * 3,
        capacityBytes: Math.floor((width * height * 3) / 8)
    };
}

// ===============================
// MAIN
// ===============================

const args = process.argv.slice(2);
const command = args[0];

try {
    switch (command) {
        case 'create': {
            const output = args[1] || 'container.png';
            const width = Number(args[2] || 800);
            const height = Number(args[3] || 600);

            const res = createTestContainer(output, width, height);

            console.log('Test container created:', output);
            console.log('Width:', res.width);
            console.log('Height:', res.height);
            console.log('Capacity:', res.capacityBits, 'bits');
            console.log('Capacity:', res.capacityBytes, 'bytes');

            break;
        }

        case 'analyze': {
            const image = args[1];

            if (!image) {
                throw new Error('Укажи путь к изображению.');
            }

            const res = analyzeContainer(image);

            console.log('Image:', image);
            console.log('Width:', res.width);
            console.log('Height:', res.height);
            console.log('Capacity:', res.capacityBits, 'bits');
            console.log('Capacity:', res.capacityBytes, 'bytes');

            break;
        }

        case 'embed': {
            const inputImage = args[1];
            const outputImage = args[2];
            const message = args[3];
            const password = args[4] || '';

            if (!inputImage || !outputImage || !message) {
                throw new Error('Формат: node main.js embed container.png stego.png "secret text" [password]');
            }

            const res = measureTime(() =>
                embedMessage(inputImage, outputImage, message, password)
            );

            console.log('Message embedded successfully.');
            console.log('Input image:', inputImage);
            console.log('Output image:', outputImage);
            console.log('Message:', message);
            console.log('Password mode:', password ? 'random LSB' : 'sequential LSB');
            console.log('Image size:', res.result.width + 'x' + res.result.height);
            console.log('Capacity:', res.result.capacityBits, 'bits');
            console.log('Message size:', res.result.messageBits, 'bits');
            console.log('Changed RGB channels:', res.result.changedBytes);
            console.log('Embedding time:', res.time, 'ms');

            break;
        }

        case 'extract': {
            const image = args[1];
            const password = args[2] || '';

            if (!image) {
                throw new Error('Формат: node main.js extract stego.png [password]');
            }

            const res = measureTime(() =>
                extractMessage(image, password)
            );

            console.log('Extracted message:');
            console.log(res.result);
            console.log('Extraction time:', res.time, 'ms');

            break;
        }

        case 'compare': {
            const original = args[1];
            const stego = args[2];

            if (!original || !stego) {
                throw new Error('Формат: node main.js compare container.png stego.png');
            }

            const res = compareImages(original, stego);

            console.log('Original:', original);
            console.log('Stego:', stego);
            console.log('Changed RGB channels:', res.changedChannels);
            console.log('Total RGB channels:', res.totalChannels);
            console.log('MSE:', res.mse.toFixed(8));
            console.log('PSNR:', res.psnr === Infinity ? 'Infinity' : res.psnr.toFixed(4) + ' dB');

            break;
        }

        case 'matrix': {
            const input = args[1];
            const output = args[2];

            if (!input || !output) {
                throw new Error('Формат: node main.js matrix image.png lsb_matrix.png');
            }

            const res = saveLsbMatrix(input, output);

            console.log('LSB matrix saved:', output);
            console.log('Source image:', input);
            console.log('Image size:', res.width + 'x' + res.height);

            break;
        }

        default:
            console.log('Commands:');
            console.log('node main.js create [output.png] [width] [height]');
            console.log('node main.js analyze image.png');
            console.log('node main.js embed container.png stego.png "secret text" [password]');
            console.log('node main.js extract stego.png [password]');
            console.log('node main.js compare container.png stego.png');
            console.log('node main.js matrix image.png lsb_matrix.png');
            console.log();
            console.log('Examples:');
            console.log('node main.js create container.png 800 600');
            console.log('node main.js analyze container.png');
            console.log('node main.js embed container.png stego.png "Korobov Egor Olegovich"');
            console.log('node main.js extract stego.png');
            console.log('node main.js compare container.png stego.png');
            console.log();
            console.log('With password:');
            console.log('node main.js embed container.png stego.png "Korobov Egor Olegovich" mykey');
            console.log('node main.js extract stego.png mykey');
    }
} catch (err) {
    console.error('Error:', err.message);
}
