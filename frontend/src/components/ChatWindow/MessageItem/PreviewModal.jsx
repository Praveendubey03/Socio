const PreviewModal = ({ message, mediaUrl, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      {message.messageType === "video" ? (
        <video src={mediaUrl} controls className="max-h-[90%]" />
      ) : (
        <img src={mediaUrl} className="max-h-[90%]" />
      )}
      <button onClick={onClose} className="absolute top-5 right-5 text-white text-2xl">
        ✕
      </button>
    </div>
  );
};

export default PreviewModal;