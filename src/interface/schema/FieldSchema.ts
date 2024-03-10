export interface FieldSchema {
  key: string;
  label: string;
  required: boolean;
  type: string;
  hidden: boolean;
  order: number;
  orderBy: boolean;
  grid?: boolean;
  filter?: {
    direct: boolean;
    operations: string[];
  };
  allowed: {
    search?: boolean;
    update?: boolean;
  };
  translation: {
    fieldLabel: string;
    fieldPlaceholder: string;
    fieldTooltip: string;
  };
  values?: {
    _id: string;
    name: string;
    icon?: {
      type: string;
      value: string;
    };
  }[];
}
