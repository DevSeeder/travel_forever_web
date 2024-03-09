<template>
  <q-layout>
    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <div class="filters-container q-pa-md">
        <div class="filter-title">Filtros</div>
        <div class="input-filter-container">
          <div
            v-for="filter in filterFields"
            :key="filter.key"
            class="q-mr-md q-mb-md filter-field"
          >
            <q-input
              v-if="['text'].includes(filter.type)"
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
              type="number"
            />
            <q-select
              v-else-if="filter.type === 'externalId'"
              v-model="activeFilters[filter.key]"
              :options="filter.options"
              :label="filter.label"
              outlined
              class="custom-border"
              @input="applyFilters"
            ></q-select>
          </div>
        </div>
        <div class="btn-side-filter btn-side-container">
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
          icon="tune"
          @click="leftDrawerOpen = !leftDrawerOpen"
          class="q-mb-md"
        />
        <q-table
          :rows="items"
          :columns="columns"
          row-key="id"
          :loading="loading"
          v-model:pagination="pagination"
          @request="onRequest"
          class="my-stretch-table fixed-header-table"
          flat
          bordered
        >
        </q-table>
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
import { DEFAULT_ORDER_MODE, DEFAULT_PAGE_SIZE } from 'src/app.constants';

export default defineComponent({
  props: {
    entity: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const service = new ListService(props.entity);

    const $q = useQuasar();
    const leftDrawerOpen = ref(false);
    const filterFields = ref<ListInputFilter[]>([]);
    const activeFilters = ref({});
    const items = ref<[]>([]);
    const columns = ref<ListColumn[]>([]);
    const loading = ref(false);
    const pagination = ref({
      sortBy: 'startDate',
      descending: DEFAULT_ORDER_MODE == 'DESC',
      page: 1,
      rowsPerPage: DEFAULT_PAGE_SIZE,
      rowsNumber: 0,
    });

    async function loadItems(params = {}) {
      params = {
        ...params,
        page: pagination.value.page,
        pageSize: pagination.value.rowsPerPage,
        // sortBy: pagination.value.sortBy,
        // descending: pagination.value.descending ? 'true' : 'false',
      };

      const response = await service.loadItems(params);
      items.value = [...response.items] as [];
      pagination.value = {
        sortBy: pagination.value.sortBy,
        descending: pagination.value.descending,
        page: response.meta.currentPage,
        rowsPerPage: pagination.value.rowsPerPage,
        rowsNumber: response.meta.totalRecords,
      };
    }

    async function loadColumns() {
      columns.value = await service.loadColumns();
    }

    async function loadFilters() {
      filterFields.value = await service.loadFilters();
    }

    async function onRequest(props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination;
      // Atualize seu objeto de paginação aqui
      pagination.value = {
        ...pagination.value,
        page,
        rowsPerPage,
        sortBy,
        descending,
      };
      // Carregue os itens com os novos parâmetros de paginação
      applyFilters();
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
        if (Object.keys(activeFilters.value[key]).length) {
          filterParams[key] = activeFilters.value[key]['value'];
          return;
        }
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
      items,
      filterFields,
      pagination,
      columns,
      loading,
      activeFilters,
      applyFilters,
      resetFilters,
      leftDrawerOpen,
      onRequest,
    };
  },
});
</script>

<style scoped></style>
src/interface/components/ListColumn
