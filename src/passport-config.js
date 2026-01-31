const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const users = require("./models/user.models");
const { logInfo } = require('./config/logger'); 


passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const user = await users.getUserByUsername(username);
            if (!user) {
                return done(null, false, {message: "No user with that username"});
            }
            if (await bcrypt.compare(password, user.password)) {
                logInfo('User logged in: ', {
                    userId: user.id
                });
                return done(null, user.id);
            } else {
                return done(null, false, {message: "Incorrect password"});
            }
        } catch (error) {
            throw error;
        }
    }
));

passport.serializeUser((userId, done) => {
    done(null, userId);
});

passport.deserializeUser(async (userId, done) => {
    try {
        const user = await users.getUserById(userId);
        const obj = { id: userId, username: user.username, subscription_status: user.subscription_status };
        done(null, obj);
    } catch (error) {
        console.log("Error deserializing user: ", error)
        done(error, null);
    }
});

// Dev Auto Sign in middleware
function autoLoginDev(req, res, next) {
    if (process.env.NODE_ENV !== 'development') {
        return next();
    }

    // Already logged in
    if (req.isAuthenticated()) {
        return next();
    }

    // Dev user ID
    const devUserId = process.env.DEV_USER_ID;

    req.login(devUserId, (err) => {
        if (err) {
        return next(err);
        }
        next();
    });
};

module.exports = { passport, autoLoginDev };