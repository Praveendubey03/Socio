import React, { useEffect } from "react";
import { useSelector } from "react-redux";

import ChatHeader from "./ChatHeader";
import MessagesList from "./MessagesList";
import MessageInput from "./MessageInput";

import useChat from "../../hooks/useChat";

const ChatWindow = () => {
  const { selectedUser } = useSelector((state) => state.message);
  const { fetchMessages } = useChat();

  // 🔹 LOAD MESSAGES
  useEffect(() => {
    if (selectedUser?._id) {
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser, fetchMessages]);

  if (!selectedUser) {
    return (
      <div className="hidden md:flex w-full h-full items-center justify-center text-gray-500">
        Select a chat to start messaging 💬
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-black overflow-hidden">

      {/* 🔹 HEADER (FIXED HEIGHT) */}
      <div className="flex-shrink-0">
        <ChatHeader />
      </div>

      {/* 🔹 MESSAGES (SCROLL AREA ONLY) */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <MessagesList />
      </div>

      {/* 🔹 INPUT (FIXED BOTTOM) */}
      <div className="flex-shrink-0">
        <MessageInput />
      </div>

    </div>
  );
};

export default ChatWindow;