import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/Button";
import {
  useDayCountStore,
  useInventoryStore,
  useStatusStore,
  useLocationStore,
} from "@/store/forecastStore";
import { CommonDialog } from "../Dialog/CommonDialog";
import { Input } from "../ui/input";
import { api } from "@/lib/api";

interface QuantityData {
  boxes: number;
  bags: number;
  each: number;
}

interface InventoryItem {
  ingredientId: string;
  itemName: string;
  startOfDayQuantity: QuantityData;
  endOfDayQuantity: QuantityData;
  remainingQuantity: QuantityData;
  consumptionRate: QuantityData;
  consumptionStatus: "normal" | "increase" | "decrease";
  category?: string;
}

interface InvDataResponse {
  items: InventoryItem[];
  totalItems?: number;
  location?: string;
}

export default function InventoryStockCount() {
  const { dayCount } = useDayCountStore();
  const { status } = useStatusStore();
  const { addPendingUpdate } = useInventoryStore();
  const { selectedLocation } = useLocationStore();
  const [data, setData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentRow, setCurrentRow] = useState<number | null>(null);
  const [currentField, setCurrentField] = useState<
    "boxes" | "bags" | "each" | null
  >(null);
  const [quantityHand, setQuantityHand] = useState<number>(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (dayCount === "Daily Count") {
        const res: InvDataResponse = await api.InventoryCnt();
        setData(res.items || []);
      } else if (dayCount === "Weekly Count") {
        // Weekly Count
        // const today = new Date();
        // const startDate = new Date(today);
        // startDate.setDate(today.getDate() - 7);
        // const endDate = today;

        const startDate = "2025-08-06";
        const endDate = "2025-08-10";

        const formatDate = (date: Date) => {
          return date.toISOString().split("T")[0];
        };

        // const formattedStartDate = formatDate(startDate);
        // const formattedEndDate = formatDate(endDate);

        const formattedStartDate = startDate;
        const formattedEndDate = endDate;
        const res: InvDataResponse = await api.WeeklyInventoryCnt(
          formattedStartDate,
          formattedEndDate,
          selectedLocation || undefined
        );
        setData(res.items || []);
      }
    } catch (err) {
      console.error("Failed to fetch inventory data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dayCount, selectedLocation]);

  const [updatedBy, setUpdatedBy] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("userName");
    setUpdatedBy(name!);
  }, []);

  const handleEdit = (
    ingredientId: string,
    field: "boxes" | "bags" | "each",
    currentValue: number
  ) => {
    const rowIndex = data.findIndex(
      (item) => item.ingredientId === ingredientId
    );
    setCurrentRow(rowIndex);
    setCurrentField(field);
    setQuantityHand(currentValue);
  };

  const handleConfirmUpdate = () => {
    if (currentRow !== null && currentField) {
      const ingredientId = data[currentRow].ingredientId;
      const updatedData = data.map((row, index) => {
        if (index === currentRow) {
          const newRemainingQuantity = {
            ...row.remainingQuantity,
            [currentField]: quantityHand,
          };
          addPendingUpdate(ingredientId, newRemainingQuantity, updatedBy);

          return {
            ...row,
            remainingQuantity: newRemainingQuantity,
          };
        }
        return row;
      });

      setData(updatedData);

      setCurrentRow(null);
      setCurrentField(null);
    }
  };

  const getConsumptionColor = (status: string) => {
    switch (status) {
      case "increase":
        return "bg-yellow-500";
      case "decrease":
        return "bg-red-600";
      default:
        return "bg-gray-400";
    }
  };

  const getConsumptionSymbol = (status: string) => {
    return status === "increase" ? "+" : "-";
  };

  if (loading) {
    return (
      <div className="p-2 flex items-center justify-center h-full">
        <p className="text-gray-600">Loading inventory data...</p>
      </div>
    );
  }

  const offCycleData = data.filter(
    (item) => item.category === "Off-cycle Fry Prep Items"
  );
  const batchData = data.filter((item) => item.category === "Batch Prep Items");
  const dayData = data.filter((item) => item.category === "24-hours Items");
  const nonFoodData = data.filter((item) => item.category === "Non-Food Items");

  return (
    <div className="p-2 bg-[#edeff7]">
      {dayCount === "Daily Count" ? (
        <>
          <div className="p-2 bg-[#dadee9] rounded">
            <h1 className="font-semibold text-lg">Daily Items</h1>
          </div>
          <div className="my-5">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-500 text-white hover:bg-gray-500">
                  <TableHead className="text-white border border-r-white">
                    Item Name
                  </TableHead>
                  <TableHead className="text-white border border-r-white">
                    Start of the day quantity
                  </TableHead>
                  <TableHead className="text-white border border-r-white">
                    End of the day quantity
                  </TableHead>
                  <TableHead className="text-white border border-r-white">
                    Remaining Quantity
                  </TableHead>
                  <TableHead className="text-white border border-r-white">
                    Consumption Rate
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="border-1 border-gray-500 bg-white">
                {data.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="flex items-center gap-2 whitespace-normal">
                      <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs">🖼️</span>
                      </div>
                      {row.itemName}
                    </TableCell>

                    <TableCell>
                      {row.startOfDayQuantity.boxes} Boxes ・{" "}
                      {row.startOfDayQuantity.bags} Bags
                    </TableCell>

                    <TableCell>{row.endOfDayQuantity.bags} Bags</TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "boxes",
                                        row.remainingQuantity.boxes
                                      );
                                    }}
                                  >
                                    -
                                  </Button>
                                </div>
                              }
                              title="Update the Box Quantity"
                              description="Please add remaining quantity of boxes of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}

                          <span className="px-2 h-7.5  flex items-center justify-center w-22 border rounded-md bg-gray-100 text-sm">
                            {row.remainingQuantity.boxes} boxes
                          </span>

                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "boxes",
                                        row.remainingQuantity.boxes
                                      );
                                    }}
                                  >
                                    +
                                  </Button>
                                </div>
                              }
                              title="Update the Box Quantity"
                              description="Please add remaining quantity of boxes of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                        </div>

                        <span>・</span>

                        <div className="flex items-center gap-1">
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "bags",
                                        row.remainingQuantity.bags
                                      );
                                    }}
                                  >
                                    -
                                  </Button>
                                </div>
                              }
                              title="Update Bag Quantity"
                              description="Please add remaining quantity of bags of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                          <span className="px-2 h-7.5 flex items-center justify-center w-22 border rounded-md bg-gray-100 text-sm">
                            {row.remainingQuantity.bags} bags
                          </span>
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "bags",
                                        row.remainingQuantity.bags
                                      );
                                    }}
                                  >
                                    +
                                  </Button>
                                </div>
                              }
                              title="Update Bag Quantity"
                              description="Please add remaining quantity of bags of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                        </div>

                        <span>・</span>

                        <div className="flex items-center gap-1">
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "each",
                                        row.remainingQuantity.each
                                      );
                                    }}
                                  >
                                    -
                                  </Button>
                                </div>
                              }
                              title="Update Individual Quantity"
                              description="Please add remaining quantity of individual units of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                          <span className="px-2 h-7.5 flex items-center justify-center w-22 border rounded-md bg-gray-100 text-sm">
                            {row.remainingQuantity.each} each
                          </span>
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "each",
                                        row.remainingQuantity.each
                                      );
                                    }}
                                  >
                                    +
                                  </Button>
                                </div>
                              }
                              title="Update Individual Quantity"
                              description="Please add remaining quantity of individual units of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-sm ${getConsumptionColor(
                            row.consumptionStatus
                          )}`}
                        >
                          {getConsumptionSymbol(row.consumptionStatus)}
                        </div>
                        {row.consumptionRate.boxes} Boxes ・{" "}
                        {row.consumptionRate.bags} Bags
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <>
          <div className="p-2 bg-[#dadee9] rounded">
            <h1 className="font-semibold text-lg">Off-Cycle Fry Prep Items</h1>
          </div>
          <div className="my-5">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-500 text-white hover:bg-gray-500">
                  <TableHead className="text-white border border-r-white">
                    Item Name
                  </TableHead>
                  <TableHead className="text-white border border-r-white">
                    Start of the day quantity
                  </TableHead>
                  <TableHead className="text-white border border-r-white">
                    End of the day quantity
                  </TableHead>
                  <TableHead className="text-white border border-r-white">
                    Remaining Quantity
                  </TableHead>
                  <TableHead className="text-white border border-r-white">
                    Consumption Rate
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="border-1 border-gray-500 bg-white">
                {offCycleData.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="flex items-center gap-2 whitespace-normal">
                      <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs">🖼️</span>
                      </div>
                      {row.itemName}
                    </TableCell>
                    <TableCell>
                      {row.startOfDayQuantity.boxes} Boxes ・{" "}
                      {row.startOfDayQuantity.bags} Bags
                    </TableCell>
                    <TableCell>{row.endOfDayQuantity.bags} Bags</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "boxes",
                                        row.remainingQuantity.boxes
                                      );
                                    }}
                                  >
                                    -
                                  </Button>
                                </div>
                              }
                              title="Update the Box Quantity"
                              description="Please add remaining quantity of boxes of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                          <span className="px-2 h-7.5 flex items-center justify-center w-22 border rounded bg-gray-100 text-sm">
                            {row.remainingQuantity.boxes} boxes
                          </span>
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "boxes",
                                        row.remainingQuantity.boxes
                                      );
                                    }}
                                  >
                                    +
                                  </Button>
                                </div>
                              }
                              title="Update the Box Quantity"
                              description="Please add remaining quantity of boxes of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                        </div>
                        <span>・</span>
                        <div className="flex items-center gap-1">
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "bags",
                                        row.remainingQuantity.bags
                                      );
                                    }}
                                  >
                                    -
                                  </Button>
                                </div>
                              }
                              title="Update Bag Quantity"
                              description="Please add remaining quantity of bags of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                          <span className="px-2 border h-7.5 flex items-center justify-center w-22 border rounded-md bg-gray-100 text-sm">
                            {row.remainingQuantity.bags} bags
                          </span>
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "bags",
                                        row.remainingQuantity.bags
                                      );
                                    }}
                                  >
                                    +
                                  </Button>
                                </div>
                              }
                              title="Update Bag Quantity"
                              description="Please add remaining quantity of bags of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                        </div>
                        <span>・</span>
                        <div className="flex items-center gap-1">
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "each",
                                        row.remainingQuantity.each
                                      );
                                    }}
                                  >
                                    -
                                  </Button>
                                </div>
                              }
                              title="Update Individual Quantity"
                              description="Please add remaining quantity of individual units of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                          <span className="px-2 border h-7.5 flex items-center justify-center w-22 border rounded-md bg-gray-100 text-sm">
                            {row.remainingQuantity.each} each
                          </span>
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "each",
                                        row.remainingQuantity.each
                                      );
                                    }}
                                  >
                                    +
                                  </Button>
                                </div>
                              }
                              title="Update Individual Quantity"
                              description="Please add remaining quantity of individual units of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-sm ${getConsumptionColor(
                            row.consumptionStatus
                          )}`}
                        >
                          {getConsumptionSymbol(row.consumptionStatus)}
                        </div>
                        {row.consumptionRate.boxes} Boxes ・{" "}
                        {row.consumptionRate.bags} Bags
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="p-2 bg-[#dadee9] rounded">
            <h1 className="font-semibold text-lg">Batch Prep Items</h1>
          </div>
          <div className="my-5">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-500 text-white hover:bg-gray-500">
                  <TableHead className="text-white border border-r-white">
                    Item Name
                  </TableHead>
                  <TableHead className="text-white border border-r-white">
                    Start of the day quantity
                  </TableHead>
                  <TableHead className="text-white border border-r-white">
                    End of the day quantity
                  </TableHead>
                  <TableHead className="text-white border border-r-white">
                    Remaining Quantity
                  </TableHead>
                  <TableHead className="text-white border border-r-white">
                    Consumption Rate
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="border-1 border-gray-500 bg-white">
                {batchData.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="flex items-center gap-2 whitespace-normal">
                      <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs">🖼️</span>
                      </div>
                      {row.itemName}
                    </TableCell>
                    <TableCell>
                      {row.startOfDayQuantity.boxes} Boxes ・{" "}
                      {row.startOfDayQuantity.bags} Bags
                    </TableCell>
                    <TableCell>{row.endOfDayQuantity.bags} Bags</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "boxes",
                                        row.remainingQuantity.boxes
                                      );
                                    }}
                                  >
                                    -
                                  </Button>
                                </div>
                              }
                              title="Update the Box Quantity"
                              description="Please add remaining quantity of boxes of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                          <span className="px-2 h-7.5 flex items-center justify-center w-22 border rounded bg-gray-100 text-sm">
                            {row.remainingQuantity.boxes} boxes
                          </span>
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "boxes",
                                        row.remainingQuantity.boxes
                                      );
                                    }}
                                  >
                                    +
                                  </Button>
                                </div>
                              }
                              title="Update the Box Quantity"
                              description="Please add remaining quantity of boxes of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                        </div>
                        <span>・</span>
                        <div className="flex items-center gap-1">
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "bags",
                                        row.remainingQuantity.bags
                                      );
                                    }}
                                  >
                                    -
                                  </Button>
                                </div>
                              }
                              title="Update Bag Quantity"
                              description="Please add remaining quantity of bags of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                          <span className="px-2 border h-7.5 flex items-center justify-center w-22 border rounded-md bg-gray-100 text-sm">
                            {row.remainingQuantity.bags} bags
                          </span>
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "bags",
                                        row.remainingQuantity.bags
                                      );
                                    }}
                                  >
                                    +
                                  </Button>
                                </div>
                              }
                              title="Update Bag Quantity"
                              description="Please add remaining quantity of bags of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                        </div>
                        <span>・</span>
                        <div className="flex items-center gap-1">
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "each",
                                        row.remainingQuantity.each
                                      );
                                    }}
                                  >
                                    -
                                  </Button>
                                </div>
                              }
                              title="Update Individual Quantity"
                              description="Please add remaining quantity of individual units of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                          <span className="px-2 border h-7.5 flex items-center justify-center w-22 border rounded-md bg-gray-100 text-sm">
                            {row.remainingQuantity.each} each
                          </span>
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "each",
                                        row.remainingQuantity.each
                                      );
                                    }}
                                  >
                                    +
                                  </Button>
                                </div>
                              }
                              title="Update Individual Quantity"
                              description="Please add remaining quantity of individual units of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-sm ${getConsumptionColor(
                            row.consumptionStatus
                          )}`}
                        >
                          {getConsumptionSymbol(row.consumptionStatus)}
                        </div>
                        {row.consumptionRate.boxes} Boxes ・{" "}
                        {row.consumptionRate.bags} Bags
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="p-2 bg-[#dadee9] rounded">
            <h1 className="font-semibold text-lg">24-hours Items</h1>
          </div>
          <div className="my-5">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-500 text-white hover:bg-gray-500">
                  <TableHead className="text-white border border-r-white">
                    Item Name
                  </TableHead>
                  <TableHead className="text-white border border-r-white">
                    Start of the day quantity
                  </TableHead>
                  <TableHead className="text-white border border-r-white">
                    End of the day quantity
                  </TableHead>
                  <TableHead className="text-white border border-r-white">
                    Remaining Quantity
                  </TableHead>
                  <TableHead className="text-white border border-r-white">
                    Consumption Rate
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="border-1 border-gray-500 bg-white">
                {dayData.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="flex items-center gap-2 whitespace-normal">
                      <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs">🖼️</span>
                      </div>
                      {row.itemName}
                    </TableCell>
                    <TableCell>
                      {row.startOfDayQuantity.boxes} Boxes ・{" "}
                      {row.startOfDayQuantity.bags} Bags
                    </TableCell>
                    <TableCell>{row.endOfDayQuantity.bags} Bags</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "boxes",
                                        row.remainingQuantity.boxes
                                      );
                                    }}
                                  >
                                    -
                                  </Button>
                                </div>
                              }
                              title="Update the Box Quantity"
                              description="Please add remaining quantity of boxes of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                          <span className="px-2 h-7.5 flex items-center justify-center w-22 border rounded bg-gray-100 text-sm">
                            {row.remainingQuantity.boxes} boxes
                          </span>
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "boxes",
                                        row.remainingQuantity.boxes
                                      );
                                    }}
                                  >
                                    +
                                  </Button>
                                </div>
                              }
                              title="Update the Box Quantity"
                              description="Please add remaining quantity of boxes of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                        </div>
                        <span>・</span>
                        <div className="flex items-center gap-1">
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "bags",
                                        row.remainingQuantity.bags
                                      );
                                    }}
                                  >
                                    -
                                  </Button>
                                </div>
                              }
                              title="Update Bag Quantity"
                              description="Please add remaining quantity of bags of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                          <span className="px-2 border h-7.5 flex items-center justify-center w-22 border rounded-md bg-gray-100 text-sm">
                            {row.remainingQuantity.bags} bags
                          </span>
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "bags",
                                        row.remainingQuantity.bags
                                      );
                                    }}
                                  >
                                    +
                                  </Button>
                                </div>
                              }
                              title="Update Bag Quantity"
                              description="Please add remaining quantity of bags of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                        </div>
                        <span>・</span>
                        <div className="flex items-center gap-1">
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "each",
                                        row.remainingQuantity.each
                                      );
                                    }}
                                  >
                                    -
                                  </Button>
                                </div>
                              }
                              title="Update Individual Quantity"
                              description="Please add remaining quantity of individual units of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                          <span className="px-2 border h-7.5 flex items-center justify-center w-22 border rounded-md bg-gray-100 text-sm">
                            {row.remainingQuantity.each} each
                          </span>
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "each",
                                        row.remainingQuantity.each
                                      );
                                    }}
                                  >
                                    +
                                  </Button>
                                </div>
                              }
                              title="Update Individual Quantity"
                              description="Please add remaining quantity of individual units of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-sm ${getConsumptionColor(
                            row.consumptionStatus
                          )}`}
                        >
                          {getConsumptionSymbol(row.consumptionStatus)}
                        </div>
                        {row.consumptionRate.boxes} Boxes ・{" "}
                        {row.consumptionRate.bags} Bags
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="p-2 bg-[#dadee9] rounded">
            <h1 className="font-semibold text-lg">Non-Food Items</h1>
          </div>
          <div className="my-5">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-500 text-white hover:bg-gray-500">
                  <TableHead className="text-white border border-r-white">
                    Item Name
                  </TableHead>
                  <TableHead className="text-white border border-r-white">
                    Start of the day quantity
                  </TableHead>
                  <TableHead className="text-white border border-r-white">
                    End of the day quantity
                  </TableHead>
                  <TableHead className="text-white border border-r-white">
                    Remaining Quantity
                  </TableHead>
                  <TableHead className="text-white border border-r-white">
                    Consumption Rate
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="border-1 border-gray-500 bg-white">
                {nonFoodData.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="flex items-center gap-2 whitespace-normal">
                      <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs">🖼️</span>
                      </div>
                      {row.itemName}
                    </TableCell>
                    <TableCell>
                      {row.startOfDayQuantity.boxes} Boxes ・{" "}
                      {row.startOfDayQuantity.bags} Bags
                    </TableCell>
                    <TableCell>{row.endOfDayQuantity.bags} Bags</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "boxes",
                                        row.remainingQuantity.boxes
                                      );
                                    }}
                                  >
                                    -
                                  </Button>
                                </div>
                              }
                              title="Update the Box Quantity"
                              description="Please add remaining quantity of boxes of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                          <span className="px-2 h-7.5 flex items-center justify-center w-22 border rounded bg-gray-100 text-sm">
                            {row.remainingQuantity.boxes} boxes
                          </span>
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "boxes",
                                        row.remainingQuantity.boxes
                                      );
                                    }}
                                  >
                                    +
                                  </Button>
                                </div>
                              }
                              title="Update the Box Quantity"
                              description="Please add remaining quantity of boxes of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                        </div>
                        <span>・</span>
                        <div className="flex items-center gap-1">
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "bags",
                                        row.remainingQuantity.bags
                                      );
                                    }}
                                  >
                                    -
                                  </Button>
                                </div>
                              }
                              title="Update Bag Quantity"
                              description="Please add remaining quantity of bags of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                          <span className="px-2 border h-7.5 flex items-center justify-center w-22 border rounded-md bg-gray-100 text-sm">
                            {row.remainingQuantity.bags} bags
                          </span>
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "bags",
                                        row.remainingQuantity.bags
                                      );
                                    }}
                                  >
                                    +
                                  </Button>
                                </div>
                              }
                              title="Update Bag Quantity"
                              description="Please add remaining quantity of bags of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                        </div>
                        <span>・</span>
                        <div className="flex items-center gap-1">
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "each",
                                        row.remainingQuantity.each
                                      );
                                    }}
                                  >
                                    -
                                  </Button>
                                </div>
                              }
                              title="Update Individual Quantity"
                              description="Please add remaining quantity of individual units of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                          <span className="px-2 border h-7.5 flex items-center justify-center w-22 border rounded-md bg-gray-100 text-sm">
                            {row.remainingQuantity.each} each
                          </span>
                          {status !== "confirm" && (
                            <CommonDialog
                              trigger={
                                <div className="flex bg-gray-200 rounded cursor-pointer hover:bg-gray-300">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEdit(
                                        row.ingredientId,
                                        "each",
                                        row.remainingQuantity.each
                                      );
                                    }}
                                  >
                                    +
                                  </Button>
                                </div>
                              }
                              title="Update Individual Quantity"
                              description="Please add remaining quantity of individual units of the item"
                              onConfirm={handleConfirmUpdate}
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
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-sm ${getConsumptionColor(
                            row.consumptionStatus
                          )}`}
                        >
                          {getConsumptionSymbol(row.consumptionStatus)}
                        </div>
                        {row.consumptionRate.boxes} Boxes ・{" "}
                        {row.consumptionRate.bags} Bags
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
