const db = require("../config/database");

/***********************************************************
 * Read
 ***********************************************************/
exports.getUserById = async function(id) {
    const sqlQuery = "SELECT id, email as username, subscription_status from users WHERE id=?";
    const rows = await db.query(sqlQuery, id);

    if (rows.length > 0) {
        return rows[0];
    } else {
        return null;
    };
}

exports.getUserByUsername = async function(username) {
    const sqlQuery = "SELECT id, email, password_hash as password from users WHERE email=?";
    const rows = await db.query(sqlQuery, username);

    if (rows.length > 0) {
        return rows[0];
    } else {
        return null;
    };
}

/***********************************************************
 * Create
 ***********************************************************/
exports.createUser = async function(email, password, stripeID) {
    const sqlQuery = "INSERT INTO users (email, password_hash, stripe_customer_id) VALUES(?, ?, ?)";
    await db.query(sqlQuery, [email, password, stripeID]);
}

/***********************************************************
 * Edit
 ***********************************************************/
// Update user record with subscription details
exports.createSubscription = async (customerId, subscriptionId, product, startDate, endDate, nextBillingDate, status) => {
    const sqlQuery = "UPDATE users SET stripe_subscription_id = ?, subscription_status = ?, subscription_tier = ?, subscription_start = ?, subscription_end = ?, next_billing_date = ? WHERE stripe_customer_id = ?";
    await db.query(sqlQuery, [subscriptionId, status, product, startDate, endDate, nextBillingDate, customerId]);
};

exports.deleteSubscription = async (customerId, status) => {
    const sqlQuery = "UPDATE users SET subscription_status = ?, subscription_end = CURRENT_TIMESTAMP(), subscription_tier = ?, next_billing_date = ? WHERE stripe_customer_id = ?";
    await db.query(sqlQuery, [status, null, null, customerId]);
};

exports.setSuccessfulPayment = async (customerId) => {
    const sqlQuery = "UPDATE users SET last_payment_at = CURRENT_TIMESTAMP() WHERE stripe_customer_id = ?";
    await db.query(sqlQuery, [customerId]);
};

exports.setFailedPayment = async (customerId) => {
    const sqlQuery = "UPDATE users SET last_payment_failed_at = CURRENT_TIMESTAMP() WHERE stripe_customer_id = ?";
    await db.query(sqlQuery, [customerId]);
};