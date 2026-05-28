import express from "express"
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";

import {
  uploadPost,
  getAllPosts,
  like,
  comment,
  saved,
  getShareList,
  sharePost,
  deletePost,
  updatePost,
  getComments,
  reply,
  deleteComment,
  likeComment

} from "../controllers/postControllers.js";

const postRouter = express.Router();


postRouter.post("/upload", isAuth, upload.single("media"), uploadPost)
postRouter.get("/getAll", isAuth, getAllPosts)
postRouter.delete("/delete/:postId", isAuth, deletePost)
postRouter.put("/update/:postId", isAuth, updatePost)


postRouter.post("/like/:postId", isAuth, like)

postRouter.post("/comment/:postId", isAuth, comment)
postRouter.get("/comments/:postId", isAuth, getComments)
postRouter.delete("/comment/:postId/:commentId", isAuth, deleteComment)
postRouter.post("/comment/like/:commentId", isAuth, likeComment);
postRouter.post("/reply/:commentId", isAuth, reply)

postRouter.post("/saved/:postId", isAuth, saved)


postRouter.get("/share-list", isAuth, getShareList)
postRouter.post("/share", isAuth, sharePost)

export default postRouter;