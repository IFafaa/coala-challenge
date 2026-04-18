import { ERole } from '@healthflow/shared';

export class ListExamsCommand {
  private readonly _requesterRole: ERole;

  constructor(requesterRole: ERole) {
    if (!requesterRole) {
      throw new Error('Requester role is required');
    }
    this._requesterRole = requesterRole;
  }

  get requesterRole(): ERole {
    return this._requesterRole;
  }
}
