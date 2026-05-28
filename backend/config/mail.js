import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config();
console.log("EMAIL:", process.env.EMAIL);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded" : "Missing");
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async (reciever,otp) => {
    transporter.sendMail({
        from:`${process.env.EMAIL}`,
        to:reciever,
        subject:"Reset Your Password",
        html: `<p> Your OTP for password reset is <b>${otp}</b>.
        It expires in 5 minutes.</p>`
    })
}

export default sendMail