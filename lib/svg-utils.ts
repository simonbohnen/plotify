export function removeSvgMetadata(doc: Document): { doc: Document, metadata: Element | null } {
  // Get the root <svg> element
  const svg = doc.documentElement;
  if (!svg || svg.nodeName !== 'svg') {
    // Not a valid SVG, return original
    return { doc, metadata: null };
  }

  // Find the <metadata> element directly under <svg>
  const metadata = svg.querySelector('metadata');
  if (metadata && metadata.parentNode === svg) {
    svg.removeChild(metadata);
    return { doc, metadata };
  }

  return { doc, metadata: null };
}

export async function hashDocument(doc: Document): Promise<string> {
  // Serialize the document to a string
  const serializer = new XMLSerializer();
  const content = serializer.serializeToString(doc);

  // Encode as UTF-8
  const encoder = new TextEncoder();
  const data = encoder.encode(content);

  // Compute SHA-256 hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Convert buffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function setMetadataSourceHash(metadata: Element, hash: string): void {
  let dcSource = metadata.querySelector('dc\\:source, source');
  if (dcSource) {
    dcSource.textContent = hash;
    return;
  }

  // Create <dc:source> if it doesn't exist
  // Try to find the parent <cc:Work> if present
  const ccWork = metadata.querySelector('cc\\:Work, Work');
  const doc = metadata.ownerDocument;
  if (doc) {
    dcSource = doc.createElementNS('http://purl.org/dc/elements/1.1/', 'dc:source');
    dcSource.textContent = hash;
    if (ccWork) {
      ccWork.appendChild(dcSource);
    } else {
      // Fallback: append to metadata
      metadata.appendChild(dcSource);
    }
  }
}

export function nodeToDocument(node: Node): Document {
  if (node.nodeType === Node.DOCUMENT_NODE) {
    return node as Document;
  } else {
    // Create a new document and import the node
    const doc = document.implementation.createDocument(null, null, null);
    const importedNode = doc.importNode(node, true);
    doc.appendChild(importedNode);
    return doc;
  }
}

export function setSvgDisplayAttributes(node: Node, maxHeight: string = '16rem'): Node {
  // Find the SVG element within the node
  let svgElem: Element | null = null;
  if (node.nodeType === Node.DOCUMENT_NODE) {
    svgElem = (node as Document).documentElement;
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    svgElem = node as Element;
  }
  
  if (!svgElem || svgElem.tagName !== 'svg') {
    return node;
  }
  
  // Check if any changes are needed
  const currentPAR = svgElem.getAttribute('preserveAspectRatio');
  const currentStyle = svgElem.getAttribute('style') || '';
  const newStyle = `width:auto;height:auto;max-width:100%;max-height:${maxHeight};`;
  
  const needsPARUpdate = currentPAR !== 'xMidYMid meet';
  const needsStyleUpdate = !currentStyle.includes('width:auto') || 
                          !currentStyle.includes('height:auto') || 
                          !currentStyle.includes('max-width:100%') || 
                          !currentStyle.includes('max-height:100%') || 
                          !currentStyle.includes('border:1px solid black');
  
  // Parse viewBox to get width and height
  const viewBox = svgElem.getAttribute('viewBox');
  let width: number | null = null;
  let height: number | null = null;
  
  if (viewBox) {
    const parts = viewBox.split(/\s+/).map(Number);
    if (parts.length === 4 && !parts.some(isNaN)) {
      // viewBox format: "x y width height"
      width = parts[2];
      height = parts[3];
    }
  }
  
  const needsWidthUpdate = width !== null && svgElem.getAttribute('width') !== width.toString();
  const needsHeightUpdate = height !== null && svgElem.getAttribute('height') !== height.toString();
  
  if (!needsPARUpdate && !needsStyleUpdate && !needsWidthUpdate && !needsHeightUpdate) {
    return node;
  }
  
  // Clone the node only if changes are needed
  const clonedNode = node.cloneNode(true);
  let clonedSvgElem: Element | null = null;
  
  if (clonedNode.nodeType === Node.DOCUMENT_NODE) {
    clonedSvgElem = (clonedNode as Document).documentElement;
  } else if (clonedNode.nodeType === Node.ELEMENT_NODE) {
    clonedSvgElem = clonedNode as Element;
  }
  
  if (clonedSvgElem && clonedSvgElem.tagName === 'svg') {
    if (needsPARUpdate) {
      clonedSvgElem.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }
    if (needsStyleUpdate) {
      clonedSvgElem.setAttribute('style', newStyle + currentStyle);
    }
    if (needsWidthUpdate && width !== null) {
      clonedSvgElem.setAttribute('width', width.toString());
    }
    if (needsHeightUpdate && height !== null) {
      clonedSvgElem.setAttribute('height', height.toString());
    }
  }
  
  return clonedNode;
}

export async function updateSvgMetadataWithHash(doc: Document): Promise<Document> {
  // Remove metadata and get the removed element
  const { doc: modifiedDoc, metadata } = removeSvgMetadata(doc);
  
  // Compute hash of the document without metadata
  const hash = await hashDocument(modifiedDoc);
  
  // If metadata was removed, update it with the hash and reinsert
  if (metadata) {
    setMetadataSourceHash(metadata, hash);
    const svg = modifiedDoc.documentElement;
    if (svg && svg.nodeName === 'svg') {
      svg.appendChild(metadata);
    }
  }
  
  return modifiedDoc;
}
