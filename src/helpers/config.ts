import config from '@/config.json';

let network = 'testnet';
const domainName = window.location.hostname;
if (domainName === 'oswap.io') network = 'livenet';
if (domainName === 'testnet.oswap.io') network = 'testnet';

export default config[network];
