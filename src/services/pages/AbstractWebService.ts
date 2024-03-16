import { FieldSchema } from 'src/interface/schema/FieldSchema';
import { ClientTravelForeverService } from '../client/ClientTravelForeverService';
import { storageService } from '../storage/StorageService';
import { EntitySchema, FormResponse } from 'src/interface/schema/FormResponse';
import store from 'src/store';

export abstract class AbstractWebService {
  protected clientService: ClientTravelForeverService;
  protected fields: FieldSchema[] = [];

  constructor(protected readonly entity: string) {
    this.clientService = new ClientTravelForeverService(
      store.getters['auth/token']
    );
  }

  async loadMeta(): Promise<EntitySchema> {
    const metaData: FormResponse = await storageService.getValue(
      `${this.entity}_fields`,
      `/${this.entity}/form/fields`
    );
    return metaData.entityRefs;
  }

  protected async getFields(): Promise<FieldSchema[]> {
    if (this.fields.length) return this.fields;

    const fieldsData: FormResponse = await storageService.getValue(
      `${this.entity}_fields`,
      `/${this.entity}/form/fields`
    );
    this.fields = fieldsData.fields;
    return this.fields;
  }
}
