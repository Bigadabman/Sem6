const fs = require("fs");
const path = require("path");

const fileName = process.argv[2] || path.join(__dirname, "input.txt");
const message = fs.readFileSync(fileName);

function rotl(x, s) {
  return ((x << s) | (x >>> (32 - s))) >>> 0;
}

function add(...values) {
  let result = 0;
  for (const value of values) {
    result = (result + value) >>> 0;
  }
  return result;
}

function padding(buffer) {
  const bitLength = BigInt(buffer.length) * 8n;
  const zerosCount = (56 - ((buffer.length + 1) % 64) + 64) % 64;
  const result = Buffer.alloc(buffer.length + 1 + zerosCount + 8);

  buffer.copy(result);
  result[buffer.length] = 0x80;

  result.writeUInt32LE(Number(bitLength & 0xffffffffn), result.length - 8);
  result.writeUInt32LE(Number(bitLength >> 32n), result.length - 4);

  return result;
}

function md4(buffer) {
  const data = padding(buffer);

  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  const f = (x, y, z) => (x & y) | (~x & z);
  const g = (x, y, z) => (x & y) | (x & z) | (y & z);
  const h = (x, y, z) => x ^ y ^ z;

  const round1 = (aa, bb, cc, dd, x, s) => rotl(add(aa, f(bb, cc, dd), x), s);
  const round2 = (aa, bb, cc, dd, x, s) => rotl(add(aa, g(bb, cc, dd), x, 0x5a827999), s);
  const round3 = (aa, bb, cc, dd, x, s) => rotl(add(aa, h(bb, cc, dd), x, 0x6ed9eba1), s);

  for (let block = 0; block < data.length; block += 64) {
    const x = [];
    for (let i = 0; i < 16; i++) {
      x[i] = data.readUInt32LE(block + i * 4);
    }

    const oldA = a;
    const oldB = b;
    const oldC = c;
    const oldD = d;

    const r1 = [3, 7, 11, 19];
    for (let i = 0; i < 16; i += 4) {
      a = round1(a, b, c, d, x[i], r1[0]);
      d = round1(d, a, b, c, x[i + 1], r1[1]);
      c = round1(c, d, a, b, x[i + 2], r1[2]);
      b = round1(b, c, d, a, x[i + 3], r1[3]);
    }

    const r2 = [3, 5, 9, 13];
    const order2 = [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15];
    for (let i = 0; i < 16; i += 4) {
      a = round2(a, b, c, d, x[order2[i]], r2[0]);
      d = round2(d, a, b, c, x[order2[i + 1]], r2[1]);
      c = round2(c, d, a, b, x[order2[i + 2]], r2[2]);
      b = round2(b, c, d, a, x[order2[i + 3]], r2[3]);
    }

    const r3 = [3, 9, 11, 15];
    const order3 = [0, 8, 4, 12, 2, 10, 6, 14, 1, 9, 5, 13, 3, 11, 7, 15];
    for (let i = 0; i < 16; i += 4) {
      a = round3(a, b, c, d, x[order3[i]], r3[0]);
      d = round3(d, a, b, c, x[order3[i + 1]], r3[1]);
      c = round3(c, d, a, b, x[order3[i + 2]], r3[2]);
      b = round3(b, c, d, a, x[order3[i + 3]], r3[3]);
    }

    a = add(a, oldA);
    b = add(b, oldB);
    c = add(c, oldC);
    d = add(d, oldD);
  }

  const hash = Buffer.alloc(16);
  hash.writeUInt32LE(a, 0);
  hash.writeUInt32LE(b, 4);
  hash.writeUInt32LE(c, 8);
  hash.writeUInt32LE(d, 12);
  return hash.toString("hex");
}

function check() {
  const tests = [
    ["", "31d6cfe0d16ae931b73c59d7e0c089c0"],
    ["abc", "a448017aaf21d8525fc10ae87aa6729d"],
  ];

  for (const [text, expected] of tests) {
    const actual = md4(Buffer.from(text, "ascii"));
    if (actual !== expected) {
      throw new Error(`MD4 self-test failed for "${text}": ${actual}`);
    }
  }
}

function benchmark(buffer, repeats) {
  const start = process.hrtime.bigint();
  let hash = "";

  for (let i = 0; i < repeats; i++) {
    hash = md4(buffer);
  }

  const ms = Number(process.hrtime.bigint() - start) / 1_000_000;
  const mb = (buffer.length * repeats) / 1024 / 1024;

  return {
    hash,
    ms,
    speed: mb / (ms / 1000),
  };
}

check();

const repeats = 1000;
const result = benchmark(message, repeats);

console.log(`File: ${fileName}`);
console.log(`Size: ${message.length} bytes`);
console.log(`Algorithm: MD4`);о
console.log(`Hash: ${result.hash}`);
console.log(`Repeats: ${repeats}`);
console.log(`Time: ${result.ms.toFixed(3)} ms`);
console.log(`Speed: ${result.speed.toFixed(2)} MB/s`);
