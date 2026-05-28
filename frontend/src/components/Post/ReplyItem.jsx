import React from "react";
import dp from "../../assets/dp.png";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const ReplyItem = ({
  reply,
  parentId,
  handleLike,
  handleDelete,
  likeState,
  userData
}) => {
  const likes = likeState.comment?.[reply._id] || [];

  const isLiked = likes.some(
    (id) => id.toString() === userData._id.toString()
  );

  const formatTime = (date) => {
    if (!date) return "";
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return "now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  return (
    <div className="flex gap-2 ml-10">

      {/* 👤 DP */}
      <img
        src={reply.author?.profileImage || dp}
        className="w-6 h-6 rounded-full object-cover mt-1"
      />

      {/* RIGHT SIDE */}
      <div className="flex-1">

        {/* TEXT + LIKE */}
        <div className="flex justify-between items-start">
          <div className="text-sm">
            <span className="font-semibold mr-1">
              {reply.author?.userName}
            </span>
            {reply.message}
          </div>

          {/* ❤️ LIKE */}
          <div className="ml-2">
            {isLiked ? (
              <FaHeart
                className="text-red-500 cursor-pointer text-xs hover:scale-110 transition"
                onClick={() => handleLike("comment", reply._id)}
              />
            ) : (
              <FaRegHeart
                className="cursor-pointer text-xs hover:scale-110 transition"
                onClick={() => handleLike("comment", reply._id)}
              />
            )}
          </div>
        </div>

        {/* META */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">

          <span>{formatTime(reply.createdAt)}</span>

          {likes.length > 0 && (
            <span>{likes.length} likes</span>
          )}

          {/* 🗑 DELETE */}
          {reply.author?._id === userData._id && (
            <button
              onClick={() => handleDelete(reply._id, parentId)}
              className="text-red-500 font-medium"
            >
              Delete
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default ReplyItem;