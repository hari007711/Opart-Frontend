import React, { useRef } from "react";
import type { StaticImageData } from "next/image";
import ForecasttemCard from "./ForecastItemCard";
import CustomScrollbar from "./CustomScrollbar";

interface ForecastItemDisplay {
  id?: number;
  posItemName: string;
  forecastedQuantity: string;
  unit?: string;
  image?: StaticImageData | string;
  posItemId?: string;
  imageUrl?: string;
  category?: string;
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
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Calculate total items for scrollbar
  const totalItems = items.reduce((sum, day) => sum + day.items.length, 0);

  return (
    <section className="bg-ui-accent-light w-full h-full p-2 rounded-lg mb-4 relative">
      <div
        ref={scrollContainerRef}
        className="my-4 pr-18 h-145 overflow-y-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((day, index) => (
          <div key={index} className="gap-4 mb-4" data-day-part={day.dayPart}>
            <header className="bg-ui-secondary-light mb-2 px-4 py-4 rounded-lg font-semibold text-xl flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg">
                {icon && <span>{icon}</span>}
                {day.dayPart}
              </h2>
              {button && <div>{button}</div>}
            </header>
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 md:grid-cols-2 gap-4 mb-2">
              {day.items.map((item, i) => (
                <div key={i} className="p-2 rounded">
                  <ForecasttemCard
                    itemName={item.posItemName}
                    quantity={item.forecastedQuantity}
                    unit={item.unit}
                    itemId={item.posItemId}
                    day={day.dayPart}
                    imageUrl={item.imageUrl}
                    category={item.category}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Scrollbar */}
      <div className="absolute bg-[#dadee9] p-2 rounded-lg right-2 top-1/2 transform -translate-y-1/2">
        <CustomScrollbar
          scrollContainerRef={scrollContainerRef}
          numberOfBoxes={5}
          dayParts={["Breakfast", "Lunch", "Afternoon", "Dinner", "Late Night"]}
          height={100}
        />
      </div>
    </section>
  );
}
