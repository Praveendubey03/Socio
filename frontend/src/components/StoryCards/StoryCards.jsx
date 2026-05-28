import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { useStoryPlayer } from "../../hooks/useStoryPlayer";

import StoryHeader from "./StoryHeader";
import StoryContent from "./StoryContent";
import StoryFooter from "./StoryFooter";
import StoryProgress from "./StoryProgress";

const StoryCards = () => {
  const { userStories } = useSelector((state) => state.story);
  const navigate = useNavigate();

  const {
    story,
    currentIndex,
    progress,

    next,
    prev,

    pause,
    resume,

    videoRef,

    showViewers,
    setShowViewers,

    onTouchStart,
    onTouchMove,
    onTouchEnd

  } = useStoryPlayer(userStories, () => navigate("/"));

  if (!story) return null;

  return (
    <div className="w-full h-screen bg-black flex justify-center">
      <div
        className="w-full max-w-[500px] relative flex flex-col"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >

        <StoryProgress
          stories={userStories}
          currentIndex={currentIndex}
          progress={progress}
        />

        <StoryHeader story={story} onClose={() => navigate("/")} />

        <StoryContent
          story={story}
          videoRef={videoRef}
          pause={pause}
          resume={resume}
          showViewers={showViewers}
        />

        <StoryFooter
          story={story}
          showViewers={showViewers}
          setShowViewers={setShowViewers}
        />

        {/* CLICK ZONES */}
        {!showViewers && (
          <div className="absolute inset-0 flex z-40">
            <div className="w-1/2" onClick={prev} />
            <div className="w-1/2" onClick={next} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryCards;