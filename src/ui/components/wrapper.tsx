import React from 'react'
import { cn } from '@/lib/utils'

const Wrapper = ({ children, className, ...prev }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={cn("max-w-[1200px] w-full mx-auto px-4 min-h-[100px] lg:min-h-[300px]", className)} {...prev}>
      {children}
    </div>
  )
}

export default Wrapper