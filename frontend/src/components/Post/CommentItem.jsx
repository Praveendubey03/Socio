import React, { useState } from "react";
import ReplyItem from "./ReplyItem";
import dp from "../../assets/dp.png";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const CommentItem = ({
  comment,
  postId,
  handleLike,
  handleReply,
  handleDelete,
  likeState,
  userData
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [text, setText] = useState("");

  // ✅ likes
  const likes = likeState.comment?.[comment._id] || [];

  const isLiked = likes.some(
    (id) => id.toString() === userData?._id?.toString()
  );

  // ✅ time formatter
  const formatTime = (date) => {
    if (!date) return "";
    const diff = Math.floor((new Date() - new Date(date)) / 1000);

    if (diff < 60) return "now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  // ✅ send reply
  const handleSendReply = () => {
    if (!text.trim()) return;

    handleReply("post", postId, comment._id, text);
    setText("");
    setShowReplyInput(false);
    setShowReplies(true);
  };

  return (
    <div className="flex gap-3">

      {/* 👤 USER DP */}
      <img
        src={comment.author?.profileImage || dp}
        className="w-8 h-8 rounded-full object-cover"
      />

      {/* RIGHT SIDE */}
      <div className="flex-1">

        {/* TEXT + LIKE */}
        <div className="flex justify-between items-start">
          <div className="text-sm">
            <span className="font-semibold mr-1">
              {comment.author?.userName}
            </span>
            {comment.message}
          </div>

          {/* ❤️ LIKE */}
          <div className="ml-2">
            {isLiked ? (
              <FaHeart
                className="text-red-500 cursor-pointer text-xs hover:scale-110 transition"
                onClick={() => handleLike("comment", comment._id)}
              />
            ) : (
              <FaRegHeart
                className="cursor-pointer text-xs hover:scale-110 transition"
                onClick={() => handleLike("comment", comment._id)}
              />
            )}
          </div>
        </div>

        {/* META LINE */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">

          <span>{formatTime(comment.createdAt)}</span>

          {likes.length > 0 && (
            <span>{likes.length} likes</span>
          )}

          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="font-medium"
          >
            Reply
          </button>

          {/* 🗑 DELETE */}
          {comment.author?._id?.toString() === userData?._id?.toString() && (
            <button
              onClick={() => handleDelete(comment._id)}
              className="text-red-500"
            >
              Delete
            </button>
          )}
        </div>

        {/* ✏️ REPLY INPUT */}
        {showReplyInput && (
          <div className="flex items-center gap-2 mt-2 animate-fade">

            <img
              src={userData?.profileImage || dp}
              className="w-6 h-6 rounded-full object-cover"
            />

            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Reply..."
              className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendReply();
                }
              }}
            />

            <button
              disabled={!text.trim()}
              onClick={handleSendReply}
              className={`text-xs font-semibold transition ${
                text.trim()
                  ? "text-blue-500 hover:text-blue-600"
                  : "text-blue-200 cursor-not-allowed"
              }`}
            >
              Post
            </button>
          </div>
        )}

        {/* 🔽 VIEW REPLIES TOGGLE */}
        {comment.replies?.length > 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-xs text-gray-500 mt-1"
          >
            {showReplies
              ? "Hide replies"
              : `View replies (${comment.replies.length})`}
          </button>
        )}

        {/* 🔥 REPLIES LIST */}
        {showReplies && (
          <div className="mt-2 space-y-2">
            {comment.replies.map((r) => (
              <ReplyItem
                key={r._id}
                reply={r}
                parentId={comment._id}
                handleLike={handleLike}
                handleDelete={handleDelete}
                likeState={likeState}
                userData={userData}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default CommentItem;