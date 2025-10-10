import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CircularGauge from "./CircularGuage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const DASHBOARD_DATA = [
  {
    itemName: "Item Name",
    forecastQuantity: 10,
    approvedQuantity: 12,
    preparedQuantity: 18,
    idealQuantity: 2,
    forecastAccuracy: 62.5,
    executionCompliance: 66.7,
    manualEffectiveness: 88.9,
    foodQuality: 88.9,
    approvalDelta: 0,
  },
  {
    itemName: "Item Name",
    forecastQuantity: 10,
    approvedQuantity: 12,
    preparedQuantity: 18,
    idealQuantity: 2,
    forecastAccuracy: 62.5,
    executionCompliance: 66.7,
    manualEffectiveness: 88.9,
    foodQuality: 88.9,
    approvalDelta: 0,
  },
  {
    itemName: "Item Name",
    forecastQuantity: 10,
    approvedQuantity: 12,
    preparedQuantity: 18,
    idealQuantity: 2,
    forecastAccuracy: 62.5,
    executionCompliance: 66.7,
    manualEffectiveness: 88.9,
    foodQuality: 88.9,
    approvalDelta: 0,
  },
  {
    itemName: "Item Name",
    forecastQuantity: 10,
    approvedQuantity: 12,
    preparedQuantity: 18,
    idealQuantity: 2,
    forecastAccuracy: 62.5,
    executionCompliance: 66.7,
    manualEffectiveness: 88.9,
    foodQuality: 88.9,
    approvalDelta: -1,
  },
  {
    itemName: "Item Name",
    forecastQuantity: 10,
    approvedQuantity: 12,
    preparedQuantity: 18,
    idealQuantity: 2,
    forecastAccuracy: 62.5,
    executionCompliance: 66.7,
    manualEffectiveness: 88.9,
    foodQuality: 88.9,
    approvalDelta: -1,
  },
  {
    itemName: "Item Name",
    forecastQuantity: 10,
    approvedQuantity: 12,
    preparedQuantity: 18,
    idealQuantity: 2,
    forecastAccuracy: 62.5,
    executionCompliance: 66.7,
    manualEffectiveness: 88.9,
    foodQuality: 88.9,
    approvalDelta: 0,
  },
  {
    itemName: "Item Name",
    forecastQuantity: 10,
    approvedQuantity: 12,
    preparedQuantity: 18,
    idealQuantity: 2,
    forecastAccuracy: 62.5,
    executionCompliance: 66.7,
    manualEffectiveness: 88.9,
    foodQuality: 88.9,
    approvalDelta: 0,
  },
  {
    itemName: "Item Name",
    forecastQuantity: 10,
    approvedQuantity: 12,
    preparedQuantity: 18,
    idealQuantity: 2,
    forecastAccuracy: 62.5,
    executionCompliance: 66.7,
    manualEffectiveness: 88.9,
    foodQuality: 88.9,
    approvalDelta: 0,
  },
];

interface MetricCardProps {
  title: string;
  percentage: number;
}
const MetricCard: React.FC<MetricCardProps> = ({ title, percentage }) => {
  const colorClass =
    percentage >= 90
      ? "text-green-600"
      : percentage >= 60
      ? "text-yellow-500"
      : "text-red-600";

  return (
    <Card className="flex p-0 w-73 my-2 flex-row items-center justify-between">
      <CardHeader className="flex items-center justify-between space-y-0 p-4 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className=" pt-0">
        <CircularGauge
          percentage={percentage}
          label=""
          colorClass={colorClass}
        />
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  const tableHeaders = [
    "Item Name",
    "Forecast Quantity",
    "Approved Quantity",
    "Prepared Quantity",
    "Ideal Quantity",
    "Forecast Accuracy",
    "Execution Compliance",
    "Manual Effectiveness",
    "Food Quality",
  ];

  const renderQuantity = (value: number, suffix: string, delta: number) => (
    <div className="flex items-center space-x-1">
      <span>
        {value} {suffix}
      </span>
      {delta !== 0 && (
        <span className="text-xs bg-red-100 text-red-700 font-semibold px-1 py-0.5 rounded-sm">
          {delta}
        </span>
      )}
    </div>
  );

  return (
    <Card className="overflow-auto rounded-xl p-0">
      <CardHeader className=" bg-[#edeff6] overflow-auto p-0 rounded-xl gap-0">
        <Tabs defaultValue="Breakfast" className="rounded-xl bg-[#edeff6] p-4 ">
          <TabsList className="bg-[#dadee9] h-auto rounded-lg border-2 border-gray-300">
            {[
              "Breakfast",
              "Lunch",
              "Afternoon",
              "Evening",
              "Dinner",
              "Late Night",
            ].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="px-4 rounded-lg py-3 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2   data-[state=active]:text-white data-[state=active]:bg-[#4c6196] transition-all duration-150"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="Breakfast" className="">
            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 bg-[#dadee9] mb-2 p-2 rounded-lg min-h-30">
              <MetricCard title="Forecast Accuracy" percentage={92} />
              <MetricCard title="Execution Compliance" percentage={60} />
              <MetricCard
                title="Manual changes Effectiveness"
                percentage={60}
              />
              <MetricCard title="Food Quality" percentage={22} />
            </div>
            <div className="overflow-auto border rounded-lg bg-white shadow-md">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-500 text-white hover:bg-gray-500">
                    {tableHeaders.map((header, i) => (
                      <TableHead
                        key={i}
                        className="text-white border border-r border-white px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-normal break-words"
                      >
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {DASHBOARD_DATA.map((item, i) => (
                    <TableRow key={i} className="hover:bg-gray-50">
                      <TableCell className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2
                   l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 
                   20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 
                   00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {item.itemName}
                      </TableCell>

                      <TableCell>
                        {renderQuantity(item.forecastQuantity, "Bags", 0)}
                      </TableCell>
                      <TableCell>
                        {renderQuantity(
                          item.approvedQuantity,
                          "Bags",
                          item.approvalDelta
                        )}
                      </TableCell>
                      <TableCell>
                        {renderQuantity(item.preparedQuantity, "Bags", 0)}
                      </TableCell>
                      <TableCell>
                        {renderQuantity(item.idealQuantity, "Bags", 0)}
                      </TableCell>
                      <TableCell>{item.forecastAccuracy}%</TableCell>
                      <TableCell>{item.executionCompliance}%</TableCell>
                      <TableCell>{item.manualEffectiveness}%</TableCell>
                      <TableCell>{item.foodQuality}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="Lunch" className="">
            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 bg-[#dadee9] mb-2 p-2 rounded-lg min-h-30">
              <MetricCard title="Forecast Accuracy" percentage={92} />
              <MetricCard title="Execution Compliance" percentage={60} />
              <MetricCard
                title="Manual changes Effectiveness"
                percentage={60}
              />
              <MetricCard title="Food Quality" percentage={22} />
            </div>
            <div className="overflow-auto border rounded-lg bg-white shadow-md">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-500 text-white hover:bg-gray-500">
                    {tableHeaders.map((header, i) => (
                      <TableHead
                        key={i}
                        className="text-white border border-r border-white px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-normal break-words"
                      >
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {DASHBOARD_DATA.map((item, i) => (
                    <TableRow key={i} className="hover:bg-gray-50">
                      <TableCell className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2
                   l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 
                   20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 
                   00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {item.itemName}
                      </TableCell>

                      <TableCell>
                        {renderQuantity(item.forecastQuantity, "Bags", 0)}
                      </TableCell>
                      <TableCell>
                        {renderQuantity(
                          item.approvedQuantity,
                          "Bags",
                          item.approvalDelta
                        )}
                      </TableCell>
                      <TableCell>
                        {renderQuantity(item.preparedQuantity, "Bags", 0)}
                      </TableCell>
                      <TableCell>
                        {renderQuantity(item.idealQuantity, "Bags", 0)}
                      </TableCell>
                      <TableCell>{item.forecastAccuracy}%</TableCell>
                      <TableCell>{item.executionCompliance}%</TableCell>
                      <TableCell>{item.manualEffectiveness}%</TableCell>
                      <TableCell>{item.foodQuality}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="Afternoon" className="">
            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 bg-[#dadee9] mb-2 p-2 rounded-lg min-h-30">
              <MetricCard title="Forecast Accuracy" percentage={92} />
              <MetricCard title="Execution Compliance" percentage={60} />
              <MetricCard
                title="Manual changes Effectiveness"
                percentage={60}
              />
              <MetricCard title="Food Quality" percentage={22} />
            </div>
            <div className="overflow-auto border rounded-lg bg-white shadow-md">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-500 text-white hover:bg-gray-500">
                    {tableHeaders.map((header, i) => (
                      <TableHead
                        key={i}
                        className="text-white border border-r border-white px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-normal break-words"
                      >
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {DASHBOARD_DATA.map((item, i) => (
                    <TableRow key={i} className="hover:bg-gray-50">
                      <TableCell className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2
                   l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 
                   20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 
                   00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {item.itemName}
                      </TableCell>

                      <TableCell>
                        {renderQuantity(item.forecastQuantity, "Bags", 0)}
                      </TableCell>
                      <TableCell>
                        {renderQuantity(
                          item.approvedQuantity,
                          "Bags",
                          item.approvalDelta
                        )}
                      </TableCell>
                      <TableCell>
                        {renderQuantity(item.preparedQuantity, "Bags", 0)}
                      </TableCell>
                      <TableCell>
                        {renderQuantity(item.idealQuantity, "Bags", 0)}
                      </TableCell>
                      <TableCell>{item.forecastAccuracy}%</TableCell>
                      <TableCell>{item.executionCompliance}%</TableCell>
                      <TableCell>{item.manualEffectiveness}%</TableCell>
                      <TableCell>{item.foodQuality}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="Evening" className="">
            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 bg-[#dadee9] mb-2 p-2 rounded-lg min-h-30">
              <MetricCard title="Forecast Accuracy" percentage={92} />
              <MetricCard title="Execution Compliance" percentage={60} />
              <MetricCard
                title="Manual changes Effectiveness"
                percentage={60}
              />
              <MetricCard title="Food Quality" percentage={22} />
            </div>
            <div className="overflow-auto border rounded-lg bg-white shadow-md">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-500 text-white hover:bg-gray-500">
                    {tableHeaders.map((header, i) => (
                      <TableHead
                        key={i}
                        className="text-white border border-r border-white px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-normal break-words"
                      >
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {DASHBOARD_DATA.map((item, i) => (
                    <TableRow key={i} className="hover:bg-gray-50">
                      <TableCell className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2
                   l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 
                   20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 
                   00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {item.itemName}
                      </TableCell>

                      <TableCell>
                        {renderQuantity(item.forecastQuantity, "Bags", 0)}
                      </TableCell>
                      <TableCell>
                        {renderQuantity(
                          item.approvedQuantity,
                          "Bags",
                          item.approvalDelta
                        )}
                      </TableCell>
                      <TableCell>
                        {renderQuantity(item.preparedQuantity, "Bags", 0)}
                      </TableCell>
                      <TableCell>
                        {renderQuantity(item.idealQuantity, "Bags", 0)}
                      </TableCell>
                      <TableCell>{item.forecastAccuracy}%</TableCell>
                      <TableCell>{item.executionCompliance}%</TableCell>
                      <TableCell>{item.manualEffectiveness}%</TableCell>
                      <TableCell>{item.foodQuality}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="Dinner" className="">
            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 bg-[#dadee9] mb-2 p-2 rounded-lg min-h-30">
              <MetricCard title="Forecast Accuracy" percentage={92} />
              <MetricCard title="Execution Compliance" percentage={60} />
              <MetricCard
                title="Manual changes Effectiveness"
                percentage={60}
              />
              <MetricCard title="Food Quality" percentage={22} />
            </div>
            <div className="overflow-auto border rounded-lg bg-white shadow-md">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-500 text-white hover:bg-gray-500">
                    {tableHeaders.map((header, i) => (
                      <TableHead
                        key={i}
                        className="text-white border border-r border-white px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-normal break-words"
                      >
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {DASHBOARD_DATA.map((item, i) => (
                    <TableRow key={i} className="hover:bg-gray-50">
                      <TableCell className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2
                   l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 
                   20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 
                   00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {item.itemName}
                      </TableCell>

                      <TableCell>
                        {renderQuantity(item.forecastQuantity, "Bags", 0)}
                      </TableCell>
                      <TableCell>
                        {renderQuantity(
                          item.approvedQuantity,
                          "Bags",
                          item.approvalDelta
                        )}
                      </TableCell>
                      <TableCell>
                        {renderQuantity(item.preparedQuantity, "Bags", 0)}
                      </TableCell>
                      <TableCell>
                        {renderQuantity(item.idealQuantity, "Bags", 0)}
                      </TableCell>
                      <TableCell>{item.forecastAccuracy}%</TableCell>
                      <TableCell>{item.executionCompliance}%</TableCell>
                      <TableCell>{item.manualEffectiveness}%</TableCell>
                      <TableCell>{item.foodQuality}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="Late Night" className="">
            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 bg-[#dadee9] mb-2 p-2 rounded-lg min-h-30">
              <MetricCard title="Forecast Accuracy" percentage={92} />
              <MetricCard title="Execution Compliance" percentage={60} />
              <MetricCard
                title="Manual changes Effectiveness"
                percentage={60}
              />
              <MetricCard title="Food Quality" percentage={22} />
            </div>
            <div className="overflow-auto border rounded-lg bg-white shadow-md">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-500 text-white hover:bg-gray-500">
                    {tableHeaders.map((header, i) => (
                      <TableHead
                        key={i}
                        className="text-white border border-r border-white px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-normal break-words"
                      >
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {DASHBOARD_DATA.map((item, i) => (
                    <TableRow key={i} className="hover:bg-gray-50">
                      <TableCell className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2
                   l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 
                   20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 
                   00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {item.itemName}
                      </TableCell>

                      <TableCell>
                        {renderQuantity(item.forecastQuantity, "Bags", 0)}
                      </TableCell>
                      <TableCell>
                        {renderQuantity(
                          item.approvedQuantity,
                          "Bags",
                          item.approvalDelta
                        )}
                      </TableCell>
                      <TableCell>
                        {renderQuantity(item.preparedQuantity, "Bags", 0)}
                      </TableCell>
                      <TableCell>
                        {renderQuantity(item.idealQuantity, "Bags", 0)}
                      </TableCell>
                      <TableCell>{item.forecastAccuracy}%</TableCell>
                      <TableCell>{item.executionCompliance}%</TableCell>
                      <TableCell>{item.manualEffectiveness}%</TableCell>
                      <TableCell>{item.foodQuality}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
}
