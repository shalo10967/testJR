import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createAuthRoutes } from './routes/auth.routes.js';
import { createUsersRoutes } from './routes/users.routes.js';
import { createPostsRoutes } from './routes/posts.routes.js';
import { createReqResProxyRoutes } from './routes/reqres.routes.js';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import type { ReqResClientPort } from '../../../application/ports/ReqResClientPort.js';
import type { LoginUseCase } from '../../../application/use-cases/LoginUseCase.js';
import type { ImportUserUseCase } from '../../../application/use-cases/ImportUserUseCase.js';
import type { GetSavedUsersUseCase } from '../../../application/use-cases/GetSavedUsersUseCase.js';
import type { GetSavedUserUseCase } from '../../../application/use-cases/GetSavedUserUseCase.js';
import type { DeleteSavedUserUseCase } from '../../../application/use-cases/DeleteSavedUserUseCase.js';
import type {
  CreatePostUseCase,
  GetPostsUseCase,
  GetPostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
} from '../../../application/use-cases/PostsUseCases.js';

export interface AppDeps {
  reqResClient: ReqResClientPort;
  loginUseCase: LoginUseCase;
  importUserUseCase: ImportUserUseCase;
  getSavedUsersUseCase: GetSavedUsersUseCase;
  getSavedUserUseCase: GetSavedUserUseCase;
  deleteSavedUserUseCase: DeleteSavedUserUseCase;
  createPostUseCase: CreatePostUseCase;
  getPostsUseCase: GetPostsUseCase;
  getPostUseCase: GetPostUseCase;
  updatePostUseCase: UpdatePostUseCase;
  deletePostUseCase: DeletePostUseCase;
}

function getCorsOrigin(): boolean | string | string[] {
  const raw = process.env.CORS_ORIGIN;
  if (!raw) return true;
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

export function createApp(deps: AppDeps): express.Application {
  const app = express();
  app.use(cors({ origin: getCorsOrigin(), credentials: true }));
  app.use(cookieParser());
  app.use(express.json());

  app.use('/auth', createAuthRoutes(deps.loginUseCase));
  app.use('/reqres', authMiddleware, createReqResProxyRoutes(deps.reqResClient));
  app.use('/users', authMiddleware, createUsersRoutes(deps.importUserUseCase, deps.getSavedUsersUseCase, deps.getSavedUserUseCase, deps.deleteSavedUserUseCase));
  app.use('/posts', authMiddleware, createPostsRoutes(deps.createPostUseCase, deps.getPostsUseCase, deps.getPostUseCase, deps.updatePostUseCase, deps.deletePostUseCase));

  app.use(errorHandler);
  return app;
}
