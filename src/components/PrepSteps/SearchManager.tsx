import PrepBatch3Hr from "@/assets/icons/prep-batch-3hr";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { StaticImageData } from "next/image";
import { useRefreshStore, useSearchStore } from "@/store/forecastStore";
import SearchSection, { SearchSectionItem } from "../ui/SearchSection";
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

interface SearchItemsResponse {
  date: string;
  forecasts: DayPartForecast[];
  message?: string;
}

interface SearchItems {
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

export default function SearchManager() {
  const [batchPrepItems, setBatchPrepItems] = useState<SearchItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noResultsMessage, setNoResultsMessage] = useState<string | null>(null);
  const { refreshKey } = useRefreshStore();
  const {
    searchTerm,
    recentSearches,
    addRecentSearch,
    // cacheSearchResult,
    getCachedResult,
  } = useSearchStore();
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [showRecentSearches, setShowRecentSearches] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  useEffect(() => {
    const fetchForecasts = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.trim() === "") {
        setShowRecentSearches(true);
        setLoading(false);
        return;
      }
      setShowRecentSearches(false);

      // Check cache first
      const cachedResult = getCachedResult(debouncedSearchTerm);
      if (cachedResult) {
        setBatchPrepItems(cachedResult.items);
        setNoResultsMessage(null);
        setError(null);
        setLoading(false);
        addRecentSearch(debouncedSearchTerm);
        return;
      }

      try {
        setLoading(true);
        addRecentSearch(debouncedSearchTerm);
        const response: SearchItemsResponse = await api.SearchItems(
          debouncedSearchTerm
        );

        // Check if no results found
        if (!response.forecasts || response.forecasts.length === 0) {
          setBatchPrepItems([]);
          setNoResultsMessage(response.message || "No results found");
          setError(null);
          setLoading(false);
          return;
        }

        const allIngredients = response.forecasts.flatMap(
          (forecast: DayPartForecast) => forecast.ingredients
        );
        const batchPrep: SearchItems[] = allIngredients.map(
          (item: IngredientForecast, index: number) => ({
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
          })
        );

        // Cache the successful result
        // cacheSearchResult(debouncedSearchTerm, batchPrep);

        setBatchPrepItems(batchPrep);
        setNoResultsMessage(null);
        setError(null);
      } catch (err) {
        setError("Failed to load ingredient forecasts");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchForecasts();
  }, [debouncedSearchTerm, refreshKey]);

  if (searchTerm && loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p className="text-gray-600 text-lg font-medium">Loading Items...</p>
      </div>
    );
  }

  if (error) {
    return <div className="w-full h-fit p-4 text-red-500">{error}</div>;
  }

  // Show no results message
  if (noResultsMessage && !showRecentSearches) {
    return (
      <div className="w-full h-fit p-6">
        <div className="flex flex-col items-center justify-center py-12">
          {/* <div className="text-gray-400 text-6xl mb-4">🔍</div> */}
          <p className="text-gray-700 text-xl font-semibold mb-2">
            {noResultsMessage}
          </p>
          {/* <p className="text-gray-500 text-sm">
            Try searching with a different keyword for "{debouncedSearchTerm}"
          </p> */}
        </div>
      </div>
    );
  }

  const itemsForPrepSection: SearchSectionItem[] = batchPrepItems.map(
    (item) => ({
      id: item.id,
      itemName: item.itemName,
      quantity: item.quantity,
      unit: item.unit,
      image: item.image as SearchSectionItem["image"],
      ingredientPrepForecastId: item.ingredientPrepForecastId,
      prepIntervalHours: item.prepIntervalHours,
      prepStatus: item.prepStatus,
      ingredientId: item.ingredientId,
    })
  );

  if (showRecentSearches) {
    return (
      <div className="w-full h-fit p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Searches
            </h2>
            {recentSearches.length > 0 && (
              <button
                onClick={() => {
                  const { clearRecentSearches } = useSearchStore.getState();
                  clearRecentSearches();
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          {recentSearches.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">🔍</div>
              <p className="text-gray-500 font-medium">No recent searches</p>
              <p className="text-gray-400 text-sm mt-1">
                Start searching to see your history here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentSearches.map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    const { setSearchTerm } = useSearchStore.getState();
                    setSearchTerm(item);
                  }}
                  className="bg-white border border-gray-300 rounded-lg p-3 cursor-pointer hover:bg-gray-50 hover:border-blue-500 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm">🕐</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-fit ">
      <div
        ref={scrollContainerRef}
        className="pr-18 h-175 overflow-y-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <SearchSection
          icon={<PrepBatch3Hr color="rgb(5, 12, 31)" height={26} />}
          items={itemsForPrepSection}
        />
      </div>
      <div className="absolute bg-[#dadee9] p-2 rounded-lg right-5 mt-1 top-[55%] transform -translate-y-1/2">
        <CustomScrollbar
          scrollContainerRef={scrollContainerRef}
          numberOfBoxes={4}
          dayParts={[
            "Off-cycle prep items",
            "Batch Prep Items",
            "24 Hours Prep Items",
            "Non-Food Items",
          ]}
          height={150}
        />
      </div>
    </div>
  );
}
