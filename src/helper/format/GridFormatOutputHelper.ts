import { FieldSchema } from 'src/interface/schema/FieldSchema';
import { FormatOutputHelper } from './FormatOutputHelper';

export class GridFormatOutputHelper<Item> extends FormatOutputHelper<Item> {
  constructor(fields: FieldSchema[]) {
    super(fields);
  }

  formatOutputItem(item) {
    const output = item;
    this.fields.forEach((field) => {
      if (field.key.indexOf('.') == -1) return;

      const splitKey = field.key.split('.');
      const parentKey = this.fields.find((parKey) => parKey.key == splitKey[0]);

      if (!parentKey) return;

      if (parentKey.type == 'array') {
        if (!item[parentKey.key].length) {
          output[field.key] = null;
          return;
        }

        let itemGrid;
        const gridConditions = field?.webTemplate?.grid?.subItemCondition;
        if (gridConditions) {
          itemGrid = item[parentKey.key].find((subItem) => {
            let filterFlag = true;
            Object.keys(gridConditions).forEach((condKey) => {
              if (subItem[condKey] != gridConditions[condKey])
                filterFlag = false;
            });
            return filterFlag;
          });
        }

        itemGrid = itemGrid || item[parentKey.key][0];
        output[field.key] = itemGrid[splitKey[1]];
      }
    });
    return super.formatOutputItem(item);
  }
}
