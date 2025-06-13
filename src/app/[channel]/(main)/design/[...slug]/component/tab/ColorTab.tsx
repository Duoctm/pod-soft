/* eslint-disable import/no-default-export */
'use client'

import React from 'react'
import { Check, X } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { type DesignType, useDesign } from '../../utils/useDesign'
import { cn } from '@/lib/utils'

const ColorTab = () => {
    const router = useRouter()
    const pathName = usePathname()

    const { setSelected, colorDesigns, setColorDesign, colorDesign } = useDesign()
    const handleSetSelected = () => {
        setSelected(null)
        router.replace(pathName)
    }

    const handleSelectedColor = (color: DesignType["colorDesign"]) => {
        setColorDesign(color)
    }

    return (
        <div className='flex flex-col flex-1 p-2'>
            <div className='flex items-center justify-between '>
                <span className='text-md font-semibold'>Choose Color</span>
                <X onClick={handleSetSelected} />
            </div>
            <div className='mt-2 flex flex-wrap gap-2 '>
                {!colorDesigns
                    ? Array.from({ length: 6 }).map((_, idx) => (
                        <div
                            key={idx}
                            className="w-8 h-8 rounded-md border-2 bg-gray-200 animate-pulse"
                        />
                    ))
                    : colorDesigns.map(color => (
                        <div
                            key={color.variant_id}
                            onClick={() => handleSelectedColor(color)}
                            className={cn(
                                "w-8 h-8 rounded-md border-2 hover:border-black/50 flex items-center justify-center",
                                { "border-black": colorDesign.variant_id === color.variant_id }
                            )}
                            style={{ backgroundColor: color.color_value }}
                        >
                            {colorDesign.variant_id === color.variant_id && <Check />}
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default ColorTab