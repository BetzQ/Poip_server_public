import { Router } from "express";
import getUserInfoRoute from "./getUserInfoRoute";
import loginRoute from "./loginRoute";
import registerRoute from "./registerRoute";
import changePasswordRoute from "./changePasswordRoute";
import changeUsernameRoute from "./changeUsername";
import getUsers from "./getUsers";
import getPostsRoute from "./getPosts";
import getNotesRoute from "./note/getNotes";
import addNoteRoute from "./note/addNote";
import updateNoteRoute from "./note/updateNote";
import deleteNoteRoute from "./note/DeleteNote";
import postNoteRoute from "./note/postNote";
import unpostNoteRoute from "./note/unpostNote";
import changeNameRoute from "./changeName";

export const userRoutes = Router();

userRoutes.use(getUsers);
userRoutes.use(getUserInfoRoute);
userRoutes.use(registerRoute);
userRoutes.use(loginRoute);
userRoutes.use(changePasswordRoute);
userRoutes.use(changeUsernameRoute);
userRoutes.use(getPostsRoute)
userRoutes.use(getNotesRoute)
userRoutes.use(addNoteRoute)
userRoutes.use(updateNoteRoute)
userRoutes.use(deleteNoteRoute)
userRoutes.use(postNoteRoute)
userRoutes.use(unpostNoteRoute)
userRoutes.use(changeNameRoute)