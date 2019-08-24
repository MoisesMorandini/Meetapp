import { Router } from 'express';
import User from './app/models/User';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionControllers';
import authMiddleware from './app/middlewares/auth';

const routes = new Router();
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
export default routes;
