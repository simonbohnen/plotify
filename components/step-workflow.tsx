"use client";

import { useState } from "react";
import { ArtworkTemplate, ArtworkStep } from "./artwork-template";
import { VectorizationScreen } from "./vectorization-screen";
import { HatchingScreen } from "./hatching-screen";

interface StepWorkflowProps {
  template: ArtworkTemplate;
  onBack?: () => void;
  onComplete?: (finalOutput: any) => void;
}

export const StepWorkflow = ({ 
  template, 
  onBack, 
  onComplete 
}: StepWorkflowProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepOutputs, setStepOutputs] = useState<Record<number, any>>({});

  const currentStep = template.steps[currentStepIndex];
  const isLastStep = currentStepIndex === template.steps.length - 1;

  const handleStepComplete = (output: any) => {
    // Store the output for this step
    setStepOutputs(prev => ({
      ...prev,
      [currentStepIndex]: output
    }));

    if (isLastStep) {
      // All steps completed
      onComplete?.(output);
    } else {
      // Move to next step
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleStepBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    } else {
      onBack?.();
    }
  };

  const renderStepScreen = () => {
    if (!currentStep) return null;

    const stepInput = currentStepIndex === 0 
      ? "initial_input_string" // For first step, use a default input
      : stepOutputs[currentStepIndex - 1]; // For subsequent steps, use previous step's output

    // For now, we'll use a simple mapping based on step name
    // In the future, this could be more sophisticated based on step types
    if (currentStep.name.toLowerCase().includes("vector")) {
      return (
        <VectorizationScreen
          input={stepInput}
          onComplete={handleStepComplete}
          onBack={handleStepBack}
        />
      );
    } else if (currentStep.name.toLowerCase().includes("hatch")) {
      return (
        <HatchingScreen
          input={stepInput}
          onComplete={handleStepComplete}
          onBack={handleStepBack}
        />
      );
    } else {
      // Fallback for unknown step types
      return (
        <div className="w-full p-6">
          <h1 className="text-2xl font-bold mb-4">{currentStep.name}</h1>
          <p className="text-muted-foreground mb-4">{currentStep.description}</p>
          <div className="bg-muted rounded-md p-3 mb-4">
            <strong>Input:</strong> {JSON.stringify(stepInput)}
          </div>
          <button 
            onClick={() => handleStepComplete("dummy_output")}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
          >
            Complete Step
          </button>
        </div>
      );
    }
  };

  return (
    <div className="w-full">
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Step {currentStepIndex + 1} of {template.steps.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {currentStep?.name}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / template.steps.length) * 100}%` }}
            />
          </div>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
            Run Step
          </button>
        </div>
      </div>

      {/* Step content */}
      {renderStepScreen()}
    </div>
  );
}; 