import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessageBroker } from '@healthflow/infra';
import { RegisterUserAccessLogUseCase } from '../use-cases/register-user-access-log.use-case';
import { UserAccessLogEventDto } from '../dtos/user-access-log-event.dto';

@Injectable()
export class UserAccessLogConsumerService implements OnModuleInit {
  private readonly logger = new Logger(UserAccessLogConsumerService.name);

  constructor(
    private readonly broker: MessageBroker,
    private readonly configService: ConfigService,
    private readonly registerUserAccessLog: RegisterUserAccessLogUseCase,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!this.broker.ready) {
      this.logger.warn(
        'Message broker unavailable; user-access-log consumer not started',
      );
      return;
    }

    const mainQueue = this.configService.getOrThrow<string>(
      'userAccessLog.queue',
    );
    const dlq = this.configService.getOrThrow<string>('userAccessLog.dlq');

    await this.broker.ensureQueueWithDeadLetter(mainQueue, dlq);

    await this.broker.consumeQueue(
      mainQueue,
      async (body) => {
        const parsed = JSON.parse(body.toString()) as UserAccessLogEventDto;
        if (
          !parsed?.module ||
          !parsed?.useCase ||
          !parsed?.action ||
          !parsed?.userId ||
          !parsed?.description ||
          !parsed?.occurredAt
        ) {
          this.logger.warn(
            `Ignoring malformed user-access-log event: ${body.toString()}`,
          );
          return;
        }
        await this.registerUserAccessLog.execute(parsed);
      },
      { prefetch: 10 },
    );
  }
}
