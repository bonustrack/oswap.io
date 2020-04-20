import { Client } from '@/helpers/_texto/main';
import { toWif } from '@/helpers/_texto/utils';
import { randomBytes } from 'crypto';
import client from '@/helpers/client';
import { LOCALSTORAGE_KEY } from '@/helpers/utils';

let config;
const testnet = true;
const lSConfig = localStorage.getItem(`${LOCALSTORAGE_KEY}.texto`);

if (lSConfig) {
  config = JSON.parse(lSConfig);
} else {
  config = {
    testnet,
    wif: toWif(randomBytes(32), testnet),
    tempPrivKey: randomBytes(32).toString('base64'),
    prevTempPrivKey: randomBytes(32).toString('base64'),
    name: 'Oswap.io'
  };
  localStorage.setItem(`${LOCALSTORAGE_KEY}.texto`, JSON.stringify(config));
}
config.client = client;

const texto = new Client(config);

export default texto;
