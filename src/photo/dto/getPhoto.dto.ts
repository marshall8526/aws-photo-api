import { IsString, IsNotEmpty } from 'class-validator';

export class GetPhotoDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
