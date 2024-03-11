import { storageService } from '../storage/StorageService';
import { ListColumnBuilder } from 'src/builders/ListColumnBuilder';
import { ListColumn } from 'src/interface/components/ListColumn';
import { PaginatedResponse } from 'src/interface/PaginatedResponse';
import { EntitySchema, FormResponse } from 'src/interface/schema/FormResponse';
import { ClientTravelForeverService } from '../client/ClientTravelForeverService';
import store from 'src/store';
import { FieldSchema } from 'src/interface/schema/FieldSchema';
import { FormatOutputHelper } from 'src/helper/format/FormatOutputHelper';
import { ListInputFilterBuilder } from 'src/builders/ListInputFilterBuilder';
import { ListInputFilter } from 'src/interface/components/ListInputFilter';
import { GridFormatOutputHelper } from 'src/helper/format/GridFormatOutputHelper';

export class ListService<Item> {
  private clientService: ClientTravelForeverService;
  private fields: FieldSchema[];

  constructor(private readonly entity: string) {
    this.clientService = new ClientTravelForeverService(
      store.getters['auth/token']
    );
  }

  async loadColumns(): Promise<ListColumn[]> {
    const fieldsData: FormResponse = await storageService.getValue(
      `${this.entity}_fields`,
      `/${this.entity}/form/fields`
    );
    this.fields = fieldsData.fields;
    return ListColumnBuilder.buildColumns(fieldsData.fields);
  }

  async loadMeta(): Promise<EntitySchema> {
    const metaData: FormResponse = await storageService.getValue(
      `${this.entity}_fields`,
      `/${this.entity}/form/fields`
    );
    return metaData.entityRefs;
  }

  async loadItems(params = {}): Promise<PaginatedResponse<Item>> {
    const response = await this.clientService.search(this.entity, params);
    response.data.items = this.formatOutput(response.data.items);
    return response.data;
  }

  async loadFilters(): Promise<ListInputFilter[]> {
    const fieldsData: FormResponse = await storageService.getValue(
      `${this.entity}_fields`,
      `/${this.entity}/form/fields`
    );
    this.fields = fieldsData.fields;
    return ListInputFilterBuilder.buildFilters(fieldsData.fields);
  }

  private formatOutput(items: Item[]) {
    const formatHelper = new GridFormatOutputHelper(this.fields);
    return formatHelper.formatOutputItems(items);
  }
}
