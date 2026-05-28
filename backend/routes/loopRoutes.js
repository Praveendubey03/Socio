import express from "express"
import isAuth from "../middlewares/isAuth.js";

import { upload } from "../middlewares/multer.js";
import { comment, deleteComment, deleteLoop, getAllLoops, getComments, getShareList, like, likeComment, reply, shareLoop, updateLoop, uploadLoop } from "../controllers/loopControllers.js";



const loopRouter = express.Router()

loopRouter.post("/upload", isAuth, upload.single("media"), uploadLoop)
loopRouter.get("/share-list", isAuth, getShareList)
loopRouter.post("/share", isAuth, shareLoop)
loopRouter.get("/getAll", isAuth, getAllLoops)
loopRouter.get("/like/:loopId", isAuth, like)
loopRouter.post("/comment/:loopId", isAuth, comment)

loopRouter.delete("/delete/:loopId", isAuth, deleteLoop)
loopRouter.put("/update/:loopId", isAuth, updateLoop)
loopRouter.get("/comments/:loopId", isAuth, getComments)
loopRouter.delete("/comment/:loopId/:commentId", isAuth, deleteComment)
loopRouter.post("/comment/like/:commentId", isAuth, likeComment);
loopRouter.post("/reply/:commentId", isAuth, reply)

export default loopRouter;