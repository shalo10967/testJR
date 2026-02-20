import type { User } from '../../domain/User.js';

export interface ReqResUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

export interface ReqResLoginResponse {
  token: string;
}

export interface ReqResUsersResponse {
  data: ReqResUser[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface ReqResUserResponse {
  data: ReqResUser;
}

/**
 * Port for the ReqRes external API (outbound).
 */
export interface ReqResClientPort {
  login(email: string, password: string): Promise<ReqResLoginResponse>;
  getUsers(page: number): Promise<ReqResUsersResponse>;
  getUserById(id: number): Promise<ReqResUserResponse>;
}
