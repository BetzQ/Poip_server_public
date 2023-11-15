import { Request, Response } from "express";
import { Router } from "express";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import DB from "../db";

const registerRoute = Router();

export const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "avwan2.avwan@gmail.com",
    pass: "iyslunaqhuugqjie",
  },
});

const otpMap = new Map();

registerRoute.post("/register", async (req: Request, res: Response) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password) {
    res.status(400).json({ message: "All input are required" });
    return;
  }

  try {
    const db = await DB();
    const users = db.collection("users");

    const existingUser = await users.findOne({ username });

    if (existingUser && existingUser.isVerify === true) {
      res.status(409).json({ message: "Username already exists" });
      return;
    }

    const existingEmail = await users.findOne({ email });

    if (existingEmail && existingEmail.isVerify === true) {
      res.status(409).json({ message: "Email already exists" });
      return;
    }

    if (existingUser && existingUser.isVerify === false) {
      res.status(201).json({
        message: "User registered successfully",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const authToken =
      Math.random().toString(36).substr(2) +
      Math.random().toString(36).substr(2);

    const newUser = {
      name,
      username,
      email,
      password: hashedPassword,
      auth_token: authToken,
      isVerify: false,
    };
    const result = await users.insertOne(newUser);

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpMap.set(email, otp);

    const mailOptions = {
      from: '"poip" <avwan2.avwan@gmail.com>',
      to: email,
      subject: "Kode OTP Anda",
      text: `Kode OTP Anda adalah: ${otp}`,
    };

    transporter.sendMail(
      mailOptions,
      (error: Error | null, info: nodemailer.SentMessageInfo) => {
        if (error) {
          console.error("Error sending OTP email:", error);
          res.status(500).json({ message: "Error sending OTP email" });
          return;
        }

        console.log("OTP email sent with ID:", info.messageId);

        res.status(201).json({
          message: "User registered successfully",
        });
      }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user" });
  }
});

registerRoute.post("/verify", async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const db = await DB();
  const users = db.collection("users");
  const existingUser = await users.findOne({ email });

  const storedOTP = otpMap.get(email);

  if (storedOTP && storedOTP.toString() === otp) {
    otpMap.delete(email);

    await users.updateOne(
      { email },
      {
        $set: { isVerify: true },
      }
    );

    res.status(200).json({
      message: "Verification successful",
      userId: existingUser?._id,
      authToken: existingUser?.auth_token,
      username: existingUser?.username,
    });
  } else {
    res.status(400).json({ message: "Invalid OTP" });
  }
});

export default registerRoute;
