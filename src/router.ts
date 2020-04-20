import Vue from 'vue';
import Router from 'vue-router';

const Home = () => import(/* webpackChunkName: "home" */ '@/views/Swap.vue');
const CreatePair = () => import(/* webpackChunkName: "create-pair" */ '@/views/CreatePair.vue');
const AddLiquidity = () => import(/* webpackChunkName: "add-liquidity" */ '@/views/Pool.vue');
const RemoveLiquidity = () =>
  import(/* webpackChunkName: "add-liquidity" */ '@/views/RemoveLiquidity.vue');
const Asset = () => import(/* webpackChunkName: "asset" */ '@/views/Asset.vue');

Vue.use(Router);

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/swap', name: 'swap', component: Home },
    { path: '/send', name: 'send', component: Home },
    { path: '/create-pair/:assetB?', name: 'create-pair', component: CreatePair },
    { path: '/add-liquidity', name: 'add-liquidity', component: AddLiquidity },
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
