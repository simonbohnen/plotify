"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getAssumedSize, SVG_SIZES } from "@/lib/svg-layout";
import { Settings } from "lucide-react";

interface LayoutScreenProps {
  onClose?: () => void;
  setSvg?: (svg: string) => void;
  svg: string;
}

export const LayoutScreen: React.FC<LayoutScreenProps> = ({ onClose, setSvg, svg }) => {
  const [svgText, setSvgText] = useState<string>(svg);
  const [svgResult, setSvgResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [width, setWidth] = useState<string>("210");
  const [height, setHeight] = useState<string>("297");
  const [margin, setMargin] = useState<string>("10");
  const [landscape, setLandscape] = useState<boolean>(false);

  useEffect(() => {
    // Infer initial width/height from SVG
    try {
      if (typeof window !== "undefined" && svg) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svg, "image/svg+xml");
        const assumed = getAssumedSize(doc);
        if (assumed) {
          const { size, orientation } = assumed;
          const s = SVG_SIZES[size];
          if (s) {
            if (orientation === "portrait") {
              setWidth(String(s.width));
              setHeight(String(s.height));
            } else {
              setWidth(String(s.height));
              setHeight(String(s.width));
            }
          }
        }
      }
    } catch {}
  }, [svg]);

  const handleProcess = async () => {
    if (!svgText) {
      setError("No SVG data available.");
      return;
    }
    setIsProcessing(true);
    setSvgResult(null);
    setError(null);
    try {
      const formData = new FormData();
      // Create a Blob from the SVG string and append as a file
      const svgBlob = new Blob([svgText], { type: "image/svg+xml" });
      formData.append("file", svgBlob, "input.svg");
      const params = new URLSearchParams({
        width,
        height,
        margin,
        landscape: landscape ? "true" : "false",
      });
      const response = await fetch(`http://localhost:8000/api/layout?${params.toString()}`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to process layout");
      }
      const svgTextResult = await response.text();
      setSvgResult(svgTextResult);
    } catch (err) {
      setError("Failed to process layout. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Layout SVG</h2>
        </div>
        <div className="flex items-center gap-2">
          {!svgResult ? (
            <Button
              onClick={handleProcess}
              disabled={isProcessing || !svgText}
              className=""
              variant="default"
              size="sm"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>Apply Layout</>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (setSvg && svgResult) {
                  setSvg(svgResult);
                }
                onClose?.();
              }}
              className=""
              variant="default"
              size="sm"
            >
              Continue design
            </Button>
          )}
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="flex gap-4 h-full">
          {/* Left Panel - SVG Preview */}
          <div className="flex-1 border rounded bg-white p-4">
            <h3 className="text-sm font-medium mb-2">Preview</h3>
            <div className="w-full h-full min-h-[400px] flex items-center justify-center">
              {svgResult ? (
                <div className="border border-dashed border-muted-foreground rounded" style={{borderWidth: 1, display: 'inline-block'}}>
                  <div
                    dangerouslySetInnerHTML={{ __html: svgResult }}
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="text-muted-foreground text-center">
                  <div className="w-32 h-32 border-2 border-dashed border-muted-foreground rounded flex items-center justify-center mb-2">
                    <span className="text-xs">SVG Preview</span>
                  </div>
                  <p className="text-sm">Apply layout to see preview</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Controls */}
          <div className="w-80 flex flex-col gap-4">
            <h2 className="text-lg font-semibold mb-2">Layout Settings</h2>
            <div className="flex flex-col gap-3">
              <label className="flex flex-col text-sm font-medium">
                Width (mm)
                <input
                  type="number"
                  value={width}
                  onChange={e => setWidth(e.target.value)}
                  placeholder="Width (mm)"
                  className="border rounded px-2 py-1 mt-1"
                />
              </label>
              <label className="flex flex-col text-sm font-medium">
                Height (mm)
                <input
                  type="number"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  placeholder="Height (mm)"
                  className="border rounded px-2 py-1 mt-1"
                />
              </label>
              <label className="flex flex-col text-sm font-medium">
                Margin (mm)
                <input
                  type="number"
                  value={margin}
                  onChange={e => setMargin(e.target.value)}
                  placeholder="Margin (mm)"
                  className="border rounded px-2 py-1 mt-1"
                />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={landscape}
                  onChange={e => setLandscape(e.target.checked)}
                />
                Landscape
              </label>
            </div>
            {error && <div className="text-destructive text-sm">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutScreen;
