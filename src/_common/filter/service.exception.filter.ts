import { Inject, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { ExceptionFilter } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { BaseException } from './exception/base.exception';
import { ServiceException } from './exception/service/service-exception';
import { CustomExceptionFilter } from './custom.exception.filter';
import { ServiceExceptionEnum } from './exception/service/service.exception.enum';

interface IExceptionInfo extends Pick<BaseException, 'timestamp' | 'path'> {
  message: string | object;
  cause?: unknown;
}

@Catch(ServiceException)
export class ServiceExceptionFilter extends CustomExceptionFilter {
  constructor() {
    super('ServiceExceptionFilter');
  }

  catch(exception: ServiceException, host: ArgumentsHost): void {
    super.catch(exception, host);

    const code = exception.errorCode;

    if (code == ServiceExceptionEnum.DB_INCONSISTENCY) {
      // notfiy to Developer.
      this.logger.error('DB has inconsistency', exception.stack, {
        className: this.className,
        traceId: exception.traceId,
      });
    }
  }
}
