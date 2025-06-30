export type StepInputType = 'string' | 'png' | 'svg' | 'none';
export type StepOutputType = 'string' | 'png' | 'svg' | 'none';

export interface ArtworkStep {
  name: string;
  description: string;
  inputType: StepInputType;
  outputType: StepOutputType;
  execute: (input: any) => Promise<any>;
}

export class ArtworkTemplate {
  constructor(
    public name: string, 
    public steps: ArtworkStep[] = []
  ) {}
} 