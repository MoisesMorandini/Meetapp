import Sequelize from 'sequelize';
import databaseConfig from '../config/database02';
import Subscription from '../app/models/Subscription';
import User from '../app/models/User';
import File from '../app/models/File';

import Meetup from '../app/models/Meetup';

const models = [User, File, Subscription, Meetup];

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
