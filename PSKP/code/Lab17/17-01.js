import { createClient } from 'redis';
import fs from 'fs';

const password = fs.readFileSync('password.txt','utf-8').trim();

const client = createClient({
    url: `redis://default:${password}@redis-11551.c283.us-east-1-4.ec2.cloud.redislabs.com:11551`
});


client.on('ready', () =>{ console.log('Client is ready') });
client.on('connect', () => { console.log('Connected'); });
client.on('error', (error) => { console.log('Error: ', error) });
client.on('end', () => { console.log('Disconnected') })



await client.connect();
await client.quit();


