import { Request, Response } from "express";
import { Router } from "express";
import { ObjectId } from "mongodb";
import DB from "../../db";

const unpostNoteRoute = Router();

unpostNoteRoute.post("/unpostNote", async (req: Request, res: Response) => {
  try {
    const db = await DB();
    const users = db.collection("users");
    const posts = db.collection("posts");

    const { auth_token, noteId } = req.body;

    const user = await users.findOne({ auth_token });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Invalid auth_token." });
    }

    const noteObjectId = new ObjectId(noteId);

    const result = await posts.deleteOne({
      note_id: noteObjectId,
      user_id: user._id,
    });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Post not found or doesn't belong to the user." });
    }

    const allPosts = await posts.find({}).project({ _id: 0 }).toArray();

    res.json(allPosts);
  } catch (error) {
    res.status(500).json({ message: "Error deleting post from MongoDB" });
  }
});

export default unpostNoteRoute;
