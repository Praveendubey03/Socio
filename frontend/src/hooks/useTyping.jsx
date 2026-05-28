import { useRef } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useSelector } from "react-redux";

const useTyping = () => {
  const typingTimeout = useRef(null);

  const { selectedUser } = useSelector((state) => state.message);

  const isTyping = useRef(false);

  const lastSent = useRef(0);

  const handleTyping = (conversationId) => {
    if (!conversationId || !selectedUser) return;

    const now = Date.now();

    // 🔥 prevent spamming API
    if (now - lastSent.current > 1000) {
      startTyping(conversationId);
      lastSent.current = now;
    }

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      stopTyping(conversationId);
    }, 2000);
  };
  // 🔹 START TYPING
  const startTyping = async (conversationId) => {
    try {
      await axios.post(
        `${serverUrl}/api/message/typing/start`,
        { conversationId },
        { withCredentials: true }
      );
    } catch (error) {
      console.log("Typing start error:", error);
    }
  };

  // 🔹 STOP TYPING
  const stopTyping = async (conversationId) => {
    try {
      await axios.post(
        `${serverUrl}/api/message/typing/stop`,
        { conversationId },
        { withCredentials: true }
      );
    } catch (error) {
      console.log("Typing stop error:", error);
    }
  };


  return { handleTyping };
};

export default useTyping;