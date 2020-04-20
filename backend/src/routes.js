import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.get('/', (req, res) => {
  return res.json({ message: 'API works! Congrats!' });
});

/**
 * SESSION CONTROLLER
 */
routes.post('/sessions', SessionController.store);
routes.use(authMiddleware);

routes.post('/files', upload.single('file'), FileController.store);

routes.get('/recipients', RecipientController.index);
routes.post('/recipients', RecipientController.store);

routes.post('/deliveryman', DeliverymanController.store);
routes.get('/deliveryman', DeliverymanController.index);
routes.put('/deliveryman/:id', DeliverymanController.update);
routes.delete('/deliveryman/:id', DeliverymanController.delete);

export default routes;
