"use client";

import React, { useRef, useState, useEffect } from "react";

interface BoundingBoxProps {
  width: number;
  height: number;
  className?: string;
}

const BoundingBox: React.FC<BoundingBoxProps> = ({ width, height, className }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const imageData = await fetch(
          new URL("/assets/icon.png", import.meta.url)
        ).then((res) => res.arrayBuffer());
        
        const blob = new Blob([imageData], { type: "image/png" });
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      } catch (error) {
        console.error("Failed to load image:", error);
      }
    };

    fetchImage();
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    console.log("handleMouseDown");
    e.preventDefault();
    setDragging(true);
    setStart({ x: e.clientX, y: e.clientY });
    setOffset({ x: position.x, y: position.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    console.log("handleMouseMove");
    if (!dragging || !boxRef.current) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    console.log("dx", dx);
    console.log("dy", dy);
    const img = boxRef.current.querySelector("img");
    if (!img) return;
    const imgRect = img.getBoundingClientRect();
    const boxRect = boxRef.current.getBoundingClientRect();
    let newX = offset.x + dx;
    let newY = offset.y + dy;
    // Restrict movement within the bounding box
    newX = Math.max(newX, boxRect.width - img.width);
    newY = Math.max(newY, boxRect.height - img.height);
    console.log("newX", newX);
    console.log("newY", newY);
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    console.log("handleMouseUp");
    setDragging(false);
  };

  React.useEffect(() => {
    console.log("useEffect called");
    console.log("dragging", dragging);
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, start, offset]);

  return (
    <div
      ref={boxRef}
      className={`border-2 border-dashed border-gray-400 rounded-md flex items-center justify-center relative overflow-hidden ${className ?? ""}`}
      style={{ width, height }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Draggable"
          style={{
            position: "absolute",
            left: position.x,
            top: position.y,
            cursor: dragging ? "grabbing" : "grab",
            userSelect: "none",
            maxWidth: "unset",
            maxHeight: "unset"
          }}
          draggable={false}
          onMouseDown={handleMouseDown}
        />
      ) : (
        <span className="text-xs text-gray-400">Loading...</span>
      )}
    </div>
  );
};

export default BoundingBox; 