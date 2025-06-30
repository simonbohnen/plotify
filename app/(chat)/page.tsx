"use client";

import { ArtworkTemplate } from "@/components/artwork-template";
import { ArtworkTemplateScreen } from "@/components/artwork-template-screen";
import BoundingBox from "@/components/bounding-box";
import { ImageUpload } from "@/components/image-upload";
import { WelcomeScreen } from "@/components/welcome-screen";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function Page() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ArtworkTemplate | null>(null);
  
  const sampleTemplates = [
    new ArtworkTemplate("Abstract Expressionism", [
      "Start with a blank canvas",
      "Apply bold, gestural brushstrokes",
      "Use vibrant, contrasting colors",
      "Add texture and depth with palette knife",
      "Express emotion through abstract forms"
    ]),
    new ArtworkTemplate("Impressionist Landscape", [
      "Sketch the basic landscape composition",
      "Apply loose, visible brushstrokes",
      "Use natural, outdoor lighting colors",
      "Capture the changing atmosphere",
      "Focus on light and color over detail"
    ]),
    new ArtworkTemplate("Modern Portrait", [
      "Draw the basic facial structure",
      "Block in major shadow areas",
      "Build up skin tones gradually",
      "Add expressive details to eyes",
      "Refine edges and add highlights"
    ]),
    new ArtworkTemplate("Surrealist Dreamscape", [
      "Create an impossible landscape",
      "Combine unrelated objects seamlessly",
      "Use dreamlike, symbolic imagery",
      "Apply smooth, realistic rendering",
      "Add mysterious lighting effects"
    ]),
    new ArtworkTemplate("Minimalist Composition", [
      "Start with geometric shapes",
      "Use limited color palette",
      "Focus on negative space",
      "Apply clean, precise lines",
      "Create visual balance and harmony"
    ]),
    new ArtworkTemplate("Pop Art Style", [
      "Choose bold, flat colors",
      "Use strong, graphic outlines",
      "Incorporate popular culture elements",
      "Apply Ben-Day dots or halftone patterns",
      "Create high contrast, vibrant composition"
    ]),
  ];

  const handleArtworkTemplateSelect = (template: ArtworkTemplate) => {
    console.log("Selected artwork template:", template.name);
    setSelectedTemplate(template);
  };

  const handleBackToTemplates = () => {
    setSelectedTemplate(null);
  };

  return (
    <div className="max-w-6xl mx-auto md:mt-20 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-8">Welcome to Plotify</h1>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Create beautiful artwork using AI-powered templates. Choose from a variety of styles to get started.
        </p>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="text-lg px-8 py-6">
              Choose Artwork Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedTemplate ? selectedTemplate.name : "Choose an Artwork Template"}
              </DialogTitle>
            </DialogHeader>
            {selectedTemplate ? (
              <ArtworkTemplateScreen 
                template={selectedTemplate} 
                onBack={handleBackToTemplates}
              />
            ) : (
              <WelcomeScreen 
                artworkTemplates={sampleTemplates} 
                onArtworkTemplateSelect={handleArtworkTemplateSelect} 
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
