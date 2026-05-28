const ReactionPopup = ({ isSender, reactions, onSelect }) => {
  return (
    <div
      className={`
        absolute top-0 -mt-10
        ${isSender ? "right-0" : "left-0"}
        bg-[#1a1a1a] px-2 py-1 rounded-full
        flex items-center gap-2
        shadow-lg border border-gray-700
        z-50
      `}
    >
      {reactions.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className="text-lg hover:scale-125 transition transform"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default ReactionPopup;