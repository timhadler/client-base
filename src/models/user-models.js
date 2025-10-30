const db = require("../database");

// Create new user record
exports.createUser = async function(email, password) {
    const sqlQuery = "INSERT INTO users (email, password_hash) VALUES(?, ?)";
    const db = await user.getConnection();
    await db.query(sqlQuery, [email, password]);
    db.release();
}

// Update user record with subscription details
exports.createSubscription = async (user, customerId, subscriptionId, product, startDate, endDate, nextBillingDate, status) => {
    const sqlQuery = "UPDATE users SET stripe_subscription_id = ?, subscription_status = ?, subscription_tier = ?, subscription_start = ?, subscription_end = ?, next_billing_date = ? WHERE stripe_customer_id = ?";
    const db = await user.getConnection();
    await db.query(sqlQuery, [subscriptionId, status, product, startDate, endDate, nextBillingDate, customerId]);

    db.release();
};

// Update user record to reflect subscription deletion
exports.deleteSubscription = async (user, customerId, status) => {
    const sqlQuery = "UPDATE users SET subscription_status = ?, subscription_end = CURRENT_TIMESTAMP(), subscription_tier = ?, next_billing_date = ? WHERE stripe_customer_id = ?";
    const db = await user.getConnection();
    await db.query(sqlQuery, [status, null, null, customerId]);

    db.release();
};

// Update user record on successful payment
exports.setSuccessfulPayment = async (user, customerId) => {
    const sqlQuery = "UPDATE users SET last_payment_at = CURRENT_TIMESTAMP() WHERE stripe_customer_id = ?";
    const db = await user.getConnection();
    await db.query(sqlQuery, [customerId]);

    db.release();
};

// Update user record on failed payment
exports.setFailedPayment = async (user, customerId) => {
    const sqlQuery = "UPDATE users SET last_payment_failed_at = CURRENT_TIMESTAMP() WHERE stripe_customer_id = ?";
    const db = await user.getConnection();
    await db.query(sqlQuery, [customerId]);

    db.release();
};

// Reveives a user with a given id
exports.getUserById = async function(id) {
    const sqlQuery = "SELECT public_id as id, email as username from users WHERE public_id=?";
    //const db = await user.getConnection();
    const rows = await db.query(sqlQuery, id);

    //db.release();
    if (rows.length > 0) {
        return rows[0];
    } else {
        return null;
    };
}

// Reveives a user with a given username
exports.getUserByUsername = async function(username) {
    const sqlQuery = "SELECT public_id as id, email, password_hash as password from users WHERE email=?";
    //const db = await user.getConnection();
    const rows = await db.query(sqlQuery, username);

    //db.release();
    if (rows.length > 0) {
        return rows[0];
    } else {
        return null;
    };
}