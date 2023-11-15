import { Request, Response } from "express";
import { Router } from "express";
import { ObjectId } from "mongodb";
import DB from "../../db";

const postNoteRoute = Router();

postNoteRoute.post("/postNote", async (req: Request, res: Response) => {
  try {
    const db = await DB();
    const users = db.collection("users");
    const notes = db.collection("notes");
    const posts = db.collection("posts");

    const { auth_token, noteId } = req.body;

    const user = await users.findOne({ auth_token });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Invalid auth_token." });
    }

    const noteObjectId = new ObjectId(noteId);

    const noteDocument = await notes.findOne({
      _id: noteObjectId,
      user_id: user._id,
    });

    if (!noteDocument) {
      return res
        .status(404)
        .json({ message: "Note not found or doesn't belong to the user." });
    }

    const existingPost = await posts.findOne({
      user_id: user._id,
      note_id: noteObjectId,
    });

    if (existingPost) {
      return res
        .status(400)
        .json({ message: "Note has already been posted by the user." });
    }

    const newPost = {
      user_id: user._id,
      note_id: noteObjectId,
      username: user.username,
      note: noteDocument.note,
      note_title: noteDocument.note_title,
    };

    const result = await posts.insertOne(newPost);

    const allPosts = await posts.find({}).project({ _id: 0 }).toArray();

    res.json(allPosts);
  } catch (error) {
    res.status(500).json({ message: "Error adding note to MongoDB" });
  }
});

export default postNoteRoute;
