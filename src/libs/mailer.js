import nodemailer from 'nodemailer';

const createTransporter = () => {
 return nodemailer.createTransport({
  host: process.env.SENDINBLUE_SMTP_HOST,
  port: process.env.SENDINBLUE_SMTP_PORT,
  auth: {
   user: process.env.SENDINBLUE_SMTP_USER,
   pass: process.env.SENDINBLUE_SMTP_PASS,
  },
 });
};

const sendEmail = async (to, subject, text) => {
 const transporter = createTransporter();

 const mailOptions = {
  from: '"OPTIMOM SAS" <serviceclientfr2024@gmail.com>',
  to,
  subject,
  text,
 };

 await transporter.sendMail(mailOptions);
};

export default sendEmail;
