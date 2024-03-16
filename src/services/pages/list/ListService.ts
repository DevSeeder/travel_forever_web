import { storageService } from '../../storage/StorageService';
import { ListColumnBuilder } from 'src/builders/ListColumnBuilder';
import { ListColumn } from 'src/interface/components/ListColumn';
import { PaginatedResponse } from 'src/interface/PaginatedResponse';
import { FormResponse } from 'src/interface/schema/FormResponse';
import { ListInputFilterBuilder } from 'src/builders/ListInputFilterBuilder';
import { ListInputFilter } from 'src/interface/components/ListInputFilter';
import { AbstractWebService } from '../AbstractWebService';

export class ListService<Item> extends AbstractWebService {
  constructor(protected readonly entity: string) {
    super(entity);
  }

  async loadColumns(): Promise<ListColumn[]> {
    const fieldsData: FormResponse = await storageService.getValue(
      `${this.entity}_fields`,
      `/${this.entity}/form/fields`
    );
    this.fields = fieldsData.fields;
    return ListColumnBuilder.buildColumns(fieldsData.fields);
  }

  async loadItems(params = {}): Promise<PaginatedResponse<Item>> {
    const response = await this.clientService.search(this.entity, params);
    response.data.items = await this.formatOutput(response.data.items);
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

  protected async formatOutput(items: Item[]) {
    return items;
  }
}
