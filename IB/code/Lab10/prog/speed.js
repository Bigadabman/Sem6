const fs = require('fs');


// ---------------- modPow ----------------

function modPow(a, x, n){

    a = BigInt(a);
    x = BigInt(x);
    n = BigInt(n);

    let result = 1n;

    while(x > 0n){

        if(x % 2n === 1n){
            result = (result * a) % n;
        }

        a = (a * a) % n;

        x /= 2n;
    }

    return result;
}


// ---------------- measureTime ----------------

function measureTime(callback){

    const start = performance.now();

    callback();

    const finish = performance.now();

    return finish - start;
}


// ---------------- data ----------------

// разные a
const aValues = [7n, 29n];

// разные x
const xValues = [
    1009n,
    1000003n,
    1000000007n,
    1000000000039n,
    100000000000031n,
    10000000000000061n,
    1000000000000000003n,
    100000000000000000039n,
    1000000000000000000000000000057n,
    100000000000000000000000000000000000000000000000151n

];

// разные n
const nValues = [
    1000000007n,
    1000000000000037n
];


// ---------------- csv ----------------

let csv =
    'a,x,n,time_ms\n';


// ---------------- test ----------------

for(let a of aValues){

    for(let x of xValues){

        for(let n of nValues){

            let time = measureTime(() => {
                
                modPow(a, x, n);

            });

            console.log(
                `a=${a} x=${x} n=${n}`
            );

            console.log(
                `time=${time.toFixed(4)} ms`
            );

            console.log('----------------');

            csv +=
                `${a},${x},${n},${time.toFixed(4)}\n`;
        }
    }
}


// ---------------- save ----------------

fs.writeFileSync(
    'speed_results.csv',
    csv
);

console.log(
    '\nCSV saved: speed_results.csv'
);