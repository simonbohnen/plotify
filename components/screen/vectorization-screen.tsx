"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api-utils";

interface VectorizationScreenProps {
  onClose?: () => void;
  setSvg?: (svg: Node) => void;
}

export const VectorizationScreen: React.FC<VectorizationScreenProps> = ({ 
  onClose, 
  setSvg 
}) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [previewImageURL, setPreviewImageURL] = useState<string | null>(null);
  const [maxColors, setMaxColors] = useState<number>(8);
  const [removeWhites, setRemoveWhites] = useState<boolean>(true);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isLoadingProduction, setIsLoadingProduction] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setPreviewImageURL(null); // Reset preview when new image is uploaded
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoadPreview = async () => {
    if (!uploadedImage || !fileInputRef.current?.files?.[0]) return;

    setIsLoadingPreview(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', fileInputRef.current.files[0]);

      const response = await fetch(`${API_URL}/api/vectorize?mode=preview&max_colors=${maxColors}&remove_whites=${removeWhites}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      setPreviewImageURL(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preview');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleGenerateProduction = async () => {
    if (!uploadedImage || !fileInputRef.current?.files?.[0]) return;

    setIsLoadingProduction(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', fileInputRef.current.files[0]);

      const response = await fetch(`${API_URL}/api/vectorize?mode=production&max_colors=${maxColors}&remove_whites=${removeWhites}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const svgContent = await response.text();
      
      // Parse the SVG and pass it back to the parent
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
      setSvg?.(svgDoc);
      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate production SVG');
    } finally {
      setIsLoadingProduction(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Vectorize Image</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleGenerateProduction}
            variant="default"
            size="sm"
            disabled={!previewImageURL || isLoadingProduction}
          >
            {isLoadingProduction ? "Generating..." : "Generate SVG"}
          </Button>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              {previewImageURL ? "Done" : "Cancel"}
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
              <h3 className="text-sm font-medium mb-4">Upload Image</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              />
            </div>

            {/* Image and Preview Display */}
            <div className="flex-1 flex gap-4">
              {/* Original Image */}
              <div className="flex-1 border rounded bg-white p-4">
                <h3 className="text-sm font-medium mb-4">Original Image</h3>
                <div className="w-full h-full min-h-[300px] flex items-center justify-center">
                  {uploadedImage ? (
                    <img
                      src={uploadedImage}
                      alt="Uploaded image"
                      className="max-w-full max-h-full object-contain"
                      style={{ maxHeight: '24rem' }}
                    />
                  ) : (
                    <div className="text-muted-foreground text-center">
                      <div className="w-32 h-32 border-2 border-dashed border-muted-foreground rounded flex items-center justify-center mb-2">
                        <span className="text-xs">No Image</span>
                      </div>
                      <p className="text-sm">Upload an image to get started</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview SVG */}
              <div className="flex-1 border rounded bg-white p-4">
                <h3 className="text-sm font-medium mb-4">Vectorized Preview</h3>
                <div className="w-full h-full min-h-[300px] flex items-center justify-center">
                  {previewImageURL ? (
                    <img
                      src={previewImageURL}
                      alt="Vectorized preview"
                      className="max-w-full max-h-full object-contain"
                      style={{ maxHeight: '24rem' }}
                    />
                  ) : (
                    <div className="text-muted-foreground text-center">
                      <div className="w-32 h-32 border-2 border-dashed border-muted-foreground rounded flex items-center justify-center mb-2">
                        <span className="text-xs">No Preview</span>
                      </div>
                      <p className="text-sm">Click &quot;Load Preview SVG&quot; to see the vectorized result</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Controls */}
          <div className="w-80 flex flex-col gap-4">
            {/* Configuration */}
            <div className="border rounded bg-card p-4">
              <h3 className="text-sm font-medium mb-4">Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Maximum Colors
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="32"
                    value={maxColors}
                    onChange={(e) => setMaxColors(parseInt(e.target.value) || 8)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Number of colors to use in vectorization (1-32)
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remove-whites"
                    checked={removeWhites}
                    onChange={(e) => setRemoveWhites(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="remove-whites" className="text-sm font-medium">
                    Remove White Colors
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Remove white backgrounds and areas from the vectorized image
                </p>

                <Button
                  onClick={handleLoadPreview}
                  variant="secondary"
                  className="w-full"
                  disabled={!uploadedImage || isLoadingPreview}
                >
                  {isLoadingPreview ? "Loading..." : "Load Preview SVG"}
                </Button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="border rounded bg-destructive/10 p-4">
                <h3 className="text-sm font-medium text-destructive mb-2">Error</h3>
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Instructions */}
            <div className="border rounded bg-muted/20 p-4">
              <h3 className="text-sm font-medium mb-2">Instructions</h3>
              <ol className="text-xs text-muted-foreground space-y-2">
                <li>1. Upload an image file (PNG, JPG, etc.)</li>
                <li>2. Configure the maximum number of colors</li>
                <li>3. Click &quot;Load Preview SVG&quot; to see the vectorized result</li>
                <li>4. If satisfied, click &quot;Generate SVG&quot; to create the final vector</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VectorizationScreen;
