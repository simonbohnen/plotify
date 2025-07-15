"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { nodeToDocument } from "@/lib/svg-utils";
import { setStrokeToFillColor } from "@/lib/svg-color";
import { API_URL } from "@/lib/api-utils";
import { TOOL_CATEGORIES } from "./tool-selection-screen";

interface SvgHatchScreenProps {
  onClose?: () => void;
  setSvg?: (svg: Node) => void;
  svg: Node;
  previewSVG?: Node;
}

type ToolCategoryKey = typeof TOOL_CATEGORIES[number]["key"];

interface HatchConfiguration {
  selectedTool: ToolCategoryKey;
  hatchSpacing: number;
}

export const SvgHatchScreen: React.FC<SvgHatchScreenProps> = ({ 
  onClose, 
  setSvg, 
  svg,
  previewSVG
}) => {
  const [hatchConfig, setHatchConfig] = useState<HatchConfiguration>({
    selectedTool: "felt_tip",
    hatchSpacing: 0.7, // Default to felt tip pen width
  });

  // Update hatch spacing when tool changes
  useEffect(() => {
    const selectedToolObj = TOOL_CATEGORIES.find(t => t.key === hatchConfig.selectedTool);
    if (selectedToolObj) {
      setHatchConfig(prev => ({
        ...prev,
        hatchSpacing: selectedToolObj.pen_width,
      }));
    }
  }, [hatchConfig.selectedTool]);

  const handleToolChange = (tool: ToolCategoryKey) => {
    const toolObj = TOOL_CATEGORIES.find(t => t.key === tool);
    setHatchConfig({
      selectedTool: tool,
      hatchSpacing: toolObj ? toolObj.pen_width : 0.7,
    });
  };

  const handleHatchSpacingChange = (spacing: number) => {
    setHatchConfig(prev => ({
      ...prev,
      hatchSpacing: spacing,
    }));
  };

  const handleApplyHatching = async () => {
    try {
      const formData = new FormData();
      const doc = nodeToDocument(svg);
      
      // Set stroke colors to fill colors before processing
      setStrokeToFillColor(doc);
      
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(doc);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
      formData.append('file', svgBlob, 'input.svg');

      // Build query parameters for the hatch-svg endpoint
      const params = new URLSearchParams({
        hatch_spacing: hatchConfig.hatchSpacing.toString(),
        hatch_angle: "45.0", // Default
        hold_back_steps: "0.0", // Default
        cross_hatch: "false", // Default
        reduce_pen_lifts: "false", // Default
        hold_back_hatch_from_edges: "false", // Default
        hatch_scope: "3.0", // Default
        tolerance: "20.0", // Default
        unit: "mm", // Default
      });

      const response = await fetch(`${API_URL}/api/hatch-svg?${params.toString()}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newSvg = await response.text();
      const parser = new DOMParser();
      const responseDoc = parser.parseFromString(newSvg, 'image/svg+xml');
      setSvg?.(responseDoc);
      onClose?.();
    } catch (error) {
      console.error('Error applying hatching:', error);
      // You might want to show an error message to the user here
    }
  };

  const selectedToolObj = TOOL_CATEGORIES.find(t => t.key === hatchConfig.selectedTool);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">SVG Hatching Configuration</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleApplyHatching}
            variant="default"
            size="sm"
          >
            Apply Hatching
          </Button>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="flex gap-6 h-full">
          {/* Left Panel - SVG Preview */}
          <div className="flex-1 border rounded bg-white p-4">
            <div className="w-full h-full min-h-[400px] flex items-center justify-center">
              {previewSVG ? (
                <div
                  dangerouslySetInnerHTML={{ __html: (() => {
                    const serializer = new XMLSerializer();
                    return serializer.serializeToString(previewSVG);
                  })() }}
                  className="object-contain border-2 border-dashed border-muted-foreground rounded"
                  style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }}
                />
              ) : (
                <div className="text-muted-foreground text-center">
                  <div className="w-32 h-32 border-2 border-dashed border-muted-foreground rounded flex items-center justify-center mb-2">
                    <span className="text-xs">No SVG</span>
                  </div>
                  <p className="text-sm">No design to display</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Hatching Configuration */}
          <div className="w-96 flex flex-col">
            <h3 className="text-sm font-medium mb-4">Hatching Configuration</h3>
            
            <div className="space-y-6">
              {/* Tool Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Hatching Tool</label>
                <div className="space-y-2">
                  {TOOL_CATEGORIES.filter(tool => tool.key !== 'other').map((tool) => (
                    <div
                      key={tool.key}
                      className={`p-3 border rounded cursor-pointer transition-colors ${
                        hatchConfig.selectedTool === tool.key
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleToolChange(tool.key)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{tool.label}</div>
                          <div className="text-xs text-muted-foreground">
                            Pen width: {tool.pen_width}mm
                          </div>
                        </div>
                        {hatchConfig.selectedTool === tool.key && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hatch Spacing Configuration */}
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Hatch Spacing: {hatchConfig.hatchSpacing}mm
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.1"
                  value={hatchConfig.hatchSpacing}
                  onChange={(e) => handleHatchSpacingChange(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.1mm</span>
                  <span>5.0mm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SvgHatchScreen;
