import Vue from 'vue';
import VueUi from '@vue/ui';
import VueI18n from 'vue-i18n';
import { upperFirst, camelCase } from 'lodash';
import makeBlockie from 'ethereum-blockies-base64';
import App from '@/App.vue';
import router from '@/router';
import store from '@/store';
import mixins from '@/mixins';
import { shorten } from '@/helpers/utils';
import messages from '@/helpers/messages.json';
import numberFormats from '@/helpers/number.json';
import '@/style.scss';

Vue.use(VueUi);
Vue.use(VueI18n);
const i18n = new VueI18n({ locale: 'en', messages, numberFormats });

const requireComponent = require.context('@/components', true, /[\w-]+\.vue$/);
requireComponent.keys().forEach(fileName => {
  const componentConfig = requireComponent(fileName);
  const componentName = upperFirst(camelCase(fileName.replace(/^\.\//, '').replace(/\.\w+$/, '')));
  Vue.component(componentName, componentConfig.default || componentConfig);
});

Vue.filter('blockie', value => makeBlockie(value));
Vue.filter('shorten', value => shorten(value));
Vue.mixin(mixins);

Vue.config.productionTip = false;

new Vue({
  i18n,
  router,
  store,
  render: h => h(App)
}).$mount('#app');
