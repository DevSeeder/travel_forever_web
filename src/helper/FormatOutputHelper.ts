import { FieldSchema } from 'src/interface/schema/FieldSchema';
import { DateHelper } from './DateHelper';

export class FormatOutputHelper<Item> {
  constructor(private readonly fields: FieldSchema[]) {}

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
        case 'datetime':
          output[field.key] = DateHelper.formatDate(item[field.key]);
          break;
        case 'externalId':
          output[field.key] = item[field.key]['value'];
          break;
        case 'decimal':
        case 'float':
        case 'double':
          const decimalFormat = new Intl.NumberFormat('pt-BR', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          output[field.key] = decimalFormat.format(item[field.key]);
          break;
        case 'currency':
          const currencyFormat = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          });
          output[field.key] = currencyFormat.format(item[field.key]);
          break;
      }
    });
    return output;
  }
}
