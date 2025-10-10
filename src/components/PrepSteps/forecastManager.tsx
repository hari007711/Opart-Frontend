import React, { useEffect, useState } from "react";
import ForecastSection from "../ui/ForecastSection";
import { ForecastResponse } from "@/types/forecast";
import { api } from "@/lib/api";
import {
  useForecastStatusStore,
  useForecastStore,
} from "@/store/forecastStore";
import Dashboard from "../Inventory/Dashboard";

export default function ForecastManager() {
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { forecastState } = useForecastStatusStore();

  const refreshTrigger = useForecastStore((state) => state.refreshTrigger);
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await api.ForecastApi("2025-08-06");
      setData(result);
    } catch (err) {
      console.error("Error fetching forecast:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedData = async () => {
    setLoading(true);
    try {
      const result = await api.ApprovedForecastApi("2025-08-06");
      setData(result);
    } catch (err) {
      console.error("Error fetching forecast:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!refreshTrigger) {
      fetchData();
    }
  }, [refreshTrigger]);

  useEffect(() => {
    if (refreshTrigger) {
      fetchApprovedData();
    }
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p className="text-gray-600 text-lg font-medium">Loading...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p className="text-red-600 text-lg font-medium">
          Failed to load forecast data.
        </p>
      </div>
    );
  }

  return (
    <div className="items-center">
      {forecastState == "modify" ? (
        <>
          <div className="flex justify-center p-3 bg-gray-100 rounded-xl mt-3">
            <h1 className="text-md text-gray-800">
              Off-Cycle Items forecast will be displayed real-time
            </h1>
          </div>

          <div className="mt-4">
            <ForecastSection title="Breakfast" items={data.forecasts || []} />
          </div>
        </>
      ) : (
        <Dashboard />
      )}
    </div>
  );
}
