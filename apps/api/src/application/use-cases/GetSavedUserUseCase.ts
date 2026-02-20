import type { UserRepositoryPort } from '../ports/UserRepositoryPort.js';
import type { User } from '../../domain/User.js';

export class GetSavedUserUseCase {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute(id: string): Promise<User | null> {
    return this.userRepo.findById(id);
  }
}
