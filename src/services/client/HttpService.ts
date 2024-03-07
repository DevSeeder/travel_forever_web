import axios, { AxiosInstance } from 'axios';

export class HttpService {
  private http: AxiosInstance;

  constructor(baseUrl: string, headers = {}) {
    this.http = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-type': 'application/json',
        ...headers,
        // Inclua outros cabeçalhos globais necessários, como tokens de autenticação
      },
    });
  }
  get(url: string, params = {}) {
    return this.http.get(url, { params });
  }

  post(url: string, data: object | Array<unknown>, config = {}) {
    console.log(data);
    return this.http.post(url, data, config);
  }
}
