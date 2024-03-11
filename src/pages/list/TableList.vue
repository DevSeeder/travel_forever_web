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
              use-chips
            >
              <template v-slot:option="scope">
                <q-item
                  :clickable="true"
                  :class="{
                    'selected-item':
                      activeFilters[filter.key] &&
                      activeFilters[filter.key].includes(scope.opt.value),
                  }"
                  @click="toggleSelection(filter.key, scope.opt)"
                >
                  <q-item-section>
                    {{ scope.opt.label }}
                  </q-item-section>
                  <q-item-section avatar>
                    <q-icon :name="scope.opt.icon" />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
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
          :rows-per-page-options="[5, 10, 20]"
        >
          <template v-slot:bottom>
            <div class="totals-container">
              <div
                class="total my-custom-cell total-cell"
                v-for="column in gridTemplateColumns"
                :style="`min-width:${column.width};`"
                :key="column.index"
              >
                <q-select
                  v-if="column.type == 'currency'"
                  v-model="selectedCurrency[column.index]"
                  :options="
                    column.totalsContent.map((total) => ({
                      label: `${total.totalValue} (${total.currency})`,
                      value: total.currency,
                    }))
                  "
                  dense
                  outlined
                >
                  <q-tooltip
                    style="
                      font-size: 14px;
                      font-weight: bold;
                      background: black;
                    "
                  >
                    Totais por moeda
                  </q-tooltip>
                  <template v-slot:option="scope">
                    <q-item
                      :clickable="true"
                      style="font-weight: bold"
                      @click="setSelectedCurrency(scope.opt, column.index)"
                    >
                      <q-item-section>
                        {{ scope.opt.label }}
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
            </div>
            <div class="q-pa-md flex justify-between" style="width: 100%">
              <q-pagination
                v-model="pagination.page"
                :max="totalPages"
                @update:model-value="setPage"
              ></q-pagination>
              <q-select
                v-model="pagination.rowsPerPage"
                :options="rowsPerPageOptions"
                dense
                style="width: 100px"
                @update:model-value="updateRowsPerPage"
              ></q-select>
            </div>
          </template>
        </q-table>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, nextTick, onMounted, reactive, ref } from 'vue';
import { useQuasar } from 'quasar';
import { ListService } from 'src/services/pages/ListService';
import { ListColumn } from 'src/interface/components/ListColumn';
import 'src/css/list.css';
import { ListInputFilter } from 'src/interface/components/ListInputFilter';
import { DEFAULT_ORDER_MODE, DEFAULT_PAGE_SIZE } from 'src/app.constants';
import { FormatOutputHelper } from 'src/helper/FormatOutputHelper';
import { TotalCurrency } from 'src/interface/TotalCurrency';

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
    const totalPages = ref(0);
    const gridTemplateColumns = ref([]);
    const rowsPerPageOptions = [
      { label: '5', value: 5 },
      { label: '10', value: 10 },
      { label: '15', value: 15 },
      { label: '20', value: 20 },
      { label: '30', value: 30 },
      { label: '50', value: 50 },
    ];

    const pagination = ref({
      sortBy: null,
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
        orderBy: pagination.value.sortBy,
        orderMode: pagination.value?.descending ? -1 : 1,
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

      generateGridTemplateColumns();
    }

    async function loadColumns() {
      columns.value = await service.loadColumns();
      const metaList = await service.loadMeta();
      pagination.value = {
        sortBy: metaList.metaList?.defaultOrderField || null,
        descending: metaList.metaList?.defaultOrderMode
          ? metaList.metaList?.defaultOrderMode == 'DESC'
          : pagination.value.descending,
        page: 1,
        rowsPerPage:
          metaList.metaList?.defaultPageSize || pagination.value.rowsPerPage,
        rowsNumber: 0,
      };
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

    function calculateTotalForColumn(columnName: string, index: number) {
      const totals: TotalCurrency = {};

      items.value.forEach((item) => {
        if (!totals[item['currency']]) totals[item['currency']] = 0;
        totals[item['currency']] += parseCurrencyToNumber(item[columnName]);
      });

      const firstCurrency = totals[Object.keys(totals)[0]];
      selectedCurrency[index] = FormatOutputHelper.formatCurrency(
        firstCurrency,
        Object.keys(totals)[0]
      );

      return Object.keys(totals).map((key) => ({
        totalValue: FormatOutputHelper.formatCurrency(totals[key], key),
        currency: key,
      }));
    }

    function parseCurrencyToNumber(value: string): number {
      const cleanedValue = value.replace(/[^\d,]/g, '').replace(',', '.');
      return parseFloat(cleanedValue);
    }

    async function generateGridTemplateColumns() {
      await nextTick();
      const colWidths = getColWidths();
      gridTemplateColumns.value = colWidths.map((col, i) => {
        return {
          width: col,
          index: i,
          type: columns.value[i].type,
          totalsContent:
            columns.value[i].type == 'currency'
              ? calculateTotalForColumn(columns.value[i].name, i)
              : [],
        };
      });
    }

    function getColWidths() {
      const colWidths = [];
      const cols = document.querySelectorAll('.my-custom-header');
      for (let i = 0; i < cols.length; i++)
        colWidths.push(cols[i]['offsetWidth'] + 'px');
      return colWidths;
    }

    const selectedCurrency = reactive({});

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
      totalPages,
      rowsPerPageOptions,
      gridTemplateColumns,
      selectedCurrency,
    };
  },

  watch: {
    'pagination.rowsPerPage': {
      immediate: true,
      handler() {
        this.calculateTotalPages();
      },
    },
    'pagination.rowsNumber': {
      immediate: true,
      handler() {
        this.calculateTotalPages();
      },
    },
  },

  methods: {
    getDisableBoolean(key: string): boolean {
      const oppositeKey = key.endsWith('_ne')
        ? key.replace('_ne', '')
        : `${key}_ne`;
      return this.activeFilters[oppositeKey] === true;
    },

    calculateTotalPages() {
      if (!this.pagination.rowsNumber) return 0;

      this.totalPages = Math.ceil(
        this.pagination.rowsNumber / this.pagination.rowsPerPage
      );
    },

    setPage(pageNumber) {
      this.pagination.page = pageNumber;
      this.applyFilters();
    },

    setSelectedCurrency(option, index) {
      this.selectedCurrency[index] = {
        ...option,
        label: option.label.replace(`(${option.value})`, ''),
      };
    },

    toggleSelection(filterKey, option) {
      if (!this.activeFilters[filterKey]) this.activeFilters[filterKey] = [];
      const index = this.activeFilters[filterKey].indexOf(option);
      if (index === -1) this.activeFilters[filterKey].push(option);
      else this.activeFilters[filterKey].splice(index, 1);
    },

    updateRowsPerPage(rowsPerPage) {
      this.pagination.rowsPerPage = rowsPerPage.value;
      this.pagination.page = 1;
      this.applyFilters();
    },
  },
});
</script>
