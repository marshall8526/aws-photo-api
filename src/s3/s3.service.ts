import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucketName: string;
  private readonly isLocal: boolean;
  private readonly logger = new Logger(S3Service.name);

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('S3_REGION');
    const endpoint = this.configService.get<string>('S3_ENDPOINT'); // only used locally
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY');
    const secretAccessKey = this.configService.get<string>(
      'S3_SECRET_ACCESS_KEY',
    );
    this.bucketName = this.configService.getOrThrow<string>('S3_BUCKET_NAME');
    this.isLocal = this.configService.get<string>('NODE_ENV') !== 'production';

    if (!region || !accessKeyId || !secretAccessKey || !this.bucketName) {
      throw new Error('Missing S3 configuration in environment variables');
    }

    this.client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      ...(this.isLocal && endpoint ? { endpoint, forcePathStyle: true } : {}),
    });
  }

  async uploadSingleFile({
    file,
    isPublic = true,
  }: {
    file: Express.Multer.File;
    isPublic: boolean;
  }) {
    try {
      const key = `${uuidv4()}`;
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: isPublic ? 'public-read' : 'private',
        Metadata: {
          originalName: file.originalname,
        },
      });

      await this.client.send(command);

      const url = isPublic
        ? this.getPublicUrl(key)
        : await this.getPresignedSignedUrl(key);

      return { key, isPublic, url };
    } catch (error) {
      this.logger.error('Failed to upload file to S3', error);
      throw new InternalServerErrorException(error);
    }
  }

getPublicUrl(key: string): string {
  if (this.isLocal) {
    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    return `${endpoint?.replace(/\/$/, '')}/${this.bucketName}/${key}`;
  }

  return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
}


  async getPresignedSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn: 3600 });
  }
}
