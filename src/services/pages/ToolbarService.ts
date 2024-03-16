import { EntityTranslation } from 'src/interface/schema/FormResponse';
import { AbstractWebService } from './AbstractWebService';

export class ToolbarService extends AbstractWebService {
  constructor(protected readonly entity: string) {
    super(entity);
  }

  actionTitle(action: string, metadata: EntityTranslation) {
    switch (action) {
      case 'list':
        return metadata?.listLabel || metadata.entityLabel;
      case 'edit':
        return `Editar ${metadata.itemLabel}`;
      case 'create':
        return `Novo(a) ${metadata.itemLabel}`;
      default:
        return metadata.entityLabel;
    }
  }
}
