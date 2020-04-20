import { Client } from 'kbyte';

const address = 'wss://obyte.org/bb-test';
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
