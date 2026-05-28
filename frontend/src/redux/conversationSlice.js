import { createSlice } from "@reduxjs/toolkit";

const conversationSlice = createSlice({
  name: "conversation",

  initialState: {
    conversations: [],   // full chat list
    loading: false,
    error: null,
  },

  reducers: {
    // 🔹 FETCH
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },

    addConversation: (state, action) => {
      state.conversations.unshift(action.payload);
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    // 🔹 LAST MESSAGE UPDATE (REALTIME)
    updateConversationLastMessage: (state, action) => {
      const { conversationId, lastMessage, lastMessageText, lastMessageAt } =
        action.payload;

      const convo = state.conversations.find(
        (c) => c.conversationId === conversationId
      );

      if (convo) {
        convo.lastMessage = lastMessage;
        convo.lastMessageText = lastMessageText;
        convo.lastMessageAt = lastMessageAt;

        // ❗ DON'T MOVE IF MUTED
        if (!convo.isMuted) {
          state.conversations = [
            convo,
            ...state.conversations.filter((c) => c.conversationId !== conversationId),
          ];
        }
      }
    },

    // 🔹 UNREAD
    incrementUnread: (state, action) => {
      const { conversationId } = action.payload;

      const convo = state.conversations.find(
        (c) => c.conversationId === conversationId
      );

      if (convo) {
        if (!convo.unreadCount) convo.unreadCount = 0;
        convo.unreadCount += 1;
      }
    },

    clearUnreadLocal: (state, action) => {
      const { conversationId } = action.payload;

      const convo = state.conversations.find(
        (c) => c.conversationId === conversationId
      );

      if (convo) {
        convo.unreadCount = 0;
      }
    },

    // 🔹 PIN
    pinChatLocal: (state, action) => {
      const { conversationId } = action.payload;

      const convo = state.conversations.find(
        (c) => c.conversationId === conversationId
      );

      if (convo) {
        convo.isPinned = true;
      }
    },

    unpinChatLocal: (state, action) => {
      const { conversationId } = action.payload;

      const convo = state.conversations.find(
        (c) => c.conversationId === conversationId
      );

      if (convo) {
        convo.isPinned = false;
      }
    },

    // 🔹 MUTE
    muteChatLocal: (state, action) => {
      const { conversationId } = action.payload;

      const convo = state.conversations.find(
        (c) => c.conversationId === conversationId
      );

      if (convo) {
        convo.isMuted = true;
      }
    },

    unmuteChatLocal: (state, action) => {
      const { conversationId } = action.payload;

      const convo = state.conversations.find(
        (c) => c.conversationId === conversationId
      );

      if (convo) {
        convo.isMuted = false;
      }
    },

    // 🔹 ARCHIVE
    archiveChatLocal: (state, action) => {
      const { conversationId, isArchived } = action.payload;

      const convo = state.conversations.find(
        (c) => c.conversationId === conversationId
      );

      if (convo) {
        convo.isArchived = isArchived;
      }
    },

    unarchiveChatLocal: (state, action) => {
      const { conversationId } = action.payload;

      const convo = state.conversations.find(
        (c) => c.conversationId === conversationId
      );

      if (convo) {
        convo.isArchived = false;
      }
    },

    // 🔹 TYPING
    setTypingUser: (state, action) => {
      const { conversationId, userId } = action.payload;

      const convo = state.conversations.find(
        (c) => c.conversationId === conversationId
      );

      if (convo) {
        convo.typingUser = userId;
      }
    },

    clearTypingUser: (state, action) => {
      const { conversationId } = action.payload;

      const convo = state.conversations.find(
        (c) => c.conversationId === conversationId
      );

      if (convo) {
        convo.typingUser = null;
      }
    },
    removeConversation: (state, action) => {
      state.conversations = state.conversations.filter(
        (c) => c.conversationId !== action.payload
      );

    },
    // 🔹 SORT (PIN PRIORITY + LATEST)
    sortConversations: (state) => {
      state.conversations.sort((a, b) => {
        // pinned first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        // then latest
        return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
      });
    },

    // 🔹 RESET
    resetConversations: (state) => {
      state.conversations = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setConversations,
  addConversation,
  setLoading,
  setError,

  updateConversationLastMessage,

  incrementUnread,
  clearUnreadLocal,

  pinChatLocal,
  unpinChatLocal,

  muteChatLocal,
  unmuteChatLocal,

  archiveChatLocal,
  unarchiveChatLocal,

  setTypingUser,
  clearTypingUser,

  removeConversation,

  sortConversations,

  resetConversations,
} = conversationSlice.actions;

export default conversationSlice.reducer;