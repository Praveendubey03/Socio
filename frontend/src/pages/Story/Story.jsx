
import { useParams } from 'react-router-dom'

import StoryCards from '../../components/StoryCards/StoryCards'
import { useGetUserStories } from "../../hooks/useStory";

const Story = () => {

    const { userName } = useParams()
    useGetUserStories(userName)



    return (
        <div className='w-full min-h-screen bg-black flex justify-center items-center px-2 md:px-4'>

            <div className='w-full max-w-[500px] h-screen'>
                <StoryCards />
            </div>

        </div>
    )
}

export default Story