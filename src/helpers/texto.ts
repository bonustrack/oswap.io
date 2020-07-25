import { Client } from '@/helpers/_texto/main';
import { toWif } from '@/helpers/_texto/utils';
import { randomBytes } from 'crypto';
import config from '@/helpers/config';
import client from '@/helpers/client';
import { LOCALSTORAGE_KEY } from '@/helpers/utils';

let clientConfig;
const testnet = config.testnet;
const lSClientConfig = localStorage.getItem(`${LOCALSTORAGE_KEY}.texto`);

if (lSClientConfig) {
  clientConfig = JSON.parse(lSClientConfig);
} else {
  clientConfig = {
    testnet,
    wif: toWif(randomBytes(32), testnet),
    tempPrivKey: randomBytes(32).toString('base64'),
    prevTempPrivKey: randomBytes(32).toString('base64'),
    name: 'Oswap.io'
  };
  localStorage.setItem(`${LOCALSTORAGE_KEY}.texto`, JSON.stringify(clientConfig));
}
clientConfig.client = client;

const texto = new Client(clientConfig);

export default texto;
