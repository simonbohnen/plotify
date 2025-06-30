"use client";

import { motion } from "framer-motion";
import { ScreenState } from "@/lib/types";
import { useEffect } from "react";

interface VectorizationScreenProps {
  input: string;
  output?: any;
  state: ScreenState;
  setStepState: (state: ScreenState) => void;
}

export const VectorizationScreen = ({ 
  input, 
  output,
  state,
  setStepState
}: VectorizationScreenProps) => {
  useEffect(() => {
    setStepState(ScreenState.EXECUTED);
  }, []);

  return (
    <motion.div
      key="vectorization-screen"
      className="w-full"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.1, duration: 0.2 }}
    >
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Vectorization</h1>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Step Overview</h2>
            <p className="text-muted-foreground mb-4">
              This step converts your input into a vectorized format. Vectorization transforms raster images 
              or text into scalable vector graphics that can be resized without losing quality.
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Input Received:</h3>
                <div className="bg-muted rounded-md p-3 text-sm">
                  {input || "No input provided"}
                </div>
              </div>
              
              {output && (
                <div>
                  <h3 className="font-medium mb-2">Output Generated:</h3>
                  <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm">
                    {output}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="font-medium mb-2">What this step does:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Analyzes the input content</li>
                  <li>Identifies shapes and patterns</li>
                  <li>Converts to vector format</li>
                  <li>Optimizes for scalability</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Dummy Progress */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-medium mb-3">Processing Status</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Input validation complete</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Vectorization algorithm initialized</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${state === ScreenState.EXECUTED ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
                <span className="text-sm">{state === ScreenState.EXECUTED ? 'Processing complete' : 'Processing vector paths...'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${state === ScreenState.EXECUTED ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${state === ScreenState.EXECUTED ? '' : 'text-muted-foreground'}`}>
                  {state === ScreenState.EXECUTED ? 'Output ready' : 'Finalizing output'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 