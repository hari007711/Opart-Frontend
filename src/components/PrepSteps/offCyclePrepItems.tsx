import PrepSection, { PrepSectionItem } from "../ui/PrepSection";
import PrepBatch1Hr from "@/assets/icons/prep-batch-1hr";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { StaticImageData } from "next/image";
import { useForecastStore, useRefreshStore } from "@/store/forecastStore";
import CustomScrollbar from "../ui/CustomScrollbar";

interface IngredientForecast {
  ingredientPrepForecastId: string;
  forecastedDate: string;
  ingredientName: string;
  category: string;
  units: string;
  quantity: number;
  daypartQuantity: number;
  prepIntervalHours: number;
  isPrepItem: boolean;
  prepStatus: string;
  ingredientId: string;
}

interface DayPartForecast {
  dayPart: string;
  ingredients: IngredientForecast[];
}

interface ImmediateItemsResponse {
  date: string;
  forecasts: DayPartForecast[];
}

interface OffCycleItem {
  id: number;
  itemName: string;
  quantity: number;
  unit: string;
  image: StaticImageData | string | null;
  ingredientPrepForecastId: string;
  prepIntervalHours: number;
  forecastedDate: string;
  category: string;
  daypartQuantity: number;
  isPrepItem: boolean;
  prepStatus: string;
  status: "available" | "unAvailable";
  ingredientId: string;
}

export default function OffCyclePrepItems() {
  const [offCycleItems, setOffCycleItems] = useState<OffCycleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshKey } = useRefreshStore();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const refreshTrigger = useForecastStore((state) => state.refreshTrigger);

  useEffect(() => {
    const fetchForecasts = async () => {
      try {
        setLoading(true);
        const isApproved = refreshTrigger > 0;
        const resp = isApproved
          ? await api.ApprovedForecastApi("2025-08-06")
          : await api.ImmediateItems("2025-08-06");
        const allIngredients = (resp.forecasts || []).flatMap(
          (forecast: DayPartForecast) => forecast.ingredients
        );

        const offCycle: OffCycleItem[] = allIngredients
          .filter(
            (item: IngredientForecast) => item.category === "Batch Prep Items"
          )
          .map((item: IngredientForecast, index: number) => ({
            id: index + 1,
            itemName: item.ingredientName,
            quantity: item.quantity,
            unit: item.units,
            image: null,
            status: item.prepStatus === "to-prep" ? "unAvailable" : "available",
            ingredientPrepForecastId: item.ingredientPrepForecastId,
            forecastedDate: item.forecastedDate,
            category: item.category,
            daypartQuantity: item.daypartQuantity,
            prepIntervalHours: item.prepIntervalHours,
            isPrepItem: item.isPrepItem,
            prepStatus: item.prepStatus,
            ingredientId: item.ingredientId,
          }));

        setOffCycleItems(offCycle);
        setError(null);
      } catch (err) {
        setError("Failed to load ingredient forecasts");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchForecasts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p className="text-gray-600 text-lg font-medium">Loading Items...</p>
      </div>
    );
  }

  if (error) {
    return <div className="w-full h-fit p-4 text-red-500">{error}</div>;
  }

  const itemsForPrepSection: PrepSectionItem[] = offCycleItems.map((item) => ({
    id: item.id,
    itemName: item.itemName,
    quantity: item.quantity,
    unit: item.unit,
    image: item.image as PrepSectionItem["image"],
    ingredientPrepForecastId: item.ingredientPrepForecastId,
    prepIntervalHours: item.prepIntervalHours,
    prepStatus: item.prepStatus,
    ingredientId: item.ingredientId,
    category: item.category,
  }));

  return (
    <div className="w-full h-fit ">
      <div
        ref={scrollContainerRef}
        className="pr-18 h-175 overflow-y-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <PrepSection
          icon={<PrepBatch1Hr color="rgb(5, 12, 31)" height={26} />}
          items={itemsForPrepSection}
        />
      </div>
      <div className="absolute bg-[#dadee9] p-2 rounded-lg right-5 mt-1 top-[54%] transform -translate-y-1/2">
        <CustomScrollbar
          scrollContainerRef={scrollContainerRef}
          numberOfBoxes={3}
          dayParts={[
            "Off-cycle prep items",
            "Batch Prep Items",
            "24 Hours Prep Items",
          ]}
          height={205}
        />
      </div>
    </div>
  );
}
