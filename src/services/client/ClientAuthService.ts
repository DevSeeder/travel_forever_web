import { HttpService } from './HttpService';
import { HttpResponseDto } from 'src/dto/response/HttpResponseDto';

export interface AuthResponse {
  userId: string;
  token: string;
}

export class ClientAuthService extends HttpService {
  constructor() {
    super('http://auth.devseeder.com', {
      projectKey: 'TRAVEL_FOREVER',
    });
  }

  async login(
    username: string,
    password: string
  ): Promise<HttpResponseDto<AuthResponse>> {
    const basicAuthToken = btoa(`${username}:${password}`);

    return this.post('/auth/login', ['DEVSEEDER/TRAVEL_FOREVER/API/USER'], {
      headers: {
        Authorization: `Basic ${basicAuthToken}`,
      },
    });
  }
}
