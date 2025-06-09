import React from 'react';
import { Check } from 'lucide-react';

interface StepNavigatorProps {
  currentStep: number;
  steps: {
    number: number;
    title: string;
  }[];
}

const StepNavigator: React.FC<StepNavigatorProps> = ({ currentStep, steps }) => {
  return (
    <div className="sticky top-0 z-50 bg-gradient-to-br from-purple-50/95 via-pink-50/95 to-blue-50/95 backdrop-blur-sm py-6 shadow-sm">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center relative">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2" />
          <div 
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-pink-500 to-purple-600 -translate-y-1/2 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
          
          {/* Steps */}
          {steps.map((step) => (
            <div key={step.number} className="relative z-10 flex flex-col items-center gap-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
                  ${step.number < currentStep 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                    : step.number === currentStep
                    ? 'bg-white border-2 border-purple-600 text-purple-600'
                    : 'bg-white border-2 border-gray-300 text-gray-400'
                  }`}
              >
                {step.number < currentStep ? <Check size={20} /> : step.number}
              </div>
              <div className={`text-sm font-medium whitespace-nowrap
                ${step.number < currentStep 
                  ? 'text-purple-600' 
                  : step.number === currentStep
                  ? 'text-purple-600'
                  : 'text-gray-400'
                }`}
              >
                {step.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepNavigator; 