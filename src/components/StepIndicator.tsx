interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export default function StepIndicator({ currentStep, totalSteps, steps }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center">
        {steps.map((label, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <div key={stepNum} className="flex items-center flex-1 last:flex-none">
              {/* Connector line before */}
              {index > 0 && (
                <div className={`flex-1 h-px mx-2 ${isCompleted || isActive ? 'bg-primary-600' : 'bg-stone-200'}`} />
              )}

              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-200 ${
                    isCompleted
                      ? 'bg-primary-700 text-white'
                      : isActive
                      ? 'bg-primary-700 text-white ring-4 ring-primary-100'
                      : 'bg-stone-100 text-stone-400 border border-stone-200'
                  }`}
                >
                  {isCompleted ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  ) : stepNum}
                </div>
                <span className={`text-xs text-center hidden sm:block ${
                  isActive ? 'text-primary-700 font-semibold' : isCompleted ? 'text-stone-500' : 'text-stone-400'
                }`}>
                  {label}
                </span>
              </div>

              {/* Connector line after (last item only needs the line before) */}
              {index < totalSteps - 1 && index === steps.length - 1 && (
                <div className="flex-1 h-px mx-2 bg-stone-200" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
