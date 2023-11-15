import { Request, Response } from "express";
import { Router } from "express";
import DB from "../../db";

const addNoteRoute = Router();

addNoteRoute.post("/add-note", async (req: Request, res: Response) => {
  try {
    const db = await DB();
    const users = db.collection("users");
    const notes = db.collection("notes");

    const { note, note_title, auth_token } = req.body;

    const user = await users.findOne({ auth_token });

    if (!user) {
      return res
        .status(401)
        .json({
          message: `Unauthorized. Invalid auth_token.${auth_token}--${note_title}`,
        });
    }

    const newNote = {
      user_id: user._id,
      note,
      note_title,
    };

    const result = await notes.insertOne(newNote);

    const userNotes = await notes.find({ user_id: user._id }).toArray();

    res.json({ userNotes, newNote });
  } catch (error) {
    res.status(500).json({ message: "Error adding note to MongoDB" });
  }
});

export default addNoteRoute;
