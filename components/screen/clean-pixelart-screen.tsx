"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api-utils";

interface CleanPixelartScreenProps {
  onClose?: () => void;
}

export const CleanPixelartScreen: React.FC<CleanPixelartScreenProps> = ({ onClose }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [cleanedImageURL, setCleanedImageURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("cleaned-pixelart.png");

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name.replace(/\.[^.]+$/, "") + "-cleaned.png");
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setCleanedImageURL(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCleanPixelart = async () => {
    if (!fileInputRef.current?.files?.[0]) return;
    setIsLoading(true);
    setError(null);
    setCleanedImageURL(null);
    try {
      const formData = new FormData();
      formData.append("file", fileInputRef.current.files[0]);
      // num_colors is always 16
      const url = `${API_URL}/api/clean-pixelart?num_colors=16`;
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      setCleanedImageURL(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clean pixelart");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!cleanedImageURL) return;
    const link = document.createElement("a");
    link.href = cleanedImageURL;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Clean Pixelart</h2>
        </div>
        <div className="flex items-center gap-2">
          {cleanedImageURL && (
            <Button onClick={handleDownload} variant="secondary" size="sm">
              Download
            </Button>
          )}
          <Button
            onClick={handleCleanPixelart}
            variant="default"
            size="sm"
            disabled={!uploadedImage || isLoading}
          >
            {isLoading ? "Cleaning..." : "Clean Pixelart"}
          </Button>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              {cleanedImageURL ? "Done" : "Cancel"}
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

            {/* Image and Cleaned Display */}
            <div className="flex-1 flex gap-4">
              {/* Original Image */}
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

              {/* Cleaned Image */}
              <div className="flex-1 border rounded bg-white p-4">
                <h3 className="text-sm font-medium mb-4">Cleaned Pixelart</h3>
                <div className="w-full h-full min-h-[300px] flex items-center justify-center">
                  {cleanedImageURL ? (
                    <img
                      src={cleanedImageURL}
                      alt="Cleaned pixelart"
                      className="max-w-full max-h-full object-contain"
                      style={{ maxHeight: '24rem' }}
                    />
                  ) : (
                    <div className="text-muted-foreground text-center">
                      <div className="w-32 h-32 border-2 border-dashed border-muted-foreground rounded flex items-center justify-center mb-2">
                        <span className="text-xs">No Cleaned Image</span>
                      </div>
                      <p className="text-sm">Click "Clean Pixelart" to process the image</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Instructions and Error */}
          <div className="w-80 flex flex-col gap-4">
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
                <li>1. Upload a pixelart image file (PNG, JPG, etc.)</li>
                <li>2. Click "Clean Pixelart" to process and clean the image</li>
                <li>3. Download the cleaned image using the Download button</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanPixelartScreen;
