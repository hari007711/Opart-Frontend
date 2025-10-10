"use client";

import { useStep } from "@/contexts/stepContext";
import ImmediatePrepItems from "@/components/PrepSteps/immediatePrepItems";
import OffCyclePrepItems from "@/components/PrepSteps/offCyclePrepItems";
import BatchPrepItems from "@/components/PrepSteps/batchPrepItems";
import Hours24PrepItems from "@/components/PrepSteps/hours24PrepItems";
import ForecastManager from "@/components/PrepSteps/forecastManager";
import InventoryStockCount from "@/components/PrepSteps/inventoryStockCount";
import InventoryStockOrder from "@/components/PrepSteps/inventoryStockOrder";
import PrintLabel from "@/components/PrintLabels/PrintLabel";
import SearchItems from "@/components/Search/Search";

export default function HomePage() {
  const { currentStep } = useStep();

  const renderStepComponent = () => {
    switch (currentStep) {
      case 0:
        return <ImmediatePrepItems />;
      case 1:
        return <OffCyclePrepItems />;
      case 2:
        return <BatchPrepItems />;
      case 3:
        return <Hours24PrepItems />;
      case 4:
        return <ForecastManager />;
      case 5:
        return <InventoryStockCount />;
      case 6:
        return <InventoryStockOrder />;
      case 7:
        return <PrintLabel />;
      case 8:
        return <SearchItems />;
      default:
        return <ImmediatePrepItems />;
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto rounded-xl">
      {renderStepComponent()}
    </div>
  );
}
