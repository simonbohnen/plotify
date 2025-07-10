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

export const OverviewScreen: React.FC = () => {
  const [svg, setSvg] = useState<string | undefined>(undefined);
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
    <div className="w-full min-h-screen flex bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="w-full bg-card border-b border-border py-4 px-8 min-h-[64px] flex items-center">
          <span className="font-semibold text-lg">Plotify</span>
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
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-card border-l border-border flex flex-col">
        {/* SVG Preview */}
        <div className="p-6 border-b border-border">
          <h3 className="text-sm font-medium mb-4">Current Design</h3>
          {svg ? (
            <div className="w-full h-64 bg-white border border-border rounded flex items-center justify-center overflow-hidden">
              <img
                src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`}
                alt="SVG Preview"
                className="w-full h-full object-contain"
                draggable={false}
              />
            </div>
          ) : (
            <div className="w-full h-64 bg-muted/20 border border-border rounded flex items-center justify-center">
              <p className="text-muted-foreground text-center">No design yet</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex-1 p-6">
          <h3 className="text-sm font-medium mb-4">Actions</h3>
          <div className="space-y-3">
            <Button variant="secondary" className="w-full justify-start">
              Lay Out
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              Select Tools
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              Hatch
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              Export
            </Button>
          </div>
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
