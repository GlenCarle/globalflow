import React from 'react';

export default function Stepper({ steps, currentStep }) {
  return (
    <div className="flex justify-between mb-8">
      {steps.map((step, idx) => (
        <div key={idx} className={`flex-1 text-center ${idx === currentStep ? 'font-bold text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${idx === currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{idx + 1}</div>
          {step}
        </div>
      ))}
    </div>
  );
}
