import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpdateProfileBody } from './entities/profile.model';
import { ProfileRepository } from './profile.repo';

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async getProfile(userId: number) {
    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async updateProfile(userId: number, body: UpdateProfileBody) {
    await this.getProfile(userId);

    return this.profileRepository.update(userId, body);
  }
}
