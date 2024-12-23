import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository } from 'typeorm';
import { ServiceException } from '../../../_common/filter/exception/service/service-exception';
import { isArrayEmpty } from '../../../utils/validator';
import { CreateTagDTO } from './dto/create-tag.dto';
import { Tag } from './entities/tag.entity';

interface UpdateRequest<T, R> {
  httpMethod: string;
  dto: T;
  handler: PromiseHandler<R>;
}

interface PromiseHandler<R> {
  resolve: (result: R) => void;
  reject: (exception: ServiceException) => void;
}

@Injectable()
export class TagService extends TypeOrmCrudService<Tag> {
  constructor(@InjectRepository(Tag) readonly repo: Repository<Tag>) {
    super(repo);
  }
  private readonly creatingQueue: UpdateRequest<CreateTagDTO, Tag>[] = [];
  private isBatchProcessing = false;

  addCreatingTagToQueue(dto: CreateTagDTO): Promise<Tag> {
    /*TODO 
      - QUEUE_LIMIT와 BATCH_INTERVAL_MS을 트래픽에 따라 변경하기
        예시) 요청량 증가시, QUEUE_LIMIT 증가, 요청량 감소시 BATCH_INTERVAL_MS 감소
    */
    const QUEUE_LIMIT = 40;
    const BATCH_INTERVAL_MS = 4000;
    return new Promise((resolve, reject: (e: ServiceException) => void) => {
      const handler: PromiseHandler<Tag> = {
        resolve,
        reject,
      };
      const request: UpdateRequest<CreateTagDTO, Tag> = {
        httpMethod: 'post',
        dto,
        handler,
      };
      this.creatingQueue.push(request);
      if (this.creatingQueue.length > QUEUE_LIMIT) {
        this.processBatch();
        return;
      }

      setTimeout(() => this.processBatch(), BATCH_INTERVAL_MS);
      return;
    });
  }

  filterUniqueDTOs(dtoList: CreateTagDTO[]): CreateTagDTO[] {
    const uniqueDTOsMap = new Map<string, CreateTagDTO>();

    for (const dto of dtoList) {
      if (!uniqueDTOsMap.has(dto.name)) {
        uniqueDTOsMap.set(dto.name, dto);
      }
    }

    return [...uniqueDTOsMap.values()];
  }

  async processBatch(): Promise<void> {
    if (this.isBatchProcessing) {
      return;
    }
    this.isBatchProcessing = true;
    try {
      if (isArrayEmpty(this.creatingQueue)) {
        return;
      }

      //batch 등록 및 큐 초기화
      const batch: UpdateRequest<CreateTagDTO, Tag>[] = [...this.creatingQueue];
      this.creatingQueue.splice(0, this.creatingQueue.length);

      const nameToPromiseMap: Map<string, PromiseHandler<Tag>[]> = new Map<
        string,
        PromiseHandler<Tag>[]
      >();
      for (const request of batch) {
        const key = request.dto.name;
        const value: PromiseHandler<Tag> = {
          resolve: request.handler.resolve,
          reject: request.handler.reject,
        };
        if (!nameToPromiseMap.has(key)) {
          nameToPromiseMap.set(key, []);
        }
        nameToPromiseMap.get(key)!.push(value);
      }

      //중복 DTO 분류
      const dtoList = batch.map((request) => request.dto);
      const uniqueDTOs: CreateTagDTO[] = this.filterUniqueDTOs(dtoList);

      //DTO 처리
      const uniqueNames = uniqueDTOs.map((dto) => dto.name);
      const existingTags: Tag[] = await this.repo
        .createQueryBuilder('tag')
        .select()
        .where('tag.name IN (:...uniqueNames)', { uniqueNames })
        .getMany();

      const existingNameMap = new Map(existingTags.map((tag) => [tag.name, tag]));
      const dtoListToCreate: CreateTagDTO[] = uniqueDTOs.filter(
        (dto) => !existingNameMap.has(dto.name),
      );

      const newTags: Tag[] = [];
      let isTransactionFail = false;
      if (!isArrayEmpty(dtoListToCreate)) {
        /*TODO 
          복수 생성 실패시, 재반복할 것인가 아니면 실패했음을 결과로 보낼 것인가?
        */
        try {
          const createdTags = await this.repo.manager.transaction<Tag[]>(
            async (transactionalEntityManager) => {
              const result: InsertResult = await transactionalEntityManager
                .getRepository(Tag)
                .createQueryBuilder()
                .insert()
                .values(dtoListToCreate)
                .returning('*')
                .execute();

              return result.generatedMaps as Tag[];
            },
          );
          newTags.push(...createdTags);
        } catch (error) {
          isTransactionFail = true;
        }
      }
      const allTags = [...existingTags, ...newTags];

      //DTO 처리 응답 반환
      for (const tag of allTags) {
        if (nameToPromiseMap.has(tag.name)) {
          const handlers = nameToPromiseMap.get(tag.name)!;
          for (const handler of handlers) {
            if (existingNameMap.has(tag.name)) {
              const error = new ServiceException(
                'DB_CONFLICT',
                'CONFLICT',
                `Tag ${tag.name} is already exist`,
              );
              handler.reject(error);
              continue;
            }

            if (isTransactionFail) {
              const error = new ServiceException(
                'SERVICE_RUN_ERROR',
                'INTERNAL_SERVER_ERROR',
                `Create Tag ${tag.name} fail `,
              );
              handler.reject(error);
              continue;
            }

            handler.resolve(tag);
          }
        }
      }
    } finally {
      this.isBatchProcessing = false;
    }
  }
  async findManyByName(names: string[]): Promise<Tag[]> {
    if (isArrayEmpty(names)) {
      return [];
    }

    const tags = await this.repo
      .createQueryBuilder('tag')
      .where('tag.name IN (:...names)', { names })
      .getMany();

    return tags;
  }

  async getTagsRelatedToPainting() {
    const query = this.repo
      .createQueryBuilder('t')
      .innerJoin('t.paintings', 'painting')
      .select(['t.name', 't.id']);

    Logger.debug(query.getSql());

    return await query.getMany();
  }
}
