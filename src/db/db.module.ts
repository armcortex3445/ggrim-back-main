import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormConfig } from '../utils/typeorm.config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { DatabaseService } from './db.service';
import { LoggerModule } from '../Logger/logger.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeormConfig,
      dataSourceFactory: async (options: DataSourceOptions) => new DataSource(options).initialize(),
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DataBaseModule {}
