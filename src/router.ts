import Vue from 'vue';
import Router from 'vue-router';

const Home = () => import(/* webpackChunkName: "home" */ '@/views/Swap.vue');
const CreatePair = () => import(/* webpackChunkName: "create-pair" */ '@/views/CreatePair.vue');
const AddLiquidity1 = () =>
  import(/* webpackChunkName: "add-liquidity-1" */ '@/views/AddLiquidity1.vue');
const AddLiquidity2 = () =>
  import(/* webpackChunkName: "add-liquidity-2" */ '@/views/AddLiquidity2.vue');
const RemoveLiquidity = () =>
  import(/* webpackChunkName: "add-liquidity" */ '@/views/RemoveLiquidity.vue');
const Asset = () => import(/* webpackChunkName: "asset" */ '@/views/Asset.vue');

Vue.use(Router);

const router = new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/swap', name: 'swap', component: Home },
    { path: '/send', name: 'send', component: Home },
    { path: '/create-pair/:assetB?', name: 'create-pair', component: CreatePair },
    { path: '/add-liquidity', name: 'add-liquidity', component: AddLiquidity1 },
    { path: '/add-liquidity-2', name: 'add-liquidity-2', component: AddLiquidity2 },
    { path: '/remove-liquidity', name: 'remove-liquidity', component: RemoveLiquidity },
    { path: '/asset/:id', name: 'asset', component: Asset },
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
