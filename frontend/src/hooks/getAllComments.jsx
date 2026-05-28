import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { serverUrl } from "../App";
import {
  setComments,
  addComment,
  setCommentLoading,
  setCommentError,
} from "../redux/commentSlice";

const getAllComments = (type, itemId) => {
  const dispatch = useDispatch();

  // ✅ fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        dispatch(setCommentLoading(true));

        const res = await axios.get(
          `${serverUrl}/api/${type}/comments/${itemId}`,
          { withCredentials: true }
        );

        dispatch(
          setComments({
            type,
            itemId,
            comments: res.data,
          })
        );

        dispatch(setCommentLoading(false));
      } catch (error) {
        dispatch(setCommentError(error.message));
      }
    };

    if (itemId) fetchComments();
  }, [dispatch, type, itemId]);

  // ✅ add comment
  const handleAddComment = async (text) => {
    try {
      const res = await axios.post(
        `${serverUrl}/api/${type}/comment/${itemId}`,
        { message: text },
        { withCredentials: true }
      );

      dispatch(
        addComment({
          type,
          itemId,
          comment: res.data,
        })
      );
    } catch (error) {
      dispatch(setCommentError(error.message));
    }
  };

  return { handleAddComment };
};

export default getAllComments;