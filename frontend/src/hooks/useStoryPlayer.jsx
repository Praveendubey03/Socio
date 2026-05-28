import { useEffect, useRef, useState } from "react";
import { useViewStory } from "./useStory";

export const useStoryPlayer = (stories = [], onClose) => {
  const { viewStory } = useViewStory();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [duration, setDuration] = useState(15000);
  const [progress, setProgress] = useState(0);
 
  const videoRef = useRef(null);
  const frameRef = useRef(null);
  const startTimeRef = useRef(null);

  // 👉 swipe refs
  const touchStart = useRef(null);
  const touchEnd = useRef(null);

  const story = stories?.[currentIndex];

  useEffect(() => {
  if (!story && stories.length > 0) {
    setCurrentIndex(0);
  }
}, [story, stories]);

useEffect(() => {
  if (!stories || stories.length === 0) {
    onClose?.();
  }
}, [stories]);
  const next = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose?.();
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // ==========================
  // 👁️ VIEW TRACKING
  // ==========================
  useEffect(() => {
    if (story?._id) viewStory(story._id);
  }, [story]);

  // ==========================
  // ⚡ PRELOAD NEXT
  // ==========================
  useEffect(() => {
    const nextStory = stories?.[currentIndex + 1];
    if (!nextStory) return;

    if (nextStory.mediaType === "image") {
      const img = new Image();
      img.src = nextStory.media;
    } else {
      const video = document.createElement("video");
      video.src = nextStory.media;
      video.preload = "auto";
    }
  }, [currentIndex]);

  // ==========================
  // ⏱️ VIDEO DURATION
  // ==========================
  useEffect(() => {
    if (!story) return;

    if (story.mediaType === "video" && videoRef.current) {
      const video = videoRef.current;

      const handleLoaded = () => {
        const videoDuration = video.duration * 1000;
        setDuration(Math.min(videoDuration, 15000));
      };

      video.addEventListener("loadedmetadata", handleLoaded);

      return () => {
        video.removeEventListener("loadedmetadata", handleLoaded);
      };
    } else {
      setDuration(15000);
    }
  }, [story]);

  // ==========================
  // 🔄 RESET PROGRESS
  // ==========================
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  // ==========================
  // ⏱️ PROGRESS ENGINE (STATE BASED)
  // ==========================
  useEffect(() => {
    if (!story || isPaused || showViewers) return;

    cancelAnimationFrame(frameRef.current);
    startTimeRef.current = performance.now();

    const update = (time) => {
      const elapsed = time - startTimeRef.current;
      const percent = elapsed / duration;

      setProgress(Math.min(percent, 1));

      if (elapsed < duration) {
        frameRef.current = requestAnimationFrame(update);
      } else {
        next();
      }
    };

    frameRef.current = requestAnimationFrame(update);

    return () => cancelAnimationFrame(frameRef.current);
  }, [story, isPaused, showViewers, currentIndex, duration]);

  // ==========================
  // 🎥 VIDEO CONTROL
  // ==========================
  useEffect(() => {
    if (!videoRef.current) return;

    if (isPaused || showViewers) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  }, [isPaused, showViewers, story]);

  // ==========================
  // 🎮 HOLD CONTROLS
  // ==========================
  const pause = () => setIsPaused(true);
  const resume = () => setIsPaused(false);

  // ==========================
  // 📱 SWIPE GESTURES
  // ==========================
  const onTouchStart = (e) => {
    touchStart.current = e.touches[0];
  };

  const onTouchMove = (e) => {
    touchEnd.current = e.touches[0];
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;

    const dx = touchEnd.current.clientX - touchStart.current.clientX;
    const dy = touchEnd.current.clientY - touchStart.current.clientY;

    // 🔥 swipe down → close
    if (dy > 80) {
      onClose?.();
      return;
    }

    // 🔥 horizontal swipe
    if (Math.abs(dx) > 50) {
      if (dx > 0) prev();
      else next();
    }
  };
// ==========================
// 🗑️ DELETE HANDLER (NEW 🔥)
// ==========================
const handleDeleteStory = (deletedId) => {
  const index = stories.findIndex((s) => s._id === deletedId);
  if (index === -1) return;

  // 👉 only one story
  if (stories.length === 1) {
    onClose?.();
    return;
  }

  // 👉 move index
  if (index < stories.length - 1) {
    setCurrentIndex(index);
  } else {
    setCurrentIndex(index - 1);
  }
};


  return {
    story,
    currentIndex,
    progress,

    next,
    prev,

    pause,
    resume,

    isPaused,
    showViewers,
    setShowViewers,

    videoRef,

    onTouchStart,
    onTouchMove,
    onTouchEnd,

    handleDeleteStory
  };
};