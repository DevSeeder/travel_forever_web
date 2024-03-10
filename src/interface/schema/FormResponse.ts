import { FieldSchema } from './FieldSchema';

export interface FormResponse {
  fields: FieldSchema[];
  entityRefs: EntitySchema;
}

export interface EntitySchema {
  metaList?: {
    defaultOrderField?: string;
    defaultOrderMode?: string;
    defaultPageSize?: number;
  };
}
