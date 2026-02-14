import { createClient } from "redis";
import fs from 'fs';

const password = fs.readFileSync('password.txt', 'utf-8').trim();


const client = createClient({
    url: `redis://default:${password}@redis-11551.c283.us-east-1-4.ec2.cloud.redislabs.com:11551`
});

await client.connect();


client.publish('channel-01', 'from publisher message 1');
client.publish('channel-01', 'from publisher message 2');

setTimeout( () => { client.publish('channel-01', 'from publisher message 3'); console.log('published')}, 5000 );
setTimeout( () => { client.publish('channel-01', 'from publisher message 4'); console.log('published')}, 10000 );
setTimeout( () => { client.publish('channel-01', 'from publisher message 5'); console.log('published')}, 15000 );
setTimeout( () => { client.publish('channel-01', 'from publisher message 6'); console.log('published')}, 20000 );


setTimeout(() => { client.quit() }, 30000);
