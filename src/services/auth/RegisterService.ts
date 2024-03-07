/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { HttpErrorResponseDto } from 'src/dto/response/HttpErrorResponseDto';
import { HttpResponseDto } from 'src/dto/response/HttpResponseDto';
import { ClientTravelForeverService } from '../client/ClientTravelForeverService';
import { LoginService } from './LoginService';

export class RegisterService {
  private clientAuth: ClientTravelForeverService;
  private loginService: LoginService;
  constructor() {
    this.clientAuth = new ClientTravelForeverService(
      process.env.SERVICE_AUTH_TOKEN!
    );
    this.loginService = new LoginService();
  }

  async register(
    name: string,
    username: string,
    password: string
  ): Promise<HttpResponseDto<{ _id: string }>> {
    const resRegister = await this.clientAuth.createUser(
      name,
      username,
      password
    );

    if (!resRegister.success) return resRegister;

    const resLogin = await this.loginService.login(username, password);
    console.log(resLogin);

    if (!resLogin.success)
      return { success: false, data: resLogin.data as HttpErrorResponseDto };

    return resRegister;
  }
}
