import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UserAccess } from '../../domain/entities/user-access.entity';
import { UserAccessRepository } from '../../domain/repositories/user-access.repository';
import { UserAccessMapper } from '../mappers/user-access.mapper';

@Injectable()
export class PrismaUserAccessRepository extends UserAccessRepository {
  constructor(private readonly prisma: PrismaClient) {
    super();
  }

  async persist(userAccess: UserAccess): Promise<UserAccess> {
    const data = UserAccessMapper.toPersistence(userAccess);
    const row = await this.prisma.userAccess.create({ data });
    return UserAccessMapper.toDomain(row);
  }
}
