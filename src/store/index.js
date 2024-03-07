import { createStore } from 'vuex'; // Importa createStore em vez de Vuex
import auth from './modules/auth';

// Cria a store usando createStore
const store = createStore({
  modules: {
    auth,
  },
});

export default store;
