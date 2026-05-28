import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSelectedUser } from "../../redux/messageSlice";

import useConversation from "../../hooks/useConversation";

import ChatHeader from "./ChatHeader";
import OnlineUsers from "./OnlineUsers";
import ChatUsers from "./ChatUser";

const ChatList = ({ showBack = true }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // REDUX DATA
  const { conversations } = useSelector((state) => state.conversation);

  // HOOK
  const { fetchConversations, deleteChat } = useConversation();

  // STATES
  const [showArchived, setShowArchived] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  //HANDLE CLICK
  const handleUserClick = (user) => {
    dispatch(setSelectedUser(user));
    navigate("/messages");
  };

  //FETCH ON LOAD
  useEffect(() => {
    fetchConversations();
  }, []);

  //COUNTS
  const archivedCount = conversations.filter((u) => u.isArchived).length;
  useEffect(() => {
  if (showArchived && archivedCount === 0) {
    setShowArchived(false);
  }
}, [archivedCount, showArchived]);

  //FILTER USERS
  const filteredUsers = showArchived
    ? conversations.filter((u) => u.isArchived)
    : conversations.filter((u) => !u.isArchived);

  return (
    <div className="w-full h-full flex flex-col bg-black relative">

      <ChatHeader showBack={showBack} />

      {showArchived && (
        <div
          onClick={() => setShowArchived(false)}
          className="px-4 py-2 text-sm text-gray-400 cursor-pointer hover:bg-[#121212]"
        >
          ← Back
        </div>
      )}

      {!showArchived && (
        <OnlineUsers onUserClick={handleUserClick} />
      )}

      {!showArchived && archivedCount > 0 && (
        <div
          onClick={() => setShowArchived(true)}
          className="px-4 py-3 border-b border-gray-800 text-gray-300 cursor-pointer hover:bg-[#121212]"
        >
          Archived Chats ({archivedCount})
        </div>
      )}

      <ChatUsers
        users={filteredUsers}
        onUserClick={handleUserClick}
        isArchivedView={showArchived}
        onDeleteClick={(user) => setDeleteTarget(user)}
      />

      {deleteTarget && (
        <div
          className="absolute inset-0 bg-black/50 flex items-center justify-center z-[50] animate-fadeIn"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="bg-[#1e1e1e] w-[300px] rounded-lg p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white text-[16px] font-semibold mb-2">
              Delete chat?
            </h3>

            <p className="text-gray-400 text-sm mb-4">
              Are you sure you want to delete this chat?
            </p>

            <div className="flex justify-end gap-3">
        
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-3 py-1 text-gray-300 hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  deleteChat(deleteTarget.conversationId);
                  setDeleteTarget(null);
                }}
                className="px-3 py-1 text-red-400 hover:text-red-500 font-semibold"
              >
                Delete
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;