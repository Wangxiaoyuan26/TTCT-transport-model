// 招标杆煤运输收入成本单价格格模型

export interface ModelParameter {
  key: string;
  label: string;
  labelEn: string;
  value: number;
  unit: string;
  type: 'variable' | 'fixed' | 'calculated';
  category: string;
  description?: string;
}

export interface ModelResult {
  label: string;
  labelEn: string;
  value: number;
  unit: string;
  type: 'cost' | 'revenue' | 'profit';
}

// 模型参数定义
export const modelParameters: ModelParameter[] = [
  // 收入相关参数
  {
    key: 'price',
    label: '单价',
    labelEn: 'Unit Price',
    value: 175,
    unit: '蒙图/吨*公里',
    type: 'variable',
    category: 'income',
    description: '运输单价'
  },
  {
    key: 'distance',
    label: '公里数',
    labelEn: 'Distance',
    value: 495,
    unit: '公里',
    type: 'fixed',
    category: 'income',
    description: '运输距离'
  },
  {
    key: 'vatRate',
    label: '增值税率',
    labelEn: 'VAT Rate',
    value: 10,
    unit: '%',
    type: 'fixed',
    category: 'income',
    description: '增值税率'
  },
  {
    key: 'exchangeRate',
    label: '汇率',
    labelEn: 'Exchange Rate',
    value: 524,
    unit: '人民币/蒙图',
    type: 'variable',
    category: 'income',
    description: '人民币兑蒙图汇率'
  },
  // 成本相关参数
  {
    key: 'fuelPriceWithVat',
    label: '柴油含税价格',
    labelEn: 'Fuel Price (with VAT)',
    value: 5000,
    unit: '蒙图/升',
    type: 'variable',
    category: 'cost',
    description: '柴油含税价格'
  },
  {
    key: 'repairFee',
    label: '维修费标准',
    labelEn: 'Repair Fee Standard',
    value: 31.7,
    unit: '蒙图/吨*公里',
    type: 'variable',
    category: 'cost',
    description: '维修费标准'
  },
  {
    key: 'fuelConsumption',
    label: '往返油耗',
    labelEn: 'Fuel Consumption (Round Trip)',
    value: 860,
    unit: '升/趟',
    type: 'variable',
    category: 'cost',
    description: '往返油耗量'
  },
  {
    key: 'tripsPerMonth',
    label: '每月趟数',
    labelEn: 'Trips per Month',
    value: 10,
    unit: '趟',
    type: 'variable',
    category: 'cost',
    description: '每月运输趟数(参考值)'
  },
  {
    key: 'driverSalary',
    label: '司机税前工资',
    labelEn: 'Driver Salary (before tax)',
    value: 950000,
    unit: '蒙图/趟',
    type: 'variable',
    category: 'cost',
    description: '司机税前工资'
  },
  {
    key: 'mealCost',
    label: '餐费',
    labelEn: 'Meal Cost',
    value: 50000,
    unit: '蒙图/趟',
    type: 'variable',
    category: 'cost',
    description: '每日餐费'
  },
  {
    key: 'loadCapacity',
    label: '装载量',
    labelEn: 'Loading Capacity',
    value: 135,
    unit: '吨',
    type: 'fixed',
    category: 'cost',
    description: '车辆装载容量'
  },
  {
    key: 'shortDistanceCost',
    label: '短盘变动成本',
    labelEn: 'Short Distance Variable Cost',
    value: 13.086721,
    unit: '元/吨',
    type: 'calculated',
    category: 'cost',
    description: '短盘变动成本'
  },
  {
    key: 'agvYardCost',
    label: 'AGV堆场费用',
    labelEn: 'AGV Yard Fee',
    value: 6.979585,
    unit: '元/吨',
    type: 'calculated',
    category: 'cost',
    description: 'AGV堆场费用'
  },
  {
    key: 'hotelCost',
    label: '住宿费',
    labelEn: 'Hotel Cost',
    value: 0,
    unit: '元/吨',
    type: 'variable',
    category: 'cost',
    description: '住宿费用'
  }
];

// 计算收入
export function calculateRevenue(params: Record<string, number>): number {
  const { price, distance, exchangeRate, vatRate } = params;
  // 收入 = 单价 * 公里数 / 汇率 / (1 + 增值税率)
  return (price * distance) / exchangeRate / (1 + vatRate / 100);
}

// 计算不含税油价
export function calculateFuelPriceWithoutVat(fuelPriceWithVat: number, vatRate: number): number {
  return fuelPriceWithVat / (1 + vatRate / 100);
}

// 计算每吨变动成本
export function calculateVariableCosts(params: Record<string, number>): {
  // 计算结果
  fuelExpense: number;
  laborExpense: number;
  mealExpense: number;
  maintenanceExpense: number;
  tollFee: number;
  totalVariableCost: number;
  shortDistanceCost: number;
  agvYardCost: number;
  hotelCost: number;
  // 计算过程（用于展示）
  calculationSteps: {
    fuelPriceWithoutVat: number;
    fuelExpenseCalc: string;
    laborExpenseCalc: string;
    mealExpenseCalc: string;
    maintenanceExpenseCalc: string;
    tollFeeCalc: string;
  };
} {
  const {
    fuelPriceWithVat,
    exchangeRate,
    vatRate,
    distance,
    repairFee,
    fuelConsumption,
    driverSalary,
    mealCost,
    loadCapacity,
    shortDistanceCost,
    agvYardCost,
    hotelCost
  } = params;

  // 不含税油价
  const fuelPriceWithoutVat = fuelPriceWithVat / (1 + vatRate / 100);

  // 燃油费用 = (油价不含税 * 油耗 * 2往返) / 装载量 / 汇率
  const fuelExpense = (fuelPriceWithoutVat * fuelConsumption) / loadCapacity / exchangeRate;

  // 人工费用 = 司机工资 / 装载量 / 汇率
  const laborExpense = driverSalary / loadCapacity / exchangeRate;

  // 餐费 = 餐费 / 装载量 / 汇率
  const mealExpense = mealCost / loadCapacity / exchangeRate;

  // 维修费用 = 维修费标准 * 公里数 / 汇率
  const maintenanceExpense = (repairFee * distance) / exchangeRate;

  // 通行费（ Toll Fee） = 假设 16.3 元/吨（固定值）
  const tollFee = 16.3;

  // 总中盘变动成本
  const totalVariableCost = fuelExpense + laborExpense + mealExpense + maintenanceExpense + tollFee;

  // 住宿费用
  const hotelCostPerTon = hotelCost;

  return {
    fuelExpense,
    laborExpense,
    mealExpense,
    maintenanceExpense,
    tollFee,
    totalVariableCost,
    shortDistanceCost,
    agvYardCost,
    hotelCost: hotelCostPerTon,
    calculationSteps: {
      fuelPriceWithoutVat,
      fuelExpenseCalc: `(${fuelPriceWithoutVat.toFixed(2)} × ${fuelConsumption}) ÷ ${loadCapacity} ÷ ${exchangeRate}`,
      laborExpenseCalc: `${driverSalary.toLocaleString()} ÷ ${loadCapacity} ÷ ${exchangeRate}`,
      mealExpenseCalc: `${mealCost.toLocaleString()} ÷ ${loadCapacity} ÷ ${exchangeRate}`,
      maintenanceExpenseCalc: `${repairFee} × ${distance} ÷ ${exchangeRate}`,
      tollFeeCalc: `16.3 元/吨（固定）`,
    }
  };
}

// 计算利润
export function calculateProfit(revenue: number, variableCosts: ReturnType<typeof calculateVariableCosts>): number {
  const totalCost = variableCosts.totalVariableCost + 
    variableCosts.shortDistanceCost + 
    variableCosts.agvYardCost +
    variableCosts.hotelCost;
  return revenue - totalCost;
}

// 计算完整模型
export function calculateModel(params: Record<string, number>): {
  revenue: number;
  costs: ReturnType<typeof calculateVariableCosts>;
  profit: number;
  profitMargin: number;
} {
  const revenue = calculateRevenue(params);
  const costs = calculateVariableCosts(params);
  const profit = calculateProfit(revenue, costs);
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

  return {
    revenue,
    costs,
    profit,
    profitMargin
  };
}
