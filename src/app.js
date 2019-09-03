import express from 'express';
import routes from './routes';
import './database';
class App {
  constructor() {
    this.server = express();

    this.middlewares();
    this.routes();
  }

  middlewares() {
    process.once('SIGINT', () => this.server.stop());
    process.once('SIGTERM', () => this.server.stop());
    this.server.use(express.json());
  }
  routes() {
    this.server.use(routes);
  }
}
export default new App().server;
