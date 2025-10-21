import React, { useCallback, useEffect, useState } from "react";
import PlusIcon from "@/assets/icons/plusIcon";
import MinusIcon from "@/assets/icons/minusIcon";
import FallBackSvg from "@/assets/icons/fallBack";
import TimerPrepIcon from "@/assets/icons/TimerPrepIcon";
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
import checkImg from "@/assets/images/check.svg";
import editIcon from "@/assets/images/editIcon.svg";
import Temp from "@/assets/images/Temp.svg";

import deleteIcon from "@/assets/images/delete.svg";
import labelIcon from "@/assets/images/label.svg";
import labelIconBlacl from "@/assets/images/labelBlack.svg";

import bluetoothIcon from "@/assets/images/bluetooth.svg";
import backIcon from "@/assets/images/back.svg";
import { api, IngredientDetailResponse } from "@/lib/api";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Button } from "./Button";
import { Input } from "./input";
import { CommonDialog } from "../Dialog/CommonDialog";
import { usePrintLabelStore, useRefreshStore } from "@/store/forecastStore";
import PrintPreview from "../PrintLabels/PrintPreview";

interface PrepItemCardProps {
  itemName: string;
  quantity: number;
  unit: string;
  image: StaticImageData | string;
  ingredientPrepForecastId: string;
  prepIntervalHours: number;
  prepStatus: string;
  ingredientId: string;
  category: string;
  // When this counter changes, Batch Prep Items auto-start prep
  prepAllSignal?: number;
}

const PrepItemCard: React.FC<PrepItemCardProps> = ({
  itemName = "Item Name",
  quantity = 10,
  unit = "bags",
  image,
  ingredientPrepForecastId,
  prepIntervalHours,
  prepStatus,
  ingredientId,
  category,
  prepAllSignal,
}) => {
  const [currentQuantity, setCurrentQuantity] = useState(quantity);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [quantityHand, setQuantityHand] = useState(currentQuantity);
  const [showCheckImg, setShowCheckImg] = useState(false);
  const [hideTimerCompletely, setHideTimerCompletely] = useState(false);
  const [quantityExpired, setQuantityExpired] = useState<number>(0);
  const { triggerRefresh } = useRefreshStore();
  const { setShowPreview, setSelectedItems, setSelectedItemsCount } =
    usePrintLabelStore();

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentQuantity > 0) {
      setCurrentQuantity(currentQuantity - 1);
    }
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentQuantity(currentQuantity + 1);
  };

  const handleDecreasePrintCnt = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (labelsCnt > 0) {
      setLabelsCnt(labelsCnt - 1);
    }
  };

  const handleIncreasePrintCnt = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLabelsCnt(labelsCnt + 1);
  };

  const duration = 3;
  // const duration = prepIntervalHours * 60 * 60;

  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const handleTimerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("timer clickeed");

    if (timeLeft === null && !showCheckImg) {
      setTimeLeft(duration);
      setHideTimerCompletely(false);
    }
  };

  // Auto-start timers for Batch Prep Items when Prep All is clicked
  useEffect(() => {
    if (!prepAllSignal) return;
    if (category !== "Batch Prep Items") return;
    // Ensure status allows showing timer; if not, move to to-prep first
    const ensureToPrep = async () => {
      try {
        if (effectiveStatus !== "to-prep" && effectiveStatus !== "in-prep") {
          await PreparationStatus(
            ingredientPrepForecastId,
            updatedBy,
            "to-prep"
          );
        }
        if (
          timeLeft === null &&
          !showCheckImg &&
          effectiveStatus !== "check-temp"
        ) {
          setTimeLeft(duration);
          setHideTimerCompletely(false);
        }
      } catch (e) {
        console.error("Failed to start prep for item", e);
      }
    };
    void ensureToPrep();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prepAllSignal]);

  const handleCheckImgClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCheckImg(false);
    setTimeLeft(null);
    setHideTimerCompletely(true);
  };

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const isCompleted = timeLeft === 0;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercentage =
    timeLeft !== null && duration > 0
      ? ((duration - timeLeft) / duration) * 100
      : 0;

  const createCircularProgress = (percentage: number) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return { strokeDasharray, strokeDashoffset };
  };

  const { strokeDasharray, strokeDashoffset } =
    createCircularProgress(progressPercentage);

  const [prepRes, setPrepRes] = useState<string>("");
  const effectiveStatus = prepRes || prepStatus;

  const PreparationStatus = useCallback(
    async (
      ingredientPrepForecastId: string,
      updatedBy: string,
      status: string
    ) => {
      try {
        const payload = {
          ingredientPrepForecastId,
          prepStatus: status,
          updatedBy,
        };
        const response = await api.PrepStatus(payload);
        setPrepRes(response.prepStatus);
        // Refresh global consumers
        triggerRefresh();
        // Immediately refresh this card's ingredient details
        if (ingredientId) {
          try {
            const refreshed = await api.IngredientDetails(
              ingredientId,
              "2025-08-06"
            );
            setIngredientData(refreshed);
            setPrepRes(refreshed.prepStatus);
          } catch (e) {
            console.error("Failed to refresh ingredient details", e);
          }
        }
        return response;
      } catch (error) {
        console.error("Error updating preparation status:", error);
      }
    },
    [triggerRefresh, ingredientId]
  );

  const [updatedBy, setUpdatedBy] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("userName");
    setUpdatedBy(name!);
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && category !== "Batch Prep Items") {
      PreparationStatus(ingredientPrepForecastId, updatedBy, "print-label");
    } else if (
      timeLeft === 0 &&
      category == "Batch Prep Items" &&
      effectiveStatus !== "check-temp"
    ) {
      PreparationStatus(ingredientPrepForecastId, updatedBy, "check-temp");
    }
  }, [timeLeft, PreparationStatus, ingredientPrepForecastId, updatedBy]);

  const OnHandAPi = async (ingredientId: string) => {
    try {
      const payload = {
        onHandQuantity: quantityHand,
        updatedBy,
      };
      const response = await api.OnHand(payload, ingredientId);
      triggerRefresh();

      return response;
    } catch (error) {
      console.error("Error updating preparation status:", error);
    }
  };

  const OnExpiredApi = async (ingredientId: string) => {
    try {
      const payload = {
        expiredQuantity: quantityExpired,
        updatedBy,
      };
      const response = await api.OnExpired(payload, ingredientId);
      triggerRefresh();

      return response;
    } catch (error) {
      console.error("Error updating preparation status:", error);
    }
  };

  const shouldShowTimer =
    (effectiveStatus === "to-prep" || effectiveStatus === "in-prep") &&
    !hideTimerCompletely;
  const shouldShowTimerButton =
    shouldShowTimer ||
    timeLeft !== null ||
    showCheckImg ||
    effectiveStatus === "check-temp";

  const DeleteExpiredApi = async () => {
    try {
      const response = await api.DeleteExpired(ingredientId);
      return response;
    } catch (error) {
      console.error("Error updating preparation status:", error);
    }
  };

  const handleDrawerOpen = (open: boolean) => {
    setIsDrawerOpen(open);
    if (open && ingredientId) {
      fetchData(ingredientId);
    }
  };

  const [ingredientData, setIngredientData] =
    useState<IngredientDetailResponse | null>(null);

  const fetchData = async (id: string) => {
    try {
      const result = await api.IngredientDetails(id, "2025-08-06");
      setIngredientData(result);
    } catch (err) {
      console.error("Error fetching forecast:", err);
    } finally {
    }
  };

  const [labelsCnt, setLabelsCnt] = useState(1);

  // Format hours (can be fractional) into "X h · Y min" label
  const formatHoursToLabel = (hours: number) => {
    if (hours === undefined || hours === null || Number.isNaN(hours)) {
      return "-";
    }
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h} h · ${m} min`;
  };

  // Next-prep countdown and progress when item is available
  const nextPrepTotalSeconds = Math.max(
    0,
    Math.round((prepIntervalHours ?? 0) * 3600)
  );
  const [nextPrepSecondsLeft, setNextPrepSecondsLeft] =
    useState<number>(nextPrepTotalSeconds);

  useEffect(() => {
    // Reset when hours or status changes
    setNextPrepSecondsLeft(nextPrepTotalSeconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prepIntervalHours, effectiveStatus]);

  useEffect(() => {
    if (effectiveStatus !== "available") return;
    if (nextPrepTotalSeconds <= 0) return;

    const intervalId = setInterval(() => {
      setNextPrepSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveStatus, nextPrepTotalSeconds]);

  const nextPrepProgressPercent = nextPrepTotalSeconds
    ? ((nextPrepTotalSeconds - nextPrepSecondsLeft) / nextPrepTotalSeconds) *
      100
    : 0;

  const PrintLabelApi = async () => {
    try {
      const payload = {
        ingredientPrepForecastId: ingredientPrepForecastId,
      };
      const response = await api.PrintLabel(payload);

      // Prepare data for preview
      const labelsCount = Math.max(0, Number(labelsCnt) || 0);
      setSelectedItems([
        {
          id: ingredientPrepForecastId,
          name: response.ingredientName,
          labelCount: labelsCount,
          prepTime: response.prepTime,
          expiryTime: response.expiryTime,
          prepIntervalHours: response.prepIntervalHours,
        },
      ]);
      setSelectedItemsCount(labelsCount > 0 ? 1 : 0);

      // Store single item response as labels array for consistency
      usePrintLabelStore.getState().setPreviewMeta({
        message: response.message,
        totalRequested: 1,
        totalSuccessful: 1,
        totalFailed: 0,
        labels: [
          {
            ingredientPrepForecastId: ingredientPrepForecastId,
            ingredientName: response.ingredientName,
            prepTime: response.prepTime,
            expiryTime: response.expiryTime,
            prepIntervalHours: response.prepIntervalHours,
            success: true,
          },
        ],
        updatedAt: response.updatedAt,
      });

      setShowPreview(true);
    } catch (error) {
      console.error("Error printing label:", error);
    }
  };

  useEffect(() => {
    if (effectiveStatus == "print-label") {
      setShowCheckImg(true);
      // const timeout = setTimeout(() => {
      // setShowCheckImg(false);
      // setTimeLeft(null);
      // setHideTimerCompletely(true);
      // }, 2000);

      // return () => clearTimeout(timeout);
    }
  }, [effectiveStatus]);

  return (
    <Drawer
      open={isDrawerOpen}
      onOpenChange={handleDrawerOpen}
      direction="right"
    >
      <DrawerTrigger asChild>
        <div className="bg-white rounded-md p-2 shadow-sm border border-black flex items-center gap-4 w-fit cursor-pointer hover:shadow-md transition-shadow">
          <div className="w-19 h-19 bg-gray-100 rounded-sm flex-shrink-0 overflow-hidden">
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
          <div>
            <div className="flex-1 min-w-0">
              <h3
                title={itemName}
                className="font-medium text-gray-900 text-base mb-1 text-base truncate w-40"
              >
                {itemName}
              </h3>
              {timeLeft !== null && !isCompleted && (
                <p className="text-sm text-gray-600 mb-2">In Prep Cycle</p>
              )}
              {showCheckImg && (
                <p className="text-sm text-gray-600 mb-2">Prepared Quantity</p>
              )}
              {effectiveStatus === "check-temp" &&
                timeLeft === null &&
                !showCheckImg && (
                  <p className="text-sm text-gray-600 mb-2">
                    Check Temperature
                  </p>
                )}
              {effectiveStatus === "print-label" &&
                timeLeft === null &&
                !showCheckImg && (
                  <p className="text-sm text-gray-400 mb-2">Print Prep Label</p>
                )}
            </div>

            <div className="flex items-center gap-2">
              {shouldShowTimer ? (
                <button
                  onClick={handleDecrease}
                  className="w-8 h-8 rounded-md p-2 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors hover:cursor-pointer"
                >
                  <MinusIcon />
                </button>
              ) : (
                <div>
                  <p className="text-xs">
                    On-Hand <br /> Quantity
                  </p>
                </div>
              )}
              {shouldShowTimer || effectiveStatus == "check-temp" ? (
                <div
                  className={`bg-white min-w-27 ${
                    effectiveStatus == "check-temp" ? "w-32" : "w-28"
                  } text-base truncate border border-gray-400 rounded-md p-1 text-center shadow-inner`}
                  title={`${currentQuantity} ${unit}`}
                >
                  <span className="text-md text-black font-semibold">
                    {/* {currentQuantity} */}
                    {parseFloat(Number(currentQuantity).toFixed(2))}

                    <span className="font-medium text-xs"> {unit}</span>
                  </span>
                </div>
              ) : (
                <div
                  className={`bg-white ${
                    effectiveStatus == "print-label"
                      ? "w-33 min-w-30"
                      : timeLeft !== null
                      ? "w-33 min-w-30"
                      : effectiveStatus == "available"
                      ? "w-56.5 min-w-56.5"
                      : "w-56.5 min-w-56.5"
                  } text-base truncate border border-gray-400 rounded-md p-1 text-center shadow-inner`}
                  title={`${currentQuantity} ${unit}`}
                >
                  <span className="text-md text-black font-semibold">
                    {/* {currentQuantity} */}
                    {parseFloat(Number(currentQuantity).toFixed(2))}

                    <span className="font-medium text-xs"> {unit}</span>
                  </span>
                </div>
              )}

              {shouldShowTimer && (
                <button
                  onClick={handleIncrease}
                  className="w-8 h-8 p-2 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors hover:cursor-pointer"
                >
                  <PlusIcon />
                </button>
              )}
            </div>
          </div>

          {shouldShowTimerButton && (
            <button
              onClick={showCheckImg ? handleCheckImgClick : handleTimerClick}
              disabled={
                !shouldShowTimer &&
                !showCheckImg &&
                timeLeft === null &&
                effectiveStatus !== "check-temp"
              }
              className={`w-20 h-20 flex items-center justify-center relative transition-all ${
                showCheckImg
                  ? "bg-white border-2 border-green-800 rounded"
                  : timeLeft !== null && effectiveStatus !== "check-temp"
                  ? "bg-yellow-400 shadow-lg border-2 border-yellow-500 rounded-full"
                  : effectiveStatus == "check-temp"
                  ? "bg-yellow-500 shadow-lg border-2 border-black rounded"
                  : "bg-white hover:bg-gray-100 border-2 border-gray-200 shadow-xl rounded-sm"
              }`}
            >
              {timeLeft !== null &&
                !isCompleted &&
                effectiveStatus !== "check-temp" && (
                  <svg
                    className="absolute inset-0 w-full h-full -rotate-90"
                    viewBox="0 0 80 80"
                  >
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="white"
                      strokeWidth="7"
                      fill="none"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="#000"
                      strokeWidth="7"
                      fill="none"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                )}

              {/* <div className="relative z-10 hover:cursor-pointer">
                {showCheckImg ? (
                  <div className="w-14 h-14 rounded-full flex items-center justify-center">
                    <Image
                      src={checkImg}
                      alt={"Completed"}
                      width={150}
                      height={150}
                      className="rounded-sm object-cover"
                    />
                  </div>
                ) : timeLeft !== null && !isCompleted ? (
                  <div className="text-center">
                    <div
                      className="font-bold text-black text-lg leading-tight tracking-wider"
                      style={{
                        fontFamily: "system-ui, -apple-system, sans-serif",
                      }}
                    >
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                ) : shouldShowTimer ? (
                  <Image src={Temp} alt="Temp" width={20} height={20} />
                  {prepStatus=="check-temp"?:
                  <TimerPrepIcon />}
                ) : prepStatus === "check-temp" ? (
                  <Image src={Temp} alt="Temp" width={20} height={20} />
                ) : prepStatus === "print-label" ? (
                  <Image src={labelIcon} alt="Label" width={20} height={20} />
                ) : null}
              </div> */}
              <div className={`relative z-10 hover:cursor-pointer `}>
                {showCheckImg ? (
                  <div
                    onClick={() =>
                      PreparationStatus(
                        ingredientPrepForecastId,
                        updatedBy,
                        "available"
                      )
                    }
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                  >
                    <Image
                      src={checkImg}
                      alt="Completed"
                      width={150}
                      height={150}
                      className="rounded-sm object-cover"
                    />
                  </div>
                ) : timeLeft !== null &&
                  !isCompleted &&
                  effectiveStatus !== "check-temp" ? (
                  <div className="text-center">
                    <div
                      className="font-bold text-black text-lg leading-tight tracking-wider"
                      style={{
                        fontFamily: "system-ui, -apple-system, sans-serif",
                      }}
                    >
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                ) : effectiveStatus === "check-temp" ? (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      PreparationStatus(
                        ingredientPrepForecastId,
                        updatedBy,
                        "print-label"
                      );
                    }}
                  >
                    <Image src={Temp} alt="Temp" width={45} height={45} />
                  </div>
                ) : effectiveStatus === "print-label" ? (
                  <Image src={labelIcon} alt="Label" width={20} height={20} />
                ) : shouldShowTimer ? (
                  <TimerPrepIcon />
                ) : null}
              </div>
            </button>
          )}
        </div>
      </DrawerTrigger>

      <DrawerContent className="max-h-screen mt-0 bg-[#4c6096] border-[#4c6096] !w-[550px] sm:!max-w-[550px] overflow-x-hidden">
        <div className="mx-auto w-full ">
          <PrintPreview />
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-6 bg-white rounded-lg py-2 px-5">
              <DrawerClose asChild className="hover:cursor-pointer">
                <Image
                  src={backIcon}
                  alt={"back"}
                  width={30}
                  height={30}
                  className="rounded cursor-pointer"
                />
              </DrawerClose>

              {typeof image === "object" && image?.src ? (
                <Image
                  src={image}
                  alt={itemName}
                  width={image.width}
                  height={image.height}
                  className="w-12 h-12 rounded object-cover"
                />
              ) : typeof image === "string" ? (
                <Image
                  src={image}
                  alt={itemName}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded object-cover"
                />
              ) : (
                <div className="w-15 h-15 flex items-center justify-center">
                  <FallBackSvg />
                </div>
              )}

              <span className="text-xl">{itemName}</span>
            </DrawerTitle>
          </DrawerHeader>

          <div className="p-4 pb-0 space-y-4">
            <div className="w-full bg-gray-100 rounded-lg items-center p-2">
              {effectiveStatus && (
                <div
                  className={`p-2 w-full rounded-lg border font-semibold items-center justify-center flex ${
                    showCheckImg
                      ? "bg-yellow-400 border-green-800 rounded shadow-xl"
                      : timeLeft !== null ||
                        (effectiveStatus === "in-prep" && timeLeft == null)
                      ? "bg-yellow-400 text-black flex rounded-full border-yellow-500"
                      : effectiveStatus === "check-temp"
                      ? "bg-yellow-500 text-black flex rounded-full border-black"
                      : effectiveStatus === "available"
                      ? "bg-transparent text-black border-none flex justify-start"
                      : effectiveStatus === "print-label"
                      ? "bg-gray-400 text-gray-700 flex rounded border-gray-400"
                      : effectiveStatus === "to-prep"
                      ? "bg-[#ffede7] text-[#bd3001] flex rounded border-[#bd3001]"
                      : "bg-[#ffece6] items-center text-red-700 flex shadow-xl rounded-sm border-red-700"
                  }`}
                >
                  {showCheckImg
                    ? "In Prep Cycle"
                    : timeLeft !== null ||
                      (effectiveStatus === "in-prep" && timeLeft == null)
                    ? "In Prep Cycle"
                    : effectiveStatus === "check-temp"
                    ? "Check Temperature"
                    : effectiveStatus === "print-label"
                    ? "Print Prep Label"
                    : effectiveStatus == "available"
                    ? ""
                    : effectiveStatus === "to-prep"
                    ? "Item Unavailable"
                    : "Item Unavailable"}
                </div>
              )}
              {effectiveStatus === "available" && timeLeft == null && (
                <div className="flex items-center gap-3">
                  <span className="text-black font-semibold">Next prep in</span>
                  <div className="relative flex-1 h-10 rounded-lg border-2 border-green-800 overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-green-400"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, nextPrepProgressPercent)
                        )}%`,
                      }}
                    />
                    <div className="relative h-full w-full flex items-center justify-center font-semibold text-black">
                      {formatHoursToLabel(nextPrepSecondsLeft / 3600)}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-between bg-[#FAFAFA] mt-4 rounded-lg">
                <div className="p-3 border rounded-lg border-gray-300 bg-white">
                  <h6>On-Hand Quantity</h6>
                  <div className="flex justify-between mt-3 gap-4">
                    <div className="bg-white border border-gray-400 rounded-md p-1 min-w-[155px] text-center shadow-inner">
                      <span className="text-md text-black font-semibold">
                        {quantityHand}{" "}
                        <span className="font-medium text-xs">{unit}</span>
                      </span>
                    </div>

                    <CommonDialog
                      trigger={
                        <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                          <Image
                            src={editIcon}
                            alt="Edit"
                            width={35}
                            height={35}
                            className="p-2.5"
                          />
                        </div>
                      }
                      title="Update the On-Hand Quantity"
                      description="Please update the on-hand quantity for this item"
                      onConfirm={() => OnHandAPi(ingredientId)}
                      onCancel={() => console.log("Cancelled")}
                    >
                      <Input
                        type="number"
                        value={quantityHand}
                        onChange={(e) =>
                          setQuantityHand(Number(e.target.value))
                        }
                        className="text-center text-xl border border-gray-500 h-12 font-semibold"
                      />
                    </CommonDialog>
                  </div>
                </div>
                <div className="p-3 border rounded-lg border-gray-300 bg-[#FFFFFF]">
                  <h6>Expired Quantity</h6>
                  <div className="flex justify-between gap-4 mt-4">
                    <div className="bg-white border border-gray-400 rounded-md p-1 min-w-[130px] text-center shadow-inner">
                      <span className="text-md text-black font-semibold">
                        {quantityExpired}
                        <span className="font-medium text-xs"> {unit}</span>
                      </span>
                    </div>
                    <div className=" flex   gap-4 ">
                      <CommonDialog
                        trigger={
                          <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                            <Image
                              src={editIcon}
                              alt={"Completed"}
                              width={35}
                              height={35}
                              className="p-2.5"
                            />
                          </div>
                        }
                        title="Update the Expired Quantity"
                        description="Please update the expired quantity for this item"
                        onConfirm={() => OnExpiredApi(ingredientId)}
                        onCancel={() => console.log("Cancelled")}
                      >
                        <Input
                          type="number"
                          value={quantityExpired}
                          onChange={(e) =>
                            setQuantityExpired(Number(e.target.value))
                          }
                          className="text-center text-xl border border-gray-500 h-12 font-semibold"
                        />
                      </CommonDialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                            <Image
                              src={deleteIcon}
                              alt={"Completed"}
                              width={35}
                              height={35}
                              className="p-2.5"
                            />
                          </div>
                        </DialogTrigger>

                        <DialogContent
                          className="sm:max-w-md bg-[#4c6096] border-none"
                          showCloseButton={false}
                        >
                          <DialogHeader>
                            <DialogTitle className="text-xl text-white font-semibold">
                              Clear all Expired Items
                            </DialogTitle>
                          </DialogHeader>
                          <div className="bg-white rounded-lg p-3">
                            <div className="mb-4">
                              <h2 className="font-semibold text-lg">
                                Do you wish mark all expired items as cleared?
                              </h2>
                            </div>

                            <DialogFooter className="flex justify-between pl-2">
                              <DialogClose asChild>
                                <Button
                                  variant="outline"
                                  className="w-1/2 h-15 text-xl font-semibold border border-black"
                                >
                                  Cancel
                                </Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button
                                  onClick={DeleteExpiredApi}
                                  className="bg-red-700 w-1/2 h-15 text-xl font-semibold"
                                >
                                  Move to Bin
                                </Button>
                              </DialogClose>
                            </DialogFooter>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#FAFAFA] mt-4 rounded-lg ">
              <div className="p-3 border rounded-lg border-gray-300 bg-[#FFFFFF]  ">
                {effectiveStatus == "available" ? (
                  <h6>Prepare More</h6>
                ) : (
                  <h6>Prepare Quantity</h6>
                )}
                <div className="flex items-center gap-2 mt-4 justify-between">
                  <div className="flex items-center gap-2">
                    {(shouldShowTimer || effectiveStatus == "available") && (
                      <button
                        onClick={handleDecrease}
                        className="w-12 h-12 rounded-md p-4 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors hover:cursor-pointer"
                      >
                        <MinusIcon />
                      </button>
                    )}

                    <div
                      className="bg-white border border-gray-400 rounded-md p-3 h-12 min-w-[90px] text-center shadow-inner text-base truncate"
                      title={`${currentQuantity} ${unit}`}
                    >
                      <span className="text-md text-black font-semibold">
                        {/* {currentQuantity} */}
                        {parseFloat(Number(currentQuantity).toFixed(2))}

                        <span className="font-medium text-xs"> {unit}</span>
                      </span>
                    </div>
                    {(shouldShowTimer || effectiveStatus == "available") && (
                      <button
                        onClick={handleIncrease}
                        className="w-12 h-12 p-4 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors hover:cursor-pointer"
                      >
                        <PlusIcon />
                      </button>
                    )}
                  </div>
                  <div
                    className={`items-center px-5 ml-2 flex gap-2 justify-center w/full rounded-md hover:cursor-pointer ${
                      timeLeft !== null && effectiveStatus == "available"
                        ? "bg-yellow-400 w-full flex shadow-lg py-0 px-0 border-2 border-yellow-500 rounded-full"
                        : effectiveStatus === "available"
                        ? "bg-[#1E3678] w-full border-2 border-[#1E3678] rounded shadow-xl"
                        : timeLeft !== null && effectiveStatus !== "print-label"
                        ? "bg-yellow-400 w-full flex shadow-lg border-2 border-yellow-500 rounded-full"
                        : effectiveStatus === "check-temp"
                        ? "bg-yellow-500 w-full flex shadow-lg border-2 border-black rounded-full py-2"
                        : effectiveStatus === "print-label"
                        ? "bg-gray-400 w-full flex shadow-lg border-2 border-gray-400 rounded py-2"
                        : "bg-[#1E3678] items-center w-full py-3 flex shadow-xl rounded-sm"
                    }`}
                    onClick={(e) => {
                      const canTriggerAction =
                        !shouldShowTimer &&
                        !showCheckImg &&
                        timeLeft === null &&
                        (effectiveStatus === "check-temp" ||
                          ingredientData?.category === "Batch Prep Items");
                      if (canTriggerAction) {
                        e.stopPropagation();
                        if (effectiveStatus != "available") {
                          PreparationStatus(
                            ingredientPrepForecastId,
                            updatedBy,
                            "print-label"
                          );
                        }
                        return;
                      }
                      if (effectiveStatus === "available") {
                        handleTimerClick(e);
                        return;
                      }
                      (showCheckImg ? handleCheckImgClick : handleTimerClick)(
                        e
                      );
                    }}
                  >
                    <button
                      disabled={
                        !shouldShowTimer &&
                        !showCheckImg &&
                        timeLeft === null &&
                        effectiveStatus !== "check-temp" &&
                        !(ingredientData?.category === "Batch Prep Items") &&
                        effectiveStatus !== "to-prep" &&
                        effectiveStatus !== "available"
                      }
                      className={` flex items-center justify-center relative transition-all ${
                        showCheckImg
                          ? "bg-white border-green-800 rounded "
                          : timeLeft !== null && effectiveStatus == "available"
                          ? "bg-yellow-400 flex rounded-lg px-0 m-0 w-full"
                          : timeLeft !== null
                          ? "bg-yellow-400 flex rounded-full"
                          : "items-center flex rounded-sm"
                      }`}
                    >
                      {timeLeft !== null && !showCheckImg && (
                        <svg
                          className=" inset-0 w-12 h-12 -rotate-90"
                          viewBox="0 0 80 80"
                        >
                          <circle
                            cx="40"
                            cy="40"
                            r="25"
                            stroke="white"
                            strokeWidth="7"
                            fill="none"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="25"
                            stroke="#000"
                            strokeWidth="7"
                            fill="none"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-linear"
                          />
                        </svg>
                      )}

                      <div className=" z-10 hover:cursor-pointer">
                        {effectiveStatus === "print-label" ? (
                          <div
                            onClick={() =>
                              PreparationStatus(
                                ingredientPrepForecastId,
                                updatedBy,
                                "available"
                              )
                            }
                            className="border-none flex items-center justify-center bg-gray-400 text-black gap-2 text-black"
                          >
                            <Image
                              src={labelIconBlacl}
                              alt="Label"
                              width={20}
                              height={20}
                              className="text-white"
                            />
                            Print Label
                          </div>
                        ) : timeLeft !== null ? (
                          <div className="text-center">
                            <div
                              className="font-bold text-black text-lg leading-tight tracking-wider"
                              style={{
                                fontFamily:
                                  "system-ui, -apple-system, sans-serif",
                              }}
                            >
                              {formatTime(timeLeft)}
                            </div>
                          </div>
                        ) : shouldShowTimer ? (
                          <TimerPrepIcon color="white" width={30} height={30} />
                        ) : effectiveStatus === "check-temp" ? (
                          <div className="flex items-center justify-center text-black shadow-none">
                            <Image
                              src={Temp}
                              alt="Temp"
                              width={30}
                              height={30}
                            />
                            Check Temp
                          </div>
                        ) : effectiveStatus === "print-label" ? (
                          <div className="flex gap-2">
                            {/* <Image
                              src={labelIcon}
                              alt="Label"
                              width={20}
                              height={20}
                            /> */}
                            <h6 className="text-black bg-green-700">
                              Ready to use
                            </h6>
                          </div>
                        ) : effectiveStatus === "to-prep" ? (
                          <div className="flex gap-2">
                            <TimerPrepIcon
                              color="white"
                              width={25}
                              height={25}
                            />
                            <h6 className="text-white">Start Prep</h6>
                          </div>
                        ) : effectiveStatus == "available" ? (
                          <div className="flex gap-2 my-3">
                            <TimerPrepIcon
                              color="white"
                              width={25}
                              height={25}
                            />
                            <h6 className="text-white">Start Prep</h6>
                          </div>
                        ) : null}
                      </div>
                      {!showCheckImg && timeLeft == null && shouldShowTimer && (
                        <span className="text-white ml-2">Start Prep</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#FAFAFA] mt-4 rounded-lg ">
              <div className="p-3 border rounded-lg border-gray-300 bg-[#FFFFFF]  ">
                <h6>Print Prep Labels</h6>
                <div className="flex items-center gap-2 mt-4 justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDecreasePrintCnt}
                      className="w-12 h-12 rounded-md p-4 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors hover:cursor-pointer"
                    >
                      <MinusIcon />
                    </button>

                    <div
                      className="bg-white border border-gray-400 rounded-md p-3 h-12 min-w-[80px] text-center shadow-inner text-base truncate"
                      title={`${labelsCnt}`}
                    >
                      <span className="text-md text-black font-semibold">
                        {labelsCnt}
                      </span>
                    </div>

                    <button
                      onClick={handleIncreasePrintCnt}
                      className="w-12 h-12 p-4 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors hover:cursor-pointer"
                    >
                      <PlusIcon />
                    </button>
                  </div>
                  <div className="bg-white flex items-center border border-black py-3 px-5 ml-2 flex gap-2 justify-between w-full rounded-md">
                    <Button
                      className="flex gap-2 bg-transparent hover:bg-transparent cursor-pointer"
                      onClick={PrintLabelApi}
                      disabled={
                        effectiveStatus != "print-label" &&
                        effectiveStatus != "available"
                      }
                    >
                      <Image
                        src={labelIcon}
                        alt={"Completed"}
                        width={20}
                        height={20}
                        className="object-cover"
                      />
                      <span className="text-gray-600">Print Label</span>
                    </Button>
                    <div>
                      <Image
                        src={bluetoothIcon}
                        alt={"Completed"}
                        width={20}
                        height={20}
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {category == "Off-cycle Fry Prep Items" ? (
              <div className=" gap-4 bg-[#FAFAFA] p-2 rounded-lg h-50 w-full flex items-center justify-center text-sm">
                Off-cycle items forecast will be displayed real-time
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 bg-[#FAFAFA] p-2 rounded-lg">
                {ingredientData?.forecastByDaypart?.map((item, id) => (
                  <div
                    className="bg-[#FAFAFA] rounded-lg p-4 space-y-2 border border-gray-400"
                    key={id}
                  >
                    <h4>{item.daypart}</h4>
                    <div className="flex gap-4 items-center">
                      <p className="text-xs">
                        Forecast
                        <br /> Quantity
                      </p>
                      <div className="bg-gray-100 border border-gray-400 rounded-md p-3 min-w-[150px] text-center shadow-inner">
                        <span className="text-md text-black font-semibold">
                          {/* {item.forecastQuantity} */}
                          {parseFloat(Number(item.forecastQuantity).toFixed(2))}

                          <span className="font-medium text-xs">
                            {" "}
                            {item.unit}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DrawerFooter></DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PrepItemCard;
