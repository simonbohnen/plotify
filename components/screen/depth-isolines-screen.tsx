"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api-utils";

interface DepthIsolinesScreenProps {
  onClose?: () => void;
  setSvg?: (svg: Node) => void;
}

export const DepthIsolinesScreen: React.FC<DepthIsolinesScreenProps> = ({
  onClose,
  setSvg,
}) => {
  const [imageWithBg, setImageWithBg] = useState<string | null>(null);
  const [imageWithoutBg, setImageWithoutBg] = useState<string | null>(null);
  const [svgPreview, setSvgPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputWithBgRef = useRef<HTMLInputElement>(null);
  const fileInputWithoutBgRef = useRef<HTMLInputElement>(null);

  const handleImageWithBgUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageWithBg(e.target?.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageWithoutBgUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageWithoutBg(e.target?.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateLineDrawing = async () => {
    if (!fileInputWithBgRef.current?.files?.[0] || !fileInputWithoutBgRef.current?.files?.[0]) {
      setError("Please upload both images.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSvgPreview(null);
    try {
      const formData = new FormData();
      formData.append("image", fileInputWithBgRef.current.files[0]);
      formData.append("mask", fileInputWithoutBgRef.current.files[0]);
      const response = await fetch(`${API_URL}/api/depth-lines`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const svgContent = await response.text();
      setSvgPreview(`data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`);
      // Optionally pass SVG to parent
      if (setSvg) {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
        setSvg(svgDoc);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate line drawing");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Depth Isolines</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleGenerateLineDrawing}
            variant="default"
            size="sm"
            disabled={isLoading || !imageWithBg || !imageWithoutBg}
          >
            {isLoading ? "Generating..." : "Generate line drawing"}
          </Button>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              {svgPreview ? "Done" : "Cancel"}
            </Button>
          )}
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="flex gap-6 h-full">
          {/* Left Panel - Image Upload and Preview */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Image Uploads */}
            <div className="border rounded bg-white p-4 flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Image with Background</h3>
                <input
                  ref={fileInputWithBgRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageWithBgUpload}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                />
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Image without Background (Mask)</h3>
                <input
                  ref={fileInputWithoutBgRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageWithoutBgUpload}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                />
              </div>
            </div>
            {/* Preview of Mask (without background) */}
            <div className="flex-1 border rounded bg-white p-4">
              <h3 className="text-sm font-medium mb-4">Mask Preview (No Background)</h3>
              <div className="w-full h-full min-h-[300px] flex items-center justify-center">
                {imageWithoutBg ? (
                  <img
                    src={imageWithoutBg}
                    alt="Mask preview"
                    className="max-w-full max-h-full object-contain"
                    style={{ maxHeight: '24rem' }}
                  />
                ) : (
                  <div className="text-muted-foreground text-center">
                    <div className="w-32 h-32 border-2 border-dashed border-muted-foreground rounded flex items-center justify-center mb-2">
                      <span className="text-xs">No Mask</span>
                    </div>
                    <p className="text-sm">Upload a mask image to preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Right Panel - SVG Preview */}
          <div className="flex-1 border rounded bg-white p-4">
            <h3 className="text-sm font-medium mb-4">Line Drawing Preview</h3>
            <div className="w-full h-full min-h-[300px] flex items-center justify-center">
              {svgPreview ? (
                <img
                  src={svgPreview}
                  alt="Line drawing preview"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-muted-foreground text-center">
                  <div className="w-32 h-32 border-2 border-dashed border-muted-foreground rounded flex items-center justify-center mb-2">
                    <span className="text-xs">No Preview</span>
                  </div>
                  <p className="text-sm">Click "Generate line drawing" to see the result</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Error Display */}
        {error && (
          <div className="mt-4 border rounded bg-destructive/10 p-4">
            <h3 className="text-sm font-medium text-destructive mb-2">Error</h3>
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepthIsolinesScreen;
