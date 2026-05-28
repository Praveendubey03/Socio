import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../App";

import {
  setConversations,
  setLoading,
  setError,
  clearUnreadLocal,
  pinChatLocal,
  unpinChatLocal,
  muteChatLocal,
  unmuteChatLocal,
  archiveChatLocal,
  sortConversations,
  removeConversation,
} from "../redux/conversationSlice";

const useConversation = () => {
  const dispatch = useDispatch();

  const { conversations } = useSelector((state) => state.conversation);

  //FETCH ALL CONVERSATIONS
  const fetchConversations = async () => {
    try {
      dispatch(setLoading(true));

      const res = await axios.get(
        `${serverUrl}/api/message/prevChats`,
        { withCredentials: true }
      );

      const normalized = res.data.map((chat) => ({
        ...chat,
        unreadCount: chat.unreadCount || 0,
        isPinned: chat.isPinned || false,
        isMuted: chat.isMuted || false,
        isArchived: chat.isArchived || false,
      }));

      dispatch(setConversations(normalized));
      dispatch(sortConversations());

    } catch (error) {
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  //CLEAR UNREAD
  const clearUnread = async (conversationId) => {
    try {
      await axios.put(
        `${serverUrl}/api/message/unread/clear/${conversationId}`,
        {},
        { withCredentials: true }
      );

      dispatch(clearUnreadLocal({ conversationId }));
    } catch (err) {
      console.log("CLEAR UNREAD ERROR:", err);
    }
  };

  //PIN
  const pinChat = async (conversationId) => {
    try {
      await axios.put(
        `${serverUrl}/api/message/pinChat/${conversationId}`,
        {},
        { withCredentials: true }
      );

      const convo = conversations.find(
        (c) => c.conversationId === conversationId
      );

      if (convo?.isPinned) {
        dispatch(unpinChatLocal({ conversationId }));
      } else {
        dispatch(pinChatLocal({ conversationId }));
      }

      dispatch(sortConversations());

    } catch (err) {
      console.log("❌ PIN ERROR:", err);
    }
  };

  //UNPIN
  const unpinChat = (conversationId) => {
    dispatch(unpinChatLocal({ conversationId }));
    dispatch(sortConversations());
  };

  //MUTE
  const muteChat = async (conversationId) => {
    try {
      await axios.put(
        `${serverUrl}/api/message/mute/${conversationId}`,
        {},
        { withCredentials: true }
      );

      const convo = conversations.find(c => c.conversationId === conversationId);

      if (convo?.isMuted) {
        dispatch(unmuteChatLocal({ conversationId }));
      } else {
        dispatch(muteChatLocal({ conversationId }));
      }
    } catch (err) {
      console.log("❌ MUTE ERROR:", err);
    }
  };

  //UNMUTE
  const unmuteChat = async (conversationId) => {
    try {
      await axios.put(
        `${serverUrl}/api/message/unmute/${conversationId}`,
        {},
        { withCredentials: true }
      );

      dispatch(unmuteChatLocal({ conversationId }));
    } catch (err) {
      console.log("UNMUTE ERROR:", err);
    }
  };

  //DELETE CHAT 
  const deleteChat = async (conversationId) => {
    try {
      await axios.delete(
        `${serverUrl}/api/message/delete/${conversationId}`,
        { withCredentials: true }
      );

      dispatch(removeConversation(conversationId));
    } catch (err) {
      console.error("DELETE ERROR:", err);
    }
  };
  
  //ARCHIVE
  const archiveChat = async (conversationId) => {
    try {
      await axios.put(
        `${serverUrl}/api/message/archive/${conversationId}`,
        {},
        { withCredentials: true }
      );

      const convo = conversations.find(
        (c) => c.conversationId === conversationId
      );

      // 🔥 TOGGLE LOCALLY
      dispatch(
        archiveChatLocal({
          conversationId,
          isArchived: !convo?.isArchived,
        })
      );

    } catch (err) {
      console.log("❌ ARCHIVE ERROR:", err);
    }
  };

  return {
    conversations,
    fetchConversations,
    clearUnread,
    pinChat,
    unpinChat,
    muteChat,
    unmuteChat,
    deleteChat,
    archiveChat,
  };
};

export default useConversation;