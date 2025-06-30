"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ArtworkTemplate, ArtworkStep } from "../lib/artwork-template";
import { StepWorkflow } from "./step-workflow";

interface ArtworkTemplateScreenProps {
  template: ArtworkTemplate;
  onBack?: () => void;
}

export const ArtworkTemplateScreen = ({ 
  template, 
  onBack 
}: ArtworkTemplateScreenProps) => {
  const [isExecuting, setIsExecuting] = useState(false);

  const handleStartExecution = () => {
    setIsExecuting(true);
  };

  const handleExecutionComplete = (finalOutput: any) => {
    console.log("Template execution completed with output:", finalOutput);
    // Here you could show a completion screen or navigate somewhere
    setIsExecuting(false);
  };

  const handleBackToTemplate = () => {
    setIsExecuting(false);
  };

  if (isExecuting) {
    return (
      <StepWorkflow
        template={template}
        onBack={handleBackToTemplate}
        onComplete={handleExecutionComplete}
      />
    );
  }

  return (
    <motion.div
      key="artwork-template-screen"
      className="w-full"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.1, duration: 0.2 }}
    >
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          {onBack && (
            <motion.button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </motion.button>
          )}
          <h1 className="text-2xl font-bold">{template.name}</h1>
        </div>

        {/* Steps Overview */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">Steps</h2>
          {template.steps.length > 0 ? (
            <div className="space-y-3">
              {template.steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="bg-card border border-border rounded-lg p-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index, duration: 0.15 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{step.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                      <div className="flex gap-2 text-xs">
                        <span className="bg-muted px-2 py-1 rounded">
                          Input: {step.inputType}
                        </span>
                        <span className="bg-muted px-2 py-1 rounded">
                          Output: {step.outputType}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-muted rounded-lg p-8 text-center">
              <p className="text-muted-foreground">No steps defined for this template yet.</p>
            </div>
          )}
        </div>

        {/* Start Execution Button */}
        {template.steps.length > 0 && (
          <div className="pt-4">
            <motion.button
              onClick={handleStartExecution}
              className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Template Execution
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}; 