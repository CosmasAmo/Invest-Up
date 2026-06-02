const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  development: {
    url: process.env.MYSQL_URL,
    dialect: 'mysql',
    logging: false
  },
  test: {
    url: process.env.MYSQL_URL,
    dialect: 'mysql',
    logging: false
  },
  production: {
    url: process.env.MYSQL_URL,
    dialect: 'mysql',
    logging: false
  }
};