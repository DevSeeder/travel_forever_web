import { FieldSchema } from 'src/interface/schema/FieldSchema';
import { ListInputFilter } from 'src/interface/components/ListInputFilter';

export class ListInputFilterBuilder {
  static buildFilters(items: FieldSchema[]): ListInputFilter[] {
    return items
      .filter((item) => item?.filter)
      .map((item) => ListInputFilterBuilder.buildFilter(item));
  }

  static buildFilter(item: FieldSchema): ListInputFilter {
    return {
      key: item.key,
      label: item.translation.fieldLabel,
      type: item.type,
    };
  }
}
