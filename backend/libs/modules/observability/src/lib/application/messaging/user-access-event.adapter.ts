import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessageBroker } from '@healthflow/infra';
import { err, ok, Result } from '@healthflow/shared';
import { UserAccessEventDto } from '../dtos/user-access-event.dto';
import { UserAccessEventPort } from '../../domain/ports/user-access-event.port';

@Injectable()
export class UserAccessEventAdapter extends UserAccessEventPort {
  private readonly logger = new Logger(UserAccessEventAdapter.name);

  constructor(
    private readonly broker: MessageBroker,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  override async publish(
    event: UserAccessEventDto,
  ): Promise<Result<void, Error>> {
    const queue = this.configService.getOrThrow<string>('userAccess.queue');

    if (!this.broker.ready) {
      this.logger.warn(
        `Broker unavailable; dropping user-access event ${event.module}:${event.useCase}`,
      );
      return ok(undefined);
    }

    try {
      const body = Buffer.from(JSON.stringify(event));
      await this.broker.publishToQueue(queue, body);
      return ok(undefined);
    } catch (error) {
      const errorMessage = `Failed to publish user-access event for ${event.module}:${event.useCase}: ${error instanceof Error ? error.message : String(error)}`;
      this.logger.error(errorMessage, error);
      return err(new Error(errorMessage));
    }
  }
}
