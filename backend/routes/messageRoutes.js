import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";

import {
  sendMessage,
  getAllMessages,
  getPrevUserChats,

  editMessage,
  deleteForMe,
  deleteForEveryone,

  toggleReaction,
  

  markAsDelivered,
  markAsSeen,

  forwardMessage,
  pinMessage,
  unpinMessage,

  updateUnreadCount,
  clearUnreadCount,

  searchMessages,

  muteConversation,
  unmuteConversation,

  pinConversation,
  archiveConversation,
  
  addTypingUser,
  removeTypingUser,
  deleteConversation
} from "../controllers/messageControllers.js";

const messageRouter = express.Router();


messageRouter.post("/send/:receiverId", isAuth, upload.single("media"), sendMessage);
messageRouter.get("/getAll/:receiverId", isAuth, getAllMessages);
messageRouter.get("/prevChats", isAuth, getPrevUserChats);


messageRouter.put("/edit", isAuth, editMessage);
messageRouter.delete("/deleteForMe/:messageId", isAuth, deleteForMe);
messageRouter.delete("/deleteForEveryone/:messageId", isAuth, deleteForEveryone);


messageRouter.post("/reaction", isAuth, toggleReaction);


messageRouter.put("/delivered/:conversationId", isAuth, markAsDelivered);
messageRouter.put("/seen/:conversationId", isAuth, markAsSeen);


messageRouter.post("/forward/:receiverId", isAuth, forwardMessage);
messageRouter.put("/pin/:messageId", isAuth, pinMessage);
messageRouter.put("/unpin/:messageId", isAuth, unpinMessage);

messageRouter.put("/unread/update", isAuth, updateUnreadCount);
messageRouter.put("/unread/clear/:conversationId", isAuth, clearUnreadCount);


messageRouter.get("/search/:conversationId", isAuth, searchMessages);

messageRouter.put("/mute/:conversationId", isAuth, muteConversation);
messageRouter.put("/unmute/:conversationId", isAuth, unmuteConversation);

messageRouter.put("/pinChat/:conversationId", isAuth, pinConversation);
messageRouter.put("/archive/:conversationId", isAuth, archiveConversation);
messageRouter.delete("/delete/:conversationId", isAuth, deleteConversation);

messageRouter.post("/typing/start", isAuth, addTypingUser);
messageRouter.post("/typing/stop", isAuth, removeTypingUser);

export default messageRouter;