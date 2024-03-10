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
              v-if="['text', 'currency'].includes(filter.type)"
              v-model="activeFilters[filter.key]"
              :label="filter.label"
              dense
              class="custom-border"
            />
            <q-input
              v-else-if="['date', 'datetime'].includes(filter.type)"
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
              multiple
              class="custom-border"
              @input="applyFilters"
            ></q-select>
            <q-toggle
              v-else-if="filter.type === 'boolean'"
              v-model="activeFilters[filter.key]"
              :label="filter.label"
              :disable="getDisableBoolean(filter.key)"
              true
              color="blue"
              @update:model-value="
                (value) => applyBooleanFilters(filter.key, value)
              "
            />
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
        if (
          !activeFilters.value[key] ||
          (Array.isArray(activeFilters.value[key]) &&
            !activeFilters.value[key].length)
        )
          return;
        if (typeof activeFilters.value[key] == 'object') {
          filterParams[key] = activeFilters.value[key]
            .map((field) => field.value)
            .join(',');
          return;
        }
        filterParams[key] = activeFilters.value[key];
      });
      console.log('filterParams');
      console.log(filterParams);
      await loadItems(filterParams);
      $q.loading.hide();
    }

    function resetFilters() {
      Object.keys(activeFilters.value).forEach((key) => {
        const filter = filterFields.value.find((f) => f.key === key);
        if (filter && filter.type === 'externalId')
          activeFilters.value[key] = [];
        else activeFilters.value[key] = '';
      });
    }

    function getOpositeKey(key: string): string {
      return key.endsWith('_ne') ? key.replace('_ne', '') : `${key}_ne`;
    }

    async function applyBooleanFilters(key: string, value: boolean) {
      const oppositeKey = getOpositeKey(key);

      if (value === true) {
        activeFilters.value[key] = true;
        activeFilters.value[oppositeKey] = false;
      } else activeFilters.value[key] = false;

      await applyFilters();
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
      applyBooleanFilters,
    };
  },

  methods: {
    getDisableBoolean(key: string): boolean {
      const oppositeKey = key.endsWith('_ne')
        ? key.replace('_ne', '')
        : `${key}_ne`;
      return this.activeFilters[oppositeKey] === true;
    },
  },
});
</script>

<style scoped></style>
src/interface/components/ListColumn
