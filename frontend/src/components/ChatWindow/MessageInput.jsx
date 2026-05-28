import React, { useRef, useState, useEffect } from "react";
import { LuImagePlus } from "react-icons/lu";
import { IoSend } from "react-icons/io5";
import { BsEmojiSmile } from "react-icons/bs";
import EmojiPicker from "emoji-picker-react";

import { useSelector, useDispatch } from "react-redux";
import {
  clearEditingMessage,
  updateMessage,
  clearReplyMessage
} from "../../redux/messageSlice";

import useChat from "../../hooks/useChat";
import useTyping from "../../hooks/useTyping";

const MessageInput = () => {
  const { selectedUser, editingMessage, replyMessage, messages } = useSelector(
    (state) => state.message
  );

  const dispatch = useDispatch();

  const { sendMessage, editMessage } = useChat(); // ✅ FIXED
  const { handleTyping } = useTyping();

  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const [frontendMedia, setFrontendMedia] = useState(null);
  const [backendMedia, setBackendMedia] = useState(null);

  const mediaRef = useRef();

  // 🔹 SYNC EDITING MESSAGE
  useEffect(() => {
    if (editingMessage) {
      setInput(editingMessage.text || "");

      // ❌ REMOVE MEDIA IN EDIT MODE
      setBackendMedia(null);
      setFrontendMedia(null);
    }
  }, [editingMessage]);

  // 🔹 HANDLE MEDIA
  const handleMedia = (e) => {
    if (editingMessage) return; // ❌ BLOCK MEDIA IN EDIT

    const file = e.target.files[0];
    if (!file) return;

    setBackendMedia(file);
    setFrontendMedia(URL.createObjectURL(file));
  };

  // 🔹 SEND / EDIT MESSAGE
  const handleSend = async () => {
    if (!input && !backendMedia) return;

    if (editingMessage) {
      const updated = await editMessage({
        messageId: editingMessage._id,
        text: input,
      });

      console.log("EDIT RESPONSE:", updated);

      if (updated && updated._id) {
        dispatch(updateMessage(updated));
      } else {
        console.log("Edit failed or invalid response");
      }

      dispatch(clearEditingMessage());
    } else {
      await sendMessage({
        text: input,
        media: backendMedia,
        replyTo: replyMessage?._id,
      });

      console.log("SENDING:", {
        text: input,
        replyTo: replyMessage?._id,
      });
    }

    // 🔥 IMPORTANT CLEANUP (YOU MISSED THIS)
    setInput("");
    setBackendMedia(null);
    setFrontendMedia(null);
    setShowEmoji(false);
    dispatch(clearReplyMessage());
  };

  // 🔹 ENTER KEY
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 🔹 EMOJI
  const handleEmoji = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="w-full border-t border-gray-800 bg-black p-3">

      {/* 🔹 REPLY BAR */}
      {replyMessage && !editingMessage && (
        <div className="mb-2 bg-[#1a1a1a] rounded-xl border border-gray-700 overflow-hidden">

          {/* TOP: NAME + CLOSE */}
          <div className="flex justify-between items-center px-3 py-1.5">
            <p className="text-xs text-gray-400">
              Replying to {replyMessage.sender?.userName}
            </p>

            <button
              onClick={() => dispatch(clearReplyMessage())}
              className="text-gray-400 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>

          {/* BOTTOM: MESSAGE PREVIEW */}
          <div className="bg-[#111] px-3 py-2">
            <p className="
  text-sm text-white
  leading-[1.4]
  break-words
  [overflow-wrap:anywhere]
  max-h-[40px] overflow-hidden
">
              {replyMessage.text || "Media"}
            </p>
          </div>
        </div>
      )}

      {/* 🔹 EDIT BAR */}
      {editingMessage && (
        <div className="flex items-center justify-between bg-[#1a1a1a] px-3 py-2 rounded-t-lg border-b border-gray-700">
          <span className="text-sm text-gray-300">
            Editing message
          </span>

          <button
            onClick={() => {
              dispatch(clearEditingMessage());
              setInput("");
            }}
            className="text-gray-400 hover:text-white text-lg"
          >
            ✕
          </button>
        </div>
      )}

      {/* 🔹 MEDIA PREVIEW (ONLY WHEN NOT EDITING) */}
      {!editingMessage && frontendMedia && (
        <div className="mb-2 w-[90px] h-[90px] rounded-lg overflow-hidden relative">
          {backendMedia?.type.startsWith("video") ? (
            <video src={frontendMedia} className="w-full h-full object-cover" />
          ) : (
            <img src={frontendMedia} className="w-full h-full object-cover" />
          )}
        </div>
      )}

      {/* 🔹 INPUT BAR */}
      <div className="flex items-end gap-2 bg-[#121212] px-4 py-2 rounded-2xl relative">

        {/* EMOJI */}
        <BsEmojiSmile
          onClick={() => setShowEmoji((prev) => !prev)}
          className="text-gray-400 text-xl cursor-pointer"
        />

        {/* TEXTAREA */}
        <textarea
          value={input}
          rows={1}
          onChange={(e) => {
            setInput(e.target.value);
            const conversationId =
              messages[0]?.conversationId?._id || messages[0]?.conversationId;

            handleTyping(conversationId);
          }}
          onKeyDown={handleKeyDown}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
          placeholder="Message..."
          className="
            flex-1 bg-transparent text-white outline-none text-sm
            resize-none max-h-[120px] overflow-y-auto
          "
        />

        {/* MEDIA BUTTON (HIDE IN EDIT MODE) */}
        {!editingMessage && (
          <LuImagePlus
            onClick={() => mediaRef.current.click()}
            className="text-gray-400 text-xl cursor-pointer"
          />
        )}

        <input
          type="file"
          hidden
          ref={mediaRef}
          accept="image/*,video/*"
          onChange={handleMedia}
        />

        {/* SEND BUTTON */}
        {(input || frontendMedia) && (
          <button
            onClick={handleSend}
            className="bg-gradient-to-br from-[#9500ff] to-[#ff0095] p-2 rounded-full"
          >
            <IoSend className="text-white text-sm" />
          </button>
        )}
      </div>

      {/* 🔹 EMOJI PICKER */}
      {showEmoji && (
        <div className="absolute bottom-[70px] left-4 z-50">
          <EmojiPicker onEmojiClick={handleEmoji} theme="dark" />
        </div>
      )}
    </div>
  );
};

export default MessageInput;