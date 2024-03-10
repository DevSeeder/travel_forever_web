import { FieldSchema } from 'src/interface/schema/FieldSchema';
import { ListInputFilter } from 'src/interface/components/ListInputFilter';

export class ListInputFilterBuilder {
  static buildFilters(items: FieldSchema[]): ListInputFilter[] {
    const filters = [];
    items
      .filter((item) => item?.filter)
      .forEach((item) =>
        ListInputFilterBuilder.buildFilter(item).forEach((op) =>
          filters.push(op)
        )
      );

    console.log('filters');
    console.log(filters);

    return filters;
  }

  static buildFilter(item: FieldSchema): ListInputFilter[] {
    const filter = {
      label: item.translation.fieldLabel,
      type: item.type,
      options:
        item.type == 'externalId' && item.values
          ? item.values.map((item) => ({
              label: item.name,
              value: item._id,
            }))
          : [],
    };

    const filters = [];

    if (item.filter.direct) {
      filters.push({ ...filter, key: item.key });

      if (item.type === 'boolean') {
        filters.push({
          ...filter,
          label: `Somente Não ${item.translation.fieldLabel}`,
          type: item.type,
          key: `${item.key}_ne`,
        });
      }
    }

    if (!item.filter?.operations || !item.filter.operations.length)
      return filters;

    item.filter.operations.forEach((op) => {
      ListInputFilterBuilder.buildOperationFilter(
        item,
        filter,
        op,
        item.filter.operations.length
      ).forEach((opf) => filters.push(opf));
    });

    return filters;
  }

  static buildOperationFilter(
    item: FieldSchema,
    filter: Partial<ListInputFilter>,
    operation: string,
    lenght: number
  ): ListInputFilter[] {
    if (operation === 'between') {
      return [
        {
          ...filter,
          label: `${item.translation.fieldLabel} de Início`,
          type: item.type,
          key: `${item.key}_start`,
        },
        {
          ...filter,
          label: `${item.translation.fieldLabel} de Fim`,
          type: item.type,
          key: `${item.key}_end`,
        },
      ];
    }

    return [
      {
        ...filter,
        label:
          lenght > 1 || item.filter.direct
            ? `${item.translation.fieldLabel} ${operation}`
            : item.translation.fieldLabel,
        type: item.type,
        key: `${item.key}_${operation}`,
      },
    ];
  }
}
