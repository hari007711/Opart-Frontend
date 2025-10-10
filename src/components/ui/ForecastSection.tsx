import React from "react";
import type { StaticImageData } from "next/image";
import ForecasttemCard from "./ForecastItemCard";

interface ForecastItemDisplay {
  id?: number;
  posItemName: string;
  forecastedQuantity: string;
  unit?: string;
  image?: StaticImageData | string;
  posItemId?: string;
  imageUrl?: string;
}

interface DayPart {
  dayPart: string;
  items: ForecastItemDisplay[];
}

interface ForecastSectionProps {
  title?: string;
  icon?: React.ReactNode;
  button?: React.ReactNode;
  items?: DayPart[];
}

export default function ForecastSection({
  icon,
  button,
  items = [],
}: ForecastSectionProps) {
  return (
    <section className="bg-ui-accent-light w-full h-full p-2 rounded-lg mb-4">
      <div className="my-4 ">
        {items.map((day, index) => (
          <div key={index} className=" gap-4">
            <header className="bg-ui-secondary-light mb-2 px-4 py-4 rounded-lg font-semibold text-xl flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg">
                {icon && <span>{icon}</span>}
                {day.dayPart}
              </h2>
              {button && <div>{button}</div>}
            </header>
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 md:grid-cols-2 gap-4 mb-2 h-200 overflow-x-auto">
              {day.items.map((item, i) => (
                <div key={i} className="p-2 rounded">
                  <ForecasttemCard
                    itemName={item.posItemName}
                    quantity={item.forecastedQuantity}
                    itemId={item.posItemId}
                    day={day.dayPart}
                    imageUrl={item.imageUrl}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
