export default {
  namespaced: true,

  state: {
    token: null,
  },

  mutations: {
    SET_TOKEN(state, token) {
      state.token = token;
    },
  },

  actions: {
    login({ commit }, token) {
      commit('SET_TOKEN', token);
      // Aqui você pode adicionar lógica para persistir o token no LocalStorage, se necessário
      localStorage.setItem('user-token', token);
    },
    logout({ commit }) {
      commit('SET_TOKEN', null);
      // Remover o token do LocalStorage
      localStorage.removeItem('user-token');
    },
  },

  getters: {
    isAuthenticated(state) {
      return !!state.token;
    },
    token: (state) => state.token,
  },
};
