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
import deleteIcon from "@/assets/images/delete.svg";
import labelIcon from "@/assets/images/label.svg";
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
import { useRefreshStore } from "@/store/forecastStore";

interface SearchItemCardProps {
  itemName: string;
  quantity: number;
  unit: string;
  image: StaticImageData | string;
  ingredientPrepForecastId: string;
  prepIntervalHours: number;
  prepStatus: string;
  ingredientId: string;
}

const SearchItemCard: React.FC<SearchItemCardProps> = ({
  itemName = "Item Name",
  quantity = 10,
  unit = "bags",
  image,
  ingredientPrepForecastId,
  prepIntervalHours,
  prepStatus,
  ingredientId,
}) => {
  const [currentQuantity, setCurrentQuantity] = useState(quantity);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [quantityHand, setQuantityHand] = useState(currentQuantity);
  const [showCheckImg, setShowCheckImg] = useState(false);
  const [hideTimerCompletely, setHideTimerCompletely] = useState(false);
  const [quantityExpired, setQuantityExpired] = useState<number>(0);
  const { triggerRefresh } = useRefreshStore();

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

  const duration = 3;
  // const duration = prepIntervalHours * 60 * 60;

  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const handleTimerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (timeLeft === null && !showCheckImg) {
      setTimeLeft(duration);
      setHideTimerCompletely(false);
    }
  };

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

  useEffect(() => {
    if (isCompleted && timeLeft === 0) {
      setShowCheckImg(true);
      const timeout = setTimeout(() => {
        setShowCheckImg(false);
        setTimeLeft(null);
        setHideTimerCompletely(true);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isCompleted, timeLeft]);

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

  const PreparationStatus = useCallback(
    async (ingredientPrepForecastId: string, updatedBy: string) => {
      try {
        const payload = {
          ingredientPrepForecastId,
          prepStatus: "available",
          updatedBy,
        };
        const response = await api.PrepStatus(payload);
        triggerRefresh();
        return response;
      } catch (error) {
        console.error("Error updating preparation status:", error);
      }
    },
    [triggerRefresh]
  );

  const [updatedBy, setUpdatedBy] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("userName");
    setUpdatedBy(name!);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      PreparationStatus(ingredientPrepForecastId, updatedBy);
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
    (prepStatus === "to-prep" || prepStatus === "in-prep") &&
    !hideTimerCompletely;
  const shouldShowTimerButton =
    shouldShowTimer || timeLeft !== null || showCheckImg;

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
            </div>

            <div className="flex items-center gap-2">
              {shouldShowTimer ? (
                <button
                  onClick={handleDecrease}
                  className="w-8 h-8 rounded-md p-2 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
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
              {shouldShowTimer ? (
                <div
                  className="bg-white min-w-30 w-30 text-base truncate border border-gray-400 rounded-md p-1 text-center shadow-inner"
                  title={`${currentQuantity} ${unit}`}
                >
                  <span className="text-md text-black font-semibold">
                    {currentQuantity}
                    <span className="font-medium text-xs"> {unit}</span>
                  </span>
                </div>
              ) : (
                <div
                  className="bg-white min-w-30 w-59 text-base truncate border border-gray-400 rounded-md p-1 text-center shadow-inner"
                  title={`${currentQuantity} ${unit}`}
                >
                  <span className="text-md text-black font-semibold">
                    {currentQuantity}
                    <span className="font-medium text-xs"> {unit}</span>
                  </span>
                </div>
              )}

              {shouldShowTimer && (
                <button
                  onClick={handleIncrease}
                  className="w-8 h-8 p-2 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
                >
                  <PlusIcon />
                </button>
              )}
            </div>
          </div>

          {shouldShowTimerButton && (
            <button
              onClick={showCheckImg ? handleCheckImgClick : handleTimerClick}
              disabled={!shouldShowTimer && !showCheckImg && timeLeft === null}
              className={`w-20 h-20 flex items-center justify-center relative transition-all ${
                showCheckImg
                  ? "bg-white border-2 border-green-700 rounded shadow-xl"
                  : timeLeft !== null
                  ? "bg-yellow-400 shadow-lg border-2 border-yellow-500 rounded-full"
                  : "bg-white hover:bg-gray-100 border-2 border-gray-200 shadow-xl rounded-sm"
              }`}
            >
              {timeLeft !== null && !isCompleted && (
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

              <div className="relative z-10">
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
                  <TimerPrepIcon />
                ) : null}
              </div>
            </button>
          )}
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
              {prepStatus !== "available" && (
                <div
                  className={`bg-[#ffece6] p-2 w-full rounded-lg border  font-semibold items-center justify-center flex border-red-700 ${
                    showCheckImg
                      ? "bg-yellow-400 border-green-700 rounded shadow-xl"
                      : timeLeft !== null
                      ? "bg-yellow-400 text-black flex rounded-full"
                      : "items-center text-red-700 flex shadow-xl rounded-sm"
                  }`}
                >
                  {!showCheckImg && timeLeft == null
                    ? "Item Unavailable"
                    : "In Prep Cycle"}
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
                <h6>Prepare Quantity</h6>
                <div className="flex items-center gap-2 mt-4 justify-between">
                  <div className="flex items-center gap-2">
                    {shouldShowTimer && (
                      <button
                        onClick={handleDecrease}
                        className="w-12 h-12 rounded-md p-4 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
                      >
                        <MinusIcon />
                      </button>
                    )}

                    <div
                      className="bg-white border border-gray-400 rounded-md p-3 h-12 min-w-[90px] text-center shadow-inner text-base truncate"
                      title={`${currentQuantity} ${unit}`}
                    >
                      <span className="text-md text-black font-semibold">
                        {currentQuantity}
                        <span className="font-medium text-xs"> {unit}</span>
                      </span>
                    </div>
                    {shouldShowTimer && (
                      <button
                        onClick={handleIncrease}
                        className="w-12 h-12 p-4 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
                      >
                        <PlusIcon />
                      </button>
                    )}
                  </div>
                  <div
                    className={`bg-[#1E3678] items-center px-5 ml-2 flex gap-2 justify-center w-full rounded-md ${
                      prepStatus == "available"
                        ? "bg-green-800 border-2 py-3 border-green-700 rounded shadow-xl"
                        : timeLeft !== null
                        ? "bg-yellow-400 flex shadow-lg border-2 border-yellow-500 rounded-full"
                        : "items-center py-3 flex shadow-xl rounded-sm"
                    }`}
                  >
                    <button
                      onClick={
                        showCheckImg ? handleCheckImgClick : handleTimerClick
                      }
                      disabled={
                        !shouldShowTimer && !showCheckImg && timeLeft === null
                      }
                      className={` flex items-center justify-center relative transition-all ${
                        showCheckImg
                          ? "bg-white border-green-700 rounded shadow-xl"
                          : timeLeft !== null
                          ? "bg-yellow-400 flex rounded-full"
                          : "items-center flex shadow-xl rounded-sm"
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

                      <div className=" z-10">
                        {prepStatus == "available" ? (
                          <div className="border-none flex items-center justify-center bg-green-800 text-black">
                            Ready to Use
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
                        ) : null}
                      </div>
                    </button>
                    {!showCheckImg && timeLeft == null && shouldShowTimer && (
                      <span className="text-white">Start Prep</span>
                    )}
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
                      onClick={handleDecrease}
                      className="w-12 h-12 rounded-md p-4 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
                    >
                      <MinusIcon />
                    </button>

                    <div
                      className="bg-white border border-gray-400 rounded-md p-3 h-12 min-w-[80px] text-center shadow-inner text-base truncate"
                      title={`${currentQuantity} ${unit}`}
                    >
                      <span className="text-md text-black font-semibold">
                        {currentQuantity}
                        <span className="font-medium text-xs"> {unit}</span>
                      </span>
                    </div>

                    <button
                      onClick={handleIncrease}
                      className="w-12 h-12 p-4 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
                    >
                      <PlusIcon />
                    </button>
                  </div>
                  <div className="bg-white border border-black py-3 px-5 ml-2 flex gap-2 justify-between w-full rounded-md">
                    <div className="flex gap-2">
                      <Image
                        src={labelIcon}
                        alt={"Completed"}
                        width={20}
                        height={20}
                        className="object-cover"
                      />
                      <span className="text-gray-600">Print Label</span>
                    </div>
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
                        {item.forecastQuantity}
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
          </div>

          <DrawerFooter></DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default SearchItemCard;
