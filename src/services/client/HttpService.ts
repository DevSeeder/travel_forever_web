import axios, { AxiosError, AxiosInstance } from 'axios';
import { HttpResponseDto } from 'src/dto/response/HttpResponseDto';

export class HttpService {
  private http: AxiosInstance;

  constructor(baseUrl: string, headers = {}) {
    this.http = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-type': 'application/json',
        ...headers,
      },
    });
  }

  async get<Response>(
    url: string,
    params = {}
  ): Promise<HttpResponseDto<Response>> {
    try {
      const response = await this.http.get(url, { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (err) {
      return this.handleError(err);
    }
  }

  async post<Response>(
    url: string,
    data: object | Array<unknown>,
    config = {}
  ): Promise<HttpResponseDto<Response>> {
    try {
      const response = await this.http.post(url, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (err) {
      return this.handleError(err);
    }
  }

  async patch<Response>(
    url: string,
    data: object | Array<unknown>,
    config = {}
  ): Promise<HttpResponseDto<Response>> {
    try {
      const response = await this.http.patch(url, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (err) {
      return this.handleError(err);
    }
  }

  private handleError(err: unknown) {
    let message;
    if (err instanceof AxiosError) {
      if (err?.response?.data?.message) message = err?.response?.data?.message;
      else message = err.message;
    } else message = JSON.stringify(`Error: ${JSON.stringify(err)}`);
    return {
      success: false,
      data: message,
    };
  }
}
