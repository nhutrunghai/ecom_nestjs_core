import { Module } from '@nestjs/common';
import { LanguageController } from './language.controller';
import { LanguageRepository } from './language.repo';
import { LanguageService } from './language.service';

@Module({
  controllers: [LanguageController],
  providers: [LanguageService, LanguageRepository],
})
export class LanguageModule {}
