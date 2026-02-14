import { createClient } from "redis";
import fs from 'fs';

const password = fs.readFileSync('password.txt', 'utf-8').trim();


const client = createClient({
    url: `redis://default:${password}@redis-11551.c283.us-east-1-4.ec2.cloud.redislabs.com:11551`
});

client.on('ready', () =>{ console.log('Client is ready') });
client.on('connect', () => { console.log('Connected'); });
client.on('error', (error) => { console.log('Error: ', error) });
client.on('end', () => { console.log('Disconnected') })


await client.connect();



let setPipeLine = client.multi();


let time = performance.now();

for(let i = 0; i < 10000; i++){
   setPipeLine.set(`${i}`, `set${i}`);
}
await setPipeLine.exec();

time = performance.now() - time;
console.log(`10000 set finished in ${~~time}ms`);


let getPipeLine = client.multi();

time = performance.now();

for(let i = 0; i < 10000; i++){
   getPipeLine.get(`${i}`);
}

await getPipeLine.exec();

time = performance.now() - time;
console.log(`10000 get finished in ${~~time}ms`);


let delPipeLine = client.multi();

time = performance.now();

for(let i = 0; i < 10000; i++){
   delPipeLine.del(`${i}`);
}

await delPipeLine.exec();

time = performance.now() - time;
console.log(`10000 del finished in ${~~time}ms`);

await client.quit();
