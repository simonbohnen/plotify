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
import { Palette, SquareArrowOutUpRight, Proportions } from "lucide-react";
import { Hash } from "lucide-react";
import { LineSquiggle } from "lucide-react";
import { Eraser } from "lucide-react";
import { PenTool } from "lucide-react";
import { DepthIsolinesScreen } from "./depth-isolines-screen";

// Example actions (replace or extend as needed)
const imageActions = [
  { key: "hatch", title: "Hatch Image" },
  { key: "vectorize", title: "Vectorize Image" },
  { key: "depth_isolines", title: "Create Line Art" },
];
const svgActions = [
  { key: "hatch_svg", title: "Hatch SVG" },
  { key: "tools", title: "Select Tools" },
  { key: "remove_fill_colors", title: "Remove Fill Colors" },
  { key: "figma_layout", title: "Lay Out in Figma", href: "https://www.figma.com/community/file/1526356171722910602/plotify-layouts" },
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

  // Handle SVG import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'image/svg+xml');
      const svgNode = doc.documentElement;
      setSvg(svgNode);
    } catch (e) {
      alert('Failed to import SVG.');
    }
  };
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getSelectedActionTitle = () => {
    const allActions = [...imageActions, ...svgActions];
    const action = allActions.find(a => a.key === selectedAction);
    return action?.title || "Action";
  };

  const renderDialogContent = () => {
    if (selectedAction === "hatch") {
      return <ImageHatchScreen onClose={handleDialogClose} setSvg={setSvg} />;
    }
    if (selectedAction === "vectorize") {
      return <VectorizationScreen onClose={handleDialogClose} setSvg={setSvg} />;
    }
    if (selectedAction === "depth_isolines") {
      return <DepthIsolinesScreen onClose={handleDialogClose} setSvg={setSvg} />;
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
          <span className="font-semibold text-4xl">Plotify</span>
        </div>

        {/* Main Area: Actions Grid */}
        <div className="flex-1 p-8 space-y-10">
          {/* Image Actions Group */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Image Actions</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl">
              {imageActions.map((action) => (
                <div
                  key={action.key}
                  className="flex flex-col items-center bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleActionClick(action.key)}
                >
                  {/* Preview Image Placeholder */}
                  <div className="w-24 h-24 bg-muted rounded-md mb-3 flex items-center justify-center">
                    {action.key === "hatch" && <Hash className="w-12 h-12 text-primary/80" />}
                    {action.key === "vectorize" && <LineSquiggle className="w-12 h-12 text-primary/80" />}
                    {action.key === "depth_isolines" && <PenTool className="w-12 h-12 text-primary/80" />}
                  </div>
                  <span className="mt-1 text-base font-medium text-center">{action.title}</span>
                </div>
              ))}
            </div>
          </div>
          {/* SVG Actions Group */}
          <div>
            <h4 className="text-lg font-semibold mb-4">SVG Actions</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl">
              {svgActions.map((action) => (
                action.key === "figma_layout" ? (
                  <a
                    key={action.key}
                    href={action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer no-underline"
                  >
                    <div className="w-24 h-24 bg-muted rounded-md mb-3 flex items-center justify-center">
                      <Proportions className="w-12 h-12 text-primary/80" />
                    </div>
                    <span className="mt-1 text-base font-medium text-center">{action.title}</span>
                  </a>
                ) : (
                  <div
                    key={action.key}
                    className="flex flex-col items-center bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleActionClick(action.key)}
                  >
                    {/* Preview Image Placeholder */}
                    <div className="w-24 h-24 bg-muted rounded-md mb-3 flex items-center justify-center">
                      {action.key === 'hatch_svg' ? <Hash className="w-12 h-12 text-primary/80" /> : null}
                      {action.key === 'tools' ? <Palette className="w-12 h-12 text-primary/80" /> : null}
                      {action.key === 'remove_fill_colors' ? <Eraser className="w-12 h-12 text-primary/80" /> : null}
                    </div>
                    <span className="mt-1 text-base font-medium text-center">{action.title}</span>
                  </div>
                )
              ))}
            </div>
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
            {/* Import Button */}
            <input
              type="file"
              accept=".svg,image/svg+xml"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImport}
            />
            <Button variant="secondary" className="w-full justify-start" onClick={triggerFileInput}>
              Import SVG
            </Button>
            <Button variant="secondary" className="w-full justify-start" onClick={handleExport}> 
              Export SVG
            </Button>
            {/* Recipes Button */}
            <a
              href="https://www.notion.so/Plotify-Recipes-230dc5ba781e8008841ce1c445f85b73?source=copy_link"
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-6"
            >
              <Button
                variant="outline"
                className="w-full justify-start border-dashed text-primary flex items-center gap-2 hover:bg-accent"
                type="button"
              >
                Plot Recipes
                <SquareArrowOutUpRight className="h-4 w-4 ml-1" />
              </Button>
            </a>
            {/* Submit your plot button */}
            <a
              href="https://forms.gle/uFko8iopyQ96uGc68"
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-2"
            >
              <Button
                variant="outline"
                className="w-full justify-start border-dashed text-primary flex items-center gap-2 hover:bg-accent"
                type="button"
              >
                Submit your plot
                <SquareArrowOutUpRight className="h-4 w-4 ml-1" />
              </Button>
            </a>
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
