<!-- eslint-disable vue/no-mutating-props -->
<template>
  <q-drawer show-if-above v-model="openFilters" side="left" bordered>
    <div class="filters-container q-pa-md">
      <q-btn
        flat
        round
        dense
        class="close-btn"
        icon="close"
        @click="closeDrawer"
      />
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
      <div class="filter-title"></div>
      <div class="btn-side-filter btn-side-container">
        <q-btn
          class="q-mb-md full-width btn-side-filter"
          style="background: #ffffff1f !important"
          color="primary"
          icon-right="filter_list"
          label="Aplicar Filtros"
          @click="applyFilters"
        />
        <q-btn
          class="q-mb-md full-width btn-side-filter"
          style="background: lightgray !important; color: black !important"
          color="grey"
          icon-right="refresh"
          label="Resetar"
          @click="resetFilters"
        />
      </div>
    </div>
  </q-drawer>
</template>

<script lang="ts">
import { useQuasar } from 'quasar';
import { ListService } from 'src/services/pages/list/ListService';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'ListFilter',
  props: {
    service: ListService,
    loadItems: Function,
    hideFilters: {
      type: Boolean,
    },
  },
  computed: {
    openFilters() {
      return !this.hideFilters;
    },
  },
  methods: {
    toggleSelection(filterKey, option) {
      let filters = this.activeFilters[filterKey];

      if (!this.activeFilters[filterKey]) filters = [];

      const index = filters.indexOf(option);

      if (index === -1) filters.push(option);
      else filters.splice(index, 1);

      this.activeFilters[filterKey] = filters;
    },
  },

  setup(props, { emit }) {
    const $q = useQuasar();
    const activeFilters = ref({});
    const filterFields = ref([]);

    function closeDrawer() {
      emit('update:setHideFilter');
    }

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
      await props.loadItems(filterParams);
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

    async function applyBooleanFilters(key: string, value: boolean) {
      const oppositeKey = key.endsWith('_ne')
        ? key.replace('_ne', '')
        : `${key}_ne`;

      if (value === true) {
        activeFilters.value[key] = true;
        activeFilters.value[oppositeKey] = false;
      } else activeFilters.value[key] = false;

      await applyFilters();
    }

    async function loadFilters() {
      filterFields.value = await props.service.loadFilters();
    }

    function getDisableBoolean(key: string): boolean {
      const oppositeKey = key.endsWith('_ne')
        ? key.replace('_ne', '')
        : `${key}_ne`;
      return activeFilters[oppositeKey] === true;
    }

    return {
      activeFilters,
      filterFields,
      applyFilters,
      resetFilters,
      applyBooleanFilters,
      loadFilters,
      getDisableBoolean,
      closeDrawer,
    };
  },
});
</script>
src/services/pages/list/ListService
