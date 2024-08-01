const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    // service: 'sendgrid',
    // secure: false,
    port: "" ,
    host: "" ,
    auth: {
        user: "" ,
        pass: "" 
    }
});

module.exports = transporter;
