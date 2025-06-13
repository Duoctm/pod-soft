/* eslint-disable import/no-default-export */
import React from 'react'
import Image from 'next/image'
import { useDesign } from '../utils/useDesign'
import { type PrintFaceData } from '../utils/type'
import { cn } from '@/lib/utils'

const ChangeFaceDesign = ({
    faces
}: { faces: PrintFaceData[] }) => {
    const { handleChangeFace, face: defaultChooseFace } = useDesign()
    return (
        <div className='flex flex-col w-24 bg-white rounded-md p-1 absolute right-10 top-0 gap-2 border'>
            {!faces
                ? Array.from({ length: 2 }).map((_, idx) => (
                    <div
                        key={idx}
                        className="w-24 h-24 bg-gray-200 animate-pulse rounded-md border"
                    />
                ))
                : faces.map((face) => {
                    const faceChange = face.name.toLocaleLowerCase()
                    return (
                        <Image
                            onClick={() => handleChangeFace(faceChange)}
                            src={face.image}
                            width={96}
                            height={96}
                            alt={face.name}
                            key={face.name}
                            className={cn(
                                "border hover:bg-black/10 rounded-md",
                                { "border-[#8C3859] border-2 bg-black/10": face.name.toLocaleLowerCase() === defaultChooseFace }
                            )}
                        />
                    )
                })
            }
        </div>
    )
}

export default ChangeFaceDesign