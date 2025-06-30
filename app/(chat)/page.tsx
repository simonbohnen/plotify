"use client";

import { ArtworkTemplate } from "@/components/artwork-template";
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
    setIsDialogOpen(false); // Close the dialog when a template is selected
    // TODO: Handle template selection - navigate to creation page, etc.
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
              <DialogTitle>Choose an Artwork Template</DialogTitle>
            </DialogHeader>
            <WelcomeScreen 
              artworkTemplates={sampleTemplates} 
              onArtworkTemplateSelect={handleArtworkTemplateSelect} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
