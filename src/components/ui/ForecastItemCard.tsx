import { useEffect, useState } from "react";
import PlusIcon from "@/assets/icons/plusIcon";
import MinusIcon from "@/assets/icons/minusIcon";
import FallBackSvg from "@/assets/icons/fallBack";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import backIcon from "@/assets/images/back.svg";
import { ForecastResponse } from "@/types/forecast";
import { api } from "@/lib/api";
import { useForecastStore } from "@/store/forecastStore";

interface ForecasttemCardProps {
  itemName: string;
  quantity: string;
  unit?: string;
  image?: StaticImageData;
  itemId?: string;
  day?: string;
  imageUrl?: string;
}

type QuantitiesState = Record<string, number>;
type DayPartQuantities = Record<string, number>;

const ForecasttemCard: React.FC<ForecasttemCardProps> = ({
  itemName,
  quantity,
  unit,
  image,
  itemId,
  day,
}) => {
  const [currentQuantity, setCurrentQuantity] = useState<QuantitiesState>({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [changeCount, setChangeCount] = useState<Record<string, number>>({});
  const [dayPartQuantities, setDayPartQuantities] = useState<DayPartQuantities>(
    {}
  );
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { updateItem } = useForecastStore();

  useEffect(() => {
    if (itemId) {
      setCurrentQuantity({ [itemId]: Number(quantity) || 0 });
    }
  }, [itemId, quantity]);

  useEffect(() => {
    if (data?.dayPartForecasts) {
      const initialQuantities: DayPartQuantities = {};
      let total = 0;
      data.dayPartForecasts.forEach((item) => {
        const qty = item.forecastedQuantity || 0;
        initialQuantities[item.dayPart] = qty;
        total += qty;
      });

      setDayPartQuantities(initialQuantities);
      setTotalQuantity(total);
    }
  }, [data]);

  const setModifiedBy = useForecastStore((state) => state.setModifiedBy);

  const getCurrentDayPart = (): string => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHour + currentMinutes / 60;

    if (currentTime < 10) {
      return "Breakfast";
    } else if (currentTime < 12) {
      return "Lunch";
    } else if (currentTime < 16) {
      return "Afternoon";
    } else if (currentTime < 21) {
      return "Dinner";
    } else {
      return "Late Night";
    }
  };

  const isEditingAllowed = (dayPart: string): boolean => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHour + currentMinutes / 60;

    switch (dayPart) {
      case "Breakfast":
        return currentTime < 10;

      case "Lunch":
        return currentTime < 12;

      case "Afternoon":
        return currentTime < 16;

      case "Dinner":
        return currentTime < 21;

      case "Late Night":
        return currentTime < 24;

      default:
        return true;
    }
  };

  const mainCardEdit = (dayPart: string): boolean => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHour + currentMinutes / 60;

    switch (dayPart) {
      case "Breakfast":
        return currentTime < 10;

      case "Lunch":
        return currentTime < 12;

      case "Afternoon":
        return currentTime < 16;

      case "Dinner":
        return currentTime < 21;

      case "Late Night":
        return currentTime < 24;

      default:
        return true;
    }
  };

  const handleIncrease = (
    id: string,
    e: React.MouseEvent,
    dayPart?: string,
    day?: string
  ) => {
    e.stopPropagation();

    const effectiveDayPart = dayPart || getCurrentDayPart();

    if (dayPart) {
      if (!isEditingAllowed(dayPart)) {
        return;
      }

      setDayPartQuantities((prev) => {
        const newQuantities = {
          ...prev,
          [dayPart]: (prev[dayPart] || 0) + 1,
        };
        return newQuantities;
      });

      updateItem(dayPart, {
        posItemId: id,
        posItemName: itemName,
        forecastedQuantity: (dayPartQuantities[dayPart] || 0) + 1,
        forecastId: "forecast-" + id,
        forecastGeneratedAt: new Date().toISOString(),
        unit,
        dayPart,
      });
    } else {
      if (!mainCardEdit(effectiveDayPart)) {
        return;
      }
      const newQty = (currentQuantity[id] || 0) + 1;
      setCurrentQuantity((prev) => ({ ...prev, [id]: newQty }));
      setChangeCount((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));

      updateItem(day!, {
        posItemId: id,
        posItemName: itemName,
        forecastedQuantity: newQty,
        forecastId: "forecast-" + id,
        forecastGeneratedAt: new Date().toISOString(),
        unit,
        dayPart: day,
      });
    }
  };

  const handleDecrease = (
    id: string,
    e: React.MouseEvent,
    dayPart?: string,
    day?: string
  ) => {
    e.stopPropagation();

    const effectiveDayPart = dayPart || getCurrentDayPart();

    if (dayPart) {
      if (!isEditingAllowed(dayPart)) {
        return;
      }
      setDayPartQuantities((prev) => {
        const newQuantities = {
          ...prev,
          [dayPart]: Math.max((prev[dayPart] || 0) - 1, 0),
        };
        return newQuantities;
      });

      updateItem(dayPart, {
        posItemId: id,
        posItemName: itemName,
        forecastedQuantity: Math.max((dayPartQuantities[dayPart] || 0) - 1, 0),
        forecastId: "forecast-" + id,
        forecastGeneratedAt: new Date().toISOString(),
        unit,
        dayPart,
      });
    } else {
      if (!mainCardEdit(effectiveDayPart)) {
        return;
      }
      const newQty = Math.max((currentQuantity[id] || 0) - 1, 0);
      setCurrentQuantity((prev) => ({ ...prev, [id]: newQty }));
      setChangeCount((prev) => ({ ...prev, [id]: (prev[id] ?? 0) - 1 }));

      updateItem(day!, {
        posItemId: id,
        posItemName: itemName,
        forecastedQuantity: newQty,
        forecastId: "forecast-" + id,
        forecastGeneratedAt: new Date().toISOString(),
        unit,
        dayPart: day,
      });
    }
  };

  const handleDrawerOpen = (open: boolean) => {
    setIsDrawerOpen(open);
    if (open && itemId) {
      fetchData(itemId);
    }
  };

  const fetchData = async (id: string) => {
    try {
      setLoading(true);
      const result = await api.ForecastItemApi(id);
      setData(result);
    } catch (err) {
      console.error("Error fetching forecast:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("userName");
      if (name) setModifiedBy(name);
    }
  }, [setModifiedBy]);

  const mainEdit = mainCardEdit(day!);

  return (
    <>
      {itemName ? (
        <Drawer
          open={isDrawerOpen}
          onOpenChange={handleDrawerOpen}
          direction="right"
        >
          <DrawerTrigger asChild>
            <div className="bg-white rounded-md p-2 flex items-start shadow-sm border border-black flex items-center gap-4 w-95 cursor-pointer hover:shadow-md transition-shadow">
              <div className="w-19 h-19 bg-gray-100 rounded-sm  overflow-hidden">
                {image ? (
                  <Image
                    src={image}
                    alt={itemName}
                    width={100}
                    height={100}
                    className="rounded-sm object-cover"
                  />
                ) : (
                  <FallBackSvg />
                )}
              </div>
              <div className="flex flex-col gap-inherit ">
                <div className="flex items-center justify-between w-full gap-2">
                  <h3
                    title={itemName}
                    className="font-medium text-gray-900 w-60 text-base truncate text-left"
                  >
                    {itemName}
                  </h3>

                  {changeCount[itemId!] !== undefined && (
                    <div className="text-xs font-semibold text-right py-1 px-2 bg-yellow-500 rounded-md text-yellow-800 cursor-default">
                      {changeCount[itemId!] > 0
                        ? `+${changeCount[itemId!]}`
                        : changeCount[itemId!]}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={(e) => handleDecrease(itemId!, e, "", day)}
                    disabled={!mainEdit}
                    className={`w-8 h-8 rounded-md p-2 flex items-center justify-center transition-colors ${
                      mainEdit
                        ? "bg-gray-200 hover:bg-gray-300 text-gray-600 cursor-pointer"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <MinusIcon />
                  </button>

                  <div className="bg-white border border-gray-400 rounded-md p-1 min-w-[90px] text-center shadow-inner">
                    <span className="text-md text-black font-semibold">
                      {currentQuantity[itemId!] ?? 0}
                      <span className="font-medium text-xs"> {unit}</span>
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleIncrease(itemId!, e, "", day)}
                    disabled={!mainEdit}
                    className={`w-8 h-8 p-2 rounded-md flex items-center justify-center transition-colors ${
                      mainEdit
                        ? "bg-gray-200 hover:bg-gray-300 text-gray-600 cursor-pointer"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <PlusIcon />
                  </button>
                </div>
              </div>
            </div>
          </DrawerTrigger>
          <DrawerContent className="max-h-screen mt-0 bg-[#4c6096] border-[#4c6096] !w-[550px] sm:!max-w-[550px] overflow-x-hidden">
            <div className="mx-auto w-full ">
              <DrawerHeader>
                <DrawerTitle className="flex items-center gap-6 bg-white rounded-lg py-2 px-5">
                  <DrawerClose asChild>
                    <Image
                      src={backIcon}
                      alt={"back"}
                      width={30}
                      height={30}
                      className="rounded cursor-pointer"
                    />
                  </DrawerClose>
                  <div className="w-15 h-15 bg-gray-100 rounded-sm flex-shrink-0 overflow-hidden">
                    {image ? (
                      <Image
                        src={image?.src}
                        alt={itemName}
                        width={image?.width}
                        height={image?.height}
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <FallBackSvg />
                    )}
                  </div>
                  <span className="text-xl">{itemName}</span>
                </DrawerTitle>
              </DrawerHeader>
              <div className="p-4 pb-0 space-y-4 ">
                <div className="py-20 px-3 border  rounded-lg border-gray-300 bg-[#FAFAFA]">
                  <div className="flex gap-4 items-center p-5 rounded-lg border border-gray-200 bg-white">
                    <h6 className="font-semibold">Total Forecast Quantity</h6>

                    <div className="bg-white border border-gray-400 rounded-md p-1 w-60 text-center shadow-inner">
                      <span className="text-md text-black font-semibold">
                        {totalQuantity ?? 0}
                        <span className="font-medium text-xs"> {unit}</span>
                      </span>
                    </div>
                  </div>
                </div>
                {loading ? (
                  <div className="h-50 flex items-center justify-center rounded-lg bg-[#FAFAFA] ">
                    Loading...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 bg-[#FAFAFA] p-2 rounded-lg">
                    {data?.dayPartForecasts?.map((item, i) => {
                      const canEdit = isEditingAllowed(item.dayPart);

                      return (
                        <div
                          key={i}
                          className="bg-[#FAFAFA] rounded-lg p-4 space-y-2 border border-gray-400"
                        >
                          <h4 className="font-semibold">{item.dayPart}</h4>
                          <div className="flex gap-4 items-center">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) =>
                                  handleDecrease(itemId!, e, item.dayPart)
                                }
                                disabled={!canEdit}
                                className={`w-12 h-12 rounded-md p-4 flex items-center justify-center transition-colors ${
                                  canEdit
                                    ? "bg-gray-200 hover:bg-gray-300 text-gray-600 cursor-pointer"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                }`}
                              >
                                <MinusIcon />
                              </button>

                              <div className="bg-white border border-gray-400 rounded-md p-3 min-w-[90px] text-center shadow-inner">
                                {dayPartQuantities[item.dayPart] ??
                                  item.forecastedQuantity ??
                                  0}
                              </div>

                              <button
                                onClick={(e) =>
                                  handleIncrease(itemId!, e, item.dayPart)
                                }
                                disabled={!canEdit}
                                className={`w-12 h-12 p-4 rounded-md flex items-center justify-center transition-colors ${
                                  canEdit
                                    ? "bg-gray-200 hover:bg-gray-300 text-gray-600 cursor-pointer"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                }`}
                              >
                                <PlusIcon />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <DrawerFooter></DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        "Loading..."
      )}
    </>
  );
};

export default ForecasttemCard;
