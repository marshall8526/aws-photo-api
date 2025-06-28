import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PhotoModule } from './photo/photo.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { S3Module } from './s3/s3.module';

@Module({
  imports: [
    PhotoModule,
    DatabaseModule,
    ConfigModule.forRoot({ isGlobal: true }),
    S3Module,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
