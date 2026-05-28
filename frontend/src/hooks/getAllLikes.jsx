import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../App";
import { toggleLike, setLikeLoading, setLikeError } from "../redux/likeSlice";

const getAllLike = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  const handleLike = async (type, itemId) => {
  if (!userData?._id) return;

  const userId = userData._id;

  // ✅ Optimistic update
  dispatch(toggleLike({ type, itemId, userId }));

  try {
    dispatch(setLikeLoading(true));

    // 🔥 FIXED ROUTE HANDLING
    let url = "";

    if (type === "post") {
      url = `${serverUrl}/api/post/like/${itemId}`;
    } else if (type === "comment") {
      url = `${serverUrl}/api/post/comment/like/${itemId}`;
    } else {
      url = `${serverUrl}/api/${type}/like/${itemId}`;
    }

    console.log("🔥 LIKE API:", url); // DEBUG

    await axios.post(url, {}, { withCredentials: true });

    dispatch(setLikeLoading(false));
  } catch (error) {
    console.log("❌ LIKE ERROR:", error.message);

    dispatch(setLikeError(error.message));

    // ❗ revert
    dispatch(toggleLike({ type, itemId, userId }));
  }
};

  return { handleLike };
};

export default getAllLike;