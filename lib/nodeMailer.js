import nodemailer from "nodemailer";

const testAccount = await nodemailer.createTestAccount();

// Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: "krista.cummings@ethereal.email",
    pass: "Q8WvK7H6uZD6Hjx8Hd",
  },
});

// Send an email using async/await
export const Sendmail = async ({ to, subject, html }) => {
  const info = await transporter.sendMail({
    from: `'URL SHORTNER' < ${testAccount.user} >`,
    to,
    subject,
    html,
  });

  // console.log("result:", info);

  const testEmailUrl = nodemailer.getTestMessageUrl(info);
  console.log("verify email:",testEmailUrl);
};
