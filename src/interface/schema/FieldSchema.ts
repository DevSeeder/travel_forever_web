export interface FieldSchema {
  key: string;
  label: string;
  required: boolean;
  type: string;
  hidden: boolean;
  order: number;
  orderBy: boolean;
  grid?: boolean;
  filter?: boolean;
  allowed: {
    search?: boolean;
    update?: boolean;
  };
  translation: {
    fieldLabel: string;
    fieldPlaceholder: string;
    fieldTooltip: string;
  };
}
