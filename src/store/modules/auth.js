// store/modules/auth.js

export default {
  namespaced: true, // Habilita o uso de namespace neste módulo
  state: () => ({
    isAuthenticated: false,
    token: null,
  }),
  mutations: {
    setAuth(state, payload) {
      state.isAuthenticated = payload.isAuthenticated;
      state.token = payload.token;

      localStorage.setItem(
        'auth',
        JSON.stringify({
          isAuthenticated: state.isAuthenticated,
          token: state.token,
        })
      );
    },
  },
  actions: {
    login({ commit }, token) {
      commit('setAuth', { isAuthenticated: true, token });
    },
    initializeAuth({ commit }) {
      const auth = localStorage.getItem('auth');
      if (auth) {
        const authState = JSON.parse(auth);
        commit('setAuth', authState);
      }
    },
    logout({ commit }) {
      commit('setAuth', { isAuthenticated: false, token: null });
    },
  },
  getters: {
    isAuthenticated(state) {
      return state.isAuthenticated;
    },
    token(state) {
      return state.token;
    },
  },
};
