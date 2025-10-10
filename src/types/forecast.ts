import { StaticImageData } from "next/image";

export interface ForecastItem {
  posItemId: string;
  forecastedDate: string;
  forecastedQuantity: string;
  forecastGeneratedAt: string;
  forecastId: string;
  posItemName: string;
  image?: string | StaticImageData;
  unit?: string;
}

export interface ForecastDayPart {
  id: number;
  posItemName: string;
  forecastedQuantity: string;
  forecastedDate: string;
  dayPart:
    | "Breakfast"
    | "Lunch"
    | "Afternoon"
    | "Evening"
    | "Dinner"
    | "Late Night"
    | string;
  items: ForecastItem[];
}

export interface ForecastResponse {
  date: string;
  forecasts: ForecastDayPart[];
  dayPartForecasts: dayForecast[];
}

export interface dayForecast {
  dayPart: string;
  forecastedQuantity: number;
  posItemId?: string;
  posItemName?: string;
}
