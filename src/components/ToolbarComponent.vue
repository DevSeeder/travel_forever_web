<template>
  <q-toolbar>
    <div class="flex-container">
      <q-btn flat round dense icon="menu" class="q-mr-sm" />
      <!-- <q-toolbar-title>{{
        metaValues.translations?.listLabel ||
        metaValues.translations.entityLabel
      }}</q-toolbar-title> -->
      <q-toolbar-title>Teste aqui</q-toolbar-title>

      <slot></slot>
    </div>
  </q-toolbar>
</template>

<script>
export default {
  name: 'ToolbarComponent',
  props: {
    showFilterButton: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    toggleFilter() {
      this.$emit('toggle-filter');
    },
  },
};
</script>
