import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",
  initialState: {
    selectedUser: null,

    messages: [],

    prevChatUsers: [],

    typingUsers: {},

    unreadCounts: {},

    editingMessage: null,
    replyMessage: null,
  },

  reducers: {
    //USER
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },

    //MESSAGES
    setMessages: (state, action) => {
      state.messages = action.payload;
    },

    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },

    setEditingMessage: (state, action) => {
      state.editingMessage = action.payload;
    },

    clearEditingMessage: (state) => {
      state.editingMessage = null;
    },
    updateMessage: (state, action) => {
      const updated = action.payload;
      const index = state.messages.findIndex(
        (msg) => msg._id === updated._id
      );

      if (index !== -1) {
        state.messages[index] = {
          ...state.messages[index],
          ...updated,
          reactions:
            updated.reactions ?? state.messages[index].reactions,
        };

      } else {
        console.log("❌ MESSAGE NOT FOUND IN STATE:", updated._id);
      }
    },

    deleteMessage: (state, action) => {
      const messageId = action.payload;
      state.messages = state.messages.map((msg) =>
        msg._id === messageId
          ? { ...msg, isDeleted: true, text: "", media: null }
          : msg
      );
    },
    deleteForMeLocal: (state, action) => {
      const { messageId, userId } = action.payload;

      state.messages = state.messages.map((msg) => {
        if (msg._id !== messageId) return msg;

        const alreadyDeleted = msg.deletedFor?.includes(userId);

        return {
          ...msg,
          deletedFor: alreadyDeleted
            ? msg.deletedFor
            : [...(msg.deletedFor || []), userId],
        };
      });
    },

    setReplyMessage: (state, action) => {
      state.replyMessage = action.payload;
    },

    clearReplyMessage: (state) => {
      state.replyMessage = null;
    },

    setPrevChatUsers: (state, action) => {
      state.prevChatUsers = action.payload;
    },

    updateLastMessage: (state, action) => {
      const { userId, lastMessage } = action.payload;

      const user = state.prevChatUsers.find(
        (u) => u._id === userId
      );

      if (user) {
        user.lastMessage = lastMessage;
      }
    },

    markMessagesDelivered: (state, action) => {
      const { conversationId, deliveredAt } = action.payload;
      console.log("🔥 REDUX DELIVERED:", conversationId, deliveredAt);

      state.messages = state.messages.map((msg) => {
        const msgConvId =
          typeof msg.conversationId === "object"
            ? msg.conversationId._id || msg.conversationId
            : msg.conversationId;

        if (String(msgConvId) === String(conversationId)) {
          console.log("✅ UPDATING MSG:", msg._id);
          return {
            ...msg,
            status: "delivered",
            deliveredAt,
          };
        }

        return msg;
      });
    },
    markMessagesSeen: (state, action) => {
      const { conversationId, seenAt } = action.payload;

      state.messages = state.messages.map((msg) => {
        const msgConvId =
          typeof msg.conversationId === "object"
            ? msg.conversationId._id || msg.conversationId
            : msg.conversationId;

        if (String(msgConvId) === String(conversationId)) {
          return {
            ...msg,
            status: "seen",
            seenAt, // ✅ USE SOCKET VALUE
          };
        }

        return msg;
      });
    },
    //TYPING
    setTyping: (state, action) => {
      const { conversationId, userId } = action.payload;
      state.typingUsers[conversationId] = userId;
    },

    clearTyping: (state, action) => {
      const { conversationId } = action.payload;
      delete state.typingUsers[conversationId];
    },

    //UNREAD
    setUnread: (state, action) => {
      const { conversationId, count } = action.payload;
      state.unreadCounts[conversationId] = count;
    },

    clearUnread: (state, action) => {
      const { conversationId } = action.payload;
      state.unreadCounts[conversationId] = 0;
    },

    //RESET
    resetChat: (state) => {
      state.selectedUser = null;
      state.messages = [];
    },
  },
});

export const {
  setSelectedUser,
  setMessages,
  addMessage,
  setEditingMessage,
  clearEditingMessage,
  setReplyMessage,
  clearReplyMessage,
  updateMessage,
  deleteMessage,
  deleteForMeLocal,
  setPrevChatUsers,
  updateLastMessage,
  markMessagesDelivered,
  markMessagesSeen,
  setTyping,
  clearTyping,
  setUnread,
  clearUnread,
  resetChat,
} = messageSlice.actions;

export default messageSlice.reducer;