const express = require("express");
const Router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
Router.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

Router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "http://localhost:3001/login",
    }),
     function (req, res) {
        // Successful authentication, redirect home.
        try {
            const result = req.user;
            const refreshToken = jwt.sign(
                {
                    "_id": result._id
                },
                process.env.REFRESH_TOKEN_SECRET,
                {expiresIn: '7d'}
            )

            // Create secure cookie with refresh token
            res.cookie('jwt', refreshToken, {
                sameSite: 'None',
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
            const token = jwt.sign(
                {
                    "user":
                        {
                            email: result.email,
                            fullname: result.fullname,
                            roles: result.roles,
                            phone: result.phone,
                            city: result.city,
                            country: result.country,
                            isBlocked: result.isBlocked,
                            verified: result.verified,
                            age: result.age,
                            avatar: result.avatar
                        }
                },
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: '60m'}
            )
            res.redirect(
                `http://localhost:3001?token=${token}`
            )

        } catch (err) {
            console.log(err.message);
        }

    }
);

module.exports = Router;