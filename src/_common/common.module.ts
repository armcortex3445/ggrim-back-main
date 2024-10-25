import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'src/Logger/logger.module';
import { TraceInterceptor } from './interceptor/trace.interceptor';
import { HttpLoggingInterceptor } from './interceptor/logging.interceptor';
import { ServiceExceptionFilter } from './filter/service.exception.filter';

@Module({
  imports: [LoggerModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TraceInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ServiceExceptionFilter,
    },
  ],
})
export class CommonModule {}
