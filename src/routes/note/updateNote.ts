import { Request, Response } from "express";
import { Router } from "express";
import DB from "../../db";
import { ObjectId } from "mongodb";

const updateNoteRoute = Router();

updateNoteRoute.put("/update-note/:id", async (req: Request, res: Response) => {
  try {
    const db = await DB();
    const users = db.collection("users");
    const notes = db.collection("notes");

    const { note, note_title, auth_token } = req.body;
    const noteId = req.params.id;

    const user = await users.findOne({ auth_token });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Invalid auth_token." });
    }

    const noteObjectId = new ObjectId(noteId);

    const existingNote = await notes.findOne({
      _id: noteObjectId,
      user_id: user._id,
    });

    if (!existingNote) {
      return res
        .status(404)
        .json({ message: "Note not found or does not belong to the user." });
    }

    const updatedNote = {
      note,
      note_title,
    };

    await notes.updateOne({ _id: noteObjectId }, { $set: updatedNote });

    const userNotes = await notes.find({ user_id: user._id }).toArray();

    res.json(userNotes);
  } catch (error) {
    res.status(500).json({ message: "Error updating note in MongoDB" });
  }
});

export default updateNoteRoute;
