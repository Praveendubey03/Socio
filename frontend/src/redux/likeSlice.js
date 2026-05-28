import { createSlice } from "@reduxjs/toolkit";

const likeSlice = createSlice({
  name: "like",
  initialState: {
    likes: {
      post: {},
      loop: {},
      story: {},
      comment: {},
    },
    loading: false,
    error: null,
  },
  reducers: {
    setLikes: (state, action) => {
      const { type, itemId, likes } = action.payload;
      state.likes[type][itemId] = likes;
    },

    toggleLike: (state, action) => {
      const { type, itemId, userId } = action.payload;

      const itemLikes = state.likes[type][itemId] || [];

      const isLiked = itemLikes.includes(userId);

      if (isLiked) {
        state.likes[type][itemId] = itemLikes.filter(
          (id) => id !== userId
        );
      } else {
        state.likes[type][itemId] = [...itemLikes, userId];
      }
    },

    setLikeLoading: (state, action) => {
      state.loading = action.payload;
    },

    setLikeError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setLikes,
  toggleLike,
  setLikeLoading,
  setLikeError,
} = likeSlice.actions;

export default likeSlice.reducer;