import { FieldSchema } from 'src/interface/schema/FieldSchema';
import { DateHelper } from './DateHelper';

export class FormatOutputHelper<Item> {
  constructor(private readonly fields: FieldSchema[]) {}

  formatOutputItems(items: Item[]): Item[] {
    return items.map((item) => this.formatOutputItem(item));
  }

  formatOutputItem(item) {
    const output = item;
    const decimalFormat = new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    let currencyFormat;
    if (item['currency'] && item['currency']['value']) {
      try {
        currencyFormat = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: item['currency']['value'],
        });
      } catch (err) {
        currencyFormat = decimalFormat;
      }
    }

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
          output[field.key] = item[field.key]['value'];
          break;
        case 'decimal':
        case 'float':
        case 'double':
          output[field.key] = decimalFormat.format(item[field.key]);
          break;
        case 'currency':
          output[field.key] = currencyFormat.format(item[field.key]);
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
      return new Intl.NumberFormat('pt-BR', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    }
  }
}
