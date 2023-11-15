import { Request, Response, Router } from "express";
import DB from "../../db";

const getNotesRoute = Router();

getNotesRoute.get("/get-notes", async (req: Request, res: Response) => {
  try {
    const db = await DB();
    const authToken = req.headers["auth-token"];

    const user = await db.collection("users").findOne({
      auth_token: authToken,
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    const userId = user._id;

    const notes = await db
      .collection("notes")
      .find({
        user_id: userId,
      })
      .toArray();

    res.status(200).json(notes);
  } catch (error) {
    console.error("Error getting notes:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default getNotesRoute;
