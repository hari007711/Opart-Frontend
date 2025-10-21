import PrintIcon from "@/assets/icons/printIcon";
import SearchIcon from "@/assets/icons/searchIcon";
import { useStep } from "@/contexts/stepContext";
import Insights from "@/assets/images/insights.svg";
import Approve from "@/assets/images/approve.svg";
import Edit from "@/assets/images/editWhite.svg";
import ConfirmWt from "@/assets/images/CfmWhite.svg";
import Edit2 from "@/assets/images/editIcon.svg";
import Print from "@/assets/images/Print.svg";
import Back from "@/assets/images/back.svg";
import Order from "@/assets/images/order.svg";
import Add from "@/assets/images/Add.svg";
import Confirm from "@/assets/images/Confirm.svg";
import Search from "@/assets/images/Search.svg";
import Image from "next/image";
import { api, MultiplePrintLabelResponse } from "@/lib/api";
import {
  useDayCountStore,
  useForecastStatusStore,
  useForecastStore,
  useInsightsStore,
  useInventoryStore,
  useStatusStore,
  useSearchStore,
  usePrintLabelStore,
  useLocationStore,
} from "@/store/forecastStore";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/Button";
import { useEffect, useState, useRef } from "react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import PrintPreview from "@/components/PrintLabels/PrintPreview";

export default function StepIndicator() {
  const { approveForecasts } = useForecastStore();
  const { steps, currentStep, setCurrentStep } = useStep();
  const currentStepData = steps[currentStep];
  const { dayCount, setDayCount } = useDayCountStore();
  const { insightsState, setInsightsState } = useInsightsStore();
  const { status, setStatus } = useStatusStore();
  const { forecastState, setForecastState } = useForecastStatusStore();
  const [activeTab, setActiveTab] = useState("Overall");
  const { saveAllUpdates, isSaving, pendingUpdates } = useInventoryStore();
  const { searchTerm, setSearchTerm } = useSearchStore();
  const { selectedItemsCount, selectedItems, setShowPreview } =
    usePrintLabelStore();
  const { selectedLocation, setSelectedLocation } = useLocationStore();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentStepData.name !== "Today's Forecast") {
      setForecastState("modify");
    }
  }, [currentStepData.name, setForecastState]);

  useEffect(() => {
    if (
      currentStepData.name === "Print Labels" ||
      currentStepData.name === "Search"
    ) {
      searchInputRef.current?.focus();
    }
  }, [currentStepData.name]);

  const handleConfirmClick = async () => {
    try {
      await saveAllUpdates();
    } catch (error) {
      console.error("Failed to save inventory updates:", error);
      alert("Failed to save inventory updates. Please try again.");
    }
  };

  const [buttonValue, setButtonvalue] = useState("Place Order Now");
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    if (isClicked) {
      setButtonvalue("Order Confirmed");
    } else {
      setButtonvalue("Place Order Now");
    }
  }, [isClicked]);

  const [isApproving, setIsApproving] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const handleApproveClick = async () => {
    try {
      setIsApproving(true);
      await approveForecasts();
    } catch (err) {
      console.error("Approve failed", err);
    } finally {
      setIsApproving(false);
    }
  };

  const handlePrintLabelClick = async () => {
    try {
      setIsPrinting(true);

      // Get selected items with labelCount > 0
      const validItems = selectedItems.filter((item) => item.labelCount > 0);

      if (validItems.length === 0) {
        console.warn("No items with label count > 0");
        return;
      }

      // Prepare payload with list of ingredientPrepForecastIds
      const payload = {
        ingredientPrepForecastIds: validItems.map((item) => String(item.id)),
      };

      const response = await api.MultiplePrintLabel(payload);

      console.log("Print label API response:", response);

      // Store print metadata for preview rendering
      usePrintLabelStore.getState().setPreviewMeta({
        message: response.message,
        totalRequested: response.totalRequested,
        totalSuccessful: response.totalSuccessful,
        totalFailed: response.totalFailed,
        labels: response.labels,
        updatedAt: response.updatedAt,
      });

      // Update selected items with prep/expiry times from response
      if (response.labels) {
        const updatedSelectedItems = validItems.map((item) => {
          const apiLabel = response.labels.find(
            (label) => label.ingredientPrepForecastId === String(item.id)
          );
          return {
            ...item,
            prepTime: apiLabel?.prepTime,
            expiryTime: apiLabel?.expiryTime,
            prepIntervalHours: apiLabel?.prepIntervalHours,
          };
        });
        usePrintLabelStore.getState().setSelectedItems(updatedSelectedItems);
      }

      // Show preview
      setShowPreview(true);
    } catch (error) {
      console.error("Error printing labels:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <>
      <PrintPreview />
      <div className="bg-white border-b-3 border-gray-200 px-6 py-4 rounded-t-2xl">
        {forecastState === "modify" ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div>
                  {currentStepData.name === "Print Labels" ||
                  currentStepData.name === "Search" ? (
                    <div className="flex items-center">
                      <button
                        onClick={() => {
                          setCurrentStep(0);
                          setSearchTerm("");
                        }}
                        className="hover:cursor-pointer"
                      >
                        <Image src={Back} alt="Back" height={20} width={20} />
                      </button>
                      {currentStepData.name == "Print Labels" && (
                        <div style={{ position: "relative" }} className="ml-5">
                          <Input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search any ingredient"
                            className="w-100 h-10 rounded pr-3 pl-12 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          <span
                            style={{
                              position: "absolute",
                              left: "12px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              pointerEvents: "none",
                            }}
                          >
                            <Image
                              src={Search}
                              alt="Search"
                              height={20}
                              width={20}
                              className="text-[#6b7280]"
                            />
                          </span>
                        </div>
                      )}
                      {currentStepData.name == "Search" && (
                        <div style={{ position: "relative" }} className="ml-5">
                          <Input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search any ingredient Search"
                            className="w-100 h-10 rounded pr-3 pl-12 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          <span
                            style={{
                              position: "absolute",
                              left: "12px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              pointerEvents: "none",
                            }}
                          >
                            <Image
                              src={Search}
                              alt="Search"
                              height={20}
                              width={20}
                              className="text-[#6b7280]"
                            />
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <h2 className="text-xl font-semibold text-gray-900">
                      {currentStepData.name}
                    </h2>
                  )}
                </div>
                {currentStepData.name === "Inventory Count" && (
                  <div className="flex ml-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="text-gray-600 font-medium flex items-center gap-2"
                        >
                          <ChevronDown className="h-10 w-10" />
                          {dayCount}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onSelect={() => {
                            setDayCount("Daily Count");
                          }}
                        >
                          Daily Count
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            setDayCount("Weekly Count");
                          }}
                        >
                          Weekly Count
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="text-gray-600 font-medium flex items-center gap-2"
                        >
                          <ChevronDown className="h-4 w-4" />
                          {selectedLocation || "All Locations"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onSelect={() => {
                            setSelectedLocation("");
                          }}
                        >
                          All Locations
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            setSelectedLocation("Freezer");
                          }}
                        >
                          Freezer
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            setSelectedLocation("Storage Room 1");
                          }}
                        >
                          Storage Room 1
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            setSelectedLocation("Storage Room 2");
                          }}
                        >
                          Storage Room 2
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            setSelectedLocation("Refrigerator");
                          }}
                        >
                          Refrigerator
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            setSelectedLocation("Pantry");
                          }}
                        >
                          Pantry
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </div>

            {currentStepData.name === "Inventory Order" && (
              <div className="flex items-center space-x-3">
                <button className="px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-3">
                  Next order will be placed by 10 pm on{" "}
                  <span className="font-semibold text-gray-700">
                    Friday 03.10.2025
                  </span>
                </button>
                <button
                  onClick={() => {
                    setIsClicked(true);
                  }}
                  className={`px-4 py-3 bg-[#1f3678] text-white rounded-md  flex items-center gap-3 ${
                    isClicked
                      ? "bg-gray-500"
                      : "bg-[#1f3678] hover:bg-[#1f3678]"
                  }`}
                >
                  <span>
                    <Image src={Order} alt="Order" height={20} width={20} />
                  </span>
                  {buttonValue}
                </button>
              </div>
            )}

            {currentStepData.name === "Print Labels" && (
              <div className="flex items-center justify-start gap-5">
                <p className="text-gray-700 font-medium">
                  {selectedItemsCount === 0
                    ? "Please select items to print labels"
                    : `${selectedItemsCount} ${
                        selectedItemsCount === 1 ? "item" : "items"
                      } selected`}
                </p>
                <button
                  onClick={handlePrintLabelClick}
                  className={`px-4 py-3 text-white rounded-md flex items-center gap-3 transition-colors  ${
                    selectedItemsCount === 0 || isPrinting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#1f3678] hover:bg-[#1a2e66] cursor-pointer hover:cursor-pointer"
                  }`}
                  disabled={selectedItemsCount === 0 || isPrinting}
                >
                  <span>
                    <Image src={Print} alt="Order" height={20} width={20} />
                  </span>
                  {isPrinting ? "Printing..." : "Print Label"}
                </button>
              </div>
            )}
            {currentStepData.name === "Today's Forecast" ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setForecastState("insights")}
                  className="px-4 py-3 text-xl font-semibold text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-3"
                >
                  <span>
                    <Image
                      src={Insights}
                      alt="Insights"
                      height={25}
                      width={25}
                    />
                  </span>
                  Insights
                </button>
                {/* <button
                  onClick={() => setForecastState("modify")}
                  className="px-4 py-3 bg-[#1f3678] text-white text-xl font-semibold rounded-md hover:bg-[#1a2e66] flex items-center gap-3"
                >
                  <span>
                    <Image src={Edit} alt="Edit" height={25} width={25} />
                  </span>
                  Modify
                </button> */}
                <button
                  className={`px-4 py-3 font-semibold text-xl rounded-md flex items-center gap-3 ${
                    isApproving
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={handleApproveClick}
                  disabled={isApproving}
                >
                  <span>
                    <Image src={Approve} alt="Approve" height={25} width={25} />
                  </span>
                  {isApproving ? "Approving..." : "Approve"}
                </button>
              </div>
            ) : (
              <>
                {currentStepData.name === "Inventory Count" ? (
                  <div className="flex items-center space-x-3">
                    <button className="px-4 py-3 text-lg text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-3">
                      <span>
                        <Image src={Add} alt="Add" height={25} width={25} />
                      </span>
                      Add Items
                    </button>

                    <button
                      onClick={() => setStatus("modify")}
                      className={`px-4 py-3 text-xl rounded-md flex items-center gap-3 transition-colors
                      ${
                        status === "modify"
                          ? "bg-[#1f3678] text-white hover:bg-[#1a2e66]"
                          : "bg-transparent text-gray-700 hover:bg-gray-200"
                      }
                    `}
                    >
                      <span>
                        {status === "modify" ? (
                          <Image src={Edit} alt="Edit" height={25} width={25} />
                        ) : (
                          <Image
                            src={Edit2}
                            alt="Edit"
                            height={25}
                            width={25}
                          />
                        )}
                      </span>
                      Modify
                    </button>

                    <button
                      onClick={handleConfirmClick}
                      disabled={
                        isSaving ||
                        (pendingUpdates.size === 0 && status !== "confirm")
                      }
                      className={`px-4 py-3 text-xl rounded-md flex items-center gap-3 transition-colors
                      ${
                        status === "confirm"
                          ? "bg-[#1f3678] text-white hover:bg-[#1a2e66]"
                          : "bg-transparent text-gray-700 hover:bg-gray-200"
                      }
                      ${isSaving ? "opacity-50 cursor-not-allowed" : ""}
                      ${
                        pendingUpdates.size === 0 && status !== "confirm"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }
                    `}
                    >
                      <span>
                        {status !== "confirm" ? (
                          <Image
                            src={Confirm}
                            alt="Confirm"
                            height={25}
                            width={25}
                          />
                        ) : (
                          <Image
                            src={ConfirmWt}
                            alt="Confirm"
                            height={25}
                            width={25}
                          />
                        )}
                      </span>
                      {isSaving ? "Saving..." : "Confirm"}
                    </button>
                  </div>
                ) : (
                  <>
                    {currentStepData.name !== "Inventory Order" &&
                      currentStepData.name !== "Print Labels" &&
                      currentStepData.name !== "Search" && (
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setCurrentStep(8)}
                            className="px-4 py-2 text-lg text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-3 hover:cursor-pointer"
                          >
                            <span>
                              <SearchIcon width={25} height={25} />
                            </span>
                            Search Items
                          </button>
                          <button
                            onClick={() => setCurrentStep(7)}
                            className="px-4 py-2 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-3 hover:cursor-pointer"
                          >
                            <span>
                              <PrintIcon width={20} height={20} />
                            </span>
                            Print Prep Label
                          </button>
                        </div>
                      )}
                  </>
                )}
              </>
            )}
          </div>
        ) : (
          currentStepData.name === "Today's Forecast" && (
            <div className="flex items-center justify-between">
              <div className="flex gap-5 items-center">
                <div className="flex gap-3">
                  <button
                    onClick={() => setForecastState("modify")}
                    className="hover:cursor-pointer"
                  >
                    <Image src={Back} alt="Back" height={20} width={20} />
                  </button>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Insights
                  </h2>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-gray-600 font-medium flex items-center gap-2"
                    >
                      <ChevronDown className="h-10 w-10" />
                      {insightsState}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onSelect={() => setInsightsState("Yesterday")}
                    >
                      Yesterday
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setInsightsState("Today")}
                    >
                      Today
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="rounded-lg"
                >
                  <TabsList className="bg-transparent h-auto rounded-lg border-b border-gray-200 border border-gray-300">
                    {["Overall", "Off-Cycle Fry", "Batch", "24 Hours"].map(
                      (tab) => (
                        <TabsTrigger
                          key={tab}
                          value={tab}
                          className="px-12 py-3 rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:text-white data-[state=active]:bg-[#1f3678] transition-all duration-150"
                        >
                          {tab}
                        </TabsTrigger>
                      )
                    )}
                  </TabsList>
                </Tabs>
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
}
