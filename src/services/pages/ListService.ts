import { storageService } from '../storage/StorageService';
import { ListColumnBuilder } from 'src/builders/ListColumnBuilder';
import { ListColumn } from 'src/interface/ListColumn';
import { PaginatedResponse } from 'src/interface/PaginatedResponse';
import { FormResponse } from 'src/interface/schema/FormResponse';
import { ClientTravelForeverService } from '../client/ClientTravelForeverService';
import store from 'src/store';

export class ListService<Item> {
  private clientService: ClientTravelForeverService;

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

    return ListColumnBuilder.buildColumns(fieldsData.fields);
  }

  async loadItems(): Promise<PaginatedResponse<Item>> {
    const response = await this.clientService.search(this.entity);
    return response.data;
  }
}
