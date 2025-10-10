import React, { useState, useMemo, useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSearchStore, usePrintLabelStore } from "@/store/forecastStore";

interface Item {
  id: number;
  name: string;
  labelCount: number;
  isSelected: boolean;
}

export default function LabelPrintInterface() {
  const [items, setItems] = useState<Item[]>([
    { id: 1, name: "Grilled Chicken", labelCount: 10, isSelected: false },
    { id: 2, name: "Beef Burger Patty", labelCount: 10, isSelected: false },
    { id: 3, name: "Bacon Strips", labelCount: 10, isSelected: false },
    { id: 4, name: "Sliced Lettuce", labelCount: 10, isSelected: false },
    { id: 5, name: "Diced Tomatoes", labelCount: 10, isSelected: false },
    { id: 6, name: "Sliced Cheese", labelCount: 10, isSelected: false },
    { id: 7, name: "Chopped Onions", labelCount: 10, isSelected: false },
    { id: 8, name: "Sautéed Mushrooms", labelCount: 10, isSelected: false },
    { id: 9, name: "Crispy Chicken", labelCount: 10, isSelected: false },
    { id: 10, name: "Fish Fillets", labelCount: 10, isSelected: false },
    { id: 11, name: "Roast Beef", labelCount: 10, isSelected: false },
    { id: 12, name: "Chicken Strips", labelCount: 10, isSelected: false },
  ]);

  const [selectAll, setSelectAll] = useState(false);
  const { searchTerm } = useSearchStore();
  const { setSelectedItemsCount } = usePrintLabelStore();

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return items;
    }
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  useEffect(() => {
    const selectedCount = items.filter((item) => item.isSelected).length;
    setSelectedItemsCount(selectedCount);
  }, [items, setSelectedItemsCount]);

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setItems(
      items.map((item) => {
        const isInFilteredList = filteredItems.some(
          (filtered) => filtered.id === item.id
        );
        return isInFilteredList ? { ...item, isSelected: newSelectAll } : item;
      })
    );
  };

  const handleSelectItem = (id: number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, isSelected: !item.isSelected } : item
      )
    );

    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, isSelected: !item.isSelected } : item
    );
    setSelectAll(updatedItems.every((item) => item.isSelected));
  };

  const handleDecrement = (id: number) => {
    setItems(
      items.map((item) =>
        item.id === id && item.labelCount > 0
          ? { ...item, labelCount: item.labelCount - 1 }
          : item
      )
    );
  };

  const handleIncrement = (id: number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, labelCount: item.labelCount + 1 } : item
      )
    );
  };

  const handleInputChange = (id: number, value: string) => {
    const num = parseInt(value) || 0;
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, labelCount: Math.max(0, num) } : item
      )
    );
  };

  return (
    <div className="w-full mx-auto p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#5B6477] hover:bg-[#5B6477] border-none">
              <TableHead className="w-12 pl-2 text-white px-5 py-3">
                <div className="flex pl-0 items-center justify-center">
                  <div
                    onClick={handleSelectAll}
                    className={`w-6 h-6 cursor-pointer border-3 transition-colors ${
                      selectAll
                        ? "bg-transparent border-white"
                        : "bg-transparent border-white"
                    }`}
                  >
                    {selectAll && (
                      <div className="w-full h-full flex items-center justify-center"></div>
                    )}
                  </div>
                </div>
              </TableHead>
              <TableHead className="text-white font-medium w-50 border border-r-white px-5 py-3">
                Item Name
              </TableHead>
              <TableHead className="text-white font-medium text-left w-100 px-5 py-3">
                Label Count to Print
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-gray-500 text-lg font-medium">
                      No results found
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow
                  key={item.id}
                  className={`transition-colors ${
                    item.isSelected
                      ? "bg-gray-200 hover:bg-gray-300"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <TableCell className="w-12">
                    <div className="flex items-center justify-center gap-2">
                      <div
                        onClick={() => handleSelectItem(item.id)}
                        className={`w-6 h-6 cursor-pointer border-2 transition-colors flex items-center justify-center ${
                          item.isSelected
                            ? "bg-white border-3 border-[#5b6477]"
                            : "bg-transparent border-3 border-[#5b6477]"
                        }`}
                      >
                        {item.isSelected && (
                          <div className="w-4 h-4 bg-[#5b6477]" />
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-black w-50">{item.name}</TableCell>
                  <TableCell className="text-left w-100">
                    <div className="flex  gap-3">
                      <button
                        onClick={() => handleDecrement(item.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-gray-300 hover:bg-gray-100 transition-colors"
                        disabled={item.labelCount === 0}
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>

                      <div className="relative">
                        <input
                          type="text"
                          value={`${item.labelCount} ${"Labels"}`}
                          onChange={(e) =>
                            handleInputChange(item.id, e.target.value)
                          }
                          disabled
                          className="w-30 h-8 bg-white text-center border border-gray-300 rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-gray-300"
                        />
                      </div>

                      <button
                        onClick={() => handleIncrement(item.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-gray-300 hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
