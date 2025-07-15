"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api-utils";

interface PixelartToSvgScreenProps {
  onClose?: () => void;
  setSvg?: (svg: Node) => void;
}

export const PixelartToSvgScreen: React.FC<PixelartToSvgScreenProps> = ({ onClose, setSvg }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [penWidth, setPenWidth] = useState<number>(1.0);
  const [upsample, setUpsample] = useState<number>(8);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateSvg = async () => {
    if (!fileInputRef.current?.files?.[0]) return;
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", fileInputRef.current.files[0]);
      const params = new URLSearchParams({
        pen_width: penWidth.toString(),
        u: upsample.toString(),
      });
      const response = await fetch(`${API_URL}/api/pixelart-to-svg?${params.toString()}`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const svgContent = await response.text();
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
      setSvg?.(svgDoc);
      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate SVG");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculation for pixel width
  const pixelWidth = (upsample * penWidth) / 1.25;
  const tenPixelWidth = 10 * pixelWidth;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Pixelart to SVG</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleGenerateSvg}
            variant="default"
            size="sm"
            disabled={!uploadedImage || isLoading}
          >
            {isLoading ? "Generating..." : "Generate Pixelart SVG"}
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
          {/* Left Panel - Image Upload and Preview */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Image Upload */}
            <div className="border rounded bg-white p-4">
              <h3 className="text-sm font-medium mb-4">Upload Pixelart Image</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              />
            </div>

            {/* Image Preview */}
            <div className="flex-1 border rounded bg-white p-4">
              <h3 className="text-sm font-medium mb-4">Original Image</h3>
              <div className="w-full h-full min-h-[300px] flex items-center justify-center">
                {uploadedImage ? (
                  <img
                    src={uploadedImage}
                    alt="Uploaded pixelart"
                    className="max-w-full max-h-full object-contain"
                    style={{ maxHeight: '24rem' }}
                  />
                ) : (
                  <div className="text-muted-foreground text-center">
                    <div className="w-32 h-32 border-2 border-dashed border-muted-foreground rounded flex items-center justify-center mb-2">
                      <span className="text-xs">No Image</span>
                    </div>
                    <p className="text-sm">Upload a pixelart image to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Configuration and Explanation */}
          <div className="w-96 flex flex-col gap-6">
            {/* Pen Width Configuration */}
            <div className="space-y-3 border rounded bg-card p-4">
              <label className="text-sm font-medium">
                Pen Width: {penWidth}mm
              </label>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={penWidth}
                onChange={(e) => setPenWidth(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0.1mm</span>
                <span>5.0mm</span>
              </div>
            </div>
            {/* Upsample Factor */}
            <div className="space-y-3 border rounded bg-card p-4">
              <label className="text-sm font-medium">
                Upsample Factor:
              </label>
              <input
                type="number"
                min="1"
                max="32"
                value={upsample}
                onChange={(e) => setUpsample(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This controls the upsampling of the pixelart. Higher values make each pixel larger.
              </p>
            </div>
            {/* Explanation */}
            <div className="border rounded bg-muted/20 p-4">
              <h3 className="text-sm font-medium mb-2">Pixel Size Calculation</h3>
              <p className="text-xs text-muted-foreground">
                One pixel will be <b>{(pixelWidth / 10).toFixed(2)}cm</b> wide in the final artwork.<br />
                10 pixels will be <b>{(tenPixelWidth / 10).toFixed(2)}cm</b> wide.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Formula: <code>pixel width = upsample factor × pen width / 1.25</code>
              </p>
            </div>
            {/* Error Display */}
            {error && (
              <div className="border rounded bg-destructive/10 p-4">
                <h3 className="text-sm font-medium text-destructive mb-2">Error</h3>
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PixelartToSvgScreen;
