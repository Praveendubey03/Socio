import axios from 'axios'
import { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { setNotificationData } from '../redux/userSlice'

const useGetAllNotifications = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const result = await axios.get(
                    `${serverUrl}/api/user/getAllNotifications`,
                    { withCredentials: true }
                )
                dispatch(setNotificationData(result.data))
            } catch (error) {
                console.log(error)
            }
        }

        fetchNotifications()
    }, [dispatch])
}

export default useGetAllNotifications