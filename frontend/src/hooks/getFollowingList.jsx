import axios from 'axios'
import { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { setFollowing, setUserData } from '../redux/userSlice'

const useFollowingList = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const result = await axios.get(
                    `${serverUrl}/api/user/followingList`,
                    { withCredentials: true }
                )

                console.log("🔥 FOLLOWING FROM API:", result.data)

                dispatch(setFollowing(result.data))
                console.log("🔥 FOLLOWING AFTER FETCH:", result.data);
                dispatch(setFollowing(result.data))

            } catch (error) {
                console.log(error)
            }
        }

        fetchUser()

    }, [])
}

export default useFollowingList