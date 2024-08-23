const db = require("mariadb");

const pool = db.createPool({
    host: process.env.DB_HOST, 
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
});

// Connect to database and check for errors
async function getConnection(){
    try {
        const connection = await pool.getConnection();
        //console.log("Successfully connected to MariaDB");
        return connection;
    } catch (err) {
        console.error("Error connecting to database: ", err);
        throw error;
    }
};

module.exports = { getConnection, authPool:pool};