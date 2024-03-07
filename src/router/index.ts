import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes';
import store from '../store';

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  if (
    to.matched.some((record) => record.meta.requiresAuth) &&
    !store.getters['auth/isAuthenticated']
  ) {
    next({ path: '/login', query: { redirect: to.fullPath } });
  } else if (to.path === '/login' && store.getters['auth/isAuthenticated']) {
    next({ path: '/' });
  } else {
    next();
  }
});

export default router;
