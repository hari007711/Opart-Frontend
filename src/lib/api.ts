const BASE_URL = "https://znzyg110de.execute-api.us-east-1.amazonaws.com/prod";

export interface ForecastAPIResponse {
  posItemId: string;
  forecastedDate: string;
  forecastedQuantity: string;
  forecastGeneratedAt: string;
  forecastId: string;
  posItemName: string;
  category?: string;
}

interface PrepStatusUpdate {
  ingredientPrepForecastId: string;
  prepStatus: string;
  updatedBy: string;
}

interface OnHandQuantity {
  onHandQuantity: number;
  updatedBy: string;
}

interface OnExpiredQuantity {
  expiredQuantity: number;
  updatedBy: string;
}

export interface Inventory {
  onHandQuantity: number;
  unit: string;
  expiredQuantity: number;
  lastUpdated: string;
}

export interface ForecastByDaypart {
  daypart: string;
  forecastQuantity: number;
  unit: string;
}

export interface IngredientDetailResponse {
  ingredientId: string;
  ingredientName: string;
  prepStatus: "to-prep" | "available" | string;
  inventory: Inventory;
  forecastByDaypart: ForecastByDaypart[];
  category?: string;
}

interface PrintLabelPayload {
  ingredientPrepForecastId: string;
}

export interface PrintLabelResponse {
  message: string;
  ingredientName: string;
  prepTime: string;
  expiryTime: string;
  prepIntervalHours: number;
  updatedAt: string;
}

interface MultiplePrintLabelPayload {
  ingredientPrepForecastIds: string[];
}

export interface MultiplePrintLabelResponse {
  message: string;
  totalRequested: number;
  totalSuccessful: number;
  totalFailed: number;
  labels: Array<{
    ingredientPrepForecastId: string;
    ingredientName: string;
    prepTime: string;
    expiryTime: string;
    prepIntervalHours: number;
    success: boolean;
    error?: string;
  }>;
  updatedAt: string;
}

export const api = {
  ForecastApi: async (date: string) => {
    const response = await fetch(`${BASE_URL}/forecasts/${date}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    const result = await response.json();

    return result || [];
  },

  ApprovedForecastApi: async (date: string) => {
    const response = await fetch(`${BASE_URL}/approved-forecasts/${date}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    const result = await response.json();

    return result || [];
  },

  ForecastItemApi: async (id: string) => {
    const response = await fetch(`${BASE_URL}/item-forecasts/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    const result = await response.json();

    return result || [];
  },

  ImmediateItems: async (date: string) => {
    const response = await fetch(`${BASE_URL}/ingredient-forecasts/${date}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    const result = await response.json();

    return result || [];
  },

  PrepStatus: async (payload: PrepStatusUpdate) => {
    const url = `${BASE_URL}/prep-status`;
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to update prep status: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  },

  OnHand: async (payload: OnHandQuantity, id: string) => {
    const url = `${BASE_URL}/ingredient-detail/${id}/on-hand`;
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to update prep status: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  },

  OnExpired: async (payload: OnExpiredQuantity, id: string) => {
    const url = `${BASE_URL}/ingredient-detail/${id}/expired`;
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to update prep status: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  },

  IngredientDetails: async (
    id: string,
    date: string
  ): Promise<IngredientDetailResponse> => {
    const response = await fetch(
      `${BASE_URL}/ingredient-detail/${id}?date=${date}`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ingredient detail: ${response.statusText}`
      );
    }

    const result: IngredientDetailResponse = await response.json();
    return result;
  },

  DeleteExpired: async (
    id: string
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await fetch(
      `${BASE_URL}/ingredient-detail/${id}/expired`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to delete expired ingredient: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result || { success: true };
  },

  InventoryCnt: async () => {
    const response = await fetch(`${BASE_URL}/stock-counting`);

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    const result = await response.json();

    return result || [];
  },

  WeeklyInventoryCnt: async (
    startDate: string,
    endDate: string,
    storageLocation?: string,
    category?: string
  ) => {
    const params = new URLSearchParams();
    params.append("startDate", startDate);
    params.append("endDate", endDate);

    if (storageLocation && storageLocation.trim() !== "") {
      params.append("storageLocation", storageLocation);
    }
    if (category && category.trim() !== "") {
      params.append("category", category);
    }
    const apiUrl = `${BASE_URL}/stock-counting/weekly?${params.toString()}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch weekly inventory: ${response.statusText}`
      );
    }
    const result = await response.json();

    return result || [];
  },

  InventoryOrder: async () => {
    const response = await fetch(`${BASE_URL}/inventory/stock-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    const result = await response.json();

    return result || [];
  },

  SearchItems: async (search: string) => {
    const response = await fetch(`${BASE_URL}/search?q=${search}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    const result = await response.json();

    return result || [];
  },

  PrintLabel: async (
    payload: PrintLabelPayload
  ): Promise<PrintLabelResponse> => {
    const url = `${BASE_URL}/print-label`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to print label: ${response.statusText}`);
    }

    const result: PrintLabelResponse = await response.json();
    return result;
  },
  PrintItems: async (date: string) => {
    const response = await fetch(`${BASE_URL}/print-label-items/${date}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    const result = await response.json();

    return result || [];
  },

  MultiplePrintLabel: async (
    payload: MultiplePrintLabelPayload
  ): Promise<MultiplePrintLabelResponse> => {
    const url = `${BASE_URL}/print-labels`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to print labels: ${response.statusText}`);
    }

    const result: MultiplePrintLabelResponse = await response.json();
    return result;
  },
};
