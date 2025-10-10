import toast from "react-hot-toast";
import { create } from "zustand";

interface ForecastItem {
  posItemId: string;
  posItemName: string;
  forecastedQuantity: number;
  unit?: string;
  forecastId?: string;
  forecastGeneratedAt?: string;
  dayPart?: string;
}

interface ForecastState {
  modifiedBy: string;
  date: string;
  forecasts: Record<string, ForecastItem[]>;
  refreshTrigger: number;
  updateItem: (dayPart: string, item: ForecastItem) => void;
  approveForecasts: () => Promise<void>;
  triggerRefresh: () => void;
  setModifiedBy: (name: string) => void;
}

interface DayCountState {
  dayCount: string;
  setDayCount: (value: string) => void;
}

export const useDayCountStore = create<DayCountState>((set) => ({
  dayCount: "Daily Count",
  setDayCount: (value) => set({ dayCount: value }),
}));

interface InsightsState {
  insightsState: string;
  setInsightsState: (value: string) => void;
}

export const useInsightsStore = create<InsightsState>((set) => ({
  insightsState: "Yesterday",
  setInsightsState: (value) => set({ insightsState: value }),
}));

interface ForecastStatusState {
  forecastState: string;
  setForecastState: (value: string) => void;
}

export const useForecastStatusStore = create<ForecastStatusState>((set) => ({
  forecastState: "modify",
  setForecastState: (value) => set({ forecastState: value }),
}));

interface StatusState {
  status: string;
  setStatus: (value: string) => void;
}

export const useStatusStore = create<StatusState>((set) => ({
  status: "modify",
  setStatus: (value) => set({ status: value }),
}));

export const useForecastStore = create<ForecastState>((set, get) => ({
  modifiedBy: "unknown",
  // date: new Date().toISOString().split("T")[0],
  date: "2025-08-06",
  forecasts: {},
  refreshTrigger: 0,

  updateItem: (dayPart, item) =>
    set((state) => {
      const dayItems = state.forecasts[dayPart] || [];
      const updatedItems = dayItems.filter(
        (i) => i.posItemId !== item.posItemId
      );
      updatedItems.push(item);
      return {
        forecasts: {
          ...state.forecasts,
          [dayPart]: updatedItems,
        },
      };
    }),

  approveForecasts: async () => {
    const { date, modifiedBy, forecasts } = get();

    const body = {
      date,
      modifiedBy,
      forecasts: Object.keys(forecasts).map((dayPart) => ({
        dayPart,
        items: forecasts[dayPart],
      })),
    };

    try {
      const res = await fetch(
        "https://qb4rj4gqfe.execute-api.us-east-1.amazonaws.com/prod/approved-forecast",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      toast.success("Approved successfully");

      set((state) => ({ refreshTrigger: state.refreshTrigger + 1 }));
    } catch (err) {
      console.error("Error approving:", err);
    }
  },

  triggerRefresh: () =>
    set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),

  setModifiedBy: (name: string) => set({ modifiedBy: name }),
}));

interface RefreshStore {
  refreshKey: number;
  triggerRefresh: () => void;
}

export const useRefreshStore = create<RefreshStore>((set) => ({
  refreshKey: 0,
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
}));

interface QuantityData {
  boxes: number;
  bags: number;
  each: number;
}

interface PendingUpdateValue {
  remainingQuantity: QuantityData;
  updatedBy: string;
}

interface InventoryStore {
  pendingUpdates: Map<string, PendingUpdateValue>;
  addPendingUpdate: (
    ingredientId: string,
    quantity: QuantityData,
    updatedBy: string
  ) => void;
  clearPendingUpdates: () => void;
  saveAllUpdates: () => Promise<void>;
  isSaving: boolean;
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  pendingUpdates: new Map(),
  isSaving: false,

  addPendingUpdate: (
    ingredientId: string,
    quantity: QuantityData,
    updatedBy: string
  ) => {
    set((state) => {
      const newUpdates = new Map(state.pendingUpdates);
      newUpdates.set(ingredientId, {
        remainingQuantity: quantity,
        updatedBy: updatedBy,
      });

      return { pendingUpdates: newUpdates };
    });
  },

  saveAllUpdates: async () => {
    const { pendingUpdates } = get();

    if (pendingUpdates.size === 0) {
      return;
    }

    set({ isSaving: true });

    try {
      const updatePromises = Array.from(pendingUpdates.entries()).map(
        ([ingredientId, updateData]) => {
          const { remainingQuantity, updatedBy } = updateData;

          return fetch(
            `https://qb4rj4gqfe.execute-api.us-east-1.amazonaws.com/prod/stock-counting/${ingredientId}/quantity`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                remainingQuantity: remainingQuantity,
                updatedBy: updatedBy,
                notes: "Physical count updated",
              }),
            }
          ).then((response) => {
            if (!response.ok) {
              throw new Error(`Failed to update ${ingredientId}`);
            }
            return response.json();
          });
        }
      );

      await Promise.all(updatePromises);
      get().clearPendingUpdates();
    } catch (error) {
      console.error("Error saving updates:", error);
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  clearPendingUpdates: () => {
    set({ pendingUpdates: new Map() });
  },
}));

interface SearchState {
  searchTerm: string;
  recentSearches: string[];
  setSearchTerm: (value: string) => void;
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  searchTerm: "",
  recentSearches:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("recentSearches") || "[]")
      : [],

  setSearchTerm: (value) => set({ searchTerm: value }),

  addRecentSearch: (term) => {
    if (!term || term.trim() === "") return;

    const { recentSearches } = get();
    const trimmedTerm = term.trim();

    const updatedSearches = [
      trimmedTerm,
      ...recentSearches.filter((s) => s !== trimmedTerm),
    ].slice(0, 10);

    set({ recentSearches: updatedSearches });

    if (typeof window !== "undefined") {
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    }
  },

  clearRecentSearches: () => {
    set({ recentSearches: [] });
    if (typeof window !== "undefined") {
      localStorage.removeItem("recentSearches");
    }
  },
}));

interface PrintLabelState {
  selectedItemsCount: number;
  setSelectedItemsCount: (count: number) => void;
}

export const usePrintLabelStore = create<PrintLabelState>((set) => ({
  selectedItemsCount: 0,
  setSelectedItemsCount: (count) => set({ selectedItemsCount: count }),
}));

interface LocationState {
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  selectedLocation: "",
  setSelectedLocation: (location) => set({ selectedLocation: location }),
}));
