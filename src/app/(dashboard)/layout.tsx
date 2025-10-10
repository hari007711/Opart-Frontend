"use client";

import { StepProvider } from "@/contexts/stepContext";
import RestaurantSidebar from "@/components/SideBar/sideBar";
import StepIndicator from "@/components/TopBar/StepIndicator";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StepProvider>
      <div className="h-screen bg-gray-50 flex">
        <RestaurantSidebar />

        <div className="flex-1 flex flex-col p-2 bg-ui-secondary">
          <StepIndicator />

          <main className="flex-1 p-2 bg-white rounded-b-2xl overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </StepProvider>
  );
}
