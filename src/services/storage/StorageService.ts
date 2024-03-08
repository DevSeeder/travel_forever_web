import { ClientTravelForeverService } from '../client/ClientTravelForeverService';
import store from '../../store';

export class StorageService {
  private clientHttp: ClientTravelForeverService;

  constructor(token: string) {
    this.clientHttp = new ClientTravelForeverService(token);
  }

  async getValue(key: string, apiUrl: string): Promise<any> {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue !== null) return JSON.parse(storedValue);

      const response = await this.clientHttp.get(apiUrl);

      localStorage.setItem(key, JSON.stringify(response.data));

      return response.data;
    } catch (error) {
      console.error('Error while retrieving value:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService(store.getters['auth/token']);
