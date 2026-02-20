import type { User, CreateUserInput } from '../../domain/User.js';

/**
 * Port for user persistence (outbound).
 */
export interface UserRepositoryPort {
  create(input: CreateUserInput): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByReqResId(reqResId: number): Promise<User | null>;
  findAll(): Promise<User[]>;
  delete(id: string): Promise<boolean>;
}
