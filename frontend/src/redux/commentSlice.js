import { createSlice } from "@reduxjs/toolkit";

const commentSlice = createSlice({
  name: "comment",
  initialState: {
    comments: {
      post: {},
      loop: {},
    },
    loading: false,
    error: null,
  },
  reducers: {
    setComments: (state, action) => {
      const { type, itemId, comments } = action.payload;
      state.comments[type][itemId] = comments;
    },

    addComment: (state, action) => {
      const { type, itemId, comment } = action.payload;

      if (!state.comments[type][itemId]) {
        state.comments[type][itemId] = [];
      }

      state.comments[type][itemId].unshift(comment);
    },

    addReply: (state, action) => {
      const { type, itemId, commentId, reply } = action.payload;

      const comments = state.comments[type][itemId];

      const target = comments?.find((c) => c._id === commentId);

      if (target) {
        if (!target.replies) target.replies = [];
        target.replies.push(reply);
      }
    },
    deleteComment: (state, action) => {
      const { type, itemId, commentId } = action.payload;

      state.comments[type][itemId] =
        state.comments[type][itemId].filter(
          (c) => c._id !== commentId
        );
    },
    deleteReply: (state, action) => {
  const { type, itemId, commentId, replyId } = action.payload;

  const comments = state.comments[type][itemId];

  const targetComment = comments.find(c => c._id === commentId);

  if (targetComment) {
    targetComment.replies = targetComment.replies.filter(
      r => r._id !== replyId
    );
  }
},
    setCommentLoading: (state, action) => {
      state.loading = action.payload;
    },

    setCommentError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setComments,
  addComment,
  addReply,
  deleteComment,
  deleteReply,
  setCommentLoading,
  setCommentError,
} = commentSlice.actions;

export default commentSlice.reducer;