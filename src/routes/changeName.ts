import { Request, Response } from "express";
import { Router } from "express";
import DB from "../db";

const changeNameRoute = Router();

changeNameRoute.post("/change-name", async (req: Request, res: Response) => {
  const { authToken, name } = req.body;

  try {
    const db = await DB();
    const users = db.collection("users");

    if (!authToken) {
      return res.status(401).json({ message: "Authentication token missing" });
    }

    const user = await users.findOne({ auth_token: authToken });

    if (!user) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    if (!name) {
      return res.status(400).json({ message: "Name missing in request body" });
    }

    const userUpdateResult = await users.updateOne(
      { auth_token: authToken },
      {
        $set: { name },
      }
    );

    if (userUpdateResult.modifiedCount === 1) {
      res.status(200).json({ message: "Name changed successfully" });
    } else {
      res.status(401).json({ message: "Failed to change name" });
    }
  } catch (error) {
    console.error("Error changing name:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default changeNameRoute;
