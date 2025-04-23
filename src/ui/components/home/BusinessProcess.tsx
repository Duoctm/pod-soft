import React from 'react';

interface ProcessStep {
    number: number;
    title: string;
    bgColor: string;
}

// Local child component to display each process step
const ProcessStepItem: React.FC<{step: ProcessStep}> = ({ step }) => {
    return (
        <div className="flex flex-col items-center">
            <div 
                className={`rounded-full ${step.bgColor} text-white h-64 w-64 flex items-center justify-center text-4xl font-bold`}
            >
                <div className='flex flex-col items-center'>
                    {step.number}
                    <p className="mt-3 text-xl font-bold text-gray-700">
                        {step.title}
                    </p>
                </div>
            </div>
        </div>
    );
};

export const BusinessProcess: React.FC = () => {
    const steps: ProcessStep[] = [
        { number: 1, title: 'Pick your product', bgColor: 'bg-purple-400' },
        { number: 2, title: 'Design', bgColor: 'bg-cyan-400' },
        { number: 3, title: 'Let us do the rest', bgColor: 'bg-purple-400' },
    ];

    return (
        <div className="bg-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Your Guide to Our Process
                    </h2>
                </div>
                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step) => (
                        <ProcessStepItem key={step.number} step={step} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BusinessProcess;