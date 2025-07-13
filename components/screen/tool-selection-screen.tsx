"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getLayerColors } from '../../lib/svg-color';
import { nodeToDocument } from "@/lib/svg-utils";
import { API_URL } from "@/lib/api-utils";

interface ToolSelectionScreenProps {
  onClose?: () => void;
  setSvg?: (svg: Node) => void;
  svg: Node;
  previewSVG?: Node;
}

// Tool categories and their color options
export const TOOL_CATEGORIES = [
  {
    key: "felt_tip",
    label: "Felt Tip",
    pen_width: 0.7,
    colors: [
      { name: "Black", value: "#222222" },
      { name: "Brown", value: "#8B5C2A" },
      { name: "Red", value: "#C0392B" },
      { name: "Blue", value: "#2980B9" },
    ],
  },
  {
    key: "technical_pen",
    label: "Technical Pen",
    pen_width: 0.15,
    colors: [
      { name: "Black", value: "#111111" },
      { name: "Gray", value: "#888888" },
      { name: "Sepia", value: "#704214" },
    ],
  },
  {
    key: "gel_pen",
    label: "Gel Pen",
    pen_width: 0.5,
    colors: [
      { name: "Black", value: "#222222" },
      { name: "Blue", value: "#1E90FF" },
      { name: "Green", value: "#27AE60" },
      { name: "Pink", value: "#FF69B4" },
    ],
  },
];

type ToolCategoryKey = typeof TOOL_CATEGORIES[number]["key"];

interface ToolColor {
  name: string;
  value: string;
}

interface ColorToolMapping {
  [color: string]: {
    tool: ToolCategoryKey;
    color: string; // rgb/hex value
  };
}

export const ToolSelectionScreen: React.FC<ToolSelectionScreenProps> = ({ 
  onClose, 
  setSvg, 
  svg,
  previewSVG
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
          const doc = nodeToDocument(svg);
          const serializer = new XMLSerializer();
          const svgString = serializer.serializeToString(doc);
          const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
          formData.append('file', svgBlob, 'input.svg');

          const response = await fetch(`${API_URL}/api/stroke-colors-to-layers`, {
            method: 'POST',
            body: formData,
          });
          const responseSvg = await response.text();

          // Parse the returned SVG
          const parser = new DOMParser();
          const responseDoc = parser.parseFromString(responseSvg, 'image/svg+xml');

          // Use getLayerColors to extract layer colors
          const layerColors = getLayerColors(responseDoc);
          const colorList = Object.values(layerColors) as string[];
          setColors(colorList);

          // Initialize tool mapping for new colors
          const newMapping: ColorToolMapping = {};
          colorList.forEach(color => {
            if (!(color in colorToolMapping)) {
              // Default: first tool and first color in that tool
              const defaultTool = TOOL_CATEGORIES[0].key;
              const defaultColor = TOOL_CATEGORIES[0].colors[0].value;
              newMapping[color] = { tool: defaultTool, color: defaultColor };
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

  const handleToolChange = (svgColor: string, tool: ToolCategoryKey) => {
    const toolObj = TOOL_CATEGORIES.find(t => t.key === tool);
    const firstColor = toolObj ? toolObj.colors[0].value : '';
    setColorToolMapping(prev => ({
      ...prev,
      [svgColor]: {
        tool,
        color: firstColor,
      },
    }));
  };

  const handleColorChange = (svgColor: string, color: string) => {
    setColorToolMapping(prev => ({
      ...prev,
      [svgColor]: {
        ...prev[svgColor],
        color,
      },
    }));
  };

  const handleContinue = async () => {
    // Here you could process the color-tool mappings
    console.log('Color tool mappings:', colorToolMapping);
    const formData = new FormData();
    const doc = nodeToDocument(svg);
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(doc);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    formData.append('file', svgBlob, 'input.svg');

    // Generate pen_ids by combining tool key and color name
    const penIds = colors.map(svgColor => {
      const mapping = colorToolMapping[svgColor];
      const toolObj = TOOL_CATEGORIES.find(t => t.key === mapping.tool) || TOOL_CATEGORIES[0];
      const colorObj = toolObj.colors.find(c => c.value === mapping.color) || toolObj.colors[0];
      return `${mapping.tool}_${colorObj.name}`;
    });
    const params = new URLSearchParams();
    penIds.forEach(id => params.append('pen_ids', id));

    const response = await fetch(`${API_URL}/api/assign-pens?${params.toString()}`, {
      method: 'POST',
      body: formData,
    });
    const newSvg = await response.text();
    const parser = new DOMParser();
    const responseDoc = parser.parseFromString(newSvg, 'image/svg+xml');
    setSvg?.(responseDoc);
    onClose?.();
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
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

          {/* Right Panel - Color Tools */}
          <div className="w-96 flex flex-col">
            <h3 className="text-sm font-medium mb-4">Color Tools</h3>
            
            {colors.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                <p className="text-sm">No stroke colors found in the SVG</p>
              </div>
            ) : (
              <div className="space-y-4">
                {colors.map((svgColor) => {
                  const mapping = colorToolMapping[svgColor] || { tool: TOOL_CATEGORIES[0].key, color: TOOL_CATEGORIES[0].colors[0].value };
                  const toolObj = TOOL_CATEGORIES.find(t => t.key === mapping.tool) || TOOL_CATEGORIES[0];
                  const colorObj = toolObj.colors.find(c => c.value === mapping.color) || toolObj.colors[0];
                  return (
                    <div key={svgColor} className="flex items-center gap-3 p-3 border rounded bg-card">
                      {/* SVG Color Swatch */}
                      <div 
                        className="w-8 h-8 rounded-full border border-border flex-shrink-0"
                        style={{ 
                          backgroundColor: svgColor,
                          boxShadow: svgColor.toLowerCase() === '#ffffff' || svgColor.toLowerCase() === 'white' 
                            ? 'inset 0 0 0 1px #e5e7eb' 
                            : 'none'
                        }}
                      />
                      {/* Tool Category Dropdown */}
                      <select
                        value={mapping.tool}
                        onChange={e => handleToolChange(svgColor, e.target.value as ToolCategoryKey)}
                        className="text-sm border rounded px-2 py-1 bg-background ml-2"
                      >
                        {TOOL_CATEGORIES.map(tool => (
                          <option key={tool.key} value={tool.key}>{tool.label}</option>
                        ))}
                      </select>
                      {/* Tool Color Dropdown */}
                      <select
                        value={mapping.color}
                        onChange={e => handleColorChange(svgColor, e.target.value)}
                        className="text-sm border rounded px-2 py-1 bg-background ml-2"
                      >
                        {toolObj.colors.map(color => (
                          <option key={color.value} value={color.value}>{color.name}</option>
                        ))}
                      </select>
                      {/* Tool Color Swatch */}
                      <div 
                        className="w-6 h-6 rounded-full border border-border ml-2"
                        style={{ backgroundColor: colorObj.value }}
                        title={colorObj.name}
                      />
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Summary */}
            {colors.length > 0 && (
              <div className="mt-6 p-4 border rounded bg-muted/20">
                <h4 className="text-sm font-medium mb-2">Summary</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>{colors.length} color{colors.length !== 1 ? 's' : ''} found</p>
                  <p>
                    {Object.values(colorToolMapping).filter(mapping => mapping.tool === 'felt_tip').length} felt tip
                  </p>
                  <p>
                    {Object.values(colorToolMapping).filter(mapping => mapping.tool === 'technical_pen').length} technical pen
                  </p>
                  <p>
                    {Object.values(colorToolMapping).filter(mapping => mapping.tool === 'gel_pen').length} gel pen
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
