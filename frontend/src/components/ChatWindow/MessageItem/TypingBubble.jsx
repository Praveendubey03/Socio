import React from "react";

const TypingBubble = () => {
  return (
    <div className="bg-[#1a1f1f] px-4 py-2 rounded-2xl flex items-center gap-1 w-fit">
      <span className="dot"></span>
      <span className="dot"></span>
      <span className="dot"></span>

      <style>{`
        .dot {
          width: 6px;
          height: 6px;
          background-color: #aaa;
          border-radius: 50%;
          animation: bounce 1.3s infinite ease-in-out;
        }

        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.6;
          }
          40% {
            transform: translateY(-6px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default TypingBubble;