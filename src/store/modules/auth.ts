import Vue from 'vue';
import { utils } from 'obyte';
import store from '@/store';
import texto from '@/helpers/texto';
import client from '@/helpers/client';
import config from '@/helpers/config';
import { LOCALSTORAGE_KEY } from '@/helpers/utils';

texto.on('ready', () => {
  const devicePubKey = texto.devicePubKey;
  console.log(`Logged in as ${devicePubKey}!`);
  store.commit('invite', `${config.uri}:${devicePubKey}@${config.node}`);
});

texto.on('pairing', msg => {
  if (msg.body.pairing_secret === 'login')
    msg.reply('To log in, please let me know your address (click ... and "Insert my address")');
});

texto.on('message', msg => {
  console.log('Message', msg.body);
  if (msg.body === 'ping') msg.reply('pong');
  if (utils.isValidAddress(msg.body.trim())) {
    store.dispatch('login', msg.body.trim());
    msg.reply('You are logged in, please get back to the website.');
  }
});

const state = {
  invite: '',
  address: '',
  balances: {}
};

const mutations = {
  invite(_state, payload) {
    Vue.set(_state, 'invite', payload);
  },
  login(_state, payload) {
    Vue.set(_state, 'address', payload.address);
    Vue.set(_state, 'balances', payload.balances);
  },
  logout(_state) {
    Vue.set(_state, 'address', '');
    Vue.set(_state, 'balances', {});
  }
};

const actions = {
  login: async ({ commit }, address) => {
    localStorage.setItem(`${LOCALSTORAGE_KEY}.address`, address);
    const balances = await client.requestAsync('light/get_balances', [address]);
    client.justsaying('light/new_address_to_watch', address);
    commit('login', { address, balances: balances[address] });
  },
  logout: async ({ commit }) => {
    localStorage.removeItem(`${LOCALSTORAGE_KEY}.address`);
    commit('logout');
  }
};

export default {
  state,
  mutations,
  actions
};
