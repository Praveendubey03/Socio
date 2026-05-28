import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import MessageItem from "./MessageItem/MessageItem";
import useChat from "../../hooks/useChat";
import TypingBubble from "./MessageItem/TypingBubble";

const MessagesList = () => {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const { markSeen, markDelivered } = useChat();
  const { userData } = useSelector((state) => state.user);
  const { messages, selectedUser } = useSelector((state) => state.message);
  const { typingUsers } = useSelector((state) => state.typing);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showNewMsgBtn, setShowNewMsgBtn] = useState(false);

  const isFirstLoad = useRef(true);

  if (!selectedUser) return null;

  // FORMAT DATE
  const formatDateLabel = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

    return d.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // SCROLL DETECTION
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const threshold = 100; // px
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

    setIsAtBottom(atBottom);

    if (atBottom) {
      setShowNewMsgBtn(false);
    }
  };

  // AUTO SCROLL LOGIC
  useEffect(() => {
    if (!bottomRef.current) return;

    if (isFirstLoad.current) {
      bottomRef.current.scrollIntoView({ behavior: "auto" });
      isFirstLoad.current = false;
      return;
    }

    if (isAtBottom) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    } else {
      setShowNewMsgBtn(true);
    }
  }, [messages]);

  //RESET ON USER CHANGE
  useEffect(() => {
    isFirstLoad.current = true;
    setShowNewMsgBtn(false);
  }, [selectedUser]);


  useEffect(() => {
    if (!selectedUser || messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    const conversationId =
      lastMessage.conversationId?._id || lastMessage.conversationId;

    //delay seen (VERY IMPORTANT)
    setTimeout(() => {
      markSeen(conversationId);
    }, 300);

  }, [messages]);

  //TYPING
const conversationId =
  messages[0]?.conversationId?._id ||
  messages[0]?.conversationId ||
  selectedUser?.conversationId;

  const isTyping =
    typingUsers[conversationId]?.includes(selectedUser._id);
  return (
    <div className="relative flex-1">

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto px-4 py-4 flex flex-col gap-3"
      >
        {messages.map((message, index) => {

          const isHiddenForMe = message.deletedFor?.includes(userData._id);

          if (isHiddenForMe) {
            return (
              <React.Fragment key={message._id}></React.Fragment>
            );
          }
          const currentDate = new Date(message.createdAt).toDateString();
          const prevDate =
            index > 0
              ? new Date(messages[index - 1].createdAt).toDateString()
              : null;

          const showDate = currentDate !== prevDate;

          return (
            <React.Fragment key={message._id}>
              {showDate && (
                <div className="sticky top-2 z-10 flex justify-center">
                  <div className="bg-[#121212]/80 backdrop-blur-md text-gray-300 text-xs px-4 py-1 rounded-full border border-gray-800 shadow">
                    {formatDateLabel(message.createdAt)}
                  </div>
                </div>
              )}

              <MessageItem message={message} />
            </React.Fragment>
          );
        })}

        {isTyping && (
          <div className="flex px-2">
            <div className="mr-auto max-w-[35%]">
              <TypingBubble />
            </div>
          </div>
        )}

        <div ref={bottomRef}></div>
      </div>

      {/* 🔥 NEW MESSAGE BUTTON */}
      {showNewMsgBtn && (
        <button
          onClick={() =>
            bottomRef.current?.scrollIntoView({ behavior: "smooth" })
          }
          className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#9500ff] to-[#ff0095] text-white px-4 py-2 rounded-full shadow-lg text-sm"
        >
          New messages ↓
        </button>
      )}
    </div>
  );
};

export default MessagesList;