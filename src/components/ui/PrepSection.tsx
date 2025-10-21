import React, { useMemo, useState } from "react";
import PrepItemCard from "./PrepItemCard";
import type { StaticImageData } from "next/image";
import { Button } from "./Button";
import TimerPrepIcon from "@/assets/icons/TimerPrepIcon";

export interface PrepSectionItem {
  id: number;
  itemName: string;
  quantity: number;
  unit: string;
  image: StaticImageData | string;
  ingredientPrepForecastId: string;
  prepIntervalHours: number;
  prepStatus: string;
  ingredientId: string;
  category: string;
}

interface PrepSectionProps {
  title?: string;
  icon?: React.ReactNode;
  button?: React.ReactNode;
  items?: PrepSectionItem[];
}

export default function PrepSection({
  title,
  icon,
  button,
  items = [],
}: PrepSectionProps) {
  const [prepAllCounter, setPrepAllCounter] = useState(0);
  const hasBatchPrepItems = items.some(
    (item) => item.category === "Batch Prep Items"
  );
  const batchItemIds = useMemo(
    () =>
      items
        .filter((i) => i.category === "Batch Prep Items")
        .map((i) => i.ingredientId),
    [items]
  );
  return (
    <section className="bg-ui-accent-light w-full h-full p-2 rounded-lg mb-4">
      {title && (
        <div className="flex items-center gap-2 ">
          <header className="bg-ui-secondary-light w-full px-2 py-4 rounded-lg font-semibold text-xl flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg">
              {icon && <span>{icon}</span>}
              {title}
            </h2>

            {/* {button && <div>{button}</div>} */}
          </header>
          {hasBatchPrepItems && (
            <div className="w-55 p-2 bg-[#1e3778] rounded-lg flex items-center">
              <TimerPrepIcon color="white" width={30} height={30} />

              <Button
                className="py-5 px-2 bg-[#1e3778] hover:bg-[#1e3778] text-lg font-bold text-white"
                onClick={() => setPrepAllCounter((c) => c + 1)}
              >
                Prep All Items
              </Button>
            </div>
          )}
        </div>
      )}
      {items.length > 0 ? (
        <div className="my-4 grid grid-cols-1 md:grid-cols-2 [@media(min-width:1366px)]:grid-cols-2 [@media(min-width:1440px)]:grid-cols-3 gap-4">
          {items.map((item) => (
            <PrepItemCard
              key={item.id}
              itemName={item.itemName}
              quantity={item.quantity}
              unit={item.unit}
              image={item.image}
              ingredientPrepForecastId={item.ingredientPrepForecastId}
              prepIntervalHours={item.prepIntervalHours}
              prepStatus={item.prepStatus}
              ingredientId={item.ingredientId}
              category={item.category}
              prepAllSignal={prepAllCounter}
            />
          ))}
        </div>
      ) : (
        <div className="w-full flex items-center justify-center py-4">
          No Items Found
        </div>
      )}
    </section>
  );
}
