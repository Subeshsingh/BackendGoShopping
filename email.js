const  nodemailer= require ('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_LOGIN,
    pass: process.env.EMAIL_PASSWORD
  }
});

const getPasswordResetURL = (userid, token) =>
  (`http://localhost:8000/reset_pw/${userid}/${token}`);

const resetPasswordTemplate = (email, url) => {
  const from = process.env.EMAIL_LOGIN
  const to = email
  const subject = "GoShopping password reset"
  const html = `
  <p>Hey ${email},</p>
  <p>We heard that you lost your GoShooping password. Sorry about that!</p>
  <p>But don’t worry! You can use the following link to reset your password:</p>
  <a href=${url}>${url}</a>
  <p>If you don’t use this link within 1 hour, it will expire.</p>
  <p>Happy Shopping! </p>
  <p>–Your friends at GoShopping</p>
  `

  return { from, to, subject, html }
}

module.exports = {
    transporter,
    getPasswordResetURL,
    resetPasswordTemplate
}