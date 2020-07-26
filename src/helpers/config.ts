import config from '@/config.json';

let network = process.env.VUE_APP_NETWORK || 'livenet';
const domainName = window.location.hostname;
if (domainName === 'testnet.oswap.io') network = 'testnet';

export default config[network];
