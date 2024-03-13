import { ListService } from './ListService';
import { GridFormatOutputHelper } from 'src/helper/format/GridFormatOutputHelper';

export class TableService extends ListService<any> {
  constructor(protected readonly entity: string) {
    super(entity);
  }

  protected async formatOutput(items) {
    const formatHelper = new GridFormatOutputHelper(await this.getFields());
    return formatHelper.formatOutputItems(items);
  }
}
