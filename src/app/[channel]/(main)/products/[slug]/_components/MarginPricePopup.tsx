/* eslint-disable import/no-default-export */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import React from 'react'
import { Dialog } from '@headlessui/react'
import { formatMoney } from '@/lib/utils'

type MarginPricePopupProps = {
    open: boolean
    onClose: () => void
    title: string,
    variantValues: {
        name: string
        size: string
    }[]
    listMarginPrice?: any[] | null
}

// Custom styles for better scrolling experience and mobile optimization
const customStyles = `
  .scrollbar-thin {
    scrollbar-width: thin;
  }
  .scrollbar-thin::-webkit-scrollbar {
    height: 4px;
    width: 4px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 2px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #F58A71;
    border-radius: 2px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #E07B6A;
  }
  
  /* Mobile scroll indicator */
  .scroll-indicator {
    position: absolute;
    bottom: 8px;
    right: 16px;
    display: flex;
    gap: 2px;
    z-index: 20;
  }
  
  .scroll-indicator-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #F58A71;
    opacity: 0.3;
    transition: opacity 0.3s ease;
  }
  
  .scroll-indicator-dot.active {
    opacity: 1;
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  
  .animate-slide-in {
    animation: slideIn 0.3s ease-out;
  }
  
  .animate-pulse-custom {
    animation: pulse 2s infinite;
  }
  
  /* Mobile card layout */
  @media (max-width: 640px) {
    .mobile-card {
      min-width: 280px;
      max-height: 500px;
      scroll-snap-align: start;
    }
    
    .mobile-scroll-container {
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
    }
    
    /* Smooth scrolling for content */
    .mobile-content-scroll {
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
    }
    
    /* Custom mobile popup height */
    .mobile-popup-content {
      max-height: calc(100vh - 6rem);
      min-height: 200px;
    }
    
    /* Individual item scroll */
    .pricing-item {
      scroll-snap-align: start;
      scroll-margin-top: 0.5rem;
    }
    
    /* Fixed height for mobile card content */
    .mobile-card-content {
      max-height: 400px;
      overflow-y: auto;
    }
  }
  
  /* Desktop scroll snap */
  @media (min-width: 641px) {
    .desktop-content-scroll {
      scroll-behavior: smooth;
    }
    
    .pricing-item {
      scroll-snap-align: start;
      scroll-margin-top: 1rem;
    }
    
    .desktop-table-scroll {
      scroll-snap-type: y mandatory;
      scroll-behavior: smooth;
    }
    
    .desktop-table-row {
      scroll-snap-align: start;
      scroll-margin-top: 1rem;
    }
  }
  
  /* Global scroll improvements */
  .smooth-scroll {
    scroll-behavior: smooth;
    scroll-snap-type: y mandatory;
  }
`;

const MarginPricePopup: React.FC<MarginPricePopupProps> = ({ open, onClose, title, listMarginPrice, variantValues }) => {

    const [showScrollHint, setShowScrollHint] = React.useState(true);
    const [_isMobile, setIsMobile] = React.useState(false);
    const [scrollProgress, setScrollProgress] = React.useState(0);

    // Check if mobile on mount
    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Hide scroll hint after user scrolls or timeout
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setShowScrollHint(false);

        // Calculate scroll progress for mobile indicator
        const { scrollLeft, scrollWidth, clientWidth } = e.currentTarget;
        const progress = scrollLeft / (scrollWidth - clientWidth);
        setScrollProgress(progress);
    };

    React.useEffect(() => {
        const timer = setTimeout(() => setShowScrollHint(false), 4000);
        return () => clearTimeout(timer);
    }, [open]);

    if (!listMarginPrice || listMarginPrice.length === 0) {
        return (
            <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" aria-hidden="true" />
                <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 max-w-md mx-auto">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#F58A71] to-[#E07B6A] rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pricing Data</h3>
                        <p className="text-sm text-gray-600 mb-6">No margin price information is available for this product.</p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-[#F58A71] text-white rounded-lg hover:bg-[#E07B6A] transition-colors duration-200 font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Dialog>
        );
    }

    // Group rules by printingTechnology
    const rules = (listMarginPrice || []).map((item: any) => item.node).filter(Boolean);
    const groupedByTech: Record<string, any[]> = {};
    rules.forEach((rule: any) => {
        const tech = rule.condition?.printingTechnology || 'UNKNOWN';
        if (!groupedByTech[tech]) groupedByTech[tech] = [];
        groupedByTech[tech].push(rule);
    });

    // Lấy unique printingTechnology
    const printingTechnologies = Object.keys(groupedByTech);


    // Lấy unique các khoảng min-max cho từng công nghệ in
    const headersByTech = printingTechnologies.map(tech => {
        const uniqueRanges = Array.from(
            new Map(
                groupedByTech[tech].map((rule: any) => {
                    const min = rule.condition?.minQuantity ?? '';
                    const max = rule.condition?.maxQuantity ?? '';
                    const key = `${min}-${max ?? '+'}`;
                    return [key, rule];
                })
            ).values()
        );
        return {
            tech,
            ranges: uniqueRanges.map((rule: any) => {
                const min = rule.condition?.minQuantity ?? '';
                const max = rule.condition?.maxQuantity ?? '';
                return { label: `Quantity (${min}${max ? `-${max}` : '+'})`, rule };
            })
        };
    });

    return (
        <>
            {/* Inject custom styles */}
            <style dangerouslySetInnerHTML={{ __html: customStyles }} />

            <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 flex items-start justify-center">
                {/* Backdrop with blur effect */}
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300" aria-hidden="true" />

                {/* Scrollable container for mobile */}
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-2 sm:p-4 py-8 sm:py-16">
                        {/* Main container */}
                        <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-100 w-full max-w-6xl mx-auto overflow-hidden max-h-[90vh]">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-[#F58A71] to-[#E07B6A] px-4 sm:px-6 py-4 sm:py-5 relative">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <Dialog.Title className="text-lg sm:text-xl font-semibold text-white capitalize">
                                                Printed By {title}
                                            </Dialog.Title>
                                            <p className="text-white/80 text-xs sm:text-sm mt-1 hidden sm:block">Margin pricing across different quantities</p>
                                        </div>
                                    </div>

                                    {/* Close button */}
                                    <button
                                        onClick={onClose}
                                        className="w-7 h-7 sm:w-8 sm:h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors duration-200 group"
                                        aria-label="Close"
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Content - with max height and scroll for mobile */}
                            <div className="p-3 sm:p-6 max-h-[calc(90vh-6rem)] overflow-y-auto mobile-content-scroll desktop-content-scroll scrollbar-thin mobile-popup-content smooth-scroll">
                                {/* Mobile scroll hint - redesigned */}
                                {showScrollHint && (
                                    <div className="sm:hidden mb-3 p-3 bg-gradient-to-r from-[#F58A71]/10 to-[#E07B6A]/10 rounded-xl border border-[#F58A71]/20 relative overflow-hidden animate-slide-in">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-6 h-6 bg-[#F58A71]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <svg className="w-3 h-3 text-[#F58A71]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-[#F58A71]">Swipe to explore</p>
                                                <p className="text-xs text-gray-600 mt-0.5">Scroll horizontally to view pricing details</p>
                                            </div>
                                            <div className="flex space-x-1">
                                                <div className="w-1 h-1 bg-[#F58A71] rounded-full animate-pulse-custom"></div>
                                                <div className="w-1 h-1 bg-[#F58A71] rounded-full animate-pulse-custom" style={{ animationDelay: '0.2s' }}></div>
                                                <div className="w-1 h-1 bg-[#F58A71] rounded-full animate-pulse-custom" style={{ animationDelay: '0.4s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Mobile card layout for small screens */}
                                <div className="sm:hidden">
                                    <div
                                        className="flex space-x-4 overflow-x-auto mobile-scroll-container scrollbar-thin pb-4"
                                        onScroll={handleScroll}
                                    >
                                        {variantValues.map(({ name, size }, vIdx) => (
                                            <div key={vIdx} className="mobile-card bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex-shrink-0">
                                                <div className="flex items-center space-x-3 mb-4">
                                                    <div
                                                        className="w-8 h-8 rounded-xl border-2 border-gray-200 shadow-sm flex-shrink-0"
                                                        style={{ backgroundColor: name.split("-")[1] }}
                                                        title={name}
                                                    ></div>
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="text-sm font-semibold text-gray-900 truncate">{name.split("-")[0]}</h3>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 mt-1">
                                                            Size {size}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mobile-card-content space-y-3 scrollbar-thin">
                                                    {headersByTech.map(({ tech, ranges }) =>
                                                        ranges.map((range, idx) => (
                                                            <div key={tech + idx} className="bg-gradient-to-r from-[#F58A71]/5 to-transparent rounded-xl p-3 border border-[#F58A71]/10 pricing-item">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex-1">
                                                                        <div className="text-xs font-semibold text-[#F58A71] uppercase tracking-wide">{tech}</div>
                                                                        <div className="text-xs text-gray-600 mt-0.5">{range.label}</div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="text-lg font-bold text-gray-900">
                                                                            {(() => {
                                                                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                                                                                const price = range.rule?.price;
                                                                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                                                                                const currency = range.rule?.currency;
                                                                                return formatMoney(Number(price) || 0, String(currency) || 'USD');
                                                                            })()}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">per unit</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Mobile scroll progress indicator */}
                                    <div className="flex justify-center mt-4 space-x-1">
                                        {variantValues.map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`scroll-indicator-dot ${Math.floor(scrollProgress * variantValues.length) === idx ? 'active' : ''}`}
                                            ></div>
                                        ))}
                                    </div>
                                </div>

                                {/* Desktop table layout */}
                                <div className="hidden sm:block">
                                    <div className="relative">
                                        <div
                                            className="overflow-x-auto scrollbar-thin transition-colors duration-200 desktop-table-scroll"
                                            onScroll={handleScroll}
                                        >
                                            <table className="w-full min-w-[700px] border-separate border-spacing-0">
                                                <thead>
                                                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                                                        <th className="sticky left-0 z-10 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 px-4 py-3.5 text-left font-semibold text-gray-700 text-sm rounded-tl-2xl">
                                                            Color
                                                        </th>
                                                        <th className="sticky left-[100px] z-10 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-b border-r border-gray-200 px-4 py-3.5 text-left font-semibold text-gray-700 text-sm">
                                                            Size
                                                        </th>
                                                        {headersByTech.map(({ tech, ranges }) =>
                                                            ranges.map((range, idx) => (
                                                                <th key={tech + idx} className="border border-gray-200 px-4 py-3.5 text-center font-semibold text-gray-700 text-sm min-w-[140px] bg-gradient-to-b from-[#F58A71]/5 to-[#F58A71]/10">
                                                                    <div className="space-y-1">
                                                                        <div className="text-xs text-[#F58A71] font-medium uppercase tracking-wide">{tech}</div>
                                                                        <div className="text-gray-700">{range.label}</div>
                                                                    </div>
                                                                </th>
                                                            ))
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {variantValues.map(({ name, size }, vIdx) => (
                                                        <tr key={vIdx} className="group hover:bg-gradient-to-r hover:from-[#F58A71]/5 hover:to-transparent transition-all duration-300 desktop-table-row">
                                                            <td className="sticky left-0 z-10 bg-white group-hover:bg-gradient-to-r group-hover:from-[#F58A71]/5 group-hover:to-transparent border border-gray-200 px-4 py-4">
                                                                <div className="flex items-center space-x-3">
                                                                    <div
                                                                        className="w-10 h-10 rounded-2xl border-2 border-gray-200 shadow-sm group-hover:border-[#F58A71]/30 transition-colors duration-200 flex-shrink-0"
                                                                        style={{ backgroundColor: name.split("-")[1] }}
                                                                        title={name}
                                                                    ></div>
                                                                    <span className="text-sm font-medium text-gray-700 truncate">{name.split("-")[0]}</span>
                                                                </div>
                                                            </td>
                                                            <td className="sticky left-[100px] z-10 bg-white group-hover:bg-gradient-to-r group-hover:from-[#F58A71]/5 group-hover:to-transparent border-t border-b border-r border-gray-200 px-4 py-4">
                                                                <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 group-hover:bg-[#F58A71]/10 group-hover:text-[#F58A71] transition-colors duration-200">
                                                                    {size}
                                                                </span>
                                                            </td>
                                                            {headersByTech.map(({ tech, ranges }) =>
                                                                ranges.map((range, idx) => (
                                                                    <td key={tech + idx} className="border border-gray-200 px-4 py-4 text-center">
                                                                        <div className="space-y-1">
                                                                            <div className="text-lg font-bold text-[#F58A71]">
                                                                                {(() => {
                                                                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                                                                                    const price = range.rule?.price;
                                                                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                                                                                    const currency = range.rule?.currency;
                                                                                    return formatMoney(Number(price) || 0, String(currency) || 'USD');
                                                                                })()}
                                                                            </div>
                                                                            <div className="text-xs text-gray-500">per unit</div>
                                                                        </div>
                                                                    </td>
                                                                ))
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Desktop gradient fade on right edge */}
                                        <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
                                    </div>
                                </div>

                                {/* Footer info - responsive */}
                                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                                    <div className="flex items-start space-x-2 sm:space-x-3">
                                        <div className="w-4 h-4 sm:w-5 sm:h-5 text-[#F58A71] flex-shrink-0 mt-0.5">
                                            <svg fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">Pricing Information</h4>
                                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                                Prices shown are margin rates based on quantity tiers and printing technology.
                                                <span className="font-medium text-[#F58A71]"> Final pricing may vary based on additional factors.</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default MarginPricePopup
