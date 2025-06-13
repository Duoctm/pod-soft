/* eslint-disable import/no-default-export */
import React from 'react'
import { useRouter } from 'next/navigation'
// eslint-disable-next-line import/no-cycle
import { tabs } from '../DesignAction'

const DefaultTab = () => {
    const router = useRouter()

    const handleSelected = (slug: string) => {
        router.push(`?value=${slug}`)
    }



    return (
        <div className='flex flex-col items-center md:pt-3 px-2'>
            <h3 className='text-2xl font-bold'>Wha&apos;s next for you?</h3>
            <div className='w-full grid grid-cols-1 items-center justify-items-center mt-4 gap-2'>
                {tabs.map((item) => (
                    <div
                        onClick={() => handleSelected(item.slug)
                        }
                        key={item.slug}
                        className='w-full flex items-center justify-center py-2 border shadow-inner rounded-md flex-col hover:scale-95 transition-all hover:bg-slate-50'
                    >
                        {item.icon}
                        <span className='text-xl font-medium'>{item.name}</span>
                    </div>
                ))}

            </div>

        </div>
    )
}

export default DefaultTab 
