import type { UserRepositoryPort } from '../ports/UserRepositoryPort.js';
import type { User } from '../../domain/User.js';

export class GetSavedUsersUseCase {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute(): Promise<User[]> {
    return this.userRepo.findAll();
  }
}
