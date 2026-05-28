import { useState } from "react";

const LIMIT = 140;

const MessageBubble = ({
  message,
  mediaUrl,
  isSender,
  onPreview,
  onDoubleClick,
}) => {
  const [expanded, setExpanded] = useState(false);

  const text = message.text || "";
  const isLong = text.length > LIMIT;

  return (
    <div
      onDoubleClick={!message.isDeleted ? onDoubleClick : undefined}
      className={`
        rounded-2xl px-4 py-2.5 flex flex-col gap-1
        w-fit min-w-[80px]
        ${isSender && message.status === "seen"
          ? "bg-gray-600"
          : isSender
            ? "bg-gradient-to-br from-[#9500ff] to-[#ff0095]"
            : "bg-[#1a1f1f]"
        }
      `}
    >
      {/* 🔹 REPLY PREVIEW */}
      {message.replyTo && (
        <div
          className={`
            mb-1 px-2 py-1 rounded-lg text-[12px]
            border-l-2 
            ${isSender
              ? "bg-white/10 border-white/40"
              : "bg-gray-700 border-gray-400"
            }
          `}
        >
          <p className="text-gray-300 text-[11px]">
            {message.replyTo.sender?.userName}
          </p>

          <p className="text-white whitespace-pre-wrap break-words line-clamp-2">
            {message.replyTo.isDeleted
              ? "This message was deleted"
              : message.replyTo.text || "Media"}
          </p>
        </div>
      )}

      {/* 🔹 MEDIA (hide if deleted) */}
      {!message.isDeleted && message.media && (
        <div
          onClick={onPreview}
          className="w-full max-w-[260px] aspect-square overflow-hidden rounded-xl"
        >
          {message.messageType === "video" ? (
            <video
              src={mediaUrl}
              autoPlay
              loop
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={mediaUrl}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      )}

      {/* 🔹 TEXT */}
      <p className="text-white text-[15px] leading-[1.5] whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word]">

        {message.isDeleted
          ? "This message was deleted"
          : expanded
            ? text
            : text.slice(0, LIMIT)}

        {/* 🔹 MORE / LESS */}
        {!message.isDeleted && isLong && (
          <span
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 ml-1 cursor-pointer select-none"
          >
            {expanded ? " less" : "...more"}
          </span>
        )}

        {/* 🔹 EDITED */}
        {!message.isDeleted && message.isEdited && (
          <span className="text-gray-400 text-[11px] ml-1">
            (edited)
          </span>
        )}
      </p>
    </div>
  );
};

export default MessageBubble;