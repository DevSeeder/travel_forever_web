import { FieldSchema } from 'src/interface/schema/FieldSchema';
import { ListFormatOutputHelper } from './ListFormatOutputHelper';

export class CardFormatOutputHelper<Item> extends ListFormatOutputHelper<Item> {
  constructor(fields: FieldSchema[]) {
    super(fields);
  }

  async formatOutputItem(item) {
    const output = await super.formatOutputItem(item);

    const cardFields = this.fields.filter(
      (field) => field?.webTemplate?.card?.show
    );
    const banner = cardFields.find(
      (field) => field?.webTemplate?.card?.type == 'banner'
    );
    const title = cardFields.find(
      (field) => field?.webTemplate?.card?.type == 'title'
    );
    const subtitles = cardFields
      .filter((field) => field?.webTemplate?.card?.type == 'subtitle')
      .map((field) => field.key);

    output['subtitles'] = [];
    subtitles.forEach((key) => {
      output['subtitles'].push(item[key]);
    });
    output['banner'] = banner ? item[banner.key] : '';
    output['title'] = title ? item[title.key] : '';
    return output;
  }
}
