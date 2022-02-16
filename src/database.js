const db = require("mariadb");

const pool = db.createPool({
    host: process.env.DB_HOST, 
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
});

// Connect to database and check for errors
pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === "PROTOCOL_CONNECTION_LOST") {
            console.error("Database connection lost");
        } else if(err.code === "ER_CON_COUNT_ERROR") {
            console.error("Database connection limit exceeded");
        } else if (err.code === "ECONREFUSED") {
            console.error("Database connection refused");
        }
    }
    if (connection) {
        console.log("Connected to database");
        connection.release();
    }

    return;
});

module.exports = pool;