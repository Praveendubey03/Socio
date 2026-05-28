import { LuEye } from "react-icons/lu";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import dp from "../../assets/dp.png";
import StoryActions from "./StoryActions";

const StoryFooter = ({ story, showViewers, setShowViewers }) => {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const isOwner =
    story?.author?._id &&
    userData?._id &&
    story.author._id.toString() === userData._id.toString();


  const getTimeAgo = (time) => {
    if (!time) return "";

    const diff = Math.floor((Date.now() - new Date(time)) / 1000);

    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const filteredViewers = (() => {
    if (!story?.viewers) return [];

    const seen = new Set();

    return story.viewers
      .filter((v) => {
        const id = v?.user?._id?.toString();

        if (!id) return false;

        // ❌ remove self
        if (id === userData?._id?.toString()) return false;

        // ❌ dedupe
        if (seen.has(id)) return false;

        seen.add(id);
        return true;
      })
      .sort((a, b) => new Date(b?.viewedAt || 0) - new Date(a?.viewedAt || 0));
  })();

  return (
    <>
      {/* 👁️ OWNER VIEW */}
      {isOwner && !showViewers && (
        <div
          onClick={() => setShowViewers(true)}
          className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full z-50"
        >
          <LuEye className="text-white" />
          <span className="text-white text-sm">
            {filteredViewers.length}
          </span>
        </div>
      )}

      {/* ❤️ VIEWER ACTIONS */}
      {story && userData && !isOwner && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-full px-4 flex justify-center">
          <StoryActions story={story} />
        </div>
      )}

      {/* 🔥 OVERLAY (UNCHANGED) */}
      {isOwner && showViewers && (
        <div
          className="absolute inset-0 z-50 flex items-end"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowViewers(false);
            }
          }}
        >
          {/* PANEL */}
          <div
            className="w-full h-[60%] bg-black/95 backdrop-blur-md rounded-t-3xl p-4 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-500 rounded-full mx-auto mb-3" />

            <div className="flex justify-between items-center mb-4">
              <span className="text-white font-semibold">
                Viewers ({filteredViewers.length})
              </span>
              <button
                onClick={() => setShowViewers(false)}
                className="text-gray-400 text-sm"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {filteredViewers.length > 0 ? (
                filteredViewers.map((viewer, i) => {
                  const userObj =
                    typeof viewer?.user === "object" ? viewer.user : null;

                  const username =
                    userObj?.userName || userObj?.name || "User";

                  const profileImage =
                    userObj?.profileImage || dp;

                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${username}`);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={profileImage}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="text-white text-sm font-medium">
                          {username}
                        </div>
                      </div>

                      <div className="text-gray-400 text-xs">
                        {getTimeAgo(viewer?.viewedAt)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-gray-400 text-center mt-10">
                  No viewers yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StoryFooter;