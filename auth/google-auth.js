const UserModel = require("../models/User");
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

require('dotenv').config()
module.exports = () => {
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

// Désérialisation de l'utilisateur
    passport.deserializeUser(function (id, done) {
        UserModel.findById(id, function (err, user) {
            done(err, user);
        });
    });
// Définition de la stratégie Google OAuth 2.0
    passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback",
        },

        async function(accessToken, refreshToken, profile, cb) {
            try {
                // console.log(profile);
                let user = await UserModel.findOne({ email: profile._json.email });
                if (user) {
                    const updatedUser = {
                        fullname: profile.displayName,
                        email: profile.emails[0].value,
                        pic: profile.photos[0].value,
                        secret: accessToken,
                        verified:profile._json.email_verified,
                    };
                    const result = await UserModel.findOneAndUpdate(
                        { _id: user._id },
                        { $set: updatedUser },
                        { new: true }
                    );
                    return cb(null, result);
                } else {
                    const newUser = new UserModel({
                        googleId: profile.id,
                        fullname: profile.displayName,
                        email: profile.emails[0].value,
                        pic: profile.photos[0].value,
                        secret: accessToken,
                        avatar:profile.photos[0].value,
                        verified:true,
                        roles:[10]
                    });
                    const result = await newUser.save();
                    return cb(null, result);
                }
            } catch (err) {
                return cb(err, null);
            }
        }));
};