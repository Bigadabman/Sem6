import { createClient } from "redis";
import fs from 'fs';

const password = fs.readFileSync('password.txt', 'utf-8').trim();


const client = createClient({
    url: `redis://default:${password}@redis-11551.c283.us-east-1-4.ec2.cloud.redislabs.com:11551`
});

await client.connect();

client.subscribe('channel-01', (message, channel) => { console.log(`${channel}: ${message}`) });
setTimeout(() => { client.quit() }, 30000);