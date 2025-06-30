"use client";

import React, { useRef, useState } from "react";

interface ImageUploadProps {
  onImageUpload?: (file: File) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onImageUpload?.(file);
    }
  };

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-400 transition-colors min-h-[180px] w-full max-w-md mx-auto"
      onClick={handleAreaClick}
    >
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className="max-h-40 object-contain rounded shadow"
        />
      ) : (
        <span className="text-gray-500">Click or drag an image to upload</span>
      )}
    </div>
  );
}; 