import React from 'react';

interface PromotionProps {
    title?: string;
    discountPercentage?: number;
    discountText?: string;
    condition?: string;
}

export const Promotion: React.FC<PromotionProps> = ({
    title = 'First Time Customer',
    discountPercentage = 25,
    discountText = 'OFF WHOLE ORDER',
    condition = '(under 100 units)'
}) => {
    return (
        <div className="w-full bg-gradient-to-r from-[#253244] via-[#8C3859] to-[#FD8C6E] text-white p-8 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <div className="max-w-4xl mx-auto">
                <p className="text-lg font-bold uppercase tracking-wider mb-4 text-white/90 drop-shadow-sm">{title}</p>
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        <span className="text-7xl font-extrabold text-white drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(28, 28, 28, 0.3)' }}>
                            {discountPercentage}%
                        </span>
                        <div className="flex flex-col items-start">
                            <span className="text-4xl font-semibold tracking-tight text-white drop-shadow-md">{discountText}</span>
                            <span className="text-sm font-medium text-white/90 mt-1 bg-[#1C1C1C]/20 px-2 py-1 rounded">{condition}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Promotion;