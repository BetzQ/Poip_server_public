import { Request, Response } from "express";
import { Router } from "express";
import bcrypt from "bcrypt";
import DB from "../db";
import jwt from "jsonwebtoken";

const loginRoute = Router();

loginRoute.post("/login", async (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    res.status(400).json({ message: "Identifier and password are required" });
    return;
  }

  try {
    const db = await DB();
    const users = db.collection("users");

    const user = await users.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user) {
      res
        .status(404)
        .json({ message: "Invalid username or email or password" });
      return;
    }

    if (!user.isVerify) {
      res.status(401).json({ message: "Unverified", email: user.email });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res
        .status(401)
        .json({ message: "Invalid username or email or password" });
      return;
    }

    const authToken = jwt.sign({ userId: user._id }, "secret_key", {
      expiresIn: "1h",
    });

    await users.updateOne(
      { _id: user._id },
      { $set: { auth_token: authToken } }
    );

    res.json({
      success: true,
      message: "Login successful",
      authToken,
      username: user.username,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default loginRoute;
