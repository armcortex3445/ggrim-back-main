import { IsJSON, IsOptional } from 'class-validator';

export class SearchQuizDTO {
  @IsOptional()
  @IsJSON()
  artist: string = '[]';

  /*형식 
      JSON 문자열 
        - 예시) url?tags=["1","2"]
        - 서버쪽에서 파싱 로직을 사용해야함
      */
  @IsOptional()
  @IsJSON()
  tags: string = '[]';

  /*형식 
      JSON 문자열 
        - 예시) url?tags=["1","2"]
        - 서버쪽에서 파싱 로직을 사용해야함
      */
  @IsOptional()
  @IsJSON()
  styles: string = '[]';
}
