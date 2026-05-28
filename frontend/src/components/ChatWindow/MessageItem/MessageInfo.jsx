import { useEffect, useRef } from "react";

const MessageInfo = ({ isSender, message, onClose }) => {
  const ref = useRef();

  // 🔥 CLOSE ON OUTSIDE CLICK
  useEffect(() => {
    const handleClick = (e) => {
      if (!ref.current?.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  // 🔥 TEMP MOCK DATA
  const deliveredAt = message?.deliveredAt || null;
  const readAt = message?.seenAt || null;
  const formatTime = (date) => {
    const d = new Date(date);
    const today = new Date();

    const isToday =
      d.toDateString() === today.toDateString();

    return isToday
      ? d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
      : d.toLocaleString([], {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
  };
  console.log("INFO MESSAGE:", message);
  return (
    <div
      ref={ref}
      className={`
        absolute top-1/2 -translate-y-1/2
        ${isSender ? "right-full mr-44" : "left-full ml-44"}
        w-[220px]

        bg-[#121212]/95 backdrop-blur-md
        rounded-2xl p-4 flex flex-col gap-3

        shadow-xl border border-gray-800
        z-50
      `}
    >
      {/* 🔹 TITLE */}
      <div className="text-center text-[14px] font-semibold text-white tracking-wide">
        Message Info
      </div>

      {/* 🔹 DIVIDER */}
      <div className="h-[1px] bg-gray-800" />

      {/* 🔹 DELIVERED */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-white font-medium">Delivered</span>
        <span className="text-gray-400">
          {deliveredAt ? formatTime(deliveredAt) : "Not delivered"}
        </span>
      </div>

      {/* 🔹 READ */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-white font-medium">Seen</span>
        <span className="text-gray-400">
          {readAt ? formatTime(readAt) : "Not seen"}
        </span>
      </div>
    </div>
  );
};

export default MessageInfo;