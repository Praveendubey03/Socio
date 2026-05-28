import { FaArrowLeft } from "react-icons/fa6";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useDeleteStory } from "../../hooks/useStory";
import dp from "../../assets/dp.png";

const StoryHeader = ({ story, onClose, onDeleteStory }) => {
    const navigate = useNavigate();
    const { userData } = useSelector((state) => state.user);
    const { deleteStory } = useDeleteStory();

    const [showMenu, setShowMenu] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const menuRef = useRef(null);
    const confirmRef = useRef(null);

    const isOwner = story?.author?._id === userData?._id;

    const getTimeAgo = (createdAt) => {
        const diff = Math.floor((Date.now() - new Date(createdAt)) / 1000);
        if (diff < 60) return `${diff}s`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        return `${Math.floor(diff / 86400)}d`;
    };

    // ✅ Close menu / modal on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target) &&
                confirmRef.current &&
                !confirmRef.current.contains(e.target)
            ) {
                setShowMenu(false);
                setShowConfirm(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ✅ DELETE HANDLER (UPDATED 🔥)
    const handleDelete = async () => {
        await deleteStory(story._id);
        setShowConfirm(false);

        // ❗ DO NOT CLOSE HERE
        onDeleteStory(story._id);
    };

    return (
        <>
            {/* HEADER */}
            <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-3 z-50">

                {/* LEFT */}
                <div className="flex items-center gap-2">
                    <FaArrowLeft
                        onClick={onClose}
                        className="text-white cursor-pointer"
                    />

                    <img
                        src={story?.author?.profileImage || dp}
                        className="w-8 h-8 rounded-full cursor-pointer"
                        onClick={() =>
                            navigate(`/profile/${story?.author?.userName}`)
                        }
                    />

                    <div className="flex flex-col text-white">
                        <span className="text-sm font-semibold">
                            {story?.author?.userName}
                        </span>
                        <span className="text-xs text-gray-400">
                            {getTimeAgo(story?.createdAt)}
                        </span>
                    </div>
                </div>

                {/* RIGHT (⋮ MENU) */}
                {isOwner && (
                    <div className="relative" ref={menuRef}>
                        <BsThreeDotsVertical
                            className="text-white text-xl cursor-pointer"
                            onClick={() => setShowMenu((prev) => !prev)}
                        />

                        {/* MENU BOX */}
                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-40 bg-black/90 backdrop-blur-md rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                                <button
                                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-800 transition"
                                    onClick={() => {
                                        setShowMenu(false);
                                        setShowConfirm(true);
                                    }}
                                >
                                    Delete Story
                                </button>

                                <button
                                    className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-800 transition"
                                    onClick={() => setShowMenu(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* CONFIRM MODAL */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div
                        ref={confirmRef}
                        className="w-[90%] max-w-sm bg-zinc-900 rounded-xl p-5 shadow-xl"
                    >
                        <h2 className="text-white text-lg font-semibold mb-3">
                            Delete Story?
                        </h2>
                        <p className="text-gray-400 text-sm mb-5">
                            This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600"
                                onClick={() => setShowConfirm(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-500"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default StoryHeader;