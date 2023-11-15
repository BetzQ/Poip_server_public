import { Request, Response } from "express";
import { Router } from "express";
import DB from "../db";

const getUsers = Router();

getUsers.get("/users", async (req: Request, res: Response) => {
  try {
    const db = await DB();
    const users = db.collection("users");

    const allUsers = await users.find().toArray();

    const sanitizedUsers = [];

    for (const user of allUsers) {
      const sanitizedUser = {
        username: user.username,
        name: user.name,
        Path: user.Path,
        following: user.following,
        followers: user.followers,
      };
      sanitizedUsers.push(sanitizedUser);
    }

    res.json(sanitizedUsers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data from MongoDB" });
  }
});

export default getUsers;
