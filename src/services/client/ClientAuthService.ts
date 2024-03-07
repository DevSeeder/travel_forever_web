import { HttpErrorResponseDto } from 'src/dto/response/HttpErrorResponseDto';
import { HttpService } from './HttpService';
import { HttpResponseDto } from 'src/dto/response/HttpResponseDto';
import { AxiosError } from 'axios';

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
  ): Promise<HttpResponseDto<AuthResponse | HttpErrorResponseDto>> {
    try {
      const basicAuthToken = btoa(`${username}:${password}`);
      const response = await this.post(
        '/auth/login',
        ['DEVSEEDER/TRAVEL_FOREVER/API/ADM'],
        {
          headers: {
            Authorization: `Basic ${basicAuthToken}`,
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (err) {
      let message;
      if (err instanceof AxiosError) {
        if (err?.response?.data?.message)
          message = err?.response?.data?.message;
        else message = err.message;
      } else message = JSON.stringify(`Error: ${JSON.stringify(err)}`);
      return {
        success: false,
        data: message,
      };
    }
  }
}
