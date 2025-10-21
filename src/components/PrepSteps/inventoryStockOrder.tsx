import React, { useEffect, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/Button";
import { useStatusStore } from "@/store/forecastStore";
import { api } from "@/lib/api";
import CustomScrollbar from "../ui/CustomScrollbar";

interface QuantityCount {
  units?: number;
  bags?: number;
  boxes?: number;
}

interface InventoryItem {
  id: string;
  itemName: string;
  category: string;
  lastUpdatedCount: QuantityCount;
  prevOrderQuantity: QuantityCount;
  nxtOrderQuantity: QuantityCount;
  ExpOnHandQuantity: QuantityCount;
}

export default function InventoryStockOrder() {
  const { status } = useStatusStore();
  const [data, setData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.InventoryOrder();
      setData(res.items || []);
    } catch (err) {
      console.error("Failed to fetch inventory data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const offCycleData = data.filter(
    (item) => item.category === "Off-cycle Fry Prep Items"
  );
  const batchData = data.filter((item) => item.category === "Batch Prep Items");
  const dayData = data.filter((item) => item.category === "24-hours Items");
  const nonFoodData = data.filter((item) => item.category === "Non-Food Items");

  const updateValue = (
    itemId: string,
    field: "boxes" | "bags" | "units",
    delta: number
  ) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              nxtOrderQuantity: {
                ...item.nxtOrderQuantity,
                [field]: Math.max(
                  0,
                  (item.nxtOrderQuantity[field] || 0) + delta
                ),
              },
            }
          : item
      )
    );
  };

  const renderQuantity = (quantity: QuantityCount): string => {
    const parts: string[] = [];

    if (quantity.units && quantity.units > 0) {
      parts.push(`${quantity.units} Units`);
    }
    if (quantity.boxes && quantity.boxes > 0) {
      parts.push(`${quantity.boxes} Boxes`);
    }
    if (quantity.bags && quantity.bags > 0) {
      parts.push(`${quantity.bags} Bags`);
    }

    return parts.join(" ・ ") || "—";
  };

  if (loading) {
    return (
      <div className="flex text-center justify-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  const renderTable = (tableData: InventoryItem[], categoryName: string) => {
    if (tableData.length === 0) {
      return (
        <div className="text-center py-8 bg-white rounded">
          <p className="text-gray-500">No items found in this category</p>
        </div>
      );
    }

    return (
      <div>
        <Table>
          <TableHeader className="h-15">
            <TableRow className="bg-gray-500 text-white hover:bg-gray-500">
              <TableHead className="text-white border border-r-white w-80 max-w-80">
                Item Name
              </TableHead>
              <TableHead className="text-white border border-r-white">
                Last Updated Count
              </TableHead>
              <TableHead className="text-white border border-r-white">
                Previous Order Quantity
              </TableHead>
              <TableHead className="text-white border border-r-white">
                Next Order Quantity
              </TableHead>
              <TableHead className="text-white border border-r-white">
                Expected On-Hand Quantity
                <br /> on the day of delivery
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="border-1 border-gray-500 bg-white">
            {tableData.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center ">
                    <span className="text-xs">🖼️</span>
                  </div>
                  <div
                    className="w-80 max-w-80 truncate "
                    title={row.itemName} // shows tooltip on hover
                  >
                    {row.itemName}
                  </div>
                </TableCell>

                <TableCell>{renderQuantity(row.lastUpdatedCount)}</TableCell>

                <TableCell>{renderQuantity(row.prevOrderQuantity)}</TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    {row.nxtOrderQuantity.boxes !== undefined && (
                      <div className="flex items-center gap-1">
                        {status !== "confirm" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateValue(row.id, "boxes", -1)}
                          >
                            -
                          </Button>
                        )}
                        <span className="px-2 border rounded bg-gray-100 text-sm">
                          {row.nxtOrderQuantity.boxes} boxes
                        </span>
                        {status !== "confirm" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateValue(row.id, "boxes", 1)}
                          >
                            +
                          </Button>
                        )}
                      </div>
                    )}
                    {row.nxtOrderQuantity.bags !== undefined && (
                      <div className="flex items-center gap-1">
                        {status !== "confirm" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateValue(row.id, "bags", -1)}
                          >
                            -
                          </Button>
                        )}
                        <span className="px-2 border rounded bg-gray-100 text-sm">
                          {row.nxtOrderQuantity.bags} bags
                        </span>
                        {status !== "confirm" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateValue(row.id, "bags", 1)}
                          >
                            +
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell>{renderQuantity(row.ExpOnHandQuantity)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div>
      <div
        ref={scrollContainerRef}
        className="pr-18 h-175 overflow-y-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div>
          <div className="bg-gray-200 p-2 mb-2 rounded-xl">
            <div
              className="p-2 bg-[#dadee9] rounded"
              data-day-part="Off-cycle prep items"
            >
              <h1 className="font-semibold text-lg">
                Off-Cycle Fry Prep Items
              </h1>
            </div>
            <div className="mt-5">
              {renderTable(offCycleData, "Off-Cycle Fry Prep Items")}
            </div>
          </div>

          <div className="bg-gray-200 p-2 mb-2 rounded-xl">
            <div
              className="p-2 bg-[#dadee9] rounded"
              data-day-part="Batch Prep Items"
            >
              <h1 className="font-semibold text-lg">Batch Prep Items</h1>
            </div>
            <div className="mt-5">
              {renderTable(batchData, "Batch Prep Items")}
            </div>
          </div>

          <div className="bg-gray-200 p-2 mb-2 rounded-xl">
            <div
              className="p-2 bg-[#dadee9] rounded"
              data-day-part="24 Hours Prep Items"
            >
              <h1 className="font-semibold text-lg">24-hours Items</h1>
            </div>
            <div className="mt-5">{renderTable(dayData, "24-hours Items")}</div>
          </div>

          <div className="bg-gray-200 p-2 mb-2 rounded-xl">
            <div
              className="p-2 bg-[#dadee9] rounded"
              data-day-part="Non-Food Items"
            >
              <h1 className="font-semibold text-lg">Non-Food Items</h1>
            </div>
            <div className="mt-5">
              {renderTable(nonFoodData, "Non-Food Items")}
            </div>
          </div>
        </div>
        {data.length > 0 && (
          <div className="absolute bg-[#dadee9] p-2 rounded-lg right-5 top-[55%] transform -translate-y-1/2">
            <CustomScrollbar
              scrollContainerRef={scrollContainerRef}
              numberOfBoxes={Math.max(
                [offCycleData, batchData, dayData, nonFoodData].filter(
                  (arr) => arr.length > 0
                ).length,
                1
              )}
              dayParts={
                [
                  offCycleData.length > 0 && "Off-cycle prep items",
                  batchData.length > 0 && "Batch Prep Items",
                  dayData.length > 0 && "24 Hours Prep Items",
                  nonFoodData.length > 0 && "Non-Food Items",
                ].filter(Boolean) as string[]
              }
              height={150}
            />
          </div>
        )}
      </div>
    </div>
  );
}
