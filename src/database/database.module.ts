import { DataSource } from 'typeorm';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import dataSource from './data-source';

@Global()
@Module({
  providers: [
    {
      provide: DataSource,
      useFactory: async (configService: ConfigService) => {
        try {
          await dataSource.initialize();
          console.log('Database connected successfully');
          return dataSource;
        } catch (error) {
          console.log('Error connecting to database');
          throw error;
        }
      },
    },
  ],
  exports: [DataSource],
})
export class DatabaseModule {}
