import React from 'react';

interface ProcessStep {
    number: number;
    title: string;
    bgColor: string;
}

const Arrow: React.FC = () => (
    <div className="hidden md:block">
        <div className="relative w-24 lg:w-28 h-4">
            <div className="absolute top-1/2 w-full h-1 bg-gradient-to-r from-[#8C3859] to-[#FD8C6E]"></div>
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                <div className="w-4 lg:w-6 h-4 lg:h-6 border-t-3 border-r-3 border-[#FD8C6E] transform rotate-45 animate-pulse"></div>
            </div>
        </div>
    </div>
);

const ProcessStepItem: React.FC<{step: ProcessStep}> = ({ step }) => {
    return (
        <div className="flex flex-col items-center group">
            <div 
                className={`${step.bgColor} rounded-full shadow-2xl h-64 w-64 lg:h-80 lg:w-80 p-8 relative overflow-hidden transform transition-all duration-500 ease-in-out hover:scale-105 hover:rotate-2`}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-[#253244]/30 to-transparent"/>
                <div className="absolute inset-0 bg-pattern opacity-10"/>
                <div className='flex flex-col items-center justify-center h-full space-y-6'>
                    <div className="bg-[#253244]/30 backdrop-blur-sm rounded-full p-4 lg:p-6 w-24 h-24 lg:w-28 lg:h-28 flex items-center justify-center transform transition-transform duration-300 hover:rotate-12">
                        <span className="text-5xl lg:text-6xl font-black text-white drop-shadow-lg">{step.number}</span>
                    </div>
                    <p className="text-2xl lg:text-3xl font-bold text-white text-center px-4 lg:px-6 leading-tight drop-shadow-md">
                        {step.title}
                    </p>
                </div>
            </div>
        </div>
    );
};

export const BusinessProcess: React.FC = () => {
    const steps: ProcessStep[] = [
        { number: 1, title: 'Pick your product', bgColor: 'bg-[#8C3859]' },
        { number: 2, title: 'Design', bgColor: 'bg-[#FD8C6E]' },
        { number: 3, title: 'Let us do the rest', bgColor: 'bg-[#8C3859]' },
    ];

    return (
        <div className="bg-gradient-to-b from-[#1C1C1C] via-[#253244] to-[#1C1C1C] py-20 lg:py-28">
            <div className="max-w-6xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 lg:mb-20">
                    <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                        Your Guide to Our Process
                    </h2>
                    <div className="mt-6 h-2 w-36 lg:w-48 bg-gradient-to-r from-[#8C3859] to-[#FD8C6E] mx-auto rounded-full shadow-lg"/>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-6">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.number}>
                            <ProcessStepItem step={step} />
                            {index < steps.length - 1 && <Arrow />}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BusinessProcess;