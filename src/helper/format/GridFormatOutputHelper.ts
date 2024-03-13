import { FieldSchema } from 'src/interface/schema/FieldSchema';
import { ListFormatOutputHelper } from './ListFormatOutputHelper';

export class GridFormatOutputHelper<Item> extends ListFormatOutputHelper<Item> {
  constructor(fields: FieldSchema[]) {
    super(fields);
  }
}
