<template>
  <!-- background: url('sua-imagem-de-fundo.jpg') no-repeat center center; -->

  <q-page class="flex flex-center" style="background-size: cover">
    <q-card class="q-pa-md" style="width: 350px; max-width: 90%">
      <q-card-section class="text-center">
        <div class="text-h6">Login</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="onSubmit" @reset="onReset" class="q-gutter-md">
          <q-input
            filled
            v-model="loginForm.username"
            label="Username"
            :error="errors.username"
            autofocus
          />
          <div v-if="errors.username" class="text-negative">
            Username is required
          </div>

          <q-input
            filled
            v-model="loginForm.password"
            label="Password"
            type="password"
            :error="errors.password"
          />
          <div v-if="errors.password" class="text-negative">
            Password is required
          </div>

          <div>
            <q-btn
              label="Login"
              type="submit"
              color="primary"
              class="full-width"
            />
          </div>
        </q-form>
      </q-card-section>

      <div
        v-if="loading"
        class="absolute-full flex flex-center bg-grey-8 text-white"
        style="opacity: 0.5"
      >
        <q-spinner-oval :size="50" />
      </div>
    </q-card>
  </q-page>
</template>

<script>
import { ClientAuthService } from 'src/services/client/ClientAuthService';

const clientAuth = new ClientAuthService();

export default {
  name: 'LoginPage',

  data() {
    return {
      loginForm: {
        username: '',
        password: '',
      },
      errors: {
        username: false,
        password: false,
      },
      progress: 50,
      loading: true,
    };
  },
  mounted() {
    this.loading = false;
  },

  methods: {
    validateForm() {
      this.errors.username = !this.loginForm.username;
      this.errors.password = !this.loginForm.password;

      return this.errors.username || this.errors.password ? false : true;
    },

    async onSubmit() {
      this.loading = true;
      if (!this.validateForm()) {
        console.log('Validation failed');
        this.loading = false;
        return;
      }

      const response = await clientAuth.login(
        this.loginForm.username,
        this.loginForm.password
      );

      this.loading = false;

      if (!response.success) {
        this.$q.notify({
          color: 'red-5',
          textColor: 'white',
          icon: 'warning',
          message: response.data,
        });
        return;
      }

      this.$q.notify({
        color: 'green-4',
        textColor: 'white',
        icon: 'done',
        message: 'Usuário logado com sucesso!',
      });
    },

    onReset() {
      this.loginForm.username = '';
      this.loginForm.password = '';
      this.errors.username = false;
      this.errors.password = false;
    },
  },
};
</script>

<style>
.q-card {
  position: relative;
  min-width: 300px;
}
</style>
