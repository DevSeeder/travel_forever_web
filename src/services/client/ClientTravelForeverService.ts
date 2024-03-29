import { HttpService } from './HttpService';
import { HttpResponseDto } from 'src/dto/response/HttpResponseDto';

export interface AuthResponse {
  userId: string;
  token: string;
}

export class ClientTravelForeverService extends HttpService {
  constructor(token: string) {
    super('http://api.travelforever.devseeder.com', {
      Authorization: `Bearer ${token}`,
    });
  }

  async createUser(
    name: string,
    username: string,
    password: string
  ): Promise<HttpResponseDto<{ _id: string }>> {
    return this.post('/users', {
      name,
      username,
      password,
    });
  }

  async search(
    entity: string,
    queryParams = {}
  ): Promise<HttpResponseDto<any>> {
    return this.get(`/${entity}`, queryParams);
  }

  async getById(entity: string, id: string): Promise<HttpResponseDto<any>> {
    return this.get(`/${entity}/${id}`);
  }

  async updateById(
    entity: string,
    id: string,
    data: object
  ): Promise<HttpResponseDto<any>> {
    return this.patch(`/${entity}/${id}`, data);
  }
}
