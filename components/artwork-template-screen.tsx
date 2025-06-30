"use client";

import { motion } from "framer-motion";
import { ArtworkTemplate } from "./artwork-template";

interface ArtworkTemplateScreenProps {
  template: ArtworkTemplate;
  onBack?: () => void;
}

export const ArtworkTemplateScreen = ({ 
  template, 
  onBack 
}: ArtworkTemplateScreenProps) => {
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

        {/* Steps */}
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
                    <p className="text-sm leading-relaxed">{step}</p>
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
      </div>
    </motion.div>
  );
}; 