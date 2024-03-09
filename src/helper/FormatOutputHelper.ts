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
      }
    });
    return output;
  }
}
