import { UserAccess } from '../entities/user-access.entity';

export abstract class UserAccessRepository {
  abstract persist(userAccess: UserAccess): Promise<UserAccess>;
}
