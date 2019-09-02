import Sequelize from 'sequelize';
import User from '../app/models/User';
import File from '../app/models/File';

import databaseConfig from '../config/database02';
import Meetup from '../app/models/Meetup';

const models = [User, File, Meetup];

class DataBase {
  constructor() {
    this.init();
  }
  init() {
    this.connection = new Sequelize(databaseConfig);
    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }
}
export default new DataBase();
