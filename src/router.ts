import Vue from 'vue';
import Router from 'vue-router';

const Home = () => import(/* webpackChunkName: "home" */ '@/views/Swap.vue');
const Create = () => import(/* webpackChunkName: "create" */ '@/views/Create.vue');
const Mint1 = () => import(/* webpackChunkName: "mint1" */ '@/views/Mint1.vue');
const Mint2 = () => import(/* webpackChunkName: "mint2" */ '@/views/Mint2.vue');
const Burn = () => import(/* webpackChunkName: "burn" */ '@/views/Burn.vue');
const Pools = () => import(/* webpackChunkName: "pools" */ '@/views/Pools.vue');
const Asset = () => import(/* webpackChunkName: "asset" */ '@/views/Asset.vue');

Vue.use(Router);

const router = new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/swap/:poolAddress?', name: 'swap', component: Home },
    { path: '/swap/*', name: 'swap-custom', component: Home },
    { path: '/send/:poolAddress?', name: 'send', component: Home },
    { path: '/send/*', name: 'send-custom', component: Home },
    { path: '/create-pool', name: 'create', component: Create },
    { path: '/create-pool/*', name: 'create-custom', component: Create },
    { path: '/add-liquidity/:poolAddress?', name: 'mint1', component: Mint1 },
    { path: '/add-liquidity-2/:poolAddress?', name: 'mint2', component: Mint2 },
    { path: '/remove-liquidity/:poolAddress?', name: 'burn', component: Burn },
    { path: '/pools', name: 'pools', component: Pools },
    { path: '/asset/*', name: 'asset', component: Asset },
    {
      path: '/*',
      name: 'error-404',
      beforeEnter: (to, from, next) => next('/')
    }
  ]
});

router.beforeEach((to, from, next) => {
  window.scrollTo(0, 0);
  next();
});

export default router;
