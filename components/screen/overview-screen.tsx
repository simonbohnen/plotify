"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContentNoClose,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageHatchScreen } from "./image-hatch-screen";

// Example actions (replace or extend as needed)
const actions = [
  { key: "vectorize", title: "Vectorize Artwork" },
  { key: "hatch", title: "Apply Hatching" },
  { key: "color", title: "Add Color" },
  { key: "export", title: "Export" },
];

interface OverviewScreenProps {
  svg?: string;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({ svg: initialSvg }) => {
  const [svg, setSvg] = useState<string | undefined>(initialSvg);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleActionClick = (actionKey: string) => {
    setSelectedAction(actionKey);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedAction(null);
  };

  const getSelectedActionTitle = () => {
    const action = actions.find(a => a.key === selectedAction);
    return action?.title || "Action";
  };

  const renderDialogContent = () => {
    if (selectedAction === "hatch") {
      return <ImageHatchScreen onClose={handleDialogClose} setSvg={setSvg} />;
    }
    
    return (
      <div className="py-4">
        <p className="text-muted-foreground">
          This is a placeholder for the {getSelectedActionTitle().toLowerCase()} functionality.
        </p>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-background">
      {/* Status Bar */}
      <div className="w-full bg-card border-b border-border py-6 px-8 min-h-[88px] flex items-center justify-between">
        <span className="font-semibold text-lg">Overview</span>
        <div className="flex items-center gap-3">
          {svg && (
            <div className="w-20 h-20 bg-white border border-border rounded flex items-center justify-center overflow-hidden">
              {/* Render SVG as an <img> with object-contain to ensure scaling */}
              <img
                src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`}
                alt="SVG Preview"
                className="w-16 h-16 object-contain"
                draggable={false}
              />
            </div>
          )}
          <Button variant="secondary">Lay Out</Button>
          <Button variant="secondary">Select Tools</Button>
          <Button variant="secondary">Hatch</Button>
          <Button variant="secondary">Export</Button>
        </div>
      </div>

      {/* Main Area: Actions Grid */}
      <div className="flex-1 p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl">
          {actions.map((action) => (
            <div
              key={action.key}
              className="flex flex-col items-center bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleActionClick(action.key)}
            >
              {/* Preview Image Placeholder */}
              <div className="w-24 h-24 bg-muted rounded-md mb-3 flex items-center justify-center">
                {/* Empty for now */}
              </div>
              <span className="mt-1 text-base font-medium text-center">{action.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContentNoClose className="w-[90vw] h-[90vh] max-w-none">
          {selectedAction !== "hatch" && (
            <DialogHeader>
              <DialogTitle>{getSelectedActionTitle()}</DialogTitle>
            </DialogHeader>
          )}
          {renderDialogContent()}
        </DialogContentNoClose>
      </Dialog>
    </div>
  );
};

export default OverviewScreen;
