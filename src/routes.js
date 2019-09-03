import { Router } from 'express';
import User from './app/models/User';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionControllers';
import authMiddleware from './app/middlewares/auth';
import FileController from './app/controllers/FileController';
import multer from 'multer';
import multerConfig from './config/multer';
import MeetupController from './app/controllers/MeetupController';
import OrganizerController from './app/controllers/OrganizerController';
import SubscriptionController from './app/controllers/SubscriptionController';

const routes = new Router();
const upload = multer(multerConfig);

routes.get('/', async (req, res) => {
  console.log('=====================================================');
  const user = await User.create({
    name: 'moises',
    email: 'moises@hotmail.com',
    password_hash: '123456',
  });

  return res.json(user);
});

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);
routes.use(authMiddleware);
routes.put('/users', UserController.update);

routes.get('/meetup', MeetupController.index);
routes.post('/meetup', MeetupController.store);
routes.put('/meetup/:id', MeetupController.update);
routes.delete('/meetup/:id', MeetupController.delete);

routes.post('/subscription', SubscriptionController.store);
routes.get('/subscription', SubscriptionController.index);

routes.get('/organizer', OrganizerController.index);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
