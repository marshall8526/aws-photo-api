import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { Photo } from './entity/photo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3Service } from 'src/s3/s3.service';
import { GetPhotoDto } from './dto/getPhoto.dto';
import { PhotoDto } from './dto/photo.dto';
import { UploadPhotoDto } from './dto/uploadPhoto.dto';

@Injectable()
export class PhotoService {
  constructor(
    @InjectRepository(Photo) private photoRepository: Repository<Photo>,
    private readonly s3Service: S3Service,
  ) { }

  async getPhotoByName(dto: GetPhotoDto): Promise<PhotoDto> {
    const dbRecord = await this.photoRepository.findOneBy({ name: dto.name });
    if (!dbRecord) {
      throw new BadRequestException('Photo not found')
    }
    const url = this.s3Service.getPublicUrl(dbRecord.s3Key)
    return PhotoDto.toDto({ url })
  }

  async uploadPhoto(file: Express.Multer.File, dto: UploadPhotoDto): Promise<string> {
    const exists = await this.photoRepository.findOneBy({ name: dto.name });
    if (exists) {
      throw new BadRequestException('Photo with this name already exists')
    }
    const data = await this.s3Service.uploadSingleFile({ file, isPublic: true });
    const photo = this.photoRepository.create({
      name: dto.name,
      s3Key: data.key,
    });

    await this.photoRepository.save(photo);
    return data.key;
  }
}
