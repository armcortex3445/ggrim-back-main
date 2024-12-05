import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import {
  ENV_DB_DATABASE_KEY,
  ENV_DB_HOST_KEY,
  ENV_DB_PASSWORD_KEY,
  ENV_DB_PORT_KEY,
  ENV_DB_USER_NAME_KEY,
} from '../_common/const/env-keys.const';

@Injectable()
export class TypeORMConfig implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      url: '',
      host: process.env[ENV_DB_HOST_KEY],
      port: +(process.env[ENV_DB_PORT_KEY] || ''),
      username: process.env[ENV_DB_USER_NAME_KEY],
      password: process.env[ENV_DB_PASSWORD_KEY],
      database: process.env[ENV_DB_DATABASE_KEY],
      autoLoadEntities: true,
      synchronize: false, //!process.env[NODE_ENV] ? false : true,
      keepConnectionAlive: true,
      logging: ['error', 'log'],
      logger: 'file',
      maxQueryExecutionTime: 1000,
      entities: [__dirname + 'src/**/{entity,entities}/*.entity.{ts,js}'], //엔티티 클래스 경로
      extra: {
        max: 100,
      },
    } as TypeOrmModuleOptions;
  }
}
