"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContentNoClose,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageHatchScreen } from "./image-hatch-screen";
import { updateSvgMetadataWithHash, nodeToDocument, setSvgDisplayAttributes } from "@/lib/svg-utils";
import { getAssumedSize } from "@/lib/svg-layout";
import { LayoutScreen } from "./layout-screen";
import { ToolSelectionScreen } from "./tool-selection-screen";
import { getColors } from "@/lib/svg-color";
import { SvgHatchScreen } from "./svg-hatch-screen";
import { VectorizationScreen } from "./vectorization-screen";
import { RemoveFillColorsScreen } from "./remove-fill-colors-screen";

// Example actions (replace or extend as needed)
const actions = [
  { key: "hatch", title: "Hatch Image" },
  { key: "vectorize", title: "Vectorize Image" },
  { key: "remove_fill_colors", title: "Remove Fill Colors" },
];

export const OverviewScreen: React.FC = () => {
  const [svg, setSvg] = useState<Node | undefined>(undefined);
  const [previewSVG, setPreviewSVG] = useState<Node | undefined>(undefined);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Ensure preserveAspectRatio is always set to 'xMidYMid meet' on the SVG
  useEffect(() => {
    if (!svg) {
      setPreviewSVG(undefined);
      return;
    }
    try {
      // Apply display attributes using utility function
      const processedNode = setSvgDisplayAttributes(svg);
      setPreviewSVG(processedNode);
    } catch (e) {
      // Ignore parse errors
      setPreviewSVG(svg);
    }
  }, [svg]);

  const handleActionClick = (actionKey: string) => {
    setSelectedAction(actionKey);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedAction(null);
  };

  const handleExport = async () => {
    if (!svg) {
      alert("No SVG to export");
      return;
    }

    try {
      // Convert Node to Document using utility function
      const doc = nodeToDocument(svg);

      // Process the document with our function
      const processedDoc = await updateSvgMetadataWithHash(doc);

      // Serialize back to string
      const serializer = new XMLSerializer();
      const processedSvg = serializer.serializeToString(processedDoc);

      // Create and download the file
      const blob = new Blob([processedSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plotify-export.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const getSelectedActionTitle = () => {
    const action = actions.find(a => a.key === selectedAction);
    return action?.title || "Action";
  };

  const renderDialogContent = () => {
    if (selectedAction === "hatch") {
      return <ImageHatchScreen onClose={handleDialogClose} setSvg={setSvg} />;
    }
    if (selectedAction === "vectorize") {
      return <VectorizationScreen onClose={handleDialogClose} setSvg={setSvg} />;
    }
    if (svg) {
      if (selectedAction === "layout") {
        return <LayoutScreen onClose={handleDialogClose} setSvg={setSvg} setPreviewSVG={setPreviewSVG} svg={svg} />;
      }
      if (selectedAction === "tools") {
        return <ToolSelectionScreen onClose={handleDialogClose} setSvg={setSvg} svg={svg} previewSVG={previewSVG} />;
      }
      if (selectedAction === "hatch_svg") {
        return <SvgHatchScreen onClose={handleDialogClose} setSvg={setSvg} svg={svg} previewSVG={previewSVG} />;
      }
      if (selectedAction === "remove_fill_colors") {
        return <RemoveFillColorsScreen onClose={handleDialogClose} setSvg={setSvg} svg={svg} previewSVG={previewSVG} />;
      }
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
        <div className="w-full bg-card py-4 px-8 min-h-[64px] flex items-center">
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
          {previewSVG ? (
            <div className="w-full h-64 max-h-64 bg-white flex items-center justify-center overflow-hidden">
              <div
                className="w-auto h-auto max-w-full max-h-64 object-contain border border-border"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                dangerouslySetInnerHTML={{ __html: (() => {
                  const serializer = new XMLSerializer();
                  return serializer.serializeToString(previewSVG);
                })() }}
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
            <Button variant="secondary" className="w-full justify-start" onClick={() => handleActionClick("layout")}>
              Lay Out
            </Button>
            <Button variant="secondary" className="w-full justify-start" onClick={() => handleActionClick("hatch_svg")}>
              Hatch
            </Button>
            <Button variant="secondary" className="w-full justify-start" onClick={() => handleActionClick("tools")}>
              Select Tools
            </Button>
            <Button variant="secondary" className="w-full justify-start" onClick={handleExport}>
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContentNoClose className="w-[90vw] h-[90vh] max-w-none">
          {renderDialogContent()}
        </DialogContentNoClose>
      </Dialog>
    </div>
  );
};

export default OverviewScreen;
