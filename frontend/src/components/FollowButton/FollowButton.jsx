import axios from "axios";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../../App";
import { setFollowing } from "../../redux/userSlice";

const FollowButton = ({
  targetUserId,
  tailwind = "",
  variant = "default", // "default" | "menu"
}) => {
  const { following } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  if (!following) {
    return <button className={tailwind}>Loading...</button>;
  }

  // ✅ normalize ids (same as your original)
  const normalizedFollowing = following.map((item) =>
    typeof item === "object"
      ? item._id.toString()
      : item.toString()
  );

  const normalizedTarget = targetUserId?.toString();
  const isFollowing = normalizedFollowing.includes(normalizedTarget);

  // ✅ TEXT CONTROL (your requirement)
  const buttonText = loading
    ? "..."
    : isFollowing
      ? variant === "menu"
        ? "Unfollow"
        : "Following"
      : "Follow";

  const handleFollow = async () => {
    try {
      setLoading(true);

      // 🎯 animation (press effect)
      setAnimating(true);
      setTimeout(() => setAnimating(false), 150);

      // ✅ KEEP YOUR ORIGINAL WORKING API (GET)
      const res = await axios.get(
        `${serverUrl}/api/user/follow/${targetUserId}`,
        { withCredentials: true }
      );

      // ✅ same logic as your original (DO NOT CHANGE)
      if (res.data?.following) {
        dispatch(setFollowing(res.data.following));
      } else {
        const updated = await axios.get(
          `${serverUrl}/api/user/followingList`,
          { withCredentials: true }
        );
        dispatch(setFollowing(updated.data));
      }

    } catch (error) {
      console.log("❌ Follow error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`
        ${tailwind}
        transition-all duration-150
        ${animating ? "scale-95" : "scale-100"}

       
          ${isFollowing
          ? variant === "menu"
            ? "bg-transparent text-red-500 font-semibold"
            : "bg-gray-200 text-black font-semibold"
          : variant === "menu"
            ? "bg-transparent text-blue-500 font-semibold"
            : "bg-gray-200 text-black font-semibold"
        }
        

        ${loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {buttonText}
    </button>
  );
};

export default FollowButton;