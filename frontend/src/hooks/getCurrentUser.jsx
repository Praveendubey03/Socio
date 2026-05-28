import axios from 'axios'
import { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { setFollowing, setUserData } from '../redux/userSlice'

const useGetCurrentUser = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/user/current`,
          { withCredentials: true }
        )

        dispatch(setUserData(result.data))
        dispatch(setFollowing(result.data.following))

      } catch (error) {
        console.log(error)
      }
    }

    fetchUser()
  }, [dispatch])
}

export default useGetCurrentUser