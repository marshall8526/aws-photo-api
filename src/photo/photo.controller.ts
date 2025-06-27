import {
  Body,
  Controller,
  Get,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PhotoService } from './photo.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadPhotoDto } from './dto/uploadPhoto.dto';
import { CommonResponseDto } from 'src/common/dto/common-response.dto';
import { GetPhotoDto } from './dto/getPhoto.dto';
import { PhotoDto } from './dto/photo.dto';

@Controller('photo')
export class PhotoController {
  constructor(private readonly photoService: PhotoService) { }
  @Get()
  async getPhoto(@Body() dto: GetPhotoDto): Promise<PhotoDto> {
    return this.photoService.getPhotoByName(dto);
  }

  @Post()
  @UseInterceptors(FileInterceptor('photo'))
  async uploadPhoto(
    @Body() dto: UploadPhotoDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /^image\/.+$/ })
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ): Promise<string> {
    return this.photoService.uploadPhoto(file, dto);
  }
}
