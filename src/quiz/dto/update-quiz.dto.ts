import { PartialType } from '@nestjs/mapped-types';
import { CreateQuizDTO } from './create-quiz.dto';

export class UpdateQuizDTO extends PartialType(CreateQuizDTO) {}
