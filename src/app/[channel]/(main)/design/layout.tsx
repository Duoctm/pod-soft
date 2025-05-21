import React, { ReactNode } from 'react'

const DesignLayout = ({children}: {children: ReactNode}) => {
  return (
    <div className='min-h-screen'>
      {children}
    </div>
  )
}

export default DesignLayout
