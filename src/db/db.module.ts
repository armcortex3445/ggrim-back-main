import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TypeormConfig } from '../utils/typeorm.config';
import { DatabaseService } from './db.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeormConfig,
      dataSourceFactory: async (options) => new DataSource(options!).initialize(),
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DataBaseModule {}
