'use client'

import { useState } from 'react'

export default function QuantityInput({ item }: { item: any }) {
    const [quantity, setQuantity] = useState(item.quantity)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10)
        setQuantity(value);
    }

    return (
        <div className="text-sm font-bold">
            Qty:
            <input
                type="number"
                value={quantity}
                onChange={handleChange}
                min="1"
                className="w-[60px] text-center border border-gray-300 rounded-md p-1 ml-2"
            />
        </div>
    )
}