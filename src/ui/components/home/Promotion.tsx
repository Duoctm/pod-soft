import React from 'react';

interface PromotionProps {
    title?: string;
    discountPercentage?: number;
    discountText?: string;
    condition?: string;
}

export const Promotion : React.FC<PromotionProps> = ({
    title = 'First Time Customer',
    discountPercentage = 25,
    discountText = 'OFF WHOLE ORDER',
    condition = '(under 100 units)'
}) => {
    return (
        <div className="w-full bg-orange-300 text-white p-4 text-left px-6">
            <p className="text-base font-semibold uppercase">{title}</p>
            <div className="text-center">
                <p className="text-6xl font-bold leading-tight">
                    {discountPercentage}% <span className="text-3xl font-normal">{discountText}</span>{' '}
                    <span className="text-base">{condition}</span>
                </p>
            </div>
        </div>
    );
};

export default Promotion;