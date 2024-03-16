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
        <div class="row q-col-gutter-md">
          <q-card
            v-for="item in items"
            :key="item.id"
            class="my-travel-card flex row no-wrap"
          >
            <q-img
              class="card-banner"
              :src="item.image"
              alt="Imagem da viagem"
            ></q-img>

            <q-card-section class="card-content">
              <div class="text-h6 card-title" v-text="item.title"></div>
              <div
                class="text-subtitle1 q-mt-xs"
                v-for="subtitle in item.subtitles"
                :key="subtitle"
              >
                {{ subtitle }}
              </div>
            </q-card-section>
            <!-- Adicione outras seções ou ações conforme necessário -->
          </q-card>
        </div>
        <!-- Paginação, se necessário, pode ser adicionada aqui -->
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import 'src/css/pages/list/filter.css';
import { defineComponent, onMounted, ref } from 'vue';
import { QCard, QCardSection, QImg, useQuasar } from 'quasar';
import ListFilter from '../ListFilter.vue';
import ToolbarComponent from 'src/components/ToolbarComponent.vue';
import { useCustomLoading } from 'src/composable/useCustomLoading';
import { CardService } from 'src/services/pages/list/CardService';

export default defineComponent({
  components: {
    ListFilter,
    ToolbarComponent,
    QCard,
    QCardSection,
    QImg,
  },
  props: {
    entity: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const service = new CardService(props.entity);
    const listFilterRef = ref(null);
    const $q = useQuasar();
    const { showLoading, hideLoading } = useCustomLoading($q);
    const hideFilter = ref(false);
    const items = ref([]);
    const loading = ref(false);
    const showFilter = ref(true);

    async function loadItems(params = {}) {
      showLoading();
      try {
        const response = await service.loadItems(params);
        items.value = response.items;
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        $q.notify({
          color: 'negative',
          message: `Falha ao carregar os dados: ${err}`,
        });
      } finally {
        hideLoading();
      }
    }

    onMounted(async () => {
      await loadItems();
      await listFilterRef.value.loadFilters();
    });

    return {
      items,
      hideFilter,
      loading,
      listFilterRef,
      service,
      loadItems,
      showFilter,
    };
  },
  methods: {
    setHideFilter(hide: boolean) {
      this.hideFilter = hide;
      this.showFilter = !hide;
    },
  },
});
</script>

<style scoped>
.my-travel-card {
  border-radius: 10px;
  overflow: hidden;
  margin: 10px;
  width: 100%;
  padding-left: 0;
  padding-top: 0;
  color: #444444;
  height: 175px;
}

.card-banner {
  width: 150px;
  height: 100%;
  object-fit: cover;
}

.card-content {
  padding-left: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #444444;
}

.card-title {
  color: #504d4d;
  font-weight: bold;
  font-family: Rubik, Arial, sans-serif;
}

.text-subtitle {
  color: #666666;
  font-weight: bold;
}
</style>
src/services/pages/list/ListService
