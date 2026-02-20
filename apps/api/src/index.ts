import 'dotenv/config';
import mongoose from 'mongoose';
import { createApp } from './adapters/in/http/app.js';
import { ReqResClient } from './adapters/out/reqres/ReqResClient.js';
import { MongoUserRepository } from './adapters/out/persistence/MongoUserRepository.js';
import { MongoPostRepository } from './adapters/out/persistence/MongoPostRepository.js';
import { LoginUseCase } from './application/use-cases/LoginUseCase.js';
import { ImportUserUseCase } from './application/use-cases/ImportUserUseCase.js';
import { GetSavedUsersUseCase } from './application/use-cases/GetSavedUsersUseCase.js';
import { GetSavedUserUseCase } from './application/use-cases/GetSavedUserUseCase.js';
import { DeleteSavedUserUseCase } from './application/use-cases/DeleteSavedUserUseCase.js';
import {
  CreatePostUseCase,
  GetPostsUseCase,
  GetPostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
} from './application/use-cases/PostsUseCases.js';

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/testjr';
const PORT = Number(process.env.PORT) || 4000;
const JWT_SECRET = process.env.JWT_SECRET ?? 'change-me-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

async function main() {
  await mongoose.connect(MONGODB_URI);
  const userRepo = new MongoUserRepository();
  const postRepo = new MongoPostRepository();
  const reqRes = new ReqResClient();

  const loginUseCase = new LoginUseCase(reqRes, JWT_SECRET, JWT_EXPIRES_IN);
  const importUserUseCase = new ImportUserUseCase(reqRes, userRepo);
  const getSavedUsersUseCase = new GetSavedUsersUseCase(userRepo);
  const getSavedUserUseCase = new GetSavedUserUseCase(userRepo);
  const deleteSavedUserUseCase = new DeleteSavedUserUseCase(userRepo);
  const createPostUseCase = new CreatePostUseCase(postRepo, userRepo);
  const getPostsUseCase = new GetPostsUseCase(postRepo);
  const getPostUseCase = new GetPostUseCase(postRepo);
  const updatePostUseCase = new UpdatePostUseCase(postRepo);
  const deletePostUseCase = new DeletePostUseCase(postRepo);

  const app = createApp({
    reqResClient: reqRes,
    loginUseCase,
    importUserUseCase,
    getSavedUsersUseCase,
    getSavedUserUseCase,
    deleteSavedUserUseCase,
    createPostUseCase,
    getPostsUseCase,
    getPostUseCase,
    updatePostUseCase,
    deletePostUseCase,
  });

  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
