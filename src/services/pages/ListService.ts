import { storageService } from '../storage/StorageService';
import { ListColumnBuilder } from 'src/builders/ListColumnBuilder';
import { ListColumn } from 'src/interface/ListColumn';
import { PaginatedResponse } from 'src/interface/PaginatedResponse';
import { FormResponse } from 'src/interface/schema/FormResponse';
import { ClientTravelForeverService } from '../client/ClientTravelForeverService';
import store from 'src/store';
import { FieldSchema } from 'src/interface/schema/FieldSchema';
import { DateHelper } from 'src/helper/DateHelper';

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
      `${this.entity}_form_search`,
      `/${this.entity}/form/search`
    );
    this.fields = fieldsData.fields;
    return ListColumnBuilder.buildColumns(fieldsData.fields);
  }

  async loadItems(): Promise<PaginatedResponse<Item>> {
    const response = await this.clientService.search(this.entity);
    response.data.items = this.formatOutputItems(response.data.items);
    return response.data;
  }

  formatOutputItems(items: Item[]): Item[] {
    return items.map((item) => this.formatOutputItem(item));
  }

  formatOutputItem(item: Item): Item {
    const output: Item = item;
    this.fields.forEach((field) => {
      if (!Object(item).hasOwnProperty([field.key]) || !field.key.length)
        return;

      switch (field.type) {
        case 'date':
        case 'datetime':
          output[field.key] = DateHelper.formatDate(item[field.key]);
          break;
      }
    });
    return output;
  }
}
