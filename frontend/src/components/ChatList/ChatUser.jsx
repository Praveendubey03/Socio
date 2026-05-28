import React from "react";
import UserItem from "./UserItem";

const ChatUsers = ({ users = [], onUserClick, isArchivedView, onDeleteClick }) => {
  if (!users.length) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
        No conversations yet
      </div>
    );
  }

  // PIN FIRST → THEN LATEST
  const sortedUsers = [...users].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    const timeA = new Date(a.lastMessage?.createdAt || 0).getTime();
    const timeB = new Date(b.lastMessage?.createdAt || 0).getTime();

    return timeB - timeA;
  });

  return (
    <div className="flex-1 overflow-y-auto overflow-visible relative">
      <div className="flex flex-col relative">
        {sortedUsers.map((user, index) => (
          <div key={user._id} className="relative overflow-visible">
            
            <UserItem
              user={user}
              onClick={() => onUserClick(user)}
              isArchivedView={isArchivedView}
               onDeleteClick={onDeleteClick}
            />
            {index !== sortedUsers.length - 1 && (
              <div className="h-[1px] bg-gray-800 ml-[70px]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatUsers;