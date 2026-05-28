import { createSlice } from "@reduxjs/toolkit";

const storySlice = createSlice({
  name: "story",
  initialState: {
    feedStories: [],
    userStories: [],
    currentStory: null,
    loading: false,
    error: null
  },

  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    setFeedStories: (state, action) => {
      state.feedStories = action.payload;
      state.loading = false;
      state.error = null;
    },

    setUserStories: (state, action) => {
      state.userStories = action.payload;
      state.loading = false;
      state.error = null;
    },

    setCurrentStory: (state, action) => {
      state.currentStory = action.payload;
    },

    addStoryToFeed: (state, action) => {
      const newStory = action.payload;

      const existingUser = state.feedStories.find(
        (item) => item.user._id === newStory.author._id
      );

      if (existingUser) {
        existingUser.stories.unshift(newStory);
      } else {
        state.feedStories.unshift({
          user: newStory.author,
          stories: [newStory]
        });
      }
    },

    removeStoryFromFeed: (state, action) => {
      const storyId = action.payload;

      // ✅ feedStories
      state.feedStories.forEach((userGroup) => {
        userGroup.stories = userGroup.stories.filter(
          (story) => story._id !== storyId
        );
      });

      state.feedStories = state.feedStories.filter(
        (group) => group.stories.length > 0
      );

      // ✅ userStories (🔥 IMPORTANT)
      state.userStories = state.userStories.filter(
        (story) => story._id !== storyId
      );

      // ✅ currentStory (🔥 VERY IMPORTANT)
      if (state.currentStory?._id === storyId) {
        state.currentStory = null;
      }
    },
    updateStoryViewerRealtime: (state, action) => {
      const { storyId, viewer } = action.payload;

      const update = (story) => {
        if (story._id !== storyId) return;

        // 🔥 ensure viewers array exists
        if (!story.viewers) story.viewers = [];

        const exists = story.viewers.some(
          (v) =>
            (v.user?._id || v.user)?.toString() ===
            viewer.user.toString()
        );

        if (!exists) {
          story.viewers.unshift({
            user: {
              _id: viewer.user,
              // ⚡ optional fallback (until refetch)
              userName: "User",
              profileImage: ""
            },
            viewedAt: viewer.viewedAt
          });
        }
      };

      // ✅ update userStories
      state.userStories.forEach(update);

      // ✅ update feedStories
      state.feedStories.forEach((group) => {
        group.stories.forEach(update);
      });

      // ✅ 🔥 update currentStory (VERY IMPORTANT)
      if (state.currentStory?._id === storyId) {
        if (!state.currentStory.viewers) {
          state.currentStory.viewers = [];
        }

        const exists = state.currentStory.viewers.some(
          (v) =>
            (v.user?._id || v.user)?.toString() ===
            viewer.user.toString()
        );

        if (!exists) {
          state.currentStory.viewers.unshift({
            user: {
              _id: viewer.user,
              userName: "User",
              profileImage: ""
            },
            viewedAt: viewer.viewedAt
          });
        }
      }
    }
  }
});

export const {
  setFeedStories,
  setUserStories,
  setCurrentStory,
  setLoading,
  setError,
  addStoryToFeed,
  removeStoryFromFeed,
  updateStoryViewerRealtime
} = storySlice.actions;

export default storySlice.reducer;