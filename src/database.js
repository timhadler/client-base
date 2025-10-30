const mariadb = require("mariadb");

const pool = mariadb.createPool({
    host: process.env.DB_HOST, 
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    idleTimeout: 60000,
    acquireTimeout: 30000,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;