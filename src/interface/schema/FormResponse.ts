import { FieldSchema } from './FieldSchema';

export interface FormResponse {
  fields: FieldSchema[];
  entityRefs: EntitySchema;
}

export interface EntitySchema {
  translations: EntityTranslation;
  metaList?: {
    defaultOrderField?: string;
    defaultOrderMode?: string;
    defaultPageSize?: number;
  };
}

export interface EntityTranslation {
  entityLabel: string;
  itemLabel: string;
  entityDescription: string;
  listLabel?: string;
}
