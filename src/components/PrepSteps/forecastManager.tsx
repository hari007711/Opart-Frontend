import React, { useEffect, useState } from "react";
import ForecastSection from "../ui/ForecastSection";
import { api } from "@/lib/api";
import {
  useForecastStatusStore,
  useForecastStore,
} from "@/store/forecastStore";
import Dashboard from "../Inventory/Dashboard";

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
  dayPart: string;
}

interface DayPartForecast {
  dayPart: string;
  ingredients: IngredientForecast[];
}

interface ImmediateItemsResponse {
  date: string;
  forecasts: DayPartForecast[];
}

type ForecastSectionItem = {
  posItemName: string;
  ingredientName?: string;
  forecastedQuantity: string;
  unit?: string;
  imageUrl?: string;
  posItemId?: string;
  dayPart: string;
  category?: string;
};

type ForecastSectionDay = {
  dayPart: string;
  items: ForecastSectionItem[];
};

export default function ForecastManager() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dayParts, setDayParts] = useState<ForecastSectionDay[]>([]);
  const { forecastState } = useForecastStatusStore();
  const refreshTrigger = useForecastStore((state) => state.refreshTrigger);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // If approved (refreshTrigger > 0), use ApprovedForecastApi; otherwise ImmediateItems
        const isApproved = refreshTrigger > 0;
        const resp = isApproved
          ? await api.ApprovedForecastApi("2025-08-06")
          : await api.ImmediateItems("2025-08-06");

        const allIngredients: IngredientForecast[] = (
          (isApproved
            ? resp?.forecasts ?? []
            : resp?.forecasts ?? []) as DayPartForecast[]
        ).flatMap((f) => f.ingredients);

        const grouped: Record<string, ForecastSectionItem[]> = {};
        allIngredients.forEach((ing: IngredientForecast) => {
          const key = ing.dayPart;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push({
            posItemName: ing.ingredientName,
            ingredientName: ing.ingredientName,
            forecastedQuantity: String(ing.quantity),
            unit: ing.units,
            posItemId: ing.ingredientId,
            dayPart: ing.dayPart,
            category: ing.category,
          });
        });

        const order = [
          "Breakfast",
          "Lunch",
          "Afternoon",
          "Dinner",
          "Late Night",
        ];
        const result: ForecastSectionDay[] = [
          ...order
            .filter((p) => grouped[p] && grouped[p].length > 0)
            .map((p) => ({ dayPart: p, items: grouped[p] })),
          ...Object.keys(grouped)
            .filter((k) => !order.includes(k))
            .map((k) => ({ dayPart: k, items: grouped[k] })),
        ];

        setDayParts(result);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load immediate items");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p className="text-gray-600 text-lg font-medium">Loading...</p>
      </div>
    );
  }

  if (error) {
    return <div className="w-full h-fit p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="items-center">
      {forecastState == "modify" ? (
        <>
          <div className="flex justify-center p-3 bg-gray-100 rounded-xl mt-3">
            <h1 className="text-md text-gray-800">
              Off-Cycle items forecast will be displayed real-time
            </h1>
          </div>
          <div className="mt-4">
            <ForecastSection items={dayParts} />
          </div>
        </>
      ) : (
        <Dashboard />
      )}
    </div>
  );
}
