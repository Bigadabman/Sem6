const utils = {

    cleanText(text) {
        return text
            //.replace(/[^a-zа-яё]/gi, ''); 
    },

    getFrequencies(text) {
        const freq = {};

        for (let char of text) {
            freq[char] = (freq[char] || 0) + 1;
        }

        return freq;
    },

    getProbabilities(freq) {
        const total = Object.values(freq).reduce((a, b) => a + b, 0);

        const probs = {};
        for (let char in freq) {
            probs[char] = freq[char] / total;
        }

        return probs;
    },

    getBinaryFrequencies(buffer) {
        let zeros = 0;
        let ones = 0;

        for (let byte of buffer) {
            for (let i = 0; i < 8; i++) {
                const bit = (byte >> i) & 1;

                if (bit === 0) zeros++;
                else ones++;
            }
        }

        return { zeros, ones };
    },

    binaryEntropyFromCounts(zeros, ones) {
        const total = zeros + ones;

        const p0 = zeros / total;
        const p1 = ones / total;

        let H = 0;

        if (p0 > 0) H -= p0 * Math.log2(p0);
        if (p1 > 0) H -= p1 * Math.log2(p1);

        return { H, p0, p1 };
    },

    entropy(probs) {
        let H = 0;

        for (let p of Object.values(probs)) {
            if (p > 0) {
                H -= p * Math.log2(p);
            }
        }

        return H;
    },

    binaryEntropy(p) {
        const q = 1 - p;

        if (p === 0 || p === 1) return 0;

        return -p * Math.log2(p) - q * Math.log2(q);
    },

    information(H, length) {
        return H * length;
    },

    effectiveEntropy(p) {
        return 1 - this.binaryEntropy(p);
    }


    

};

module.exports = utils;

