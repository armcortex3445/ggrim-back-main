import { HttpStatus } from '@nestjs/common';
import { HttpException, HttpExceptionOptions } from '@nestjs/common/exceptions';

interface IBaseException {
  errorCode: number;
  timestamp: string;
  msg: string;
  path: string;
}

export type HttpStatusType = keyof typeof HttpStatus;

export class BaseException extends HttpException implements IBaseException {
  traceId: string;
  constructor(
    errorCode: number,
    status: number,
    response: Record<string, any> | string,
    options?: HttpExceptionOptions,
  ) {
    let resbody = typeof response === 'string' ? { message: response } : response;

    resbody['errorCode'] = errorCode;
    resbody['status'] = status;
    super(resbody, status, options);
    this.errorCode = errorCode;
    this.msg = JSON.stringify(resbody, null, 2);
  }

  errorCode: number;

  timestamp: string;

  msg: string;

  path: string;
}
