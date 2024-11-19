import { Module } from '@nestjs/common';
import { TypeormConfig } from '../../src/utils/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TestService } from './test.service';
import { TestingModule } from '@nestjs/testing';
import { LoggerModule } from '../../src/Logger/logger.module';
import { DataBaseModule } from '../../src/db/db.module';

/* TestModule
## Purpose:
- Initialize the test environment for E2E and integration tests.
- Provide a test API for external modules.
- Create a DataSource connected to the test database tables.

## Configuration Details:
- The configuration is defined in the `setEnvVars.js` file.
- Adapts the module specifically for the test environment.
*/

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeormConfig,
      dataSourceFactory: async (options: DataSourceOptions) => new DataSource(options).initialize(),
    }),
    DataBaseModule,
  ],
  providers: [TestService],
  exports: [TestService],
})
export class TestModule {}
