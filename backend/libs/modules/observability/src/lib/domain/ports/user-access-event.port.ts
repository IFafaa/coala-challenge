import { Result } from '@healthflow/shared';
import { UserAccessEventDto } from '../../application/dtos/user-access-event.dto';

export abstract class UserAccessEventPort {
  abstract publish(event: UserAccessEventDto): Promise<Result<void, Error>>;
}
