import { useEffect, useState } from "react";
import PrepBatch3Hr from "@/assets/icons/prep-batch-3hr";
import PrepSection, { PrepSectionItem } from "../ui/PrepSection";
import PrepBatch1Hr from "@/assets/icons/prep-batch-1hr";
import PrepBatch24Hr from "@/assets/icons/prep-batch-24";
import { api } from "@/lib/api";
import { StaticImageData } from "next/image";

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

interface DayPartForecast {
  dayPart: string;
  ingredients: IngredientForecast[];
}

interface ImmediateItemsResponse {
  date: string;
  forecasts: DayPartForecast[];
}

export default function ImmediatePrepItems() {
  const [offCycleItems, setOffCycleItems] = useState<OffCycleItem[]>([]);
  const [batchPrepItems, setBatchPrepItems] = useState<OffCycleItem[]>([]);
  const [twentyFourHourItems, setTwentyFourHourItems] = useState<
    OffCycleItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForecasts = async () => {
      try {
        setLoading(true);
        const response: ImmediateItemsResponse = await api.ImmediateItems(
          "2025-08-06"
        );
        const allIngredients = response.forecasts.flatMap(
          (forecast: DayPartForecast) => forecast.ingredients
        );

        const offCycle: OffCycleItem[] = allIngredients
          .filter(
            (item: IngredientForecast) =>
              item.category === "Off-cycle Fry Prep Items"
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

        const batchPrep: OffCycleItem[] = allIngredients
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

        const twentyFourHour: OffCycleItem[] = allIngredients
          .filter(
            (item: IngredientForecast) => item.category === "24-hours Items"
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
        setBatchPrepItems(batchPrep);
        setTwentyFourHourItems(twentyFourHour);
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

  const offCycle: PrepSectionItem[] = offCycleItems.map((item) => ({
    id: item.id,
    itemName: item.itemName,
    quantity: item.quantity,
    unit: item.unit,
    image: item.image as PrepSectionItem["image"],
    ingredientPrepForecastId: item.ingredientPrepForecastId,
    prepIntervalHours: item.prepIntervalHours,
    prepStatus: item.prepStatus,
    ingredientId: item.ingredientId,
  }));

  const batch: PrepSectionItem[] = batchPrepItems.map((item) => ({
    id: item.id,
    itemName: item.itemName,
    quantity: item.quantity,
    unit: item.unit,
    image: item.image as PrepSectionItem["image"],
    ingredientPrepForecastId: item.ingredientPrepForecastId,
    prepIntervalHours: item.prepIntervalHours,
    prepStatus: item.prepStatus,
    ingredientId: item.ingredientId,
  }));

  const twentyFour: PrepSectionItem[] = twentyFourHourItems.map((item) => ({
    id: item.id,
    itemName: item.itemName,
    quantity: item.quantity,
    unit: item.unit,
    image: item.image as PrepSectionItem["image"],
    ingredientPrepForecastId: item.ingredientPrepForecastId,
    prepIntervalHours: item.prepIntervalHours,
    prepStatus: item.prepStatus,
    ingredientId: item.ingredientId,
  }));

  return (
    <div className="w-full h-fit">
      <PrepSection
        title="Off-cycle prep items"
        icon={<PrepBatch1Hr color="rgb(5, 12, 31)" height={26} />}
        items={offCycle}
      />
      <PrepSection
        title="Batch Prep Items"
        icon={<PrepBatch3Hr color="rgb(5, 12, 31)" height={26} />}
        items={batch}
      />
      <PrepSection
        title="24 Hours Prep Items"
        icon={<PrepBatch24Hr color="rgb(5, 12, 31)" height={26} />}
        items={twentyFour}
      />
    </div>
  );
}
