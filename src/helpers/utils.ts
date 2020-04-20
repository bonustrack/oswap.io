import pkg from '@/../package.json';

export const LOCALSTORAGE_KEY = pkg.name;

export function shorten(str) {
  if (str.length < 10) return str;
  return `${str.slice(0, 4)}...${str.slice(str.length - 4)}`;
}

export function b64UriDec(str) {
  return (str + '==='.slice((str.length + 3) % 4)).replace(/-/g, '+').replace(/_/g, '/');
}

export function b64UriEnc(str) {
  return str
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
