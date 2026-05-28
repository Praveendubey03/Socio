import axios from "axios"
import { useDispatch } from "react-redux"
import { setShareUsers } from "../redux/shareSlice"
import { serverUrl } from "../App"

const getAllShare = () => {
    const dispatch = useDispatch()

    const fetchUsers = async () => {
        try {
            const res = await axios.get(
                `${serverUrl}/api/post/share-list`,
                { withCredentials: true }
            )

            // ✅ backend already gives unique users
            dispatch(setShareUsers(res.data))

        } catch (err) {
            console.log(err)
        }
    }

    return { fetchUsers }
}

export default getAllShare