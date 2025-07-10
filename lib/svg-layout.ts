export interface SVGSize {
  width: number;
  height: number;
  name: string;
  description: string;
}

export const SVG_SIZES: Record<string, SVGSize> = {
  a3: {
    width: 371,
    height: 525,
    name: "A3",
    description: "A3 size (371mm x 525mm)"
  },
  a4: {
    width: 264,
    height: 373,
    name: "A4",
    description: "A4 size (264mm x 373mm)"
  },
  a5: {
    width: 186.5,
    height: 264,
    name: "A5",
    description: "A5 size (186.5mm x 264mm)"
  }
};

// Helper function to get size by name
export function getSVGSize(sizeName: string): SVGSize | undefined {
  return SVG_SIZES[sizeName];
}

// Helper function to get all available sizes
export function getAllSVGSizes(): SVGSize[] {
  return Object.values(SVG_SIZES);
}

// Helper function to convert various units to millimeters
export function convertToMM(value: number, unit: string): number {
  const unitLower = unit.toLowerCase();
  
  switch (unitLower) {
    case 'mm':
      return value;
    case 'cm':
      return value * 10;
    case 'in':
      return value * 25.4;
    case 'px':
      return value * (25.4 / 96); // 1px = 1/96th of 1in = 25.4/96 mm
    case 'pt':
      return value * (25.4 / 72); // 1pt = 1/72 of 1in = 25.4/72 mm
    case 'pc':
      return value * (25.4 / 72 * 12); // 1pc = 12pt = 12 * (25.4/72) mm
    default:
      throw new Error(`Unsupported unit: ${unit}`);
  }
}

// Helper function to extract width and height from SVG document
export function getSVGDimensions(document: Document): { width: string | null; height: string | null } {
  // Get the root SVG element
  const svgElement = document.querySelector('svg');
  
  if (!svgElement) {
    throw new Error('No SVG element found in document');
  }
  
  return {
    width: svgElement.getAttribute('width'),
    height: svgElement.getAttribute('height')
  };
}

// Helper function to extract numeric value and unit from a dimension string
function parseDimension(dimension: string): { value: number; unit: string } | null {
  const match = dimension.match(/^([\d.]+)([a-zA-Z]*)$/);
  if (!match) return null;
  
  const value = parseFloat(match[1]);
  const unit = match[2] || 'px'; // Default to px if no unit specified
  
  return { value, unit };
}

// Helper function to check if two dimensions are within 2% tolerance
function isWithinTolerance(dim1: number, dim2: number): boolean {
  const tolerance = 0.02; // 2%
  const difference = Math.abs(dim1 - dim2);
  const average = (dim1 + dim2) / 2;
  return difference / average <= tolerance;
}

// Function to determine the assumed size of an SVG document
export function getAssumedSize(document: Document): { size: string; orientation: 'portrait' | 'landscape' } | null {
  const dimensions = getSVGDimensions(document);
  
  if (!dimensions.width || !dimensions.height) {
    return null;
  }
  
  // Parse width and height
  const widthData = parseDimension(dimensions.width);
  const heightData = parseDimension(dimensions.height);
  
  if (!widthData || !heightData) {
    return null;
  }
  
  // Convert to millimeters
  const widthMM = convertToMM(widthData.value, widthData.unit);
  const heightMM = convertToMM(heightData.value, heightData.unit);
  
  // Check each predefined size
  for (const [sizeKey, size] of Object.entries(SVG_SIZES)) {
    // Check portrait orientation (width x height)
    if (isWithinTolerance(widthMM, size.width) && isWithinTolerance(heightMM, size.height)) {
      return { size: sizeKey, orientation: 'portrait' };
    }
    
    // Check landscape orientation (height x width)
    if (isWithinTolerance(widthMM, size.height) && isWithinTolerance(heightMM, size.width)) {
      return { size: sizeKey, orientation: 'landscape' };
    }
  }
  
  return null;
}
