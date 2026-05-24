import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as argon2 from 'argon2';

@Injectable()
export class IdentityService implements OnApplicationBootstrap {
  private readonly logger = new Logger(IdentityService.name);
  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    await this.seedAdmin();
  }

  private async seedAdmin() {
    try {
      const adminExists = await this.prisma.staff.findFirst();

      if (!adminExists) {
        this.logger.log('No admin user found. Creating default admin...');
        const defaultLogin = 'staff';
        const defaultPass = 'SecurePass123!';
        const passwordHash = await argon2.hash(defaultPass);

        await this.prisma.staff.create({
          data: {
            login: defaultLogin,
            passwordHash: passwordHash,
          },
        });

        this.logger.warn(`
          ##########################################################
          # DEFAULT ADMIN CREATED!                                 #
          # Login: ${defaultLogin}                                 #
          # Password: ${defaultPass}                               #
          # PLEASE CHANGE PASSWORD AFTER FIRST LOGIN               #
          ##########################################################
        `);
      } else {
        this.logger.log('Admin user already exists.');
      }
    } catch (error) {
      this.logger.error('Failed to seed admin:', error);
    }
  }
}
