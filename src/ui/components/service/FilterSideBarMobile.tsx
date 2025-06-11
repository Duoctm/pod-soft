import React from 'react'
import { XIcon } from 'lucide-react'
import { useFilterSidebar } from '@/actions/useFilterSidebar'
const FilterSideBarMobile = () => {
    const { isOpen, onClose } = useFilterSidebar()
    return (
        <div
            className={`fixed inset-0 z-50 transform bg-white transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
        >
            <div className="flex h-full flex-col overflow-y-auto p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold capitalize text-gray-800">Filters</h2>
                    <button className="rounded-full p-2 hover:bg-gray-100" onClick={() => onClose()}>
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </div>
    )
}

// eslint-disable-next-line import/no-default-export
export default FilterSideBarMobile