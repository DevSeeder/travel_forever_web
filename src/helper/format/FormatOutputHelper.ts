import { FieldSchema } from 'src/interface/schema/FieldSchema';
import { DateHelper } from '../DateHelper';

export class FormatOutputHelper<Item> {
  constructor(protected readonly fields: FieldSchema[]) {}

  formatOutputItems(items: Item[]): Item[] {
    return items.map((item) => this.formatOutputItem(item));
  }

  formatOutputItem(item) {
    const output = item;
    this.fields.forEach((field) => {
      if (!Object(item).hasOwnProperty([field.key]) || !field.key.length)
        return;
      switch (field.type) {
        case 'date':
          output[field.key] = DateHelper.formatDate(
            item[field.key],
            'DD/MM/YYYY'
          );
          break;
        case 'datetime':
          output[field.key] = DateHelper.formatDate(
            item[field.key],
            'DD/MM/YYYY HH:mm'
          );
          break;
        case 'externalId':
          if (field.key == 'currency') {
            output['currencyName'] = item[field.key]['translated'];
            output[field.key] = item[field.key]['code'];
          } else output[field.key] = item[field.key]['value'];
          break;
        case 'decimal':
        case 'float':
        case 'double':
          output[field.key] = FormatOutputHelper.formatDecimal(item[field.key]);
          break;
        case 'currency':
          output[field.key] = FormatOutputHelper.formatCurrency(
            item[field.key],
            item['currency']['code']
          );
          break;
      }
    });
    return output;
  }

  static formatCurrency(value, currency: string): string {
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency,
      }).format(value);
    } catch (err) {
      return FormatOutputHelper.formatDecimal(value);
    }
  }

  static formatDecimal(value): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
}
