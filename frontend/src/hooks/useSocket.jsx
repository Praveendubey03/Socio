import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { serverUrl } from "../App";
import axios from "axios";
import store from "../redux/store";

// messageSlice
import {
  addMessage,
  updateMessage,
  setUnread,
  clearUnread,
} from "../redux/messageSlice";

import { setTypingUser, removeTypingUser } from "../redux/typingSlice";
// socketSlice
import {
  setSocket,
  setOnlineUsers,
  setConnected,
} from "../redux/socketSlice";

import {
  updateConversationLastMessage
  , incrementUnread
} from "../redux/conversationSlice";
import { updateStoryViewerRealtime } from "../redux/storySlice";

const useSocket = () => {
  const dispatch = useDispatch();

  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    if (!userData?._id) return;

    console.log("🚀 CONNECTING SOCKET WITH USER:", userData._id);

    const newSocket = io(serverUrl, {
      withCredentials: true,
      query: {
        userId: userData._id,
      },
      transports: ["websocket"],
    });

    dispatch(setSocket(newSocket));

    // ✅ CONNECTION
    newSocket.on("connect", () => {
      console.log("✅ SOCKET CONNECTED:", newSocket.id);
      dispatch(setConnected(true));
    });

    newSocket.on("disconnect", () => {
      console.log("❌ SOCKET DISCONNECTED");
      dispatch(setConnected(false));
    });

    // ✅ ONLINE USERS
    newSocket.on("getOnlineUsers", (users) => {
      console.log("🟢 ONLINE USERS:", users);
      dispatch(setOnlineUsers(users));
    });

    // 🔥 NEW MESSAGE
    newSocket.on("newMessage", (message) => {
      console.log("🔥 NEW MESSAGE RECEIVED:", message);

      dispatch(addMessage(message));

      const state = store.getState();
      const selectedUser = state.message.selectedUser;
      const currentUser = state.user.userData;

      const conversationId =
        message.conversationId?._id || message.conversationId;

      const receiverId =
        message.receiver?._id || message.receiver;

      // ✅ DELIVERED
      if (String(receiverId) === String(currentUser._id)) {
        console.log("📡 CALLING DELIVERED API:", conversationId);

        axios.put(
          `${serverUrl}/api/message/delivered/${conversationId}`,
          {},
          { withCredentials: true }
        );
      }

      // ✅ SEEN
      if (
        selectedUser &&
        String(message.sender?._id || message.sender) ===
        String(selectedUser._id)
      ) {
        console.log("👁️ CALLING SEEN API:", conversationId);

        axios.put(
          `${serverUrl}/api/message/seen/${conversationId}`,
          {},
          { withCredentials: true }
        );
      }
      dispatch(updateConversationLastMessage({
        conversationId,
        lastMessage: message,
        lastMessageText: message.text || "📷 Media",
        lastMessageAt: new Date(),
      }));

      // 🔔 unread (if chat not open)
      if (!selectedUser || selectedUser._id !== message.sender?._id) {
        dispatch(incrementUnread({ conversationId }));
      }
    });

    // ✅ EDIT
    newSocket.on("messageEdited", (message) => {
      console.log("✏️ MESSAGE EDITED:", message);
      dispatch(updateMessage(message));
    });

    // ✅ SEEN SOCKET
    newSocket.on("messagesSeen", ({ conversationId, seenAt }) => {
      console.log("👁️ SOCKET SEEN:", { conversationId, seenAt });

      dispatch({
        type: "message/markMessagesSeen",
        payload: { conversationId, seenAt },
      });
    });

    // ✅ DELIVERED SOCKET
    newSocket.on("messagesDelivered", ({ conversationId, deliveredAt }) => {
      console.log("📦 SOCKET DELIVERED:", {
        conversationId,
        deliveredAt,
      });

      dispatch({
        type: "message/markMessagesDelivered",
        payload: { conversationId, deliveredAt },
      });
    });

    // ✅ DELETE
    newSocket.on("messageDeleted", ({ messageId }) => {
      console.log("🗑️ SOCKET DELETE:", messageId);

      dispatch(
        updateMessage({
          _id: messageId,
          isDeleted: true,
          text: "",
          media: null,
        })
      );
    });

    // 🔥 REACTION (IMPORTANT DEBUG)
    newSocket.on("reactionUpdated", ({ messageId, reactions }) => {
      console.log("⚡ SOCKET REACTION UPDATE:", {
        messageId,
        reactions,
      });

      dispatch(updateMessage({ _id: messageId, reactions }));
    });

    // ✅ TYPING
    newSocket.on("typing", ({ conversationId, userId }) => {
      console.log("🔥 TYPING RECEIVED:", conversationId, userId);
      dispatch(setTypingUser({ conversationId, userId }));
    });
    newSocket.on("stopTyping", ({ conversationId, userId }) => {
      dispatch(removeTypingUser({ conversationId, userId }));
    });

    // ✅ UNREAD
    newSocket.on("unreadUpdated", ({ conversationId }) => {
      console.log("🔔 UNREAD UPDATED:", conversationId);

      dispatch(setUnread({ conversationId, count: 1 }));
    });

    newSocket.on("unreadCleared", ({ conversationId }) => {
      console.log("✅ UNREAD CLEARED:", conversationId);

      dispatch(clearUnread({ conversationId }));
    });

    newSocket.on("storyViewed", ({ storyId, viewer }) => {
  dispatch(updateStoryViewerRealtime({ storyId, viewer }));
});


    // 🧹 CLEANUP (VERY IMPORTANT FIX)
    return () => {
      console.log("🧹 CLEANING SOCKET LISTENERS");

      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("getOnlineUsers");
      newSocket.off("newMessage");
      newSocket.off("messageEdited");
      newSocket.off("messagesSeen");
      newSocket.off("messagesDelivered");
      newSocket.off("messageDeleted");
      newSocket.off("reactionUpdated");
      newSocket.off("typing");
      newSocket.off("stopTyping");
      newSocket.off("unreadUpdated");
      newSocket.off("unreadCleared");
      newSocket.off("storyViewed");

      newSocket.disconnect();
    };
  }, [dispatch, userData]);
};

export default useSocket;