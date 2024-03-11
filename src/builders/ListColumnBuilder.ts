import { FieldSchema } from 'src/interface/schema/FieldSchema';
import { ListColumn } from 'src/interface/components/ListColumn';

export class ListColumnBuilder {
  static buildColumns(items: FieldSchema[]): ListColumn[] {
    return items
      .filter((item) => item?.webTemplate?.grid?.show)
      .map((item) => ListColumnBuilder.buildColumn(item));
  }

  static buildColumn(item: FieldSchema): ListColumn {
    return {
      name: item.key,
      field: item.key,
      label: item.translation.fieldLabel,
      align: 'center',
      sortable: item.orderBy,
      headerClasses: 'my-custom-header',
      classes: 'my-custom-cell',
      type: item.type,
    };
  }
}
