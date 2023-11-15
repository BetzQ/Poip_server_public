import { Request, Response } from "express";
import { Router } from "express";
import DB from "../db";

const getUserInfoRoute = Router();

getUserInfoRoute.get(
  "/get-user-info/:auth_token",
  async (req: Request, res: Response) => {
    const authTokenParam = req.params.auth_token;

    try {
      const db = await DB();
      const users = db.collection("users");

      const user = await users.findOne({ auth_token: authTokenParam });

      if (!user) {
        res.status(404).json({ message: "No user found" });
        return;
      }

      const sanitizedUser = {
        name: user.name,
        username: user.username,
        auth_token: user.auth_token,
        email: user.email,
        Path: user.Path,
        following: user.following,
        followers: user.followers,
        videos: user.videos,
      };

      res.json(sanitizedUser);
    } catch (error) {
      res.status(500).json({ message: "Error fetching data from MongoDB" });
    }
  }
);

export default getUserInfoRoute;
