import { set } from 'lodash';
import { createHash } from 'crypto';
import { utils } from 'obyte';
import Decimal from 'decimal.js';
import client from '@/helpers/client';
import config from '@/helpers/config';

export const FACTORY_ADDRESS = config.factoryAddress;
export const BASE_ADDRESS = config.baseAddress;
export const PROXY_BASE_ADDRESSES = config.proxyBaseAddresses;
export const TOKEN_REGISTRY_ADDRESS = config.tokenRegistryAddress;

Decimal.set({
  precision: 15,
  rounding: Decimal.ROUND_HALF_EVEN,
  maxE: 308,
  minE: -324,
  toExpNeg: -7,
  toExpPos: 21
});

export function fromString(str: string, decimals: number = 0) {
  const multiplier = 10 ** decimals;
  // @ts-ignore
  return parseFloat(str).toFixed(decimals) * multiplier;
}

export function toString(amount: number, decimals: number = 0) {
  const multiplier = 10 ** decimals;
  const str = parseFloat((amount / multiplier).toFixed(decimals));
  return isNaN(str) || str < 0 ? '' : str;
}

export function getAmountBought(inputAmount, inputReserve, outputReserve, swapFee) {
  const swapNoFee = 1e11 - swapFee;
  const numerator = inputAmount * outputReserve * swapNoFee;
  const denominator = inputReserve * 1e11 + inputAmount * swapNoFee;
  return Math.floor(numerator / denominator);
}

export function getAmountSold(outputAmount, outputReserve, inputReserve, swapFee) {
  const swapNoFee = 1e11 - swapFee;
  const numerator = outputAmount * inputReserve * 1e11;
  const denominator = (outputReserve - outputAmount) * swapNoFee;
  return Math.ceil(numerator / denominator);
}

export async function getInfo(address) {
  const params = {
    address,
    trigger: {
      data: { info: '1' },
      address: 'FAB6TH7IRAVHDLK2AAWY5YBE6CEBUACF',
      outputs: { base: 10000 }
    }
  };
  try {
    const result = await client.requestAsync('light/dry_run_aa', params);
    return result[0].response.responseVars;
  } catch (e) {
    return {};
  }
}

export async function getAAState(address: string, delimiter?: string) {
  const state = await client.requestAsync('light/get_aa_state_vars', { address });
  return parseAAState(state, delimiter);
}

export async function getAAStateVars(address: string, var_prefix: string, delimiter?: string) {
  const state = await client.requestAsync('light/get_aa_state_vars', { address, var_prefix });
  return parseAAState(state, delimiter);
}

export async function getAAsByBaseAAs(aa: string | string[], aaParams?: object) {
  let params = { params: aaParams };
  if (typeof aa === 'string') {
    params['base_aa'] = aa;
  } else {
    params['base_aas'] = aa;
  }
  return await client.requestAsync('light/get_aas_by_base_aas', params);
}

export function parseAAState(obj, delimiter = '.'): any {
  const state = {};
  Object.entries(obj).forEach(v => set(state, v[0].replace(delimiter, '.'), v[1]));
  return state;
}

export function numberFromSeed(seed) {
  const hash = createHash('sha256')
    .update(seed.toString(), 'utf8')
    .digest('hex');
  const head = hash.substr(0, 16);
  const nominator = new Decimal('0x' + head);
  const denominator = new Decimal('0x1' + '0'.repeat(16));
  return nominator.div(denominator);
}

export function generateCreateUri(assets, swapFee) {
  const [assetA, assetB] = assets;
  const order = numberFromSeed(assetA) > numberFromSeed(assetB);
  const asset0 = order ? assetA : assetB;
  const asset1 = order ? assetB : assetA;
  const definition = [
    'autonomous agent',
    {
      base_aa: BASE_ADDRESS,
      params: { factory: FACTORY_ADDRESS, asset0, asset1, swap_fee: swapFee }
    }
  ];
  const address = utils.getChash160(definition);
  const data = { create: '1', address, asset0, asset1, swap_fee: swapFee };
  return generateUri(FACTORY_ADDRESS, data);
}

export function generateUri(address, data, amount = 1e4, asset?) {
  let uri = `${config.uri}:${address}`;
  const json = JSON.stringify(data);
  const b64 = encodeURIComponent(Buffer.from(json).toString('base64'));
  uri += `?base64data=${b64}`;
  if (amount) uri += `&amount=${Math.floor(amount)}`;
  if (asset) uri += `&asset=${encodeURIComponent(asset)}`;
  return uri;
}

export function generatePaymentMessage(objPaymentRequest) {
  const paymentJson = JSON.stringify(objPaymentRequest);
  return Buffer.from(paymentJson).toString('base64');
}

export function getBalance(balances, asset, pending = true) {
  if (!balances || !balances[asset]) return 0;
  return balances[asset].stable + (pending ? balances[asset].pending : 0);
}
