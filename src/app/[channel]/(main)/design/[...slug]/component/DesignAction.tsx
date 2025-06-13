/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-cycle */
/* eslint-disable import/no-default-export */

"use client"
import { CloudUpload, Palette, Type } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react'
import { useDesign } from '../utils/useDesign';
import TabContent from './tab/TabContent';
import { cn } from '@/lib/utils'



export const tabs = [
    {
        slug: "color",
        name: "Color",
        icon: <Palette className='w-8 h-8' />
    },
    {
        slug: "upload",
        name: "Upload",
        icon: <CloudUpload className='w-8 h-8' />

    }, {
        slug: "add-text",
        name: "Add Text",
        icon: <Type className='w-8 h-8' />
    }]




const DesignAction = () => {

    const router = useRouter()
    const params = useSearchParams()

    const { selected, setSelected } = useDesign()

    useEffect(() => {
        const defaultSelected = params.get("value")
        setSelected(defaultSelected)
    }, [params])

    const handleSelected = (slug: string) => {
        router.push(`?value=${slug}`)
    }


    return (
        <div className='w-full h-full flex flex-row border rounded-md overflow-hidden'>
            <div className='w-20 h-full text-white flex flex-col items-start justify-start bg-[#743C54] pt-2'>
                {tabs.map(i => (
                    <div
                        key={i.name}
                        className={cn(
                            "w-20 h-20 flex items-center justify-center flex-col hover:bg-white/20 hover:text-white",
                            { "bg-white text-black border-l-[4px] border-l-blue-500": i.slug === selected }
                        )}
                        onClick={() => handleSelected(i.slug)}
                    >
                        {i.icon}
                        <span>{i.name}</span>
                    </div>
                ))}
            </div>
            <div className='flex-1 h-full'>
                <TabContent slug={selected} />
            </div>
        </div>
    )
}

export default DesignAction
