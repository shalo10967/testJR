import type { ReqResClientPort } from '../ports/ReqResClientPort.js';
import type { UserRepositoryPort } from '../ports/UserRepositoryPort.js';
import type { User } from '../../domain/User.js';

export class UserNotFoundError extends Error {
  constructor(public readonly id: number) {
    super(`User ${id} not found in ReqRes`);
    this.name = 'UserNotFoundError';
  }
}

/**
 * Fetches user from ReqRes and persists locally.
 */
export class ImportUserUseCase {
  constructor(
    private readonly reqRes: ReqResClientPort,
    private readonly userRepo: UserRepositoryPort
  ) {}

  async execute(reqResUserId: number): Promise<User> {
    const response = await this.reqRes.getUserById(reqResUserId);
    const data = response.data;
    const existing = await this.userRepo.findByReqResId(data.id);
    if (existing) return existing;

    return this.userRepo.create({
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      avatar: data.avatar,
      reqResId: data.id,
    });
  }
}
