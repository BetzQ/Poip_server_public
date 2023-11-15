import { Request, Response } from "express";
import { Router } from "express";
import bcrypt from "bcrypt";
import DB from "../db";
import { transporter } from "./registerRoute";

const changePasswordRoute = Router();

const verificationCodes = new Map<string, string>();

changePasswordRoute.post(
  "/change-password",
  async (req: Request, res: Response) => {
    const { authToken, email, password } = req.body;

    try {
      const db = await DB();
      const users = db.collection("users");

      if (!authToken) {
        return res
          .status(401)
          .json({ message: "Authentication token missing" });
      }

      const user = await users.findOne({ auth_token: authToken });

      if (!user) {
        return res
          .status(401)
          .json({ message: "Invalid authentication token" });
      }

      if (!email) {
        return res
          .status(400)
          .json({ message: "Email missing in request body" });
      }

      if (email !== user.email) {
        return res
          .status(400)
          .json({ message: "Email does not match the authenticated user" });
      }

      if (!password) {
        return res
          .status(400)
          .json({ message: "Password missing in request body" });
      }

      const currentTime: Date = new Date();
      if (user.lastUsernameChange) {
        const timeSinceLastChange =
          currentTime.getTime() - user.lastPasswordChange;
        if (timeSinceLastChange < 24 * 60 * 60 * 1000) {
          const timeRemaining = 24 * 60 * 60 * 1000 - timeSinceLastChange;
          const hoursRemaining = Math.floor(timeRemaining / (60 * 60 * 1000));
          return res
            .status(400)
            .json({
              message: `You can request password change again in ${hoursRemaining} hours.`,
            });
        }
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid password" });
      }

      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      verificationCodes.set(email, verificationCode);

      const mailOptions = {
        from: '"poip" <avwan2.avwan@gmail.com>',
        to: email,
        subject: "Kode Verifikasi Penggantian Password",
        text: `Kode verifikasi Anda adalah: ${verificationCode}`,
      };

      transporter.sendMail(mailOptions, async (error: Error | null) => {
        if (error) {
          console.error("Error sending verification code email:", error);
          res
            .status(500)
            .json({ message: "Error sending verification code email" });
          return;
        }

        res
          .status(200)
          .json({ message: "Verification code sent successfully" });
      });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

changePasswordRoute.post(
  "/verify-change-password",
  async (req: Request, res: Response) => {
    const { email, verificationCode, newPassword } = req.body;

    const storedVerificationCode = verificationCodes.get(email);

    if (
      !storedVerificationCode ||
      storedVerificationCode !== verificationCode
    ) {
      return res.status(401).json({ message: "Invalid verification code" });
    }

    try {
      const db = await DB();
      const users = db.collection("users");

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      await users.updateOne(
        { email },
        {
          $set: { password: hashedNewPassword, lastPasswordChange: new Date() },
        }
      );

      verificationCodes.delete(email);

      res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

export default changePasswordRoute;
