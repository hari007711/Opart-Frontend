import { StaticImageData } from "next/image";
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
  category?: string;
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
    console.log(forecasts, "forecasts");

    // Flatten all items and group by their category field (not by the store key)
    const allItems = Object.values(forecasts).flat();
    const groupedByCategory: Record<
      string,
      Array<{
        ingredientId: string;
        ingredientName: string;
        quantity: number;
        modifiedIngredient: boolean;
      }>
    > = {};
    allItems.forEach((item) => {
      const categoryKey = item.category || "Uncategorized";
      if (!groupedByCategory[categoryKey]) groupedByCategory[categoryKey] = [];
      groupedByCategory[categoryKey].push({
        ingredientId: item.posItemId,
        ingredientName: item.posItemName,
        quantity: item.forecastedQuantity,
        modifiedIngredient: true,
      });
    });

    const body = {
      date,
      approvedBy: modifiedBy,
      forecasts: Object.keys(groupedByCategory).map((category) => ({
        category,
        ingredients: groupedByCategory[category],
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

interface CachedSearchResult {
  searchTerm: string;
  items: SearchItems[];
  timestamp: number;
}

interface SearchItems {
  id: number;
  itemName: string;
  quantity: number;
  unit: string;
  image: StaticImageData | string;
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

interface SearchState {
  searchTerm: string;
  recentSearches: string[];
  searchCache: Map<string, CachedSearchResult>;
  setSearchTerm: (value: string) => void;
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
  // cacheSearchResult: (searchTerm: string, items: SearchItems[]) => void;
  getCachedResult: (searchTerm: string) => CachedSearchResult | null;
  clearSearchCache: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  searchTerm: "",
  recentSearches:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("recentSearches") || "[]")
      : [],
  searchCache: new Map(),

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

  // cacheSearchResult: (searchTerm, items) => {
  //   const trimmedTerm = searchTerm.trim().toLowerCase();
  //   const cacheEntry: CachedSearchResult = {
  //     searchTerm: trimmedTerm,
  //     items,
  //     timestamp: Date.now(),
  //   };

  //   set((state) => {
  //     const newCache = new Map(state.searchCache);
  //     newCache.set(trimmedTerm, cacheEntry);

  //     // Limit cache size to 50 entries
  //     if (newCache.size > 50) {
  //       const firstKey = newCache.keys().next().value;
  //       newCache.delete(firstKey);
  //     }

  //     return { searchCache: newCache };
  //   });
  // },

  getCachedResult: (searchTerm) => {
    const trimmedTerm = searchTerm.trim().toLowerCase();
    const { searchCache } = get();
    const cached = searchCache.get(trimmedTerm);

    if (!cached) return null;

    // Check if cache is older than 5 minutes (300000 ms)
    const isStale = Date.now() - cached.timestamp > 300000;
    if (isStale) {
      set((state) => {
        const newCache = new Map(state.searchCache);
        newCache.delete(trimmedTerm);
        return { searchCache: newCache };
      });
      return null;
    }

    return cached;
  },

  clearSearchCache: () => {
    set({ searchCache: new Map() });
  },
}));

interface PrintLabelItem {
  id: string | number;
  name: string;
  labelCount: number;
  prepTime?: string;
  expiryTime?: string;
  prepIntervalHours?: number;
}

interface PrintLabelState {
  selectedItemsCount: number;
  selectedItems: PrintLabelItem[];
  showPreview: boolean;
  previewMeta?: {
    message?: string;
    totalRequested?: number;
    totalSuccessful?: number;
    totalFailed?: number;
    labels?: Array<{
      ingredientPrepForecastId: string;
      ingredientName: string;
      prepTime: string;
      expiryTime: string;
      prepIntervalHours: number;
      success?: boolean;
      error?: string;
    }>;
    updatedAt?: string;
  };
  setSelectedItemsCount: (count: number) => void;
  setSelectedItems: (items: PrintLabelItem[]) => void;
  setShowPreview: (show: boolean) => void;
  setPreviewMeta: (meta: PrintLabelState["previewMeta"]) => void;
}

export const usePrintLabelStore = create<PrintLabelState>((set) => ({
  selectedItemsCount: 0,
  selectedItems: [],
  showPreview: false,
  previewMeta: undefined,
  setSelectedItemsCount: (count) => set({ selectedItemsCount: count }),
  setSelectedItems: (items) => set({ selectedItems: items }),
  setShowPreview: (show) => set({ showPreview: show }),
  setPreviewMeta: (meta) => set({ previewMeta: meta }),
}));

interface LocationState {
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  selectedLocation: "",
  setSelectedLocation: (location) => set({ selectedLocation: location }),
}));
