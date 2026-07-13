import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  isPrismaErrorCode,
  PrismaErrorCode,
} from 'src/database/prisma-error.util';
import {
  CreateLanguageBody,
  UpdateLanguageBody,
} from './entities/language.model';
import { LanguageRepository } from './language.repo';

@Injectable()
export class LanguageService {
  constructor(private readonly languageRepository: LanguageRepository) {}

  findAll() {
    return this.languageRepository.findAll();
  }

  async findById(languageId: string) {
    const language = await this.languageRepository.findById(languageId);

    if (!language) {
      throw new NotFoundException('Language not found');
    }

    return language;
  }

  async create(body: CreateLanguageBody, userId: number) {
    try {
      return await this.languageRepository.create(body, userId);
    } catch (error) {
      if (isPrismaErrorCode(error, PrismaErrorCode.UniqueConstraintFailed)) {
        throw new ConflictException('Language already exists');
      }

      throw error;
    }
  }

  async update(body: UpdateLanguageBody, userId: number) {
    await this.findById(body.id);

    return this.languageRepository.update(body, userId);
  }

  async delete(languageId: string, userId: number) {
    await this.findById(languageId);

    await this.languageRepository.softDelete(languageId, userId);

    return {
      message: 'Language deleted successfully',
    };
  }
}
