import { storageService } from '../storage/StorageService';
import { EntitySchema, FormResponse } from 'src/interface/schema/FormResponse';

export abstract class AbstractWebService {
  constructor(protected readonly entity: string) {}

  async loadMeta(): Promise<EntitySchema> {
    const metaData: FormResponse = await storageService.getValue(
      `${this.entity}_fields`,
      `/${this.entity}/form/fields`
    );
    return metaData.entityRefs;
  }
}
