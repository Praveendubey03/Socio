import express from "express"
import isAuth from "../middlewares/isAuth.js";
import { editProfile, follow, followingList,  getAllNotifications, getCurrentUser, getProfile, markAsRead, search, suggestedUsers } from "../controllers/userControllers.js";
import { upload } from "../middlewares/multer.js";


const userRouter = express.Router()
userRouter.get("/current",isAuth,getCurrentUser)
userRouter.get("/suggested",isAuth,suggestedUsers)
userRouter.post("/editProfile",isAuth,upload.single("profileImage"),editProfile)
userRouter.get("/getProfile/:userName",isAuth,getProfile)
userRouter.get("/search",isAuth,search)
userRouter.get("/getAllNotifications",isAuth,getAllNotifications)
userRouter.post("/markAsRead",isAuth,markAsRead)
userRouter.get("/follow/:targetUserId",isAuth,follow)
userRouter.get("/followingList",isAuth,followingList)


export default userRouter;