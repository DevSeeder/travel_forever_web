import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('pages/list/TableList.vue'),
    props: {
      entity: 'travels',
    },
    meta: { requiresAuth: true },
  },
  {
    path: '/list/:entity',
    component: () => import('pages/list/TableList.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  // Adicione esta linha
  { path: '/login', component: () => import('pages/auth/LoginPage.vue') },
  { path: '/register', component: () => import('pages/auth/RegisterPage.vue') },
  { path: '/logout', component: () => import('pages/auth/LoginPage.vue') },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
