"use client";

import React from "react";

interface BoundingBoxProps {
  width: number;
  height: number;
  className?: string;
}

const BoundingBox: React.FC<BoundingBoxProps> = ({ width, height, className }) => {
  return (
    <div
      className={`border-2 border-dashed border-gray-400 rounded-md flex items-center justify-center ${className ?? ""}`}
      style={{ width, height }}
    >
      <span className="text-xs text-gray-400">{width} × {height}</span>
    </div>
  );
};

export default BoundingBox; 