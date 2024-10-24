import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

export interface ILogContext {
  className: string;
  traceId?: string;
}

@Injectable()
export class LoggerService {
  static KEY = {
    traceReq: 'traceId',
  };

  private _traceId: string;
  constructor(
    private readonly logger: Logger,
    private readonly clsService: ClsService,
  ) {}

  debug(message: any, context: ILogContext) {
    return this.logger.debug(message, this.getFullContext(context));
  }
  log(message: any, context: ILogContext) {
    return this.logger.log(message, this.getFullContext(context));
  }
  error(message: any, stack: string, context: ILogContext) {
    return this.logger.error(message, stack, this.getFullContext(context));
  }

  fatal(message: any, stack: string, context: ILogContext) {
    return this.logger.fatal(message, stack, this.getFullContext(context));
  }
  verbose(message: any, context: ILogContext) {
    return this.logger.verbose(message, this.getFullContext(context));
  }
  warn(message: any, context: ILogContext) {
    return this.logger.warn(message, this.getFullContext(context));
  }

  private getFullContext(ctx: ILogContext) {
    const reqInfo = this.clsService.get(LoggerService.KEY.traceReq) || ctx.traceId;
    return `${ctx.className} , req{${reqInfo}}`;
  }
}
