export type IngredientStage =
  | "to-prep"
  | "in-prep"
  | "check-temp"
  | "print-label"
  | "available"
  | "live";
export type IngredientCategory =
  | "off-cycle-prep"
  | "batch-prep"
  | "24-hours-prep";

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  quantity: number;
  unit: string;
  stage: IngredientStage;
  prepDurationMinutes: number;
  timerStartTime?: string;
  timerEndTime?: string;
  expiredQuantity: number;
  onHandQuantity?: number;
  availableQuantity?: number;
  available: boolean; // Boolean field to track if item is available or unavailable (separate from prep cycle stages)
  lastUpdated: string;
}

const mockIngredients: Ingredient[] = [
  // Off-cycle prep items (8 items)
  {
    id: "1",
    name: "French fries",
    category: "off-cycle-prep",
    quantity: 2,
    unit: "portions",
    stage: "to-prep",
    prepDurationMinutes: 1.5,
    expiredQuantity: 0,
    onHandQuantity: 0,
    available: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Potato wedges",
    category: "off-cycle-prep",
    quantity: 1,
    unit: "portions",
    stage: "to-prep",
    prepDurationMinutes: 2.0,
    expiredQuantity: 0,
    onHandQuantity: 0,
    available: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Hash brown patties",
    category: "off-cycle-prep",
    quantity: 3,
    unit: "pieces",
    stage: "to-prep",
    prepDurationMinutes: 1.0,
    expiredQuantity: 0,
    onHandQuantity: 0,
    available: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Onion rings",
    category: "off-cycle-prep",
    quantity: 1,
    unit: "portions",
    stage: "to-prep",
    prepDurationMinutes: 1.5,
    expiredQuantity: 0,
    onHandQuantity: 0,
    available: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Mozzarella sticks",
    category: "off-cycle-prep",
    quantity: 2,
    unit: "pieces",
    stage: "to-prep",
    prepDurationMinutes: 1.0,
    expiredQuantity: 0,
    onHandQuantity: 0,
    available: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Jalapeño poppers",
    category: "off-cycle-prep",
    quantity: 1,
    unit: "pieces",
    stage: "to-prep",
    prepDurationMinutes: 1.5,
    expiredQuantity: 0,
    onHandQuantity: 0,
    available: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "7",
    name: "Chicken nuggets",
    category: "off-cycle-prep",
    quantity: 1,
    unit: "pieces",
    stage: "to-prep",
    prepDurationMinutes: 1.5,
    expiredQuantity: 0,
    onHandQuantity: 0,
    available: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "8",
    name: "Popcorn chicken",
    category: "off-cycle-prep",
    quantity: 2,
    unit: "portions",
    stage: "to-prep",
    prepDurationMinutes: 1.0,
    expiredQuantity: 0,
    onHandQuantity: 0,
    available: true,
    lastUpdated: new Date().toISOString(),
  },

  // Batch prep items (10 items) - Updated with breakfast forecast quantities only
  {
    id: "9",
    name: "Beef burger patties",
    category: "batch-prep",
    quantity: 15, // From breakfast forecast only
    unit: "patties",
    stage: "to-prep",
    prepDurationMinutes: 2.0,
    expiredQuantity: 0,
    onHandQuantity: 0,
    available: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "10",
    name: "Grilled chicken fillets",
    category: "batch-prep",
    quantity: 12, // From breakfast forecast only
    unit: "fillets",
    stage: "to-prep",
    prepDurationMinutes: 2.0,
    expiredQuantity: 0,
    onHandQuantity: 0,
    available: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "11",
    name: "Crispy chicken fillets",
    category: "batch-prep",
    quantity: 10, // From breakfast forecast only
    unit: "fillets",
    stage: "to-prep",
    prepDurationMinutes: 1.5,
    expiredQuantity: 0,
    onHandQuantity: 0,
    available: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "12",
    name: "Chicken strips",
    category: "batch-prep",
    quantity: 8, // From breakfast forecast only
    unit: "strips",
    stage: "to-prep",
    prepDurationMinutes: 1.5,
    expiredQuantity: 0,
    onHandQuantity: 0,
    available: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "13",
    name: "Fried chicken pieces",
    category: "batch-prep",
    quantity: 6, // From breakfast forecast only
    unit: "pieces",
    stage: "to-prep",
    prepDurationMinutes: 2.0,
    expiredQuantity: 0,
    onHandQuantity: 0,
    available: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "14",
    name: "Bacon strips",
    category: "batch-prep",
    quantity: 25, // From breakfast forecast only
    unit: "strips",
    stage: "to-prep",
    prepDurationMinutes: 1.5,
    expiredQuantity: 0,
    onHandQuantity: 0,
    available: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "15",
    name: "Sausage patties",
    category: "batch-prep",
    quantity: 20, // From breakfast forecast only
    unit: "patties",
    stage: "to-prep",
    prepDurationMinutes: 1.5,
    expiredQuantity: 0,
    onHandQuantity: 0,
    available: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "16",
    name: "Hot dog franks",
    category: "batch-prep",
    quantity: 12, // From breakfast forecast only
    unit: "franks",
    stage: "to-prep",
    prepDurationMinutes: 1.0,
    expiredQuantity: 0,
    onHandQuantity: 0,
    available: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "17",
    name: "Breaded fish fillets",
    category: "batch-prep",
    quantity: 8, // From breakfast forecast only
    unit: "fillets",
    stage: "to-prep",
    prepDurationMinutes: 2.0,
    expiredQuantity: 0,
    onHandQuantity: 0,
    available: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "18",
    name: "Roast beef slices",
    category: "batch-prep",
    quantity: 15, // From breakfast forecast only
    unit: "slices",
    stage: "to-prep",
    prepDurationMinutes: 1.0,
    expiredQuantity: 0,
    onHandQuantity: 0,
    available: true,
    lastUpdated: new Date().toISOString(),
  },

  // 24-hour prep items (3 items) - Synced with breakfast forecast quantities
  {
    id: "19",
    name: "Tortilla chips",
    category: "24-hours-prep",
    quantity: 35, // From breakfast forecast (24-hour items only appear in breakfast daypart)
    unit: "bags",
    stage: "to-prep",
    prepDurationMinutes: 0.5,
    expiredQuantity: 0,
    onHandQuantity: 0,
    available: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "20",
    name: "Hard taco shells",
    category: "24-hours-prep",
    quantity: 75, // From breakfast forecast (24-hour items only appear in breakfast daypart)
    unit: "shells",
    stage: "to-prep",
    prepDurationMinutes: 1.0,
    expiredQuantity: 0,
    onHandQuantity: 0,
    available: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "21",
    name: "Tostada shells",
    category: "24-hours-prep",
    quantity: 60, // From breakfast forecast (24-hour items only appear in breakfast daypart)
    unit: "shells",
    stage: "to-prep",
    prepDurationMinutes: 0.5,
    expiredQuantity: 0,
    onHandQuantity: 0,
    available: true,
    lastUpdated: new Date().toISOString(),
  },
];

export default mockIngredients;
