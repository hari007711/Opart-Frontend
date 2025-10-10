"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface Step {
  id: number;
  name: string;
}

interface StepContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  steps: Step[];
}

const StepContext = createContext<StepContextType | undefined>(undefined);

export function StepProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { id: 0, name: "Immediate Prep Items" },
    { id: 1, name: "Off-Cycle Prep Items" },
    { id: 2, name: "Batch Prep Items" },
    { id: 3, name: "24 Hours Prep Items" },
    { id: 4, name: "Today's Forecast" },
    { id: 5, name: "Inventory Count" },
    { id: 6, name: "Inventory Order" },
    { id: 7, name: "Print Labels" },
    { id: 8, name: "Search" },
  ];

  return (
    <StepContext.Provider value={{ currentStep, setCurrentStep, steps }}>
      {children}
    </StepContext.Provider>
  );
}

export function useStep() {
  const context = useContext(StepContext);
  if (context === undefined) {
    throw new Error("useStep must be used within a StepProvider");
  }
  return context;
}
