import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { openShare } from "../../redux/shareSlice";
import getAllLikes from "../../hooks/getAllLikes";
import getAllComments from "../../hooks/getAllComments";
import getAllReply from "../../hooks/getAllReply";
import getAllShare from "../../hooks/getAllShare";
import { serverUrl } from "../../App";
import axios from "axios";

import PostHeader from "./PostHeader";
import PostActions from "./PostActions";
import CommentItem from "./CommentItem";
import CommentInput from "./CommentInput";
import VideoPlayer from "../VideoPlayer/VideoPlayer";

const Post = ({ post }) => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const { postData } = useSelector((state) => state.post);
  const commentsState = useSelector((state) => state.comment.comments);
  const likeState = useSelector((state) => state.like.likes);

  const { handleLike } = getAllLikes();
  const { handleAddComment } = getAllComments("post", post._id);
  const { handleReply } = getAllReply();
  const { fetchUsers } = getAllShare();

  const [showComments, setShowComments] = useState(false);
  const [message, setMessage] = useState("");

  const currentPost =
    postData.find((p) => p._id === post._id) || post;

  const comments =
    commentsState.post?.[currentPost._id] || currentPost.comments || [];

  const handleDelete = async (id, parentId = null) => {
    try {
      await axios.delete(
        `${serverUrl}/api/post/comment/${currentPost._id}/${id}`,
        { withCredentials: true }
      );

      dispatch({
        type: parentId ? "comment/deleteReply" : "comment/deleteComment",
        payload: {
          type: "post",
          itemId: currentPost._id,
          commentId: parentId || id,
          replyId: parentId ? id : undefined,
        },
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="w-full max-w-[500px] mx-auto bg-white rounded-lg shadow-md mb-8 pb-4">

      <PostHeader post={currentPost} />

      {/* MEDIA */}
      {/* MEDIA */}
      <div className="w-full bg-black flex justify-center items-center">

        {currentPost.mediaType === "image" ? (
          <div className="w-full max-w-[600px] aspect-square sm:aspect-[4/5] md:aspect-auto md:max-h-[600px]">
            <img
              src={currentPost.media}
              className="w-full h-full object-cover md:object-contain"
            />
          </div>
        ) : (
          <div className="w-full max-w-[600px] aspect-square sm:aspect-[4/5] md:aspect-auto md:max-h-[600px]">
            <VideoPlayer media={currentPost.media} />
          </div>
        )}

      </div>

      <PostActions
        post={currentPost}
        comments={comments}
        likeState={likeState}
        handleLike={handleLike}
        toggleComments={() => setShowComments(!showComments)}
        openShare={() => {
          dispatch(openShare(currentPost));
          fetchUsers();
        }}
      />

      {/* COMMENTS */}
      {showComments && (
        <>
          <div className="p-3 space-y-3 max-h-[250px] overflow-y-auto">
            {comments.map((c) => (
              <CommentItem
                key={c._id}
                comment={c}
                postId={currentPost._id}
                handleLike={handleLike}
                handleReply={handleReply}
                handleDelete={handleDelete}
                likeState={likeState}
                userData={userData}
              />
            ))}
          </div>

          <CommentInput
            message={message}
            setMessage={setMessage}
            onSend={() => {
              handleAddComment(message);
              setMessage("");
            }}
          />
        </>
      )}
    </div>
  );
};

export default Post;