import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Logger } from '@nestjs/common';
import { CommonResponseDto } from '../dto/common-response.dto';

@Injectable()
export class CommonResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CommonResponseInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => CommonResponseDto.setData(data)),

      catchError((err) => {
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: any = 'Internal server error';

        if (err instanceof HttpException) {
          status = err.getStatus();
          const res = err.getResponse();
          message = typeof res === 'string' ? res : res['message'] ?? res;
        } else {
          this.logger.error('Unexpected error', err.stack || err);
        }

        const response = new CommonResponseDto();
        response.error = {
          statusCode: status,
          message,
        };

        return throwError(
          () => new HttpException(response, status)
        );
      }),
    );
  }
}