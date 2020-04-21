import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import SignatureController from './app/controllers/SignatureController';
import DeliverymanController from './app/controllers/DeliverymanController';
import PackageController from './app/controllers/PackageController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.get('/', (req, res) => {
  return res.json({ message: 'API works! Congrats!' });
});

/**
 * Session routes
 */
routes.post('/sessions', SessionController.store);
routes.use(authMiddleware);

// Files routes
routes.post('/files', upload.single('file'), FileController.store);
routes.post('/signature', upload.single('file'), SignatureController.store);

/**
 * Recipients routes
 */
routes.get('/recipients', RecipientController.index);
routes.post('/recipients', RecipientController.store);

/**
 * Deliveryman routes
 */
routes.post('/deliveryman', DeliverymanController.store);
routes.get('/deliveryman', DeliverymanController.index);
routes.put('/deliveryman/:id', DeliverymanController.update);
routes.delete('/deliveryman/:id', DeliverymanController.delete);

/**
 * Packages routes
 */
routes.get('/package', PackageController.index);
routes.post('/package', PackageController.store);
routes.put('/package/:id', PackageController.update);
routes.delete('/package/:id', PackageController.delete);

export default routes;
