import { Client } from 'kbyte';
import config from '@/helpers/config';

const address = `wss://${config.node}`;
let client;

function connect() {
  client = new Client(address);

  client.requestAsync = (command, params) =>
    new Promise((resolve, reject) => {
      client.request(command, params, (e, result) => {
        if (e) return reject(e);
        resolve(result);
      });
    });

  setInterval(() => client.request('heartbeat', null), 10 * 1000);

  client.ws.addEventListener('close', e => {
    if (e.code !== 1000) connect();
  });

  client.ws.addEventListener('error', e => {
    if (e.code === 'ECONNREFUSED') connect();
  });
}

connect();

export default client;
