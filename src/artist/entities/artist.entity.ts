import { IsDate, IsString, IsUrl } from 'class-validator';
import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CustomBaseEntity } from '../../db/entity/custom.base.entity';
import { Painting } from '../../painting/entities/painting.entity';

@Entity()
/*TODO
- 동명이인을 구분할 방법을 찾아야함
*/
// @Unique(['name'])
export class Artist extends CustomBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @IsString()
  id!: string;

  @Column()
  @IsString()
  name!: string;

  @Column({
    nullable: true,
  })
  @IsUrl()
  image_url!: string;

  @Column({
    type: 'time without time zone',
    nullable: true,
  })
  @IsDate()
  birth_date!: Date;

  @Column({
    type: 'time without time zone',
    nullable: true,
  })
  @IsDate()
  death_date!: Date;

  @Column({
    nullable: true,
  })
  @IsUrl()
  info_url!: string;

  @OneToMany(() => Painting, (painting) => painting.artist)
  @JoinColumn()
  paintings!: Painting[];
}
