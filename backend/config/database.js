import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import winston from 'winston';

dotenv.config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'database' }
});

// Database configuration
const config = {
  development: {
    // Use SQLite for development if PostgreSQL not available
    dialect: process.env.DB_DIALECT || 'sqlite',
    storage: process.env.DB_DIALECT === 'postgres' ? undefined : './database.sqlite',
    
    // PostgreSQL settings (used when DB_DIALECT=postgres)
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'pilot_invoices',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    
    logging: (msg) => logger.info(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
};

const env = process.env.NODE_ENV || 'development';
const sequelize = new Sequelize(config[env]);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('PostgreSQL connection established successfully');
    return true;
  } catch (error) {
    logger.error('Unable to connect to PostgreSQL:', error);
    return false;
  }
};

// Sync database models
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    logger.info(`Database synced successfully${force ? ' (with force)' : ''}`);
    return true;
  } catch (error) {
    logger.error('Failed to sync database:', error);
    return false;
  }
};

export { sequelize, testConnection, syncDatabase };
export default sequelize;
