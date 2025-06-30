"use client";

import { ArtworkTemplate } from "@/components/artwork-template";
import BoundingBox from "@/components/bounding-box";
import { ImageUpload } from "@/components/image-upload";
import { WelcomeScreen } from "@/components/welcome-screen";

export default function Page() {
  const sampleTemplates = [
    new ArtworkTemplate("Abstract Expressionism"),
    new ArtworkTemplate("Impressionist Landscape"),
    new ArtworkTemplate("Modern Portrait"),
    new ArtworkTemplate("Surrealist Dreamscape"),
    new ArtworkTemplate("Minimalist Composition"),
    new ArtworkTemplate("Pop Art Style"),
  ];

  const handleArtworkTemplateSelect = (template: ArtworkTemplate) => {
    console.log("Selected artwork template:", template.name);
    // TODO: Handle template selection - navigate to creation page, etc.
  };

  return (
    <WelcomeScreen 
      artworkTemplates={sampleTemplates} 
      onArtworkTemplateSelect={handleArtworkTemplateSelect} 
    />
  );
}
