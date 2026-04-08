const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
    process.env.MYSQL_DB || 'kalahaat_db',
    process.env.MYSQL_USER || 'root',
    process.env.MYSQL_PASSWORD || 'Thanush@752',
    {
        host: process.env.MYSQL_HOST || '127.0.0.1',
        dialect: 'mysql',
        logging: false, // Set to console.log to see SQL queries
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL Connected successfully with Sequelize');
    } catch (error) {
        console.error('❌ Unable to connect to the MySQL database:', error.message);
        // Don't exit process yet, as we need this for migration script
    }
};

module.exports = { sequelize, connectDB };
