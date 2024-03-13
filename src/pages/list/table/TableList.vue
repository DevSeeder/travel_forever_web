<template>
  <ToolbarComponent
    @toggle-filter="setHideFilter(!hideFilter)"
    :showFilterButton="true"
    :entity="$props.entity"
  ></ToolbarComponent>
  <q-layout class="rounded-borders">
    <ListFilter
      ref="listFilterRef"
      v-show="showFilter"
      :service="service"
      :load-items="loadItems"
      :hideFilters="hideFilter"
      @update:setHideFilter="setHideFilter(true)"
    ></ListFilter>

    <q-page-container>
      <q-page class="q-pa-md">
        <q-table
          :rows="itemsWithTotal"
          :columns="columns"
          row-key="id"
          :loading="loading"
          v-model:pagination="pagination"
          @request="onRequest"
          class="my-stretch-table fixed-header-table"
          flat
          bordered
          :rows-per-page-options="DEFAULT_OPTIONS_ROWS_PER_PAGE"
        >
          <template v-slot:body-cell="{ row, col }">
            <q-td :class="{ 'q-tr--totals': row.id === '__totalsRow' }">
              <template v-if="row.id === '__totalsRow'">
                <q-select
                  v-if="col.type == 'currency'"
                  v-model="selectedCurrency[col.name]"
                  :options="currencyOptions[col.name]"
                  dense
                  outlined
                >
                  <q-tooltip class="select-tooltip">
                    Totais por moeda
                  </q-tooltip>
                  <template v-slot:option="scope">
                    <q-item
                      :clickable="true"
                      style="font-weight: bold; background: beige"
                      @click="setSelectedCurrency(scope.opt, col.name)"
                    >
                      <q-item-section>
                        {{ scope.opt.label }}
                        <q-tooltip class="select-tooltip">
                          {{ scope.opt.currencyName }}
                        </q-tooltip>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </template>
              <template v-else>
                {{ row[col.field] }}
              </template>
            </q-td>
          </template>
        </q-table>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { useQuasar } from 'quasar';
import { ListService } from 'src/services/pages/ListService';
import { ListColumn } from 'src/interface/components/ListColumn';
import 'src/css/pages/list/list.css';
import 'src/css/pages/list/filter.css';
import 'src/css/pages/list/totals.css';
import {
  DEFAULT_ORDER_MODE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_OPTIONS_ROWS_PER_PAGE,
} from 'src/app.constants';
import { FormatOutputHelper } from 'src/helper/format/FormatOutputHelper';
import { TotalCurrency } from 'src/interface/TotalCurrency';
import ListFilter from '../ListFilter.vue';
import ToolbarComponent from 'src/components/ToolbarComponent.vue';

export default defineComponent({
  components: {
    ListFilter,
    ToolbarComponent,
  },
  props: {
    entity: {
      type: String,
      required: true,
    },
  },
  computed: {
    itemsWithTotal() {
      if (!this.items.length) return [];

      if (!this.columns.find((col) => col.type === 'currency'))
        return [...this.items];

      const totalsRow = this.calculateTotals();

      Object.keys(this.currencyOptions).forEach((key) => {
        this.setSelectedCurrency(this.currencyOptions[key][0], key);
      });

      return [...this.items, totalsRow];
    },
  },

  setup(props) {
    const service = new ListService(props.entity);

    const listFilterRef = ref(null);

    const $q = useQuasar();
    const hideFilter = ref(false);
    const items = ref<[]>([]);
    const columns = ref<ListColumn[]>([]);
    const loading = ref(false);
    const totalPages = ref(0);
    const closeFilter = ref(null);
    const showFilter = ref(false);

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

    async function onRequest(props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination;
      pagination.value = {
        ...pagination.value,
        page,
        rowsPerPage,
        sortBy,
        descending,
      };
      listFilterRef.value.applyFilters();
    }

    onMounted(async () => {
      $q.loading.show();
      try {
        await loadColumns();
        await loadItems();
        await listFilterRef.value.loadFilters();
        closeFilter.value(true);
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

    const selectedCurrency = reactive({});
    const totalsRow = reactive({});
    const currencyOptions = reactive({});

    return {
      items,
      pagination,
      columns,
      loading,
      hideFilter,
      onRequest,
      totalPages,
      selectedCurrency,
      totalsRow,
      currencyOptions,
      listFilterRef,
      service,
      loadItems,
      DEFAULT_OPTIONS_ROWS_PER_PAGE,
      closeFilter,
      showFilter,
    };
  },

  watch: {
    items: {
      immediate: true,
      handler() {
        this.calculateTotals();
      },
    },
  },

  methods: {
    setHideFilter(hide: boolean) {
      this.hideFilter = hide;
      this.showFilter = !hide;
    },

    setCurrencyOptions() {
      const options = {};
      this.columns.forEach((col) => {
        if (col.type === 'currency' && this.totalsRow[col.name]) {
          const totals = this.totalsRow[col.name].contents;
          options[col.name] = totals.map((total) => ({
            label: `${total.totalValue} (${total.currency})`,
            value: total.currency,
            currencyName: total.currencyName,
          }));
        }
      });

      this.currencyOptions = options;
    },

    calculateTotals() {
      if (!this.columns.find((col) => col.type === 'currency')) return;

      const newTotalsRow = { ...this.totalsRow };
      this.columns.forEach((col) => {
        if (col.type !== 'currency') {
          newTotalsRow[col.name] = '';
          return;
        }

        const calcTotalCol = this.calculateTotalForColumn(col.name);

        newTotalsRow[col.name] = {
          contents: calcTotalCol,
        };
      });

      newTotalsRow['id'] = '__totalsRow';
      this.totalsRow = newTotalsRow;

      this.setCurrencyOptions();

      return newTotalsRow;
    },

    calculateTotalForColumn(columnName: string) {
      const totals: TotalCurrency = {};
      const currencies: { [key: string]: string } = {};

      this.items.forEach((item) => {
        if (!totals[item['currency']]) totals[item['currency']] = 0;
        totals[item['currency']] += this.parseCurrencyToNumber(
          item[columnName]
        );
        currencies[item['currency']] = item['currencyName'];
      });

      return Object.keys(totals).map((key) => ({
        totalValue: FormatOutputHelper.formatCurrency(totals[key], key),
        currency: key,
        currencyName: currencies[key],
      }));
    },

    parseCurrencyToNumber(value: string): number {
      if (!value) return 0;
      const cleanedValue = value.replace(/[^\d,]/g, '').replace(',', '.');
      return parseFloat(cleanedValue);
    },

    setSelectedCurrency(option, fieldKey) {
      if (!this.selectedCurrency) this.selectedCurrency = {};

      this.selectedCurrency[fieldKey] = {
        ...option,
        label: option.label.replace(`(${option.value})`, ''),
      };
    },
  },

  mounted() {
    this.closeFilter = this.setHideFilter;
  },
});
</script>
