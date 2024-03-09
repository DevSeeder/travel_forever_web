<template>
  <q-layout>
    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <!-- Conteúdo da Sidebar de Filtros -->
      <div class="filters-container q-pa-md">
        <div
          v-for="filter in filterFields"
          :key="filter.key"
          class="q-mr-md q-mb-md filter-field"
        >
          <q-input
            v-if="filter.type === 'text'"
            v-model="activeFilters[filter.key]"
            :label="filter.label"
            dense
            class="custom-border"
          />
          <q-input
            v-else-if="filter.type === 'date'"
            v-model="activeFilters[filter.key]"
            :label="filter.label"
            dense
            class="custom-border"
            type="date"
          />
          <q-input
            v-else-if="filter.type === 'number'"
            v-model="activeFilters[filter.key]"
            :label="filter.label"
            dense
            class="custom-border"
            type="number"
          />
        </div>
        <div class="q-mt-auto full-width-item btn-side-filter">
          <q-btn
            class="q-mb-md full-width btn-side-filter"
            color="primary"
            icon-right="filter_list"
            label="Aplicar Filtros"
            @click="applyFilters"
          />
          <q-btn
            class="q-mb-md full-width btn-side-filter"
            color="grey"
            icon-right="refresh"
            label="Resetar"
            @click="resetFilters"
          />
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <q-page class="q-pa-md">
        <q-btn
          fab
          icon="menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
          class="q-mb-md"
        />
        <q-table
          :rows="trips"
          :columns="columns"
          row-key="id"
          :loading="loading"
          class="my-stretch-table"
        />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { ListService } from 'src/services/pages/ListService';
import { ListColumn } from 'src/interface/components/ListColumn';
import 'src/css/list.css';
import { ListInputFilter } from 'src/interface/components/ListInputFilter';

interface Trip {
  name: string;
  startDate: string;
  endDate: string;
}

const service = new ListService<Trip>('travels');

export default defineComponent({
  setup() {
    const $q = useQuasar();
    const leftDrawerOpen = ref(false);
    const filterFields = ref<ListInputFilter[]>([]);
    const activeFilters = ref({});
    const trips = ref<Trip[]>([]);
    const columns = ref<ListColumn[]>([]);
    const loading = ref(false);
    const pagination = ref({
      sortBy: 'startDate',
      descending: false,
      page: 1,
      rowsPerPage: 10,
    });

    async function loadItems(params = {}) {
      const response = await service.loadItems(params);
      trips.value = [...response.items];
      pagination.value = {
        sortBy: 'startDate',
        descending: false,
        page: response.meta.currentPage,
        rowsPerPage: 10,
      };
    }

    async function loadColumns() {
      columns.value = await service.loadColumns();
    }

    async function loadFilters() {
      filterFields.value = await service.loadFilters();
    }

    // Usando onMounted para chamar funções assíncronas após o componente ser montado
    onMounted(async () => {
      $q.loading.show();
      try {
        await loadColumns();
        await loadItems();
        await loadFilters();
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        $q.notify({
          color: 'negative',
          message: `Falha ao carregar os dados: ${err}`,
        });
      } finally {
        $q.loading.hide();
      }
    });

    async function applyFilters() {
      $q.loading.show();
      let filterParams = {};
      Object.keys(activeFilters.value).forEach((key) => {
        if (!activeFilters.value[key]) return;
        filterParams[key] = activeFilters.value[key];
      });
      console.log(filterParams);

      await loadItems(filterParams);
      $q.loading.hide();
    }

    function resetFilters() {
      Object.keys(activeFilters.value).forEach((key) => {
        activeFilters.value[key] = '';
      });
    }

    return {
      trips,
      filterFields,
      pagination,
      columns,
      loading,
      activeFilters,
      applyFilters,
      resetFilters,
      leftDrawerOpen,
    };
  },
});
</script>

<style scoped></style>
src/interface/components/ListColumn
