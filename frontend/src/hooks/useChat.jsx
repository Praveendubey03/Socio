import axios from "axios";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../App";
import store from "../redux/store";

import {
  setMessages,
  setPrevChatUsers,
  setSelectedUser,
  updateLastMessage,
  deleteMessage,
} from "../redux/messageSlice";

const useChat = () => {
  const dispatch = useDispatch();

  const { userData } = useSelector((state) => state.user);
  const { selectedUser } = useSelector((state) => state.message);

  // GET ALL MESSAGES
  const fetchMessages = useCallback(async (receiverId) => {
    try {
      const res = await axios.get(
        `${serverUrl}/api/message/getAll/${receiverId}`,
        { withCredentials: true }
      );
      dispatch(setMessages(res.data));
    } catch (error) {
      console.log("GET MESSAGES ERROR:", error);
    }
  }, [dispatch]);


  //GET PREVIOUS CHATS
  const fetchPrevChats = useCallback(async () => {
    try {
      const res = await axios.get(
        `${serverUrl}/api/message/prevChats`,
        { withCredentials: true }
      );

      dispatch(setPrevChatUsers(res.data));
    } catch (error) {
      console.log("PREV CHATS ERROR:", error);
    }
  }, [dispatch]);

  //SEND MESSAGE
  const sendMessage = async ({ text, media, replyTo }) => {
    try {
      if (!selectedUser) return;

      if (!media) {
        const res = await axios.post(
          `${serverUrl}/api/message/send/${selectedUser._id}`,
          { text, replyTo },
          { withCredentials: true }
        );

        dispatch(
          updateLastMessage({
            userId: selectedUser._id,
            lastMessage: res.data,
          })
        );

        return;
      }

      const formData = new FormData();
      if (text) formData.append("text", text);
      formData.append("media", media);
      if (replyTo) formData.append("replyTo", String(replyTo));

      const res = await axios.post(
        `${serverUrl}/api/message/send/${selectedUser._id}`,
        formData,
        { withCredentials: true }
      );

      console.log("✅ MEDIA MESSAGE SENT:", res.data);

      dispatch(
        updateLastMessage({
          userId: selectedUser._id,
          lastMessage: res.data,
        })
      );

    } catch (error) {
      console.log("SEND ERROR:", error);
    }
  };

  //SELECT USER
  const selectUser = async (user) => {
    dispatch(setSelectedUser(user));

    const res = await axios.get(
      `${serverUrl}/api/message/getAll/${user._id}`,
      { withCredentials: true }
    );

    dispatch(setMessages(res.data));
    const conversationId =
      res.data[0]?.conversationId?._id || res.data[0]?.conversationId;

    if (conversationId) {
      markSeen(conversationId);
    }
  };

  //CLEAR CHAT
  const clearChat = () => {
    dispatch(setSelectedUser(null));
    dispatch(setMessages([]));
  };

  //EDIT MESSAGE
  const editMessage = async ({ messageId, text }) => {
    try {
      const res = await axios.put(
        `${serverUrl}/api/message/edit`,
        { messageId, newText: text },
        { withCredentials: true }
      );

      return res.data;
    } catch (err) {
      console.log("EDIT ERROR:", err);
      return null;
    }
  };

  //DELIVERED
  const markDelivered = async (conversationId) => {
    try {
       await axios.put(
        `${serverUrl}/api/message/delivered/${conversationId}`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.log("DELIVER ERROR:", err);
    }
  };

  //SEEN
  const markSeen = async (conversationId) => {
    try {
      await axios.put(
        `${serverUrl}/api/message/seen/${conversationId}`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.log("SEEN ERROR:", err);
    }
  };

  // REACT TO MESSAGE
  const reactToMessage = async ({ messageId, emoji }) => {

    const state = store.getState();
    const userId = state.user.userData?._id;

    const message = state.message.messages.find(
      (m) => m._id === messageId
    );

    if (!message) {
      return;
    }

    const prevReactions = message.reactions || [];
    const newReactions = optimisticUpdate(prevReactions, userId, emoji);
    store.dispatch({
      type: "message/updateMessage",
      payload: {
        _id: messageId,
        reactions: newReactions,
      },
    });

    try {
      await axios.post(
        `${serverUrl}/api/message/reaction`,
        { messageId, emoji },
        { withCredentials: true }
      );
    } catch (error) {
      console.log("REACTION ERROR:", error);
      store.dispatch({
        type: "message/updateMessage",
        payload: {
          _id: messageId,
          reactions: prevReactions,
        },
      });
    }
  };

  //OPTIMISTIC HELPER
  const optimisticUpdate = (reactions, userId, emoji) => {
    const existing = reactions.find(
      (r) => String(r.user) === String(userId)
    );
    if (existing) {
      if (existing.emoji === emoji) {
  
        return reactions.filter(
          (r) => String(r.user) !== String(userId)
        );
      }
      return reactions.map((r) =>
        String(r.user) === String(userId)
          ? { ...r, emoji }
          : r
      );
    }

    return [...reactions, { user: userId, emoji }];
  };

  //DELETE FOR ME
  const deleteForMe = async (messageId, userId) => {
    try {
      await axios.delete(
        `${serverUrl}/api/message/deleteForMe/${messageId}`,
        { withCredentials: true }
      );

      dispatch({
        type: "message/deleteForMeLocal",
        payload: { messageId, userId },
      });

    } catch (error) {
      console.log("DELETE FOR ME ERROR:", error);
    }
  };

  //DELETE FOR EVERYONE
  const deleteForEveryone = async (messageId) => {
    try {
      await axios.delete(
        `${serverUrl}/api/message/deleteForEveryone/${messageId}`,
        { withCredentials: true }
      );

      dispatch(deleteMessage(messageId));
      dispatch({
        type: "message/deleteForMeLocal",
        payload: {
          messageId,
          userId: userData._id,
        },
      });

    } catch (error) {
      console.log("DELETE FOR EVERYONE ERROR:", error);
    }
  };

  return {
    selectedUser,
    fetchMessages,
    fetchPrevChats,
    sendMessage,
    selectUser,
    clearChat,
    editMessage,
    markDelivered,
    markSeen,
    reactToMessage,
    deleteForMe,
    deleteForEveryone,
  };
};

export default useChat;