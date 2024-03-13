import { AbstractWebService } from './AbstractWebService';

export class ToolbarService extends AbstractWebService {
  constructor(protected readonly entity: string) {
    super(entity);
  }
}
