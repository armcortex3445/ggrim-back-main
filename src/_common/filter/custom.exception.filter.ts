import { Catch, Inject, Injectable } from '@nestjs/common/decorators';
import { ArgumentsHost, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from 'src/Logger/logger.service';
import { BaseException } from './exception/base.exception';

interface CauseInfo {
  innerError: unknown;
  stack: string;
}
interface IExceptionInfo extends Pick<BaseException, 'timestamp' | 'path'> {
  message: string | object;
  cause?: CauseInfo;
  error?: unknown;
}

export class CustomExceptionFilter implements ExceptionFilter {
  static cnt = 0;
  className: string;
  logger: LoggerService;
  constructor(className: string) {
    this.className = className;
  }

  catch(exception: any, host: ArgumentsHost): void {
    if (host.getType() == 'http') {
      const ctx = host.switchToHttp();
      const req = ctx.getRequest<Request>();
      const res = ctx.getResponse<Response>();

      exception.timestamp = new Date().toLocaleTimeString('kr');
      exception.path = req.url;

      if (exception instanceof BaseException) {
        this.logBaseException(exception);
        res.status(exception.getStatus()).json({
          errorCode: exception.errorCode,
          statusCode: exception.getStatus(),
          timeStamp: exception.timestamp,
          path: exception.path,
        });
      } else {
        this.logUnknownException(exception);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          timeStamp: exception.timestamp,
          path: exception.path,
        });
      }
    } else {
      this.logger.error(`unsupport host type[${host.getType()} access`, exception.stack, {
        className: this.className,
        traceId: exception.traceId,
      });
    }
  }

  private logBaseException(exception: BaseException) {
    const info: IExceptionInfo = {
      timestamp: exception.timestamp,
      path: exception.path,
      message: exception.getResponse(),
      cause: this.getCauseInfo(exception),
    };

    if (exception.getStatus() >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(JSON.stringify(info, null, 2), exception.stack, {
        className: this.className,
        traceId: exception.traceId,
      });
    } else {
      this.logger.warn(JSON.stringify(info, null, 2), {
        className: this.className,
        traceId: exception.traceId,
      });
    }
  }

  private logUnknownException(e: any) {
    const info: IExceptionInfo = {
      timestamp: e.timeStamp,
      path: e.path,
      message: e,
      cause: this.getCauseInfo(e),
    };

    this.logger.error(
      `Unknown Exception ${e.name} occurs ` + `${JSON.stringify(info, null, 2)}`,
      e.stack,
      {
        className: this.className,
        traceId: e.traceId,
      },
    );
  }

  notifySeriousError(msg: string) {
    //심각한 에러 발생시 알려주는 용도?
  }

  getCauseInfo(e: any) {
    const innerError = e.cause;
    if (!innerError) {
      return;
    }

    const ret: CauseInfo = {
      innerError: innerError,
      stack: innerError.stack,
    };

    return ret;
  }
}
