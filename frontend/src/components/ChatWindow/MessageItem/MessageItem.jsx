import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../../../App";

import MessageBubble from "./MessageBubble";
import MessageActions from "./MessageActions";
import ReactionPopup from "./ReactionPopup";
import MessageMenu from "./MessageMenu";
import PreviewModal from "./PreviewModal";
import MessageInfo from "./MessageInfo";
import ReactionDetails from "./ReactionDetails";
import useChat from "../../../hooks/useChat";

const reactionsList = ["❤️", "😮", "😢", "😡", "👍"];

const MessageItem = ({ message }) => {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { reactToMessage } = useChat();

  const [showPreview, setShowPreview] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReactionDetails, setShowReactionDetails] = useState(false);
  const [menuPosition, setMenuPosition] = useState("down");
  const [showInfo, setShowInfo] = useState(false);

  const wrapperRef = useRef();

  const senderId =
    typeof message.sender === "object"
      ? message.sender._id
      : message.sender;

  const isSender = senderId === userData?._id;

  const mediaUrl = message.isTemp
    ? message.media
    : message.media?.startsWith("http")
    ? message.media
    : `${serverUrl}/${message.media}`;

  // 🔥 CLOSE ALL POPUPS
  useEffect(() => {
    const handleClick = (e) => {
      if (!wrapperRef.current?.contains(e.target)) {
        setShowMenu(false);
        setShowReactions(false);
        setShowReactionDetails(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // 🔥 MENU POSITION (same logic reused)
  const handleMenuToggle = () => {
    setShowMenu((prev) => !prev);
    setShowReactions(false);
    setShowReactionDetails(false);

    setTimeout(() => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;

      const spaceBelow = window.innerHeight - rect.bottom;
      setMenuPosition(spaceBelow < 180 ? "up" : "down");
    }, 0);
  };

  return (
    <div
      ref={wrapperRef}
      className="w-full flex px-2"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        if (!showMenu && !showReactions) setShowActions(false);
      }}
    >
      <div
        className={`relative flex flex-col ${
          isSender ? "ml-auto items-end" : "mr-auto items-start"
        } max-w-[35%]`}
      >
        {/* ACTIONS */}
        <MessageActions
          message={message}
          isSender={isSender}
          show={showActions || showMenu || showReactions}
          onReact={() => {
            setShowReactions((prev) => !prev);
            setShowMenu(false);
            setShowReactionDetails(false);
          }}
          onMenu={handleMenuToggle}
        />

        {/* EMOJI PICKER (same positioning style as menu) */}
        {showReactions && (
          <div className="relative">
            <ReactionPopup
              isSender={isSender}
              reactions={reactionsList}
              onSelect={(emoji) => {
                reactToMessage({
                  messageId: message._id,
                  emoji,
                });
                setShowReactions(false);
              }}
            />
          </div>
        )}

        {/* MENU */}
        {showMenu && (
          <MessageMenu
            isSender={isSender}
            message={message}
            navigate={navigate}
            position={menuPosition}
            onInfo={() => {
              setShowInfo((prev) => !prev);
              setShowMenu(false);
            }}
            onClose={() => setShowMenu(false)}
          />
        )}

        {showInfo && (
          <MessageInfo
            isSender={isSender}
            message={message}
            onClose={() => setShowInfo(false)}
          />
        )}

        {/* MESSAGE */}
        <MessageBubble
          message={message}
          mediaUrl={mediaUrl}
          isSender={isSender}
          onPreview={() => setShowPreview(true)}
        />

        {/* ✅ REACTION BAR (ONLY ONE) */}
        {message.reactions?.length > 0 && (
          <div
            className={`
              relative mt-1 flex items-center gap-1 px-2 py-[3px]
              rounded-full bg-[#1a1a1a] text-white w-fit flex-wrap cursor-pointer
              ${isSender ? "ml-auto" : "mr-auto"}
            `}
            onClick={() => {
              setShowReactionDetails((prev) => !prev);
              setShowReactions(false);
              setShowMenu(false);
            }}
          >
            {Object.entries(
              message.reactions.reduce((acc, r) => {
                acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                return acc;
              }, {})
            ).map(([emoji, count]) => (
              <span key={emoji} className="text-xs flex items-center gap-[2px]">
                {emoji}
                {count > 1 && <span>{count}</span>}
              </span>
            ))}

            {/* ✅ REACTION DETAILS (same style as menu positioning) */}
            {showReactionDetails && (
              <div
                className={`
                  absolute z-50
                  ${menuPosition === "up" ? "bottom-full mb-2" : "top-full mt-2"}
                  ${isSender ? "right-0" : "left-0"}
                `}
              >
                <ReactionDetails
                  reactions={message.reactions}
                  isSender={isSender}
                  onClose={() => setShowReactionDetails(false)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* PREVIEW */}
      {showPreview && (
        <PreviewModal
          message={message}
          mediaUrl={mediaUrl}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default MessageItem;