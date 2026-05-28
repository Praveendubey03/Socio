import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";

import {
    getAllStories,
    getStoryByUserName,
    uploadStory,
    viewStory,
    deleteStory,
    getStoryViewers,
    replyToStory,
    reactToStory
} from "../controllers/storyControllers.js";

const storyRouter = express.Router();

storyRouter.post("/upload", isAuth, upload.single("media"), uploadStory);

storyRouter.get("/getByUserName/:userName", isAuth, getStoryByUserName);

storyRouter.get("/getAll", isAuth, getAllStories);

storyRouter.get("/view/:storyId", isAuth, viewStory);

// 🔥 NEW
storyRouter.delete("/delete/:storyId", isAuth, deleteStory);

storyRouter.get("/viewers/:storyId", isAuth, getStoryViewers);

storyRouter.post("/reply/:storyId", isAuth, replyToStory);
storyRouter.post("/react/:storyId", isAuth, reactToStory);


export default storyRouter;