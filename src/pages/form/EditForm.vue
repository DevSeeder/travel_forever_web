<template>
  <ToolbarComponent
    :showFilterButton="false"
    :entity="$props.entity"
    :action="'edit'"
  ></ToolbarComponent>
  <q-page class="q-pa-md">
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <div
        v-for="field in fields"
        :key="field.key"
        class="q-mr-md q-mb-md filter-field"
      >
        <q-input
          v-if="['text', 'currency'].includes(field.type)"
          v-model="item[field.key]"
          :label="field.translation.fieldLabel"
          dense
          class="custom-border"
        />
        <q-input
          v-else-if="['date', 'datetime'].includes(field.type)"
          v-model="item[field.key]"
          :label="field.translation.fieldLabel"
          dense
          class="custom-border"
          type="date"
        />
        <q-input
          v-else-if="field.type === 'number'"
          v-model="item[field.key]"
          :label="field.translation.fieldLabel"
          dense
          type="number"
        />
        <q-select
          v-else-if="field.type === 'externalId'"
          v-model="item[field.key]"
          :options="field.options"
          :label="field.translation.fieldLabel"
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
                  item[field.key] && item[field.key].includes(scope.opt.value),
              }"
            >
              <q-item-section>
                {{ scope.opt.translation.fieldLabel }}
              </q-item-section>
              <q-item-section avatar>
                <q-icon :name="scope.opt.icon" />
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-toggle
          v-else-if="field.type === 'boolean'"
          v-model="item[field.key]"
          :label="field.label"
          :disable="false"
          true
          color="blue"
          @update:model-value="(value) => {}"
        />
        {{ field.type === 'boolean' ? console.log('boolean') : null }}
        {{ field.type === 'boolean' ? console.log(field.label) : null }}
        {{ field.type === 'boolean' ? console.log(item[field.key]) : null }}
      </div>

      <div>
        <q-btn label="Salvar" type="submit" color="primary" icon-right="save" />
        <q-btn
          label="Resetar"
          icon-right="refresh"
          type="reset"
          color="primary"
          outline
          class="q-ml-md"
        />
      </div>
    </q-form>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import ToolbarComponent from 'src/components/ToolbarComponent.vue';
import { FormService } from 'src/services/pages/FormService';
import { useQuasar } from 'quasar';
import { useCustomLoading } from 'src/composable/useCustomLoading';
import { ObjectHelper } from 'src/helper/types/ObjectHelper';

export default defineComponent({
  name: 'EditForm',
  components: {
    ToolbarComponent,
  },
  props: {
    entity: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const service = new FormService(props.entity);

    const fields = ref([]);
    const item = ref({});
    const originalItem = ref({});
    const $q = useQuasar();
    const { showLoading, hideLoading } = useCustomLoading($q);

    async function onSubmit() {
      $q.loading.show();
      const diffItem = ObjectHelper.diffObject(originalItem.value, item.value);
      diffItem['symbol'] = null;

      console.log('diffItem');
      console.log(diffItem);
      const response = await service.updateItem(props.id, diffItem);

      $q.loading.hide();

      if (!response.success) {
        $q.notify({
          color: 'red-5',
          textColor: 'white',
          icon: 'warning',
          message: response.data,
        });
        return;
      }

      $q.notify({
        color: 'green-4',
        textColor: 'white',
        icon: 'done',
        message: 'Registro alterado com sucesso!',
      });
    }

    function onReset() {
      item.value = { ...originalItem.value };
    }

    onMounted(async () => {
      showLoading();
      await loadColumns();
      await loadItem();
      hideLoading();
    });

    async function loadColumns() {
      fields.value = await service.loadFields();
    }

    async function loadItem() {
      const data = await service.loadItem(props.id);
      item.value = data;
      originalItem.value = { ...data };
    }

    return {
      item,
      fields,
      onSubmit,
      onReset,
    };
  },
});
</script>
