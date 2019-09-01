import Sequelize from 'sequelize';
import User from '../app/models/User';
import File from '../app/models/File';

import databaseConfig from '../config/database02';

const models = [User, File];

class DataBase {
  constructor() {
    this.init();
  }
  init() {
    this.connection = new Sequelize(databaseConfig);
    models.map(model => model.init(this.connection));
  }
}
export default new DataBase();
