import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';
import { IPasswordHasherProvider } from '@healthflow/shared';
import { Argon2PasswordHasherProvider } from './services/argon2-password-hasher.provider';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.getOrThrow<string>('jwtSecret'),
        signOptions: {
          expiresIn: (config.get<string>('jwtExpiresIn') ??
            '7d') as SignOptions['expiresIn'],
        },
      }),
    }),
  ],
  providers: [
    Argon2PasswordHasherProvider,
    {
      provide: IPasswordHasherProvider,
      useExisting: Argon2PasswordHasherProvider,
    },
  ],
  exports: [JwtModule, IPasswordHasherProvider],
})
export class ProvidersModule {}
