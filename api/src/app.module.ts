import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrefijosModule } from './prefijos/prefijos.module.js';

@Module({
  imports: [PrefijosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
