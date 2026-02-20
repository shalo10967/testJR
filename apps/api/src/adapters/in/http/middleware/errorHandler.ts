import type { Request, Response, NextFunction } from 'express';
import { UserNotFoundError } from '../../../../application/use-cases/ImportUserUseCase.js';
import { SavedUserNotFoundError } from '../../../../application/use-cases/DeleteSavedUserUseCase.js';
import { PostNotFoundError, AuthorNotFoundError } from '../../../../application/use-cases/PostsUseCases.js';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof UserNotFoundError) {
    res.status(404).json({ message: `User ${err.id} not found in ReqRes` });
    return;
  }
  if (err instanceof SavedUserNotFoundError) {
    res.status(404).json({ message: 'Saved user not found' });
    return;
  }
  if (err instanceof PostNotFoundError) {
    res.status(404).json({ message: `Post ${err.id} not found` });
    return;
  }
  if (err instanceof AuthorNotFoundError) {
    res.status(400).json({ message: `Author user ${err.authorUserId} not found. Save the user locally first.` });
    return;
  }
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes('user not found')) {
      res.status(404).json({ message: 'User not found in ReqRes' });
      return;
    }
    if (msg.includes('invalid') && msg.includes('credential')) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    // Always log so you can see the real error in the API terminal
    console.error('[errorHandler]', err);

    // In production, expose message only for known external/safe errors (e.g. ReqRes)
    const safeToExpose =
      err.message.includes('ReqRes') ||
      err.message.includes('Invalid JSON') ||
      err.message.includes('Failed to fetch');
    const responseMessage =
      process.env.NODE_ENV !== 'production' || safeToExpose
        ? err.message
        : 'Internal server error';

    res.status(500).json({ message: responseMessage });
    return;
  }
  res.status(500).json({ message: 'Internal server error' });
}
