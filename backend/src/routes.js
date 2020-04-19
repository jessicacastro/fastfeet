import { Router } from 'express';

import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.get('/', (req, res) => {
  return res.json({ message: 'API works! Congrats!' });
});

/**
 * SESSION CONTROLLER
 */
routes.post('/sessions', SessionController.store);
// routes.use(authMiddleware);

export default routes;
