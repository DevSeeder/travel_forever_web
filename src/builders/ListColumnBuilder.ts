import { FieldSchema } from 'src/interface/schema/FieldSchema';
import { ListColumn } from 'src/interface/ListColumn';

export class ListColumnBuilder {
  static buildColumns(items: FieldSchema[]): ListColumn[] {
    return items
      .filter((item) => item.grid)
      .map((item) => ListColumnBuilder.buildColumn(item));
  }

  static buildColumn(item: FieldSchema): ListColumn {
    return {
      name: item.key,
      field: item.key,
      label: item.label,
      align: 'center',
      sortable: item.orderBy,
      headerClasses: 'my-custom-header',
      classes: 'my-custom-cell',
    };
  }
}
