import React from "react";
import { useSelector } from "react-redux";
import ChatList from "../../components/ChatList/ChatList";
import ChatWindow from "../../components/ChatWindow/ChatWindow";

const MessageArea = () => {
  const { selectedUser } = useSelector((state) => state.message);

  return (
    <div className="w-full h-screen flex bg-black ">

      {/* LEFT - CHAT LIST (FIXED WIDTH) */}
      <div
        className={`
    border-r border-gray-800
    w-full md:w-[320px] lg:w-[350px]
    flex-shrink-0
    h-full
    overflow-visible
    ${selectedUser ? "hidden md:block" : "block"}
  `}
      >
        <ChatList showBack={true} />
      </div>

      {/* RIGHT - CHAT WINDOW (TAKES REMAINING SPACE ONLY) */}
      <div
        className={`
          flex-1
          min-w-0
          h-full
          overflow-hidden
          ${selectedUser ? "block" : "hidden md:flex"}
        `}
      >
        {selectedUser ? (
          <ChatWindow />
        ) : (
          <div className="hidden md:flex w-full h-full items-center justify-center text-gray-500">
            Select a chat to start messaging 💬
          </div>
        )}
      </div>

    </div>
  );
};

export default MessageArea;