<template>
  <nav class="text-center mb-4">
    <div v-if="showWarning" class="btn-submit width-fit" style="height: auto;">
      <a @click="hideWarning">
        <Icon class="position-absolute right-0 top-0 p-3 m-1" name="close" size="18" />
      </a>
      <div class="p-2">This project is in beta. Use at your own risk.</div>
    </div>
    <div class="position-relative">
      <a
        v-text="config.network"
        @click="modalAboutOpen = true"
        class="position-absolute left-0 top-0 mx-3 my-4 btn-outline"
      />
      <span v-if="invite" class="position-absolute right-0 top-0 mx-3 my-4">
        <a v-if="!address" @click="handleLogin" class="btn-outline">Log in</a>
        <a @click="modalAccountOpen = true" class="btn-outline" v-else>
          <span class="hide-sm hide-md mr-2">{{ address | shorten }}</span>
          <Avatar :address="address" size="18" />
        </a>
        <a
          class="btn-outline ml-2"
          @click="modalSelectUnitOpen = true"
          v-text="unit.short || unit.symbol"
        />
      </span>
      <h1 class="pt-4">
        <router-link :to="{ name: 'home' }" class="text-white" style="font-size: 64px;">
          <img src="~/@/assets/logo.svg" class="mt-4" height="64" />
        </router-link>
      </h1>
      <div class="container-sm px-3">
        <div id="nav" class="clearfix bg-gray-9 d-flex rounded-2">
          <router-link
            :to="{
              name: this.$route.params.poolAddress ? 'swap' : 'home',
              params: { poolAddress: this.$route.params.poolAddress },
              query: this.$route.query
            }"
            class="d-block col-4 rounded-2"
            >Swap</router-link
          >
          <router-link
            :to="{
              name: 'send',
              params: { poolAddress: this.$route.params.poolAddress },
              query: this.$route.query
            }"
            class="d-block col-4 rounded-2"
            >Send</router-link
          >
          <router-link
            :to="{
              name: ['mint1', 'mint2', 'burn'].includes(this.$route.name)
                ? this.$route.name
                : 'pools',
              params: { poolAddress: this.$route.params.poolAddress },
              query: this.$route.query
            }"
            class="d-block col-4 rounded-2"
            >Pools</router-link
          >
        </div>
      </div>
      <ModalAccount :open="modalAccountOpen" @close="modalAccountOpen = false" />
      <ModalSelectUnit :open="modalSelectUnitOpen" @close="modalSelectUnitOpen = false" />
      <ModalAbout :open="modalAboutOpen" @close="modalAboutOpen = false" />
    </div>
  </nav>
</template>

<script>
import { LOCALSTORAGE_KEY } from '@/helpers/utils';
import config from '@/helpers/config';

export default {
  data() {
    return {
      modalSelectUnitOpen: false,
      modalAccountOpen: false,
      modalAboutOpen: false,
      showWarning: !localStorage.getItem(`${LOCALSTORAGE_KEY}.warning`),
      config
    };
  },
  computed: {
    address() {
      return this.auth.address;
    },
    invite() {
      return this.auth.invite;
    },
    unit() {
      return this.settings.assets.base;
    }
  },
  methods: {
    hideWarning() {
      localStorage.setItem(`${LOCALSTORAGE_KEY}.warning`, '1');
      this.showWarning = false;
    },
    handleLogin() {
      const url = `${this.invite}#login`;
      if (navigator.userAgent.indexOf('Firefox') != -1) {
        const opener = window.open(url, '', 'width=1,height=1,resizable=no');
        setTimeout(function() {
          opener.close();
        }, 5000);
      } else {
        location.href = url;
      }
    }
  }
};
</script>
