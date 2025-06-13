import { RedoIcon, Undo } from 'lucide-react'
import React from 'react'
import { useDesign } from '../utils/useDesign'

const RedoUndo = () => {

    const { handleRedo, handleUndo } = useDesign()

    return (
        <div className='w-16 flex flex-col absolute top-0 left-1 border-2  rounded-md '>
            <div
                onClick={() => handleRedo()}
                className='w-full h-16 flex items-center justify-center hover:bg-black/10 flex-col'>
                <RedoIcon />
                Redo
            </div>
            <div
                onClick={() => handleUndo()}
                className='w-full h-16 flex items-center justify-center hover:bg-black/20 flex-col'>
                <Undo />
                Undo

            </div>

        </div>
    )
}

export default RedoUndo  
