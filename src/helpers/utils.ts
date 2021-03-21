import config from '@/helpers/config';
import pkg from '@/../package.json';

export const LOCALSTORAGE_KEY = pkg.name;

export function shorten(str: string) {
  if (str.length < 10) return str;
  return `${str.slice(0, 4)}...${str.slice(str.length - 4)}`;
}

export function b64UriDec(str: string) {
  return (str + '==='.slice((str.length + 3) % 4)).replace(/-/g, '+').replace(/_/g, '/');
}

export function b64UriEnc(str: string) {
  return str
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function explorerLink(str: string) {
  // return `https://${config.testnet ? 'testnet' : ''}explorer.obyte.org/#${str}`;
  return config.testnet
    ? `https://testnetexplorer.obyte.org/#${str}`
    : `https://digitalnerds.github.io/obyte-address-assets/#/${str}`;
}
