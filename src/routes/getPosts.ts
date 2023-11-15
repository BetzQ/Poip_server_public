import { Request, Response, Router } from "express";
import DB from "../db";

const getPostsRoute = Router();

getPostsRoute.get("/get-posts", async (req: Request, res: Response) => {
  try {
    const db = await DB();

    const posts = await db.collection("posts").find().toArray();

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error getting posts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default getPostsRoute;
