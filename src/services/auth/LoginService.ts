import { HttpResponseDto } from 'src/dto/response/HttpResponseDto';
import {
  AuthResponse,
  ClientAuthService,
} from 'src/services/client/ClientAuthService';
import store from 'src/store/index';

export class LoginService {
  private clientAuth: ClientAuthService;
  constructor() {
    this.clientAuth = new ClientAuthService();
  }

  async login(
    username: string,
    password: string
  ): Promise<HttpResponseDto<AuthResponse>> {
    const resLogin = await this.clientAuth.login(username, password);
    if (resLogin.success)
      store.dispatch('auth/login', (resLogin.data as AuthResponse).token);

    return resLogin;
  }
}
