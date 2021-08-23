<template>
  <Modal :open="open" @close="$emit('close')">
    <div class="modal-body flex-auto my-5 px-4">
      <h2 class="mb-3 text-white">About</h2>
      <p v-if="pkg.description" style="font-size: 24px;" class="mb-4">
        {{ pkg.description }}
      </p>
      <p>
        <label class="d-block">Network</label>
        <a :href="config.explorer" target="_blank">
          {{ config.network }}
          <Icon name="external-link" class="ml-1" size="18" />
        </a>
      </p>
      <p>
        <label class="d-block">Documentation</label>
        <a href="https://docs.oswap.io" target="_blank">
          https://docs.oswap.io
          <Icon name="external-link" class="ml-1" size="18" />
        </a>
      </p>
      <p v-if="pkg.bugs && pkg.bugs.url">
        <label class="d-block">GitHub</label>
        <a :href="pkg.bugs.url.replace('/issues', '')" target="_blank">
          {{ pkg.bugs.url.replace('/issues', '') }}
          <Icon name="external-link" class="ml-1" size="18" />
        </a>
      </p>
      <p v-if="pkg.version">
        <label class="d-block">Version</label>
        <a :href="pkg.bugs.url.replace('/issues', '/blob/master/package.json')" target="_blank">
          {{ pkg.version }}
          <Icon name="external-link" class="ml-1" size="18" />
        </a>
      </p>
      <p v-if="pkg.license">
        <label class="d-block">License</label>
        <a :href="pkg.bugs.url.replace('/issues', '/blob/master/LICENSE')" target="_blank">
          {{ pkg.license }}
          <Icon name="external-link" class="ml-1" size="18" />
        </a>
      </p>
      <p v-for="(item, i) in { factory, pool, proxies, registry }" :key="i">
        <label :for="i" class="d-block" v-text="item.name" />
        <span v-for="(address, j) in item.addresses" :key="j">
          <a :id="i" :href="_explorerLink(address)" target="_blank" class="d-block py-2 text-white">
            <Avatar :address="address" size="18" class="mr-1" />
            {{ address }}
            <Icon name="external-link" class="ml-1" size="18" />
          </a>
        </span>
        <span v-if="!item.addresses.length">
          No addresses
        </span>
      </p>
    </div>
  </Modal>
</template>

<script>
import pkg from '@/../package.json';
import {
  FACTORY_ADDRESS,
  BASE_ADDRESS,
  PROXY_BASE_ADDRESSES,
  TOKEN_REGISTRY_ADDRESS
} from '@/helpers/_oswap';
import config from '@/helpers/config';

export default {
  props: ['open'],
  data() {
    return {
      pkg,
      factory: { name: 'Factory address', addresses: [FACTORY_ADDRESS] },
      pool: { name: 'Pool base address', addresses: [BASE_ADDRESS] },
      proxies: { name: 'Proxy base address(es)', addresses: PROXY_BASE_ADDRESSES },
      registry: { name: 'Registry address', addresses: [TOKEN_REGISTRY_ADDRESS] },
      config
    };
  }
};
</script>
