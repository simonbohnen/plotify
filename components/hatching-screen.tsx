"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScreenState } from "@/lib/types";
import { useEffect } from "react";

interface HatchingScreenProps {
    input: string;
    output?: any;
    state: ScreenState;
    setStepState: (state: ScreenState) => void;
}

export const HatchingScreen = ({
    input,
    output,
    state,
    setStepState
}: HatchingScreenProps) => {
    useEffect(() => {
        setStepState(ScreenState.READY_TO_EXECUTE);
    }, []);

    return (
        <motion.div
            key="hatching-screen"
            className="w-full"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ delay: 0.1, duration: 0.2 }}
        >
            <div className="flex flex-col gap-6">
                {/* Content */}
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">Step Overview</h2>
                        <p className="text-muted-foreground mb-4">
                            This step applies hatching patterns to create texture and depth. Hatching uses parallel lines
                            at varying densities to simulate shading and form in your artwork.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium mb-2">Input Received:</h3>
                                <div className="bg-muted rounded-md p-3 text-sm">
                                    {input || "No input provided"}
                                </div>
                            </div>

                            {output && (
                                <div>
                                    <h3 className="font-medium mb-2">Output Generated:</h3>
                                    <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm">
                                        {output}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="font-medium mb-2">What this step does:</h3>
                                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                    <li>Analyzes vector shapes and forms</li>
                                    <li>Determines optimal hatching direction</li>
                                    <li>Applies parallel line patterns</li>
                                    <li>Creates depth through line density</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Dummy Progress */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h3 className="font-medium mb-3">Processing Status</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm">Vector analysis complete</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm">Hatching direction calculated</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${state === ScreenState.EXECUTED ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
                                <span className="text-sm">{state === ScreenState.EXECUTED ? 'Hatching complete' : 'Applying hatching patterns...'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${state === ScreenState.EXECUTED ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                <span className={`text-sm ${state === ScreenState.EXECUTED ? '' : 'text-muted-foreground'}`}>
                                    {state === ScreenState.EXECUTED ? 'Output ready' : 'Optimizing line density'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Hatching Preview */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h3 className="font-medium mb-3">Hatching Preview</h3>
                        <div className="bg-muted rounded-md p-4 h-32 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-2 bg-white rounded-md flex items-center justify-center">
                                    <div className="space-y-1">
                                        {[...Array(8)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="h-0.5 bg-gray-600"
                                                style={{ width: `${Math.random() * 40 + 20}px` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {state === ScreenState.EXECUTED ? 'Hatching pattern applied' : 'Hatching pattern preview'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}; 