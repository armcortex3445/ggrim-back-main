import { IsJSON, IsOptional, IsString } from 'class-validator';

export class SearchPaintingDTO {
  @IsString()
  title: string = '';

  @IsOptional()
  @IsString()
  artistName: string = '';

  /*형식 
    JSON 문자열 
      - 예시) url?tags=["1","2"]
      - 서버쪽에서 파싱 로직을 사용해야함
    */
  @IsOptional()
  @IsJSON()
  tags: string = ',';
}
