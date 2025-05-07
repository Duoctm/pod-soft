import { cn } from '@/lib/utils'
import React from 'react'

const Wrapper = ({children, className, ...prev} : { children: React.ReactNode, className?: string}) => {
  return (
    <div className={cn("max-w-[1200px] w-full mx-auto px-4", className)} {...prev}>
      {children}
    </div>
  )
}

export default Wrapper
