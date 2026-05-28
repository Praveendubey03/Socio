import axios from "axios";
import { useDispatch } from "react-redux";
import { serverUrl } from "../App";
import { addReply, setCommentError } from "../redux/commentSlice";

const getAllReply = () => {
    const dispatch = useDispatch();

    const handleReply = async (type, itemId, commentId, message) => {
        try {
            const result = await axios.post(
                `${serverUrl}/api/${type}/reply/${commentId}`,
                { message },
                { withCredentials: true }
            );

            // ✅ Update redux instantly
            const comment = result.data.comments?.find(
                (c) => c._id === commentId
            );

            const reply = comment?.replies?.slice(-1)[0];

            if (reply) {
                dispatch(addReply({ type, itemId, commentId, reply }));
            }
        } catch (error) {
            console.log(error);
            dispatch(setCommentError(error.message));
        }
    };

    return { handleReply };
};

export default getAllReply;