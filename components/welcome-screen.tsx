"use client";

import { motion } from "framer-motion";
import { ArtworkTemplate } from "./artwork-template";

interface WelcomeScreenProps {
  artworkTemplates: ArtworkTemplate[];
  onArtworkTemplateSelect: (template: ArtworkTemplate) => void;
}

export const WelcomeScreen = ({ 
  artworkTemplates, 
  onArtworkTemplateSelect 
}: WelcomeScreenProps) => {
  return (
    <motion.div
      key="welcome-screen"
      className="w-full"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.1, duration: 0.2 }}
    >
      <div className="flex flex-col gap-6 leading-relaxed">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {artworkTemplates.map((template, index) => (
            <motion.div
              key={template.name}
              className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => onArtworkTemplateSelect(template)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index, duration: 0.15 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="aspect-square bg-muted rounded-md mb-3 flex items-center justify-center">
                {/* Placeholder for future image */}
                <div className="text-muted-foreground text-sm">
                  Image coming soon
                </div>
              </div>
              <h3 className="text-lg font-semibold">{template.name}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}; 