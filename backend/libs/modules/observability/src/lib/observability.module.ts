import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UserAccessEventAdapter } from './application/messaging/user-access-event.adapter';
import { UserAccessConsumerService } from './application/messaging/user-access-consumer.service';
import { RegisterUserAccessUseCase } from './application/use-cases/register-user-access.use-case';
import { UserAccessEventPort } from './domain/ports/user-access-event.port';
import { UserAccessRepository } from './domain/repositories/user-access.repository';
import { PrismaUserAccessRepository } from './infrastructure/repositories/prisma-user-access.repository';
import { HttpErrorLoggingInterceptor } from './presentation/interceptors/http-error-logging.interceptor';
import { HttpLoggingInterceptor } from './presentation/interceptors/http-logging.interceptor';

@Module({
  providers: [
    { provide: UserAccessRepository, useClass: PrismaUserAccessRepository },
    { provide: UserAccessEventPort, useClass: UserAccessEventAdapter },
    RegisterUserAccessUseCase,
    UserAccessConsumerService,
    { provide: APP_INTERCEPTOR, useClass: HttpLoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: HttpErrorLoggingInterceptor },
  ],
  exports: [UserAccessEventPort],
})
export class ObservabilityModule {}
