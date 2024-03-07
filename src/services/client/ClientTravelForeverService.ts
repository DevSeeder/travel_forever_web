import { HttpService } from './HttpService';
import { HttpResponseDto } from 'src/dto/response/HttpResponseDto';
import { AxiosError } from 'axios';

export interface AuthResponse {
  userId: string;
  token: string;
}

export class ClientTravelForeverService extends HttpService {
  constructor(token: string) {
    super('http://api.travelforever.devseeder.com', {
      Authorization: `Bearer ${token}`,
    });
    console.log({
      Authorization: `Bearer ${token}`,
    });
  }

  async createUser(
    name: string,
    username: string,
    password: string
  ): Promise<HttpResponseDto<{ _id: string }>> {
    try {
      const response = await this.post('/users', {
        name,
        username,
        password,
      });

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
