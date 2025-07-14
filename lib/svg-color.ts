/**
 * Extracts unique stroke colors from an SVG document
 * @param svgDocument - The SVG document to analyze
 * @returns Array of unique stroke colors found in the SVG
 */
export function getColors(svgDocument: Document): string[] {
  const colors = new Set<string>();
  
  // Helper function to recursively traverse SVG elements
  function traverseElements(element: Element): void {
    // Check for stroke attribute
    const stroke = element.getAttribute('stroke');
    if (stroke && stroke !== 'none' && stroke !== 'inherit') {
      colors.add(stroke);
    }
    
    // Check for stroke in style attribute
    const style = element.getAttribute('style');
    if (style) {
      const strokeMatch = style.match(/stroke:\s*([^;]+)/);
      if (strokeMatch && strokeMatch[1] !== 'none' && strokeMatch[1] !== 'inherit') {
        colors.add(strokeMatch[1].trim());
      }
    }
    
    // Recursively check child elements
    for (const child of Array.from(element.children)) {
      traverseElements(child);
    }
  }
  
  // Start traversal from the root SVG element
  const svgElement = svgDocument.querySelector('svg');
  if (svgElement) {
    traverseElements(svgElement);
  }
  
  return Array.from(colors);
}

/**
 * Extracts unique fill colors from an SVG document
 * @param svgDocument - The SVG document to analyze
 * @returns Array of unique fill colors found in the SVG
 */
export function getFillColors(svgDocument: Document): string[] {
  const colors = new Set<string>();
  
  // Helper function to recursively traverse SVG elements
  function traverseElements(element: Element): void {
    // Check for fill attribute
    const fill = element.getAttribute('fill');
    if (fill && fill !== 'none' && fill !== 'inherit') {
      colors.add(fill);
    }
    
    // Check for fill in style attribute
    const style = element.getAttribute('style');
    if (style) {
      const fillMatch = style.match(/fill:\s*([^;]+)/);
      if (fillMatch && fillMatch[1] !== 'none' && fillMatch[1] !== 'inherit') {
        colors.add(fillMatch[1].trim());
      }
    }
    
    // Recursively check child elements
    for (const child of Array.from(element.children)) {
      traverseElements(child);
    }
  }
  
  // Start traversal from the root SVG element
  const svgElement = svgDocument.querySelector('svg');
  if (svgElement) {
    traverseElements(svgElement);
  }
  
  return Array.from(colors);
}

/**
 * Extracts stroke colors from top-level g elements in an SVG document
 * @param svgDocument - The SVG document to analyze
 * @returns Object mapping layer ID (starting from 1) to hex stroke color value
 */
export function getLayerColors(svgDocument: Document): Record<number, string> {
  const layerColors: Record<number, string> = {};
  
  // Helper function to extract stroke color from an element
  function getStrokeColor(element: Element): string | null {
    // Check for stroke attribute
    const stroke = element.getAttribute('stroke');
    if (stroke && stroke !== 'none' && stroke !== 'inherit') {
      return stroke;
    }
    
    // Check for stroke in style attribute
    const style = element.getAttribute('style');
    if (style) {
      const strokeMatch = style.match(/stroke:\s*([^;]+)/);
      if (strokeMatch && strokeMatch[1] !== 'none' && strokeMatch[1] !== 'inherit') {
        return strokeMatch[1].trim();
      }
    }
    
    return null;
  }
  
  // Get the root SVG element
  const svgElement = svgDocument.querySelector('svg');
  if (!svgElement) {
    return layerColors;
  }
  
  // Find all top-level g elements
  const topLevelGroups = Array.from(svgElement.children).filter(
    child => child.tagName.toLowerCase() === 'g'
  );
  
  // Extract stroke colors from each top-level g element
  topLevelGroups.forEach((group, index) => {
    const layerId = index + 1; // Start from 1
    const strokeColor = getStrokeColor(group);
    
    if (strokeColor) {
      layerColors[layerId] = strokeColor;
    }
  });
  
  return layerColors;
}

/**
 * Sets the stroke color of all SVG elements to their fill color if a fill color exists
 * @param svgDocument - The SVG document to modify
 */
export function setStrokeToFillColor(svgDocument: Document): void {
  // Helper function to get fill color from an element
  function getFillColor(element: Element): string | null {
    // Check for fill attribute
    const fill = element.getAttribute('fill');
    if (fill && fill !== 'none' && fill !== 'inherit') {
      return fill;
    }
    
    // Check for fill in style attribute
    const style = element.getAttribute('style');
    if (style) {
      const fillMatch = style.match(/fill:\s*([^;]+)/);
      if (fillMatch && fillMatch[1] !== 'none' && fillMatch[1] !== 'inherit') {
        return fillMatch[1].trim();
      }
    }
    
    return null;
  }

  // Helper function to set stroke color on an element
  function setStrokeColor(element: Element, color: string): void {
    // Set stroke attribute
    element.setAttribute('stroke', color);
    
    // Update stroke in style attribute if it exists
    const style = element.getAttribute('style');
    if (style) {
      // Replace existing stroke in style or add new stroke
      const updatedStyle = style.replace(/stroke:\s*[^;]+;?/, `stroke: ${color};`);
      if (updatedStyle === style) {
        // No existing stroke found, add it
        element.setAttribute('style', `${style}; stroke: ${color};`);
      } else {
        element.setAttribute('style', updatedStyle);
      }
    } else {
      // No style attribute exists, just set the stroke attribute
      element.setAttribute('stroke', color);
    }
  }

  // Helper function to recursively traverse SVG elements
  function traverseElements(element: Element): void {
    // Get fill color from this element
    const fillColor = getFillColor(element);
    
    // If element has a fill color, set stroke to that color
    if (fillColor) {
      setStrokeColor(element, fillColor);
    }
    
    // Recursively process child elements
    for (const child of Array.from(element.children)) {
      traverseElements(child);
    }
  }
  
  // Start traversal from the root SVG element
  const svgElement = svgDocument.querySelector('svg');
  if (svgElement) {
    traverseElements(svgElement);
  }
}
