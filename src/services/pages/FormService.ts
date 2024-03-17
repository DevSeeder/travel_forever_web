import { storageService } from '../storage/StorageService';
import { PaginatedResponse } from 'src/interface/PaginatedResponse';
import { FormResponse } from 'src/interface/schema/FormResponse';
import { ClientTravelForeverService } from '../client/ClientTravelForeverService';
import { FieldSchema } from 'src/interface/schema/FieldSchema';
import { AbstractWebService } from './AbstractWebService';
import store from 'src/store';
import { FormFormatOutputHelper } from 'src/helper/format/FormFormatOutputHelper';
import { HttpResponseDto } from 'src/dto/response/HttpResponseDto';

export class FormService<Item> extends AbstractWebService {
  constructor(protected readonly entity: string) {
    super(entity);
    this.clientService = new ClientTravelForeverService(
      store.getters['auth/token']
    );
  }

  async loadFields(): Promise<FieldSchema[]> {
    const fieldsData: FormResponse = await storageService.getValue(
      `${this.entity}_fields`,
      `/${this.entity}/form/fields`
    );
    this.fields = fieldsData.fields.filter((field) => !field.hidden);
    return this.fields;
  }

  async loadItem(
    id: string
  ): Promise<HttpResponseDto<{ rawItem: Item; item: Item }>> {
    const response = await this.clientService.getById(this.entity, id);
    if (!response.success) return response;
    const rawItem = { ...response.data };
    response.data = await new FormFormatOutputHelper(
      await this.getFields()
    ).formatOutputItem(response.data);
    return { ...response, data: { item: response.data, rawItem } };
  }

  async updateItem(id: string, data: object): Promise<HttpResponseDto<any>> {
    return this.clientService.updateById(this.entity, id, data);
  }
}
