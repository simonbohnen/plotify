"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getFillColors } from '../../lib/svg-color';
import { nodeToDocument, setSvgDisplayAttributes } from "@/lib/svg-utils";

interface RemoveFillColorsScreenProps {
  onClose?: () => void;
  setSvg?: (svg: Node) => void;
  svg: Node;
  previewSVG?: Node;
}

export const RemoveFillColorsScreen: React.FC<RemoveFillColorsScreenProps> = ({ 
  onClose, 
  setSvg, 
  svg,
  previewSVG
}) => {
  const [fillColors, setFillColors] = useState<string[]>([]);
  const [currentSvg, setCurrentSvg] = useState<Node>(svg);
  const [localPreviewSvg, setLocalPreviewSvg] = useState<Node>(svg);

  // Extract fill colors when SVG changes
  useEffect(() => {
    if (svg) {
      try {
        const doc = nodeToDocument(svg);
        const colors = getFillColors(doc);
        setFillColors(colors);
        setCurrentSvg(svg);
        
        // Set up local preview SVG with display attributes
        const previewNode = setSvgDisplayAttributes(svg, '24rem');
        setLocalPreviewSvg(previewNode);
      } catch (error) {
        console.error('Error extracting fill colors from SVG:', error);
      }
    }
  }, [svg]);

  const removeFillColor = (colorToRemove: string) => {
    try {
      const doc = nodeToDocument(currentSvg);
      
      // Helper function to recursively remove elements with the specified fill color
      function removeElementsWithFillColor(element: Element): void {
        // Check if this element has the fill color we want to remove
        const fill = element.getAttribute('fill');
        const style = element.getAttribute('style');
        
        let hasTargetFill = false;
        
        // Check direct fill attribute
        if (fill === colorToRemove) {
          hasTargetFill = true;
        }
        
        // Check fill in style attribute
        if (style) {
          const fillMatch = style.match(/fill:\s*([^;]+)/);
          if (fillMatch && fillMatch[1].trim() === colorToRemove) {
            hasTargetFill = true;
          }
        }
        
        // If this element has the target fill color, remove it
        if (hasTargetFill) {
          element.remove();
          return;
        }
        
        // Recursively check child elements (in reverse order to avoid index issues)
        const children = Array.from(element.children);
        for (let i = children.length - 1; i >= 0; i--) {
          removeElementsWithFillColor(children[i]);
        }
      }
      
      // Start removal from the root SVG element
      const svgElement = doc.querySelector('svg');
      if (svgElement) {
        removeElementsWithFillColor(svgElement);
      }
      
      // Update the SVG and colors
      setCurrentSvg(doc);
      const updatedColors = getFillColors(doc);
      setFillColors(updatedColors);
      
      // Update local preview SVG with display attributes
      const previewNode = setSvgDisplayAttributes(doc, '24rem');
      setLocalPreviewSvg(previewNode);
      
      // Update the parent component's SVG
      setSvg?.(doc);
      
    } catch (error) {
      console.error('Error removing fill color:', error);
    }
  };

  const handleContinue = () => {
    onClose?.();
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Remove Fill Colors</h2>
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
              {localPreviewSvg ? (
                <div
                  dangerouslySetInnerHTML={{ __html: (() => {
                    const serializer = new XMLSerializer();
                    return serializer.serializeToString(localPreviewSvg);
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

          {/* Right Panel - Fill Colors */}
          <div className="w-96 flex flex-col">
            <h3 className="text-sm font-medium mb-4">Fill Colors</h3>
            
            {fillColors.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                <p className="text-sm">No fill colors found in the SVG</p>
              </div>
            ) : (
              <div className="space-y-4">
                {fillColors.map((fillColor) => (
                  <div key={fillColor} className="flex items-center justify-between p-3 border rounded bg-card">
                    <div className="flex items-center gap-3">
                      {/* Fill Color Swatch */}
                      <div 
                        className="w-8 h-8 rounded-full border border-border flex-shrink-0"
                        style={{ 
                          backgroundColor: fillColor,
                          boxShadow: fillColor.toLowerCase() === '#ffffff' || fillColor.toLowerCase() === 'white' 
                            ? 'inset 0 0 0 1px #e5e7eb' 
                            : 'none'
                        }}
                      />
                      {/* Color Value */}
                      <span className="text-sm font-mono">{fillColor}</span>
                    </div>
                    
                    {/* Trash Icon Button */}
                    <Button
                      onClick={() => removeFillColor(fillColor)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Summary */}
            {fillColors.length > 0 && (
              <div className="mt-6 p-4 border rounded bg-muted/20">
                <h4 className="text-sm font-medium mb-2">Summary</h4>
                <div className="text-xs text-muted-foreground">
                  <p>{fillColors.length} fill color{fillColors.length !== 1 ? 's' : ''} found</p>
                  <p className="mt-1">Click the trash icon next to a color to remove all elements with that fill color.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoveFillColorsScreen;
