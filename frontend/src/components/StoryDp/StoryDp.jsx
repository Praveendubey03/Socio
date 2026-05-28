import React from "react";
import dp from "../../assets/dp.png";
import { BsPlus } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useStoryMeta } from "../../hooks/useStoryMeta";

const StoryDp = ({
  profileImage,
  userName,
  stories = [],
  isOwn = false,
  showRing = true,
  onClickCustom,
}) => {
  const navigate = useNavigate();

  // ✅ central logic (HOOK)
  const { viewed, hasStory } = useStoryMeta(stories);

  // ✅ CLICK HANDLER
  const handleClick = () => {
    if (onClickCustom) {
      onClickCustom();
      return;
    }

    // ❌ removed upload redirect
    // only navigate if story exists
    if (!hasStory) return;

    navigate(`/story/${userName}`);
  };

  return (
    <div className="flex flex-col items-center w-[70px]">
      
      {/* RING */}
      <div
        onClick={handleClick}
        className={`p-[2px] rounded-full cursor-pointer transition-all duration-300
          ${showRing && hasStory
            ? viewed
              ? "bg-gray-600"
              : "bg-gradient-to-b from-blue-500 to-orange-500"
            : ""
          }`}
      >
        <div className="bg-black p-[2px] rounded-full">

          {/* IMAGE */}
          <div className="relative w-[60px] h-[60px] rounded-full overflow-hidden">
            <img
              src={profileImage || dp}
              alt="story-dp"
              className="w-full h-full object-cover"
            />

            {/* PLUS ICON (only UI, no navigation now) */}
            {isOwn && !hasStory && (
              <BsPlus className="absolute bottom-0 right-0 bg-white text-black rounded-full w-[20px] h-[20px] border-2 border-black" />
            )}
          </div>

        </div>
      </div>

      {/* NAME */}
      {userName && (
        <div className="text-[12px] text-center truncate w-full text-white mt-1">
          {userName}
        </div>
      )}
    </div>
  );
};

export default StoryDp;