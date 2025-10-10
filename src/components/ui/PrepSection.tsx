import React from "react";
import PrepItemCard from "./PrepItemCard";
import type { StaticImageData } from "next/image";

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
  return (
    <section className="bg-ui-accent-light w-full h-full p-2 rounded-lg mb-4">
      {title && (
        <header className="bg-ui-secondary-light px-2 py-4 rounded-lg font-semibold text-xl flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg">
            {icon && <span>{icon}</span>}
            {title}
          </h2>
          {button && <div>{button}</div>}
        </header>
      )}

      <div className="my-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 xl:grid-cols-3 gap-4 ">
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
          />
        ))}
      </div>
    </section>
  );
}
