"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getLayerColors } from '../../lib/svg-color';

interface ToolSelectionScreenProps {
  onClose?: () => void;
  setSvg?: (svg: string) => void;
  svg: string;
}

type ToolType = "pen" | "brush";

interface ColorToolMapping {
  [color: string]: ToolType;
}

export const ToolSelectionScreen: React.FC<ToolSelectionScreenProps> = ({ 
  onClose, 
  setSvg, 
  svg 
}) => {
  const [colors, setColors] = useState<string[]>([]);
  const [colorToolMapping, setColorToolMapping] = useState<ColorToolMapping>({});

  // Extract colors when SVG changes
  useEffect(() => {
    if (svg) {
      (async () => {
        try {
          // Upload SVG as a file using FormData
          const formData = new FormData();
          const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
          formData.append('file', svgBlob, 'input.svg');

          const response = await fetch('http://localhost:8000/api/stroke-colors-to-layers', {
            method: 'POST',
            body: formData,
          });
          const responseSvg = await response.text();

          // Parse the returned SVG
          const parser = new DOMParser();
          const doc = parser.parseFromString(responseSvg, 'image/svg+xml');

          // Use getLayerColors to extract layer colors
          const layerColors = getLayerColors(doc);
          const colorList = Object.values(layerColors) as string[];
          setColors(colorList);

          // Initialize tool mapping for new colors
          const newMapping: ColorToolMapping = {};
          colorList.forEach(color => {
            if (!(color in colorToolMapping)) {
              newMapping[color] = "pen"; // Default to pen
            } else {
              newMapping[color] = colorToolMapping[color];
            }
          });
          setColorToolMapping(newMapping);
        } catch (error) {
          console.error('Error extracting layer colors from SVG:', error);
        }
      })();
    }
  }, [svg]);

  const handleToolChange = (color: string, tool: ToolType) => {
    setColorToolMapping(prev => ({
      ...prev,
      [color]: tool
    }));
  };

  const handleContinue = () => {
    // Here you could process the color-tool mappings
    console.log('Color tool mappings:', colorToolMapping);
    onClose?.();
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Select Tools for Colors</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleContinue}
            variant="default"
            size="sm"
          >
            Continue
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
            <h3 className="text-sm font-medium mb-4">Current Design</h3>
            <div className="w-full h-full min-h-[400px] flex items-center justify-center">
              {svg ? (
                <div className="w-64 h-full flex items-center justify-center overflow-hidden">
                  <img
                    src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`}
                    alt="SVG Preview"
                    className="w-full h-full object-contain border-2 border-dashed border-muted-foreground rounded"
                    draggable={false}
                  />
                </div>
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

          {/* Right Panel - Color Tools */}
          <div className="w-80 flex flex-col">
            <h3 className="text-sm font-medium mb-4">Color Tools</h3>
            
            {colors.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                <p className="text-sm">No stroke colors found in the SVG</p>
              </div>
            ) : (
              <div className="space-y-4">
                {colors.map((color) => (
                  <div key={color} className="flex items-center gap-3 p-3 border rounded bg-card">
                    {/* Color Circle */}
                    <div 
                      className="w-8 h-8 rounded-full border border-border flex-shrink-0"
                      style={{ 
                        backgroundColor: color,
                        // Add a subtle border for light colors
                        boxShadow: color.toLowerCase() === '#ffffff' || color.toLowerCase() === 'white' 
                          ? 'inset 0 0 0 1px #e5e7eb' 
                          : 'none'
                      }}
                    />
                    
                    {/* Color Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{color}</p>
                    </div>
                    
                    {/* Tool Dropdown */}
                    <select
                      value={colorToolMapping[color] || "pen"}
                      onChange={(e) => handleToolChange(color, e.target.value as ToolType)}
                      className="text-sm border rounded px-2 py-1 bg-background"
                    >
                      <option value="pen">Pen</option>
                      <option value="brush">Brush</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
            
            {/* Summary */}
            {colors.length > 0 && (
              <div className="mt-6 p-4 border rounded bg-muted/20">
                <h4 className="text-sm font-medium mb-2">Summary</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>{colors.length} color{colors.length !== 1 ? 's' : ''} found</p>
                  <p>
                    {Object.values(colorToolMapping).filter(tool => tool === 'pen').length} pen tool{Object.values(colorToolMapping).filter(tool => tool === 'pen').length !== 1 ? 's' : ''}
                  </p>
                  <p>
                    {Object.values(colorToolMapping).filter(tool => tool === 'brush').length} brush tool{Object.values(colorToolMapping).filter(tool => tool === 'brush').length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolSelectionScreen;
