import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { serverUrl } from "../App";

import {
  setFeedStories,
  setUserStories,
  setCurrentStory,
  setLoading,
  setError,
  addStoryToFeed,
  removeStoryFromFeed,
  
} from "../redux/storySlice";

// 🔥 1. Get Feed Stories
export const useGetFeedStories = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const { feedStories } = useSelector((state) => state.story);

  useEffect(() => {
    if (!userData) return;

    // ✅ prevent refetch
    if (feedStories?.length > 0) return;

    const fetchStories = async () => {
      try {
        dispatch(setLoading(true));

        const res = await axios.get(
          `${serverUrl}/api/story/getAll`,
          { withCredentials: true }
        );

        const grouped = groupStoriesByUser(res.data);
        dispatch(setFeedStories(grouped));

      } catch (err) {
        dispatch(setError(err.response?.data?.message || err.message));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchStories();
  }, [userData]);
};

// 🔥 2. Get User Stories
export const useGetUserStories = (userName) => {
  const dispatch = useDispatch();
  const { userStories } = useSelector((state) => state.story);

  useEffect(() => {
    if (!userName) return;

    // ✅ skip if already loaded
    if (userStories?.length > 0) return;

    const fetchStories = async () => {
      try {
        dispatch(setLoading(true));

        const res = await axios.get(
          `${serverUrl}/api/story/getByUserName/${userName}`,
          { withCredentials: true }
        );

        dispatch(setUserStories(res.data));

      } catch (err) {
        dispatch(setError(err.response?.data?.message || err.message));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchStories();
  }, [userName]);
};

// 🔥 3. View Story
export const useViewStory = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  const viewStory = async (storyId) => {
    try {
      const res = await axios.get(
        `${serverUrl}/api/story/view/${storyId}`,
        { withCredentials: true }
      );

      dispatch(setCurrentStory(res.data));

    } catch (err) {
      dispatch(setError(err.response?.data?.message || err.message));
    }
  };

  return { viewStory };
};

// 🔥 4. Upload Story
export const useUploadStory = () => {
  const dispatch = useDispatch();

  const uploadStory = async (formData) => {
    try {
      dispatch(setLoading(true));

      const res = await axios.post(
        `${serverUrl}/api/story/upload`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      // ✅ optimistic UI
      dispatch(addStoryToFeed(res.data));

    } catch (err) {
      dispatch(setError(err.response?.data?.message || err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return { uploadStory };
};

// 🔥 5. Delete Story
export const useDeleteStory = () => {
  const dispatch = useDispatch();

  const deleteStory = async (storyId) => {
    try {
      dispatch(setLoading(true));

      await axios.delete(
        `${serverUrl}/api/story/delete/${storyId}`,
        { withCredentials: true }
      );

      // ✅ optimistic remove
      dispatch(removeStoryFromFeed(storyId));

    } catch (err) {
      dispatch(setError(err.response?.data?.message || err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return { deleteStory };
};

// 🔥 6. Reply to Story
export const useReplyToStory = () => {
  const dispatch = useDispatch();

  const replyToStory = async (storyId, message) => {
    try {
      await axios.post(
        `${serverUrl}/api/story/reply/${storyId}`,
        { message },
        { withCredentials: true }
      );

    } catch (err) {
      dispatch(setError(err.response?.data?.message || err.message));
    }
  };

  return { replyToStory };
};

// 🔥 7. Prefetch Stories (GLOBAL 🔥)
export const usePrefetchStories = () => {
  const dispatch = useDispatch();

  const prefetchStories = async (userName) => {
    try {
      const res = await axios.get(
        `${serverUrl}/api/story/getByUserName/${userName}`,
        { withCredentials: true }
      );

      dispatch(setUserStories(res.data));

    } catch (err) {
      console.log(err);
    }
  };

  return { prefetchStories };
};

// reaction 
export const useReactToStory = () => {
  const reactToStory = async (storyId) => {
    try {
      const res = await axios.post(
        `${serverUrl}/api/story/react/${storyId}`,
        {},
        { withCredentials: true }
      );

      return res.data;

    } catch (err) {
      console.log(err);
      return null;
    }
  };

  return { reactToStory };
};

// 🔥 Helper
const groupStoriesByUser = (stories) => {
  const map = {};

  stories.forEach((story) => {
    const userId = story.author._id;

    if (!map[userId]) {
      map[userId] = {
        user: story.author,
        stories: []
      };
    }

    map[userId].stories.push(story);
  });

  return Object.values(map).map((group) => ({
    ...group,
    stories: group.stories.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )
  }));
};