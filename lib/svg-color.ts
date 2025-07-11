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
