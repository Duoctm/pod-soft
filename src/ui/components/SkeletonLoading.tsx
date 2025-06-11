import React from 'react'

const SkeletonLoading = () => {
    return (
        <div className="animate-pulse max-w-[250px] w-full">
            {[1, 2, 3, 4].map((index) => (
                <div key={index} className="mb-6">
                    {/* Filter header skeleton */}
                    <div className="mb-3 flex items-center justify-between">
                        <div className="h-6 w-24 rounded bg-gray-200"></div>
                        <div className="h-5 w-5 rounded bg-gray-200"></div>
                    </div>
                    {/* Filter options skeleton */}
                    <div className="flex flex-wrap gap-3">
                        {[1, 2, 3, 4].map((optionIndex) => (
                            <div key={optionIndex} className="h-8 w-20 rounded-full bg-gray-200"></div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default SkeletonLoading
