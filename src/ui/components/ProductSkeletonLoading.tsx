import React from 'react'

const SKELETON_ITEMS = 6;

const ProductSkeletonLoading: React.FC = () => {
    return (
        <div className="w-full min-h-screen">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: SKELETON_ITEMS }).map((_, idx) => (
                    <div key={idx} className="animate-pulse">
                        <div className="mb-3 aspect-square rounded-lg bg-gray-200"></div>
                        <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                        <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// eslint-disable-next-line import/no-default-export
export default ProductSkeletonLoading
