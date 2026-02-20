import type { UserRepositoryPort } from '../ports/UserRepositoryPort.js';

export class SavedUserNotFoundError extends Error {
  constructor(public readonly id: string) {
    super(`Saved user ${id} not found`);
    this.name = 'SavedUserNotFoundError';
  }
}

export class DeleteSavedUserUseCase {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.userRepo.delete(id);
    if (!deleted) throw new SavedUserNotFoundError(id);
  }
}
