import { CardFormatOutputHelper } from 'src/helper/format/CardFormatOutputHelper';
import { ListService } from './ListService';

export class CardService extends ListService<any> {
  constructor(protected readonly entity: string) {
    super(entity);
  }

  protected async formatOutput(items) {
    const formatHelper = new CardFormatOutputHelper(await this.getFields());
    return formatHelper.formatOutputItems(items);
  }
}
