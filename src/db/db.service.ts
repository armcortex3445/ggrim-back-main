import { Inject, Injectable, Logger } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, DataSource, Repository } from 'typeorm';

export interface IEnitity {
  name: string;
  tableName: string;
}

@Injectable()
export class DatabaseService {
  constructor(private readonly dataSource: DataSource) {
    Logger.log(`[${DatabaseService.name}] init`);
  }
  public async getRepository<T>(entity: any): Promise<Repository<T>> {
    return this.dataSource.getRepository(entity);
  }

  public async isConnected(): Promise<boolean> {
    return this.dataSource.isInitialized;
  }

  public async close(): Promise<void> {
    if (this.isConnected) {
      this.dataSource.destroy();
    }
  }

  public async getEntities() {
    const entities: IEnitity[] = [];
    this.dataSource.entityMetadatas.forEach((x) =>
      entities.push({ name: x.name, tableName: x.tableName }),
    );

    return entities;
  }
}
