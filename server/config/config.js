import dotenv from 'dotenv';
dotenv.config();

export default {
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