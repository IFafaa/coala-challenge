import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UserAccessLogEventAdapter } from './application/messaging/user-access-log-event.adapter';
import { UserAccessLogConsumerService } from './application/messaging/user-access-log-consumer.service';
import { RegisterUserAccessLogUseCase } from './application/use-cases/register-user-access-log.use-case';
import { UserAccessLogEventPort } from './domain/ports/user-access-log-event.port';
import { UserAccessLogRepository } from './domain/repositories/user-access-log.repository';
import { PrismaUserAccessLogRepository } from './infrastructure/repositories/prisma-user-access-log.repository';
import { HttpErrorLoggingInterceptor } from './presentation/interceptors/http-error-logging.interceptor';
import { HttpLoggingInterceptor } from './presentation/interceptors/http-logging.interceptor';

@Module({
  providers: [
    { provide: UserAccessLogRepository, useClass: PrismaUserAccessLogRepository },
    { provide: UserAccessLogEventPort, useClass: UserAccessLogEventAdapter },
    RegisterUserAccessLogUseCase,
    UserAccessLogConsumerService,
    { provide: APP_INTERCEPTOR, useClass: HttpLoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: HttpErrorLoggingInterceptor },
  ],
  exports: [UserAccessLogEventPort],
})
export class ObservabilityModule {}
