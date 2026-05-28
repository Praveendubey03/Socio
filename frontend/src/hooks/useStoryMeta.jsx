import { useMemo } from "react";
import { useSelector } from "react-redux";

export const useStoryMeta = (stories = []) => {
  const { userData } = useSelector(state => state.user);

  const meta = useMemo(() => {
    if (!stories?.length || !userData?._id) {
      return {
        hasStory: false,
        viewed: false
      };
    }

    const userId = userData._id.toString();

    const viewed = stories.every(story => {
      if (!story?.viewers?.length) return false;

      return story.viewers.some(v => {
        const id =
          v?.user?._id?.toString() ||
          v?.user?.toString();

        return id === userId;
      });
    });

    return {
      hasStory: true,
      viewed
    };
  }, [stories, userData]);

  return meta;
};