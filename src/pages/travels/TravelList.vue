<template>
  <q-page class="q-pa-md">
    <q-table :rows="trips" :columns="columns" row-key="id" :loading="loading" />
  </q-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { QPage, QTable, QInput } from 'quasar';
import { ListService } from 'src/services/pages/ListService';
import { ListColumn } from 'src/interface/ListColumn';
import 'src/css/list.css';

interface Trip {
  name: string;
  startDate: string;
  endDate: string;
}

const service = new ListService<Trip>('travels');

export default defineComponent({
  setup() {
    const filter = ref('');
    const trips = ref<Trip[]>([]);
    const columns = ref<ListColumn[]>([]);
    const loading = ref(false);
    const pagination = ref({
      sortBy: 'startDate',
      descending: false,
      page: 1,
      rowsPerPage: 10,
    });

    async function loadItems() {
      loading.value = true;
      const response = await service.loadItems();
      trips.value = [...response.items];
      pagination.value = {
        sortBy: 'startDate',
        descending: false,
        page: response.meta.currentPage,
        rowsPerPage: 10,
      };
      loading.value = false;
    }

    async function loadColumns() {
      loading.value = true;
      columns.value = await service.loadColumns();
      loading.value = false;
    }

    // Usando onMounted para chamar funções assíncronas após o componente ser montado
    onMounted(() => {
      loadColumns();
      loadItems();
    });

    return {
      trips,
      filter,
      pagination,
      columns,
      loading,
    };
  },
});
</script>

<style scoped></style>
