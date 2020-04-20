import Vue from 'vue';
import store from '@/store';
import client from '@/helpers/client';
import { getAAState, FACTORY_ADDRESS, TOKEN_REGISTRY_ADDRESS } from '@/helpers/_oswap';
import { LOCALSTORAGE_KEY } from '@/helpers/utils';
import units from '@/helpers/units.json';

const state = {
  isLoading: false,
  assets: {},
  allPairs: {},
  getPair: {},
  getAsset: {},
  assetToSymbol: {},
  decimals: {},
  exchangeRates: {}
};

client.subscribe(result => {
  const [command, { subject, body }] = result;
  if (command === 'justsaying' && subject === 'exchange_rates') {
    store.commit('exchangeRates', body);
  }
});

const mutations = {
  isLoading(_state, payload) {
    Vue.set(_state, 'isLoading', payload);
  },
  init(_state, { factory, registry }) {
    const lSUnit = localStorage.getItem(`${LOCALSTORAGE_KEY}.unit`);
    const assets = { base: lSUnit ? JSON.parse(lSUnit) : units[0] };
    Vue.set(_state, 'assetToSymbol', registry.a2s);
    Vue.set(_state, 'decimals', registry.decimals);
    if (factory.all_pairs) {
      Vue.set(_state, 'allPairs', factory.all_pairs);
      Vue.set(_state, 'getPair', factory.get_pair);
      Vue.set(_state, 'getAsset', factory.get_asset);
      Object.entries(factory.get_pair).forEach(pair => {
        // @ts-ignore
        pair[1].split('_').forEach(asset => {
          const symbol = registry.a2s[asset];
          const decimals = registry.decimals[asset] || 0;
          // @ts-ignore
          if (asset !== 'base' && factory.get_asset && factory.get_asset[pair[0]])
            assets[asset] = { symbol, decimals };
        });
      });
    }
    Vue.set(_state, 'assets', assets);
  },
  unit(_state, payload) {
    Vue.set(_state.assets, 'base', payload);
  },
  exchangeRates(_state, payload) {
    Vue.set(_state, 'exchangeRates', payload);
  }
};

const actions = {
  init: async ({ commit }) => {
    commit('isLoading', true);
    const address = localStorage.getItem(`${LOCALSTORAGE_KEY}.address`);
    if (address) store.dispatch('login', address);
    const factory = await getAAState(FACTORY_ADDRESS);
    const registry = await getAAState(TOKEN_REGISTRY_ADDRESS, '_');
    commit('init', { factory, registry });
    commit('isLoading', false);
  },
  unit: ({ commit }, unit) => {
    localStorage.setItem(`${LOCALSTORAGE_KEY}.unit`, JSON.stringify(unit));
    commit('unit', unit);
  }
};

export default {
  state,
  mutations,
  actions
};
