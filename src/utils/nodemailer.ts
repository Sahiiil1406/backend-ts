import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.NODEMAILER_EMAIL, // Your Gmail address
    pass: process.env.NODEMAILER_PASSWORD, // Your Gmail App Password
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendMail = async (
  to: string,
  subject: string,
  text: string,
  html: string
) => {
  try {
    const info = await transporter.sendMail({
      from: `"Your Name" <${process.env.NODEMAILER_EMAIL}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
