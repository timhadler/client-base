const db = require("mariadb");

const pool = db.createPool({
    host: process.env.DB_HOST, 
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
});

async function getUserPool(user) {
    let dbUser, dbPass;

    switch(user) {
        case 'tim':
            dbUser = process.env.TIM_USER;
            dbPass = process.env.TIM_PASS;
            break;
        default:
            throw new Error("No db credentials found for user:", user);
    }

    return db.createPool({
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: dbUser, 
        password: dbPass,
    });
};

// Connect to database and check for errors
// async function getConnection(){
//     try {
//         const connection = await pool.getConnection();
//         //console.log("Successfully connected to MariaDB");
//         return connection;
//     } catch (err) {
//         console.error("Error connecting to database: ", err);
//         throw error;
//     }
// };

module.exports = { getUserPool, authPool:pool};