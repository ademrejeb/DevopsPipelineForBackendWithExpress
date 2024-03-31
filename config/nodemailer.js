const nodemailer = require("nodemailer");
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "moatazfoudhailii@gmail.com",
        pass: "kdel aiws mgsx mopc",
    },
});

module.exports = transporter