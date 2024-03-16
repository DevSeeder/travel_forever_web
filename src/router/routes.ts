import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('pages/list/cards/CardList.vue'),
    props: {
      entity: 'travels',
    },
    meta: { requiresAuth: true },
  },
  {
    path: '/list/:entity',
    component: () => import('pages/list/table/TableList.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: '/edit/:entity/:id',
    component: () => import('pages/form/EditForm.vue'),
    props: true,
    meta: { requiresAuth: true },
  },
  { path: '/login', component: () => import('pages/auth/LoginPage.vue') },
  { path: '/register', component: () => import('pages/auth/RegisterPage.vue') },
  { path: '/logout', component: () => import('pages/auth/LoginPage.vue') },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/general/ErrorNotFound.vue'),
  },
];

export default routes;
