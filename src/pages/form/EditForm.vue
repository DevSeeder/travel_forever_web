<template>
  <ToolbarComponent
    :showFilterButton="false"
    :entity="$props.entity"
    :action="'edit'"
  ></ToolbarComponent>
  <q-page class="q-pa-md main-container">
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <div
        v-for="field in fields"
        :key="field.key"
        class="q-mr-md q-mb-md filter-field"
      >
        <q-input
          v-if="InputTypes.Text.includes(field.type)"
          v-model="item[field.key]"
          :label="field.translation.fieldLabel"
          dense
          class="custom-border"
        />
        <q-input
          v-else-if="InputTypes.Date.includes(field.type)"
          v-model="item[field.key]"
          :label="field.translation.fieldLabel"
          dense
          class="custom-border"
          type="date"
        />
        <q-input
          v-else-if="InputTypes.Number.includes(field.type)"
          v-model="item[field.key]"
          :label="field.translation.fieldLabel"
          dense
          type="number"
        />
        <!-- `selectRef_${field.key}` -->
        <q-select
          v-else-if="InputTypes.Select.includes(field.type)"
          v-model="item[field.key]"
          :class="`select_field_${field.key}`"
          ref="selectRefs"
          :options="
            (field.values ?? []).map((opt) => ({
              label: opt.name,
              value: opt._id,
              icon: opt?.icon?.value,
            }))
          "
          :label="field.translation.fieldLabel"
          outlined
          class="custom-border"
        >
          <template v-slot:option="scope">
            <q-item
              :clickable="true"
              :class="{
                'selected-item':
                  rawItem[field.key] &&
                  rawItem[field.key]._id == scope.opt.value,
              }"
              @click="toggleSelection(field.key, scope.opt)"
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
          v-else-if="InputTypes.Toggle.includes(field.type)"
          v-model="item[field.key]"
          :label="field.translation.fieldLabel"
          :disable="false"
          true
          color="blue"
          @update:model-value="(value) => {}"
        />
        <q-input
          v-else-if="InputTypes.Datetime.includes(field.type)"
          filled
          v-model="item[field.key]"
          type="datetime-local"
          :label="field.translation.fieldLabel"
        />
        <div
          class="editable-link q-field__control"
          v-else-if="InputTypes.Link.includes(field.type)"
        >
          <label class="q-field__label label-link">{{
            field.translation.fieldLabel
          }}</label>
          <div v-if="isEditing">
            <q-btn
              flat
              icon="done"
              @click.stop="saveLink"
              style="color: green"
            ></q-btn>
            <q-input
              style="width: 95%; float: right"
              v-model="item[field.key]"
              dense
              @keyup.enter="saveLink"
            />
          </div>
          <div v-else @click="editLink" class="cursor-pointer">
            <q-btn
              flat
              icon="edit"
              @click.stop="editLink"
              style="color: black"
            ></q-btn>
            <a :href="item[field.key]" target="_blank">{{ item[field.key] }}</a>
          </div>
        </div>
        <div v-else-if="field.array && field.type == 'file'">
          <div>
            <q-file
              ref="fileInput"
              v-model="tempFiles[field.key]"
              multiple
              label="Escolha os arquivos"
              filled
              use-chips
              @update:model-value="() => addFiles(field.key)"
              style="margin-bottom: 20px"
            ></q-file>
            <div class="q-mt-md">
              <div v-for="(file, index) in item[field.key]" :key="index">
                <q-chip
                  outline
                  color="primary"
                  text-color="primary"
                  style="cursor: pointer"
                >
                  <div @click="downloadFile(file)">
                    {{ file.fileName }}
                  </div>
                  <q-icon
                    name="cancel"
                    class="cursor-pointer"
                    @click="dialogVisible = true"
                  />
                  <ConfirmDialog
                    v-model="dialogVisible"
                    message="Você tem certeza que deseja remover este item?"
                    @confirm="removeFile(file, field.key, index)"
                  />
                </q-chip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </q-form>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import 'src/css/pages/form/form.css';
import ToolbarComponent from 'src/components/ToolbarComponent.vue';
import ConfirmDialog from 'src/components/ConfirmDialog.vue';
import { FormService } from 'src/services/pages/FormService';
import { useQuasar } from 'quasar';
import { useCustomLoading } from 'src/composable/useCustomLoading';
import { ObjectHelper } from 'src/helper/types/ObjectHelper';
import { InputTypes } from '../../app.constants';
import { SupabaseFile } from 'src/interface/SupabaseFile';
import supabase from 'src/boot/supabaseClient';

export default defineComponent({
  name: 'EditForm',
  components: {
    ToolbarComponent,
    ConfirmDialog,
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
  methods: {
    toggleSelection(fieldKey, option) {
      if (!this.rawItem[fieldKey]) this.rawItem[fieldKey] = {};
      this.rawItem[fieldKey]._id = option.value;
      this.item[fieldKey] = option.label;
      (
        document.querySelector(
          `.select_field_${fieldKey} .q-icon.notranslate.material-icons.q-select__dropdown-icon`
        ) as any
      ).click();
    },
    addFiles(fieldKey) {
      if (!Array.isArray(this.item[fieldKey])) {
        this.item[fieldKey] = [];
      }

      this.uploadFiles(fieldKey);

      this.tempFiles[fieldKey] = [];
    },
    async uploadFiles(fieldKey) {
      this.tempFiles[fieldKey].forEach(async (file) => {
        const fileExt = file.name.split('.').pop();
        const originalFileName = file.name.split('.').shift();
        const fileName = `${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const filePath = `${fieldKey}/${fileName}`;

        const uploadRes = await supabase.storage
          .from(process.env.TRAVEL_FOREVER_API_STORAGE_SUPABASE_BUCKET_NAME)
          .upload(filePath, file);

        if (uploadRes.error) {
          console.error('Erro no upload:', uploadRes.error);
          return;
        }

        this.item[fieldKey].push({
          type: 'supabase',
          fileName: originalFileName,
          extension: fileExt,
          data: uploadRes.data,
          uploadDate: new Date(),
          inactivateDate: null,
          active: true,
        });
      });
    },
    async downloadFile(file: SupabaseFile): Promise<void> {
      try {
        console.log('downloadFile');
        console.log(file);
        const key = file.data.path;
        const { data, error } = await supabase.storage
          .from(process.env.TRAVEL_FOREVER_API_STORAGE_SUPABASE_BUCKET_NAME)
          .download(key);

        if (error) {
          throw error;
        }

        if (data) {
          const url = URL.createObjectURL(data);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${file.fileName}.${file.extension}`;
          document.body.appendChild(a);
          a.click();

          URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      } catch (error) {
        console.error('Erro ao fazer download do arquivo:', error);
      }
    },
    async removeFile(file, fieldKey, index) {
      const { data, error } = await supabase.storage
        .from(process.env.TRAVEL_FOREVER_API_STORAGE_SUPABASE_BUCKET_NAME)
        .remove([file.data.path]);

      if (error) {
        console.error('Erro ao remover o arquivo:', error);
        return;
      }

      this.item[fieldKey].splice(index, 1);

      console.log('Arquivo removido com sucesso:', data);
    },
  },

  setup(props) {
    const service = new FormService(props.entity);
    const mySelect = ref(null);
    const fields = ref([]);
    const item = ref({});
    const originalItem = ref({});
    const rawItem = ref({});
    const selectRefs = ref({});
    const tempFiles = ref({});
    const $q = useQuasar();
    const dialogVisible = ref(false);
    const { showLoading, hideLoading } = useCustomLoading($q);

    const isEditing = ref(false);

    const editLink = () => {
      isEditing.value = true;
    };

    const saveLink = () => {
      isEditing.value = false;
      // Aqui você pode emitir um evento ou fazer uma chamada API para salvar o novo link
      // Por exemplo: emit('update:to', editableLink.value);
    };

    async function onSubmit() {
      $q.loading.show();
      const diffItem = ObjectHelper.diffObject(originalItem.value, item.value);
      fields.value.forEach((field) => {
        if (!diffItem[field.key]) return;

        if (field.type == 'externalId')
          diffItem[field.key] = rawItem.value[field.key]._id;

        if (field.type == 'datetime')
          diffItem[field.key] = `${diffItem[field.key]}-03:00`;
      });

      if (!diffItem) {
        $q.loading.hide();
        $q.notify({
          color: 'green-4',
          textColor: 'white',
          icon: 'done',
          message: 'Registro alterado com sucesso!',
        });
        return;
      }

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

      await loadItem();
    }

    function onReset() {
      item.value = { ...originalItem.value };
    }

    onMounted(async () => {
      try {
        showLoading();
        await loadColumns();
        await loadItem();
        hideLoading();
      } catch (err) {
        hideLoading();
        $q.notify({
          color: 'red-5',
          textColor: 'white',
          icon: 'warning',
          message: JSON.stringify(err),
        });
      }
    });

    async function loadColumns() {
      fields.value = await service.loadFields();
      // fields.value
      //   .filter((field) => field.type === 'externalId')
      //   .forEach((field) => {
      //     selectRefs.value[field.key] = {};
      //   });
    }

    async function loadItem() {
      const response = await service.loadItem(props.id);
      if (!response.success) {
        $q.notify({
          color: 'red-5',
          textColor: 'white',
          icon: 'warning',
          message: JSON.stringify(response.data),
        });
        return;
      }
      item.value = response.data['item'];
      originalItem.value = { ...(response.data['item'] as object) };
      rawItem.value = { ...(response.data['rawItem'] as object) };
    }

    return {
      item,
      fields,
      onSubmit,
      onReset,
      InputTypes,
      rawItem,
      selectRefs,
      mySelect,
      isEditing,
      editLink,
      saveLink,
      tempFiles,
      dialogVisible,
    };
  },
});
</script>
