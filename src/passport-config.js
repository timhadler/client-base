const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const db = require("./database");
const clients = require("./models/client-models");


passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const user = await clients.getUserByUsername(db.authPool, username);
            if (!user) {
                return done(null, false, {message: "No user with that username"});
            }
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user.id);
            } else {
                return done(null, false, {message: "Incorrect password"});
            }
        } catch (error) {
            console.log("Error serializing user", error);
        }
    }
));

passport.serializeUser((userId, done) => {
    done(null, userId);
});

passport.deserializeUser(async (userId, done) => {
    try {
        const user = await clients.getUserById(db.authPool, userId);
        //user.pool = db.authPool;
        const obj = { id: user.id, username: user.username, pool: await db.getUserPool(user.username) }
        //console.log(obj.pool);
        done(null, obj);
    } catch (error) {
        console.log("Error deserializing user: ", error)
        done(error, null);
    }
});

module.exports = passport;