import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaintingModule } from './painting/painting.module';
import { ArtistModule } from './artist/artist.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormConfig } from './utils/typeorm.config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './Logger/logger.module';
import { ClsModule } from 'nestjs-cls';
import { CommonModule } from './_common/common.module';
import { QuizModule } from './quiz/quiz.module';
import { NODE_ENV } from './_common/const/env-keys.const';

const ENV = process.env[NODE_ENV];

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeormConfig,
      dataSourceFactory: async (options: DataSourceOptions) => new DataSource(options).initialize(),
    }),
    ClsModule.forRoot({
      global: true,
      interceptor: {
        mount: true,
      },
    }),
    LoggerModule,
    CommonModule,
    PaintingModule,
    ArtistModule,
    QuizModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
