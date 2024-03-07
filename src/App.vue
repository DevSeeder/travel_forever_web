<template>
  <q-layout>
    <q-header>
      <!-- Seu código para o cabeçalho aqui -->
    </q-header>

    <q-drawer>
      <!-- Seu código para a gaveta (sidebar) aqui -->
    </q-drawer>

    <q-page-container>
      <!-- As páginas do seu aplicativo serão injetadas aqui -->
      <router-view></router-view>
    </q-page-container>

    <q-footer>
      <!-- Seu código para o rodapé aqui -->
    </q-footer>
  </q-layout>
</template>

<script>
export default {
  name: 'App',
  created() {
    this.$store.dispatch('auth/initializeAuth');
  },
}; //
</script>

<style>
/* Seu CSS global aqui */
</style>
