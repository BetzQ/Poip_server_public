import { Request, Response } from "express";
import { Router } from "express";
import { ObjectId } from "mongodb";
import DB from "../../db";

const deleteNoteRoute = Router();

deleteNoteRoute.delete(
  "/delete-note/:id",
  async (req: Request, res: Response) => {
    try {
      const db = await DB();
      const users = db.collection("users");
      const notes = db.collection("notes");
      const posts = db.collection("posts");

      const { auth_token } = req.body;
      const noteId = req.params.id;

      const user = await users.findOne({ auth_token });

      if (!user) {
        return res
          .status(401)
          .json({ message: `Unauthorized. Invalid auth_token` });
      }

      const noteObjectId = new ObjectId(noteId);

      const note = await notes.findOne({
        _id: noteObjectId,
        user_id: user._id,
      });

      if (!note) {
        return res
          .status(404)
          .json({ message: `Catatan tidak ditemukan atau tidak diizinkan.` });
      }

      await notes.deleteOne({ _id: noteObjectId });

      await posts.deleteOne({ note_id: noteObjectId });

      const userNotes = await notes.find({ user_id: user._id }).toArray();
      const postsData = await posts.find().toArray();

      res.json({ userNotes, postsData });
    } catch (error) {
      res.status(500).json({ message: "Error deleting note from MongoDB" });
    }
  }
);

export default deleteNoteRoute;
