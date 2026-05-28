import React from "react";
import dp from "../../assets/dp.png";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PostMenu from "../PostMenu/PostMenu";

const PostHeader = ({ post }) => {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  const formatTime = (date) => {
    if (!date) return "";

    const diff = Math.floor((new Date() - new Date(date)) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  // 🔥 FIX: detect owner properly
  const isOwner =
    post.author?._id?.toString() === userData?._id?.toString();

  return (
    <div className="flex justify-between items-center px-4 py-3">

      {/* LEFT */}
      <div className="flex items-center gap-3">
        <img
          src={post.author?.profileImage || dp}
          className="w-10 h-10 rounded-full cursor-pointer"
          onClick={() => navigate(`/profile/${post.author.userName}`)}
        />

        <div className="flex items-center gap-1 text-sm">
          <span className="font-bold">
            {post.author?.userName}
          </span>

          <span className="text-gray-400">•</span>

          <span className="text-gray-500 text-xs">
            {formatTime(post.createdAt)}
          </span>
        </div>
      </div>

      {/* RIGHT (MENU) */}
      <PostMenu
        isOwner={isOwner} // ✅ FIXED
        targetUserId={post.author?._id}
        username={post.author?.userName}
        currentCaption={post.caption}
      />

    </div>
  );
};

export default PostHeader;