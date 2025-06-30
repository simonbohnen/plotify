"use client";

import { ArtworkTemplate, ArtworkStep } from "@/lib/artwork-template";
import { ArtworkTemplateScreen } from "@/components/artwork-template-screen";
import BoundingBox from "@/components/screen/bounding-box";
import { ImageUpload } from "@/components/screen/image-upload";
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
  
  const vectorizationStep: ArtworkStep = {
    name: "Vectorization",
    description: "Convert input into vector format for scalable processing",
    inputType: "none",
    outputType: "string",
    execute: async (input: any) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return "vectorized_output";
    }
  }
  
  const sampleTemplates = [
    new ArtworkTemplate("Abstract Expressionism", [
      vectorizationStep,
      {
        name: "Hatching",
        description: "Apply hatching patterns for texture and depth",
        inputType: "string",
        outputType: "string",
        execute: async (input: any) => {
          // Dummy execution - in real app this would call an API
          await new Promise(resolve => setTimeout(resolve, 1000));
          return "hatched_output";
        }
      }
    ]),
    new ArtworkTemplate("Impressionist Landscape", [
      vectorizationStep,
      {
        name: "Hatching",
        description: "Apply impressionist-style hatching",
        inputType: "string",
        outputType: "string",
        execute: async (input: any) => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return "impressionist_hatched";
        }
      }
    ]),
    new ArtworkTemplate("Modern Portrait", [
      vectorizationStep,
      {
        name: "Hatching",
        description: "Apply modern portrait hatching techniques",
        inputType: "string",
        outputType: "string",
        execute: async (input: any) => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return "modern_portrait_hatched";
        }
      }
    ]),
    new ArtworkTemplate("Surrealist Dreamscape", [
      vectorizationStep,
      {
        name: "Hatching",
        description: "Apply dreamlike hatching patterns",
        inputType: "string",
        outputType: "string",
        execute: async (input: any) => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return "dreamlike_hatched";
        }
      }
    ]),
    new ArtworkTemplate("Minimalist Composition", [
      vectorizationStep,
      {
        name: "Hatching",
        description: "Apply minimal hatching for subtle texture",
        inputType: "string",
        outputType: "string",
        execute: async (input: any) => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return "minimal_hatched";
        }
      }
    ]),
    new ArtworkTemplate("Pop Art Style", [
      vectorizationStep,
      {
        name: "Hatching",
        description: "Apply bold pop art hatching patterns",
        inputType: "string",
        outputType: "string",
        execute: async (input: any) => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return "pop_art_hatched";
        }
      }
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
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
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
