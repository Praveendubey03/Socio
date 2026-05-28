const StoryProgress = ({ stories = [], currentIndex, progress }) => {
  return (
    <div className="absolute top-0 w-full flex gap-1 px-2 pt-2 z-50">
      {stories.map((_, i) => {
        let scale = 0;

        if (i < currentIndex) scale = 1;
        else if (i === currentIndex) scale = progress;
        else scale = 0;

        return (
          <div key={i} className="flex-1 h-[3px] bg-gray-600 rounded overflow-hidden">
            <div
              className="h-full bg-white origin-left transition-transform duration-75"
              style={{ transform: `scaleX(${scale})` }}
            />
          </div>
        );
      })}
    </div>
  );
};
export default StoryProgress;