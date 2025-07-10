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
