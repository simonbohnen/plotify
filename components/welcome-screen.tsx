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
      className="max-w-6xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Choose an Artwork Template</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworkTemplates.map((template, index) => (
            <motion.div
              key={template.name}
              className="bg-card border border-border rounded-lg p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => onArtworkTemplateSelect(template)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="aspect-square bg-muted rounded-md mb-4 flex items-center justify-center">
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