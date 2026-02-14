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

await client.set('incr', 0);

let hsetPipeLine = client.multi();


let time = performance.now();

for(let i = 0; i < 10000; i++){
   hsetPipeLine.hSet(`${i}`, {id: i, val: `val-${i}`});
}
await hsetPipeLine.exec();

time = performance.now() - time;
console.log(`10000 hSet finished in ${~~time}ms`);



let hgetPipeLine = client.multi();


time = performance.now();

for(let i = 0; i < 10000; i++){
   hgetPipeLine.hGet(`${i}`, 'val');
}
await hgetPipeLine.exec();

time = performance.now() - time;
console.log(`10000 hGet finished in ${~~time}ms`);

await client.flushDb();


await client.quit();
