"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface HatchingScreenProps {
  input: string;
  onComplete: (output: string) => void;
  onBack?: () => void;
}

export const HatchingScreen = ({ 
  input, 
  onComplete, 
  onBack 
}: HatchingScreenProps) => {
  const handleContinue = () => {
    // For now, just pass a dummy output string
    onComplete("hatched_output_string");
  };

  return (
    <motion.div
      key="hatching-screen"
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
          <h1 className="text-2xl font-bold">Hatching</h1>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Step Overview</h2>
            <p className="text-muted-foreground mb-4">
              This step applies hatching patterns to create texture and depth. Hatching uses parallel lines 
              at varying densities to simulate shading and form in your artwork.
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Input Received:</h3>
                <div className="bg-muted rounded-md p-3 text-sm">
                  {input || "No input provided"}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">What this step does:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Analyzes vector shapes and forms</li>
                  <li>Determines optimal hatching direction</li>
                  <li>Applies parallel line patterns</li>
                  <li>Creates depth through line density</li>
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
                <span className="text-sm">Vector analysis complete</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Hatching direction calculated</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Applying hatching patterns...</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Optimizing line density</span>
              </div>
            </div>
          </div>

          {/* Hatching Preview */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-medium mb-3">Hatching Preview</h3>
            <div className="bg-muted rounded-md p-4 h-32 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-white rounded-md flex items-center justify-center">
                  <div className="space-y-1">
                    {[...Array(8)].map((_, i) => (
                      <div 
                        key={i} 
                        className="h-0.5 bg-gray-600"
                        style={{ width: `${Math.random() * 40 + 20}px` }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Hatching pattern preview</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button 
            onClick={handleContinue}
            className="px-6"
          >
            Continue to Next Step
          </Button>
        </div>
      </div>
    </motion.div>
  );
}; 