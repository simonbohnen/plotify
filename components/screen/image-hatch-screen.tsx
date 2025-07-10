"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Image, Settings } from "lucide-react";

interface ImageHatchScreenProps {
  onClose?: () => void;
  setSvg?: (svg: string) => void;
}

export const ImageHatchScreen: React.FC<ImageHatchScreenProps> = ({ onClose, setSvg }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [svgResult, setSvgResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setSvgResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleProcessImage = async () => {
    if (!uploadedImage) return;
    setIsProcessing(true);
    setSvgResult(null);
    setError(null);
    try {
      // Convert base64 data URL to file object
      const response = await fetch(uploadedImage);
      const blob = await response.blob();
      const file = new File([blob], "image.png", { type: "image/png" });
      
      const formData = new FormData();
      formData.append("file", file);
      const apiResponse = await fetch("http://localhost:8000/api/hatch-mock", {
        method: "POST",
        body: formData,
      });
      if (!apiResponse.ok) {
        throw new Error("Failed to process image");
      }
      const svgText = await apiResponse.text();
      setSvgResult(svgText);
    } catch (err) {
      console.error(err);
      setError("Failed to process image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setSvgResult(null);
    setError(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Image className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Image Hatching</h2>
        </div>
        <div className="flex items-center gap-2">
          {!svgResult ? (
            <Button
              onClick={handleProcessImage}
              disabled={!uploadedImage || isProcessing}
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
                <>Apply Hatching</>
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
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Upload Area */}
          <div className="flex flex-col h-full overflow-hidden">            
            {!uploadedImage ? (
              <div className="flex-1 border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center overflow-hidden">
                <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center mb-4">
                  Drag and drop an image here, or click to browse
                </p>
                <Button onClick={handleUploadClick} variant="outline">
                  Choose Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
                          ) : (
                <div className="flex-1 border border-border rounded-lg p-4 flex flex-col overflow-hidden">
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                      <img
                        src={uploadedImage}
                        alt="Uploaded image"
                        className="w-full h-full object-contain rounded"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2 flex-shrink-0">
                    <Button onClick={handleUploadClick} variant="outline" size="sm">
                      Change Image
                    </Button>
                    <Button onClick={handleReset} variant="outline" size="sm">
                      Remove
                    </Button>
                  </div>
                </div>
              )}
          </div>

          {/* Preview Area */}
          <div className="flex flex-col">
            <div className="border border-border rounded-lg p-4 min-h-[200px] bg-muted/20 flex items-center justify-center">
              {isProcessing && (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-muted-foreground mb-2"></div>
                  <span className="text-muted-foreground">Processing...</span>
                </div>
              )}
              {error && !isProcessing && (
                <span className="text-destructive text-center">{error}</span>
              )}
              {svgResult && !isProcessing && !error && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-full h-full max-h-[400px] max-w-full overflow-auto">
                    <div
                      dangerouslySetInnerHTML={{ __html: svgResult }}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}
              {!svgResult && !isProcessing && !error && (
                <>
                  {uploadedImage ? (
                    <p className="text-muted-foreground text-center">
                      Hatching preview will appear here after processing
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-center">
                      Upload an image to see the hatching preview
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageHatchScreen;
