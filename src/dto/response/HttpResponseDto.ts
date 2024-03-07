import { HttpErrorResponseDto } from './HttpErrorResponseDto';

export interface HttpResponseDto<ResponseData> {
  success: boolean;
  data: ResponseData | HttpErrorResponseDto;
}
