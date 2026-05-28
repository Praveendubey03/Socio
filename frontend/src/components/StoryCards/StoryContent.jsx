const StoryContent = ({
  story,
  videoRef,
  pause,
  resume,
  showViewers
}) => {
  if (!story) return null;
  return (
    <div
      className={`flex-1 flex items-center justify-center ${showViewers ? "blur-sm opacity-40" : ""
        }`}
      onMouseDown={pause}
      onMouseUp={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
    >
      {story.mediaType === "image" && (
        <img src={story.media} className="max-h-[85vh]" />
      )}

      {story.mediaType === "video" && (
        <video
          ref={videoRef}
          src={story.media}
          className="max-h-[85vh]"
          muted
          playsInline
        />
      )}
    </div>
  );
};

export default StoryContent;