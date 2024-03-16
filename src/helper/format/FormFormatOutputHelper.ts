import { FieldSchema } from 'src/interface/schema/FieldSchema';
import { FormatOutputHelper } from './FormatOutputHelper';
import { DateHelper } from '../DateHelper';

export class FormFormatOutputHelper<Item> extends FormatOutputHelper<Item> {
  constructor(fields: FieldSchema[]) {
    super(fields);
  }

  formatOutputItem(item) {
    const originalItem = { ...item };
    const output = super.formatOutputItem(item);
    this.fields.forEach((field) => {
      if (field.type == 'date')
        output[field.key] = DateHelper.formatDate(
          originalItem[field.key],
          'YYYY-MM-DD'
        );

      if (field.type == 'datetime')
        output[field.key] = DateHelper.formatDate(
          originalItem[field.key],
          'YYYY-MM-DD HH:mm'
        );

      if (field.type == 'boolean') output[field.key] = item[field.key] || false;
    });
    return output;
  }

  formatObjectField(item) {
    // const output = item;
    // this.fields.forEach((field) => {
    //   if (field.key.indexOf('.') == -1) return;
    //   const splitKey = field.key.split('.');
    //   const parentKey = this.fields.find((parKey) => parKey.key == splitKey[0]);
    //   if (!parentKey) return;
    //   if (parentKey.type == 'array') {
    //     if (!item[parentKey.key].length) {
    //       output[field.key] = null;
    //       return;
    //     }
    //     let itemGrid;
    //     itemGrid = itemGrid || item[parentKey.key][0];
    //     output[field.key] = itemGrid[splitKey[1]];
  }
}
