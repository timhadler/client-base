// Create customer subscription
exports.createSubscription = async (user, customerId, subscriptionId, product, startDate, endDate, nextBillingDate, status) => {
    const sqlQuery = "UPDATE users SET stripe_subscription_id = ?, subscription_status = ?, subscription_tier = ?, subscription_start = ?, subscription_end = ?, next_billing_date = ? WHERE stripe_customer_id = ?";
    const db = await user.getConnection();
    await db.query(sqlQuery, [subscriptionId, status, product, startDate, endDate, nextBillingDate, customerId]);

    db.release();
};

exports.deleteSubscription = async (user, customerId, status) => {
    const sqlQuery = "UPDATE users SET subscription_status = ?, subscription_end = CURRENT_TIMESTAMP(), subscription_tier = ?, next_billing_date = ? WHERE stripe_customer_id = ?";
    const db = await user.getConnection();
    await db.query(sqlQuery, [status, null, null, customerId]);

    db.release();
};