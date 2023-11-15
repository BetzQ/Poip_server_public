import { Request, Response } from "express";
import { Router } from "express";
import DB from "../db";
import { transporter } from "./registerRoute";
import { ObjectId } from "mongodb";

const changeUsernameRoute = Router();

const verificationCodes = new Map<string, string>();

changeUsernameRoute.post(
  "/change-username",
  async (req: Request, res: Response) => {
    const { authToken, email, username } = req.body;

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

      if (!username) {
        return res
          .status(400)
          .json({ message: "Username missing in request body" });
      }

      const currentTime: Date = new Date();
      if (user.lastUsernameChange) {
        const timeSinceLastChange =
          currentTime.getTime() - user.lastUsernameChange;
        if (timeSinceLastChange < 24 * 60 * 60 * 1000) {
          const timeRemaining = 24 * 60 * 60 * 1000 - timeSinceLastChange;
          const hoursRemaining = Math.floor(timeRemaining / (60 * 60 * 1000));
          return res
            .status(400)
            .json({
              message: `You can request username change again in ${hoursRemaining} hours.`,
            });
        }
      }

      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      verificationCodes.set(email, verificationCode);

      const mailOptions = {
        from: '"poip" <avwan2.avwan@gmail.com>',
        to: email,
        subject: "Kode Verifikasi Penggantian Username",
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
      console.error("Error changing username:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

changeUsernameRoute.post(
  "/verify-change-username",
  async (req: Request, res: Response) => {
    const { email, verificationCode, username } = req.body;

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

      const userUpdateResult = await users.updateOne(
        { email },
        {
          $set: { username, lastUsernameChange: new Date() },
        }
      );

      if (userUpdateResult.modifiedCount === 1) {
        verificationCodes.delete(email);

        const posts = db.collection("posts");
        const user = await users.findOne({ email });
        const user_id = new ObjectId(user?._id);

        const postsUpdateResult = await posts.updateMany(
          { user_id },
          {
            $set: { username: username },
          }
        );

        if (postsUpdateResult.modifiedCount > 0) {
          res.status(200).json({ message: "Username changed successfully" });
        } else {
          res
            .status(200)
            .json({
              message:
                "Username changed successfully in users, but no posts were updated",
            });
        }
      } else {
        res.status(401).json({ message: "Failed to change username in users" });
      }
    } catch (error) {
      console.error("Error changing username:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

export default changeUsernameRoute;
