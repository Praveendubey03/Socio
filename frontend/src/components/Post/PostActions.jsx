import React from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { MdOutlineComment } from "react-icons/md";
import { IoSend } from "react-icons/io5";
import { useSelector } from "react-redux";

const PostActions = ({
  post,
  comments,
  likeState,
  handleLike,
  toggleComments,
  openShare
}) => {

  const { userData } = useSelector((state) => state.user);

  // ✅ get latest likes
  const likes =
    likeState.post?.[post._id] || post.likes || [];

  // 🔥 FIXED CHECK
  const isLiked = likes.some(
    (id) => id.toString() === userData._id.toString()
  );

  return (
    <div className="flex gap-5 px-4 py-2 items-center">

      {/* ❤️ LIKE */}
      <div className="flex items-center gap-1">
        {isLiked ? (
          <FaHeart
            className="text-red-500 cursor-pointer w-[24px] h-[24px] transition-transform hover:scale-110"
            onClick={() => handleLike("post", post._id)}
          />
        ) : (
          <FaRegHeart
            className="cursor-pointer w-[24px] h-[24px] transition-transform hover:scale-110"
            onClick={() => handleLike("post", post._id)}
          />
        )}

        <span className="text-sm font-medium">
          {likes.length}
        </span>
      </div>

      {/* 💬 COMMENT */}
      <div
        onClick={toggleComments}
        className="flex items-center gap-1 cursor-pointer"
      >
        <MdOutlineComment className="w-[24px] h-[24px]" />
        <span className="text-sm font-medium">
          {comments.length}
        </span>
      </div>

      {/* ✈️ SHARE */}
      <IoSend
        className="cursor-pointer w-[24px] h-[24px]"
        onClick={openShare}
      />

    </div>
  );
};

export default PostActions;