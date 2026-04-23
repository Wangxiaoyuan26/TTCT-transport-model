'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { modelParameters, calculateModel, calculateFuelPriceWithoutVat } from '@/lib/price-model';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Fuel, 
  Users, 
  Wrench, 
  Truck,
  Download,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';

// 参数滑动范围配置
const sliderConfig: Record<string, { min: number; max: number; step: number }> = {
  price: { min: 100, max: 300, step: 5 },
  distance: { min: 300, max: 800, step: 10 },
  exchangeRate: { min: 300, max: 800, step: 10 },
  fuelPriceWithVat: { min: 3000, max: 10000, step: 100 },
  repairFee: { min: 20, max: 50, step: 1 },
  fuelConsumption: { min: 500, max: 1500, step: 20 },
  driverSalary: { min: 500000, max: 1500000, step: 50000 },
  mealCost: { min: 20000, max: 100000, step: 5000 },
  hotelCost: { min: 0, max: 50, step: 5 },
};

export default function PriceModelPage() {
  const [params, setParams] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    modelParameters.forEach(p => {
      initial[p.key] = p.value;
    });
    return initial;
  });

  const [vatRate, setVatRate] = useState(10);

  const results = calculateModel(params);
  const fuelPriceWithoutVat = calculateFuelPriceWithoutVat(params.fuelPriceWithVat, vatRate);

  const handleParamChange = useCallback((key: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setParams(prev => ({ ...prev, [key]: numValue }));
  }, []);

  const resetToDefaults = useCallback(() => {
    const initial: Record<string, number> = {};
    modelParameters.forEach(p => {
      initial[p.key] = p.value;
    });
    setParams(initial);
    setVatRate(10);
  }, []);

  const downloadExcel = useCallback(() => {
    // 创建CSV格式的Excel兼容文件
    const headers = ['项目', '项目(英文)', '数值', '单位', '类型'];
    const rows = [
      ...modelParameters.map(p => [p.label, p.labelEn, params[p.key].toFixed(2), p.unit, p.type]),
      ['收入合计', 'Total Revenue', results.revenue.toFixed(2), '元/吨', 'calculated'],
      ['燃油费用', 'Fuel Expense', results.costs.fuelExpense.toFixed(2), '元/吨', 'calculated'],
      ['人工费用', 'Labor Expense', results.costs.laborExpense.toFixed(2), '元/吨', 'calculated'],
      ['餐费', 'Meal Expense', results.costs.mealExpense.toFixed(2), '元/吨', 'calculated'],
      ['维修费用', 'Maintenance Expense', results.costs.maintenanceExpense.toFixed(2), '元/吨', 'calculated'],
      ['通行费', 'Toll Fee', results.costs.tollFee.toFixed(2), '元/吨', 'calculated'],
      ['总中盘变动成本', 'Total Variable Cost', results.costs.totalVariableCost.toFixed(2), '元/吨', 'calculated'],
      ['短盘变动成本', 'Short Distance Cost', results.costs.shortDistanceCost.toFixed(2), '元/吨', 'calculated'],
      ['AGV堆场费用', 'AGV Yard Fee', results.costs.agvYardCost.toFixed(2), '元/吨', 'calculated'],
      ['住宿费', 'Hotel Cost', results.costs.hotelCost.toFixed(2), '元/吨', 'calculated'],
      ['利润', 'Profit', results.profit.toFixed(2), '元/吨', 'calculated'],
      ['利润率', 'Profit Margin', results.profitMargin.toFixed(2), '%', 'calculated'],
    ];

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `招标杆煤运输收入成本模型_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [params, results]);

  const incomeParams = modelParameters.filter(p => p.category === 'income');
  const costParams = modelParameters.filter(p => p.category === 'cost');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  招标煤运输收入成本利润测算模型 v1.0
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  ETT Coal Transportation Revenue & Cost Model
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={resetToDefaults}>
                <RefreshCw className="h-4 w-4 mr-2" />
                重置
              </Button>
              <Button size="sm" onClick={downloadExcel}>
                <Download className="h-4 w-4 mr-2" />
                导出Excel
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 w-full">
        {/* 核心指标卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* 收入 */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                收入 (元/吨)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {results.revenue.toFixed(2)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                单价 × 公里数 ÷ 汇率 ÷ (1+增值税率)
              </p>
            </CardContent>
          </Card>

          {/* 总成本 */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                总成本 (元/吨)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {(results.costs.totalVariableCost + results.costs.shortDistanceCost + results.costs.agvYardCost + results.costs.hotelCost).toFixed(2)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                中盘 + 短盘 + AGV + 住宿
              </p>
            </CardContent>
          </Card>

          {/* 利润 */}
          <Card className={`border-l-4 ${results.profit >= 0 ? 'border-l-blue-500' : 'border-l-red-500'}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                {results.profit >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                利润 (元/吨)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${results.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {results.profit.toFixed(2)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                收入 - 成本
              </p>
            </CardContent>
          </Card>

          {/* 利润率 */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                利润率
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${results.profitMargin >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                {results.profitMargin.toFixed(2)}%
              </div>
              <div className="mt-2">
                <Progress 
                  value={Math.max(0, Math.min(100, 50 + results.profitMargin))} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 详细计算区域 */}
        <Tabs defaultValue="income" className="space-y-4">
          <TabsList className="grid grid-cols-4 gap-2 p-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl h-auto">
            <TabsTrigger 
              value="income" 
              className="flex flex-col items-center gap-1 py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/30 data-[state=active]:scale-105 hover:scale-105 hover:bg-white/50 dark:hover:bg-white/10"
            >
              <DollarSign className="h-5 w-5" />
              <span>收入参数</span>
            </TabsTrigger>
            <TabsTrigger 
              value="cost" 
              className="flex flex-col items-center gap-1 py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-600 data-[state=active]:to-orange-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/30 data-[state=active]:scale-105 hover:scale-105 hover:bg-white/50 dark:hover:bg-white/10"
            >
              <Truck className="h-5 w-5" />
              <span>成本参数</span>
            </TabsTrigger>
            <TabsTrigger 
              value="breakdown" 
              className="flex flex-col items-center gap-1 py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 data-[state=active]:scale-105 hover:scale-105 hover:bg-white/50 dark:hover:bg-white/10"
            >
              <Calculator className="h-5 w-5" />
              <span>成本明细</span>
            </TabsTrigger>
            <TabsTrigger 
              value="summary" 
              className="flex flex-col items-center gap-1 py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/30 data-[state=active]:scale-105 hover:scale-105 hover:bg-white/50 dark:hover:bg-white/10"
            >
              <FileSpreadsheet className="h-5 w-5" />
              <span>数据汇总</span>
            </TabsTrigger>
          </TabsList>

          {/* 收入参数 */}
          <TabsContent value="income" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  收入计算参数
                </CardTitle>
                <CardDescription>
                  收入 = 单价 × 公里数 ÷ 汇率 ÷ (1+增值税率) = {results.revenue.toFixed(2)} 元/吨
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {incomeParams.map(param => (
                    <div key={param.key} className="space-y-3">
                      <Label htmlFor={param.key} className="text-sm font-medium">
                        {param.label}
                        <span className="text-slate-400 ml-1">({param.labelEn})</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id={param.key}
                          type="number"
                          value={params[param.key] || ''}
                          onChange={(e) => handleParamChange(param.key, e.target.value)}
                          className="pr-12 font-mono"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                          {param.unit}
                        </span>
                      </div>
                      {/* 可变参数滑动条 */}
                      {param.type === 'variable' && sliderConfig[param.key] && (
                        <div className="px-1">
                          <Slider
                            value={[params[param.key]]}
                            min={sliderConfig[param.key].min}
                            max={sliderConfig[param.key].max}
                            step={sliderConfig[param.key].step}
                            onValueChange={(values) => handleParamChange(param.key, values[0].toString())}
                            className="py-2"
                          />
                          <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>{sliderConfig[param.key].min}</span>
                            <span>{sliderConfig[param.key].max}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={param.type === 'variable' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {param.type === 'variable' ? '可变' : '固定'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 收入公式说明 */}
            <Card className="bg-green-50 dark:bg-green-950 border-green-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-green-700 dark:text-green-300">计算公式：</span>
                    <code className="bg-white dark:bg-slate-800 px-3 py-1 rounded text-green-800 dark:text-green-200">
                      收入 = {params.price} × {params.distance} ÷ {params.exchangeRate} ÷ (1 + {vatRate}%) = {results.revenue.toFixed(2)} 元/吨
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 成本参数 */}
          <TabsContent value="cost" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fuel className="h-5 w-5 text-orange-600" />
                  成本计算参数
                </CardTitle>
                <CardDescription>
                  变动成本包含：燃油、人工、餐费、维修、通行费等
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {costParams.map(param => (
                    <div key={param.key} className="space-y-3">
                      <Label htmlFor={param.key} className="text-sm font-medium">
                        {param.label}
                        <span className="text-slate-400 ml-1">({param.labelEn})</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id={param.key}
                          type="number"
                          value={params[param.key] || ''}
                          onChange={(e) => handleParamChange(param.key, e.target.value)}
                          className="pr-12 font-mono"
                          disabled={param.type === 'calculated'}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                          {param.unit}
                        </span>
                      </div>
                      {/* 可变参数滑动条 */}
                      {param.type === 'variable' && sliderConfig[param.key] && (
                        <div className="px-1">
                          <Slider
                            value={[params[param.key]]}
                            min={sliderConfig[param.key].min}
                            max={sliderConfig[param.key].max}
                            step={sliderConfig[param.key].step}
                            onValueChange={(values) => handleParamChange(param.key, values[0].toString())}
                            className="py-2"
                          />
                          <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>{sliderConfig[param.key].min}</span>
                            <span>{sliderConfig[param.key].max}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            param.type === 'calculated' ? 'outline' : 
                            param.type === 'variable' ? 'default' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {param.type === 'calculated' ? '计算值' : 
                           param.type === 'variable' ? '可变' : '固定'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {/* VAT Rate */}
                  <div className="space-y-3">
                    <Label htmlFor="vatRate" className="text-sm font-medium">
                      增值税率
                      <span className="text-slate-400 ml-1">(VAT Rate)</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="vatRate"
                        type="number"
                        value={vatRate || ''}
                        onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
                        className="pr-12 font-mono"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        %
                      </span>
                    </div>
                    <div className="px-1">
                      <Slider
                        value={[vatRate]}
                        min={0}
                        max={20}
                        step={1}
                        onValueChange={(values) => setVatRate(values[0])}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>0%</span>
                        <span>20%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">固定</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 油价计算说明 */}
            <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200">
              <CardContent className="pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-orange-700 dark:text-orange-300">不含税油价计算：</span>
                    <code className="bg-white dark:bg-slate-800 px-3 py-1 rounded text-orange-800 dark:text-orange-200">
                      {params.fuelPriceWithVat} ÷ (1 + {vatRate}%) = {fuelPriceWithoutVat.toFixed(2)} 蒙图/升
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 成本明细 */}
          <TabsContent value="breakdown" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 中盘变动成本 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    中盘变动成本明细
                  </CardTitle>
                  <CardDescription>
                    总计：{results.costs.totalVariableCost.toFixed(2)} 元/吨
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>成本项目</TableHead>
                        <TableHead className="text-right">金额 (元/吨)</TableHead>
                        <TableHead className="text-right">占比</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="flex items-center gap-2">
                          <Fuel className="h-4 w-4 text-orange-500" />
                          燃油费用
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {results.costs.fuelExpense.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-slate-500">
                          {((results.costs.fuelExpense / results.costs.totalVariableCost) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-500" />
                          人工费用
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {results.costs.laborExpense.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-slate-500">
                          {((results.costs.laborExpense / results.costs.totalVariableCost) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="flex items-center gap-2">
                          <span className="text-lg">🍽️</span>
                          餐费
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {results.costs.mealExpense.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-slate-500">
                          {((results.costs.mealExpense / results.costs.totalVariableCost) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-yellow-500" />
                          维修费用
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {results.costs.maintenanceExpense.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-slate-500">
                          {((results.costs.maintenanceExpense / results.costs.totalVariableCost) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="flex items-center gap-2">
                          <span className="text-lg">🛣️</span>
                          通行费
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {results.costs.tollFee.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-slate-500">
                          {((results.costs.tollFee / results.costs.totalVariableCost) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-slate-100 dark:bg-slate-800 font-bold">
                        <TableCell>合计</TableCell>
                        <TableCell className="text-right">
                          {results.costs.totalVariableCost.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">100%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* 其他成本 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-purple-600" />
                    其他成本
                  </CardTitle>
                  <CardDescription>
                    短盘、堆场及附加成本
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>成本项目</TableHead>
                        <TableHead className="text-right">金额 (元/吨)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>短盘变动成本</TableCell>
                        <TableCell className="text-right font-medium">
                          {results.costs.shortDistanceCost.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>AGV堆场费用</TableCell>
                        <TableCell className="text-right font-medium">
                          {results.costs.agvYardCost.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>住宿费</TableCell>
                        <TableCell className="text-right font-medium">
                          {results.costs.hotelCost.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-slate-100 dark:bg-slate-800 font-bold">
                        <TableCell>其他成本合计</TableCell>
                        <TableCell className="text-right">
                          {(results.costs.shortDistanceCost + results.costs.agvYardCost + results.costs.hotelCost).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* 成本计算过程 */}
            <Card className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  中盘变动成本计算过程
                </CardTitle>
                <CardDescription>
                  详细展示每项成本的单吨计算公式
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 不含税油价 */}
                <div className="p-3 bg-orange-50 dark:bg-orange-950/50 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-orange-700 dark:text-orange-300">1. 不含税油价计算</span>
                    <Badge variant="outline" className="text-xs">中间步骤</Badge>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <code className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded">
                      含税油价 ÷ (1 + 增值税率) = {params.fuelPriceWithVat} ÷ (1 + {vatRate}%) = <span className="font-bold text-orange-600">{results.costs.calculationSteps.fuelPriceWithoutVat.toFixed(2)} 蒙图/升</span>
                    </code>
                  </div>
                </div>

                {/* 燃油费用 */}
                <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-blue-700 dark:text-blue-300">2. 燃油费用</span>
                    <Badge variant="outline" className="text-xs">每吨成本</Badge>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <code className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded">
                      (不含税油价 × 往返油耗) ÷ 装载量 ÷ 汇率
                    </code>
                  </div>
                  <div className="mt-1 text-sm">
                    <code className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded">
                      ({results.costs.calculationSteps.fuelPriceWithoutVat.toFixed(2)} × {params.fuelConsumption}) ÷ {params.loadCapacity} ÷ {params.exchangeRate} = <span className="font-bold text-blue-600">{results.costs.fuelExpense.toFixed(2)} 元/吨</span>
                    </code>
                  </div>
                </div>

                {/* 人工费用 */}
                <div className="p-3 bg-purple-50 dark:bg-purple-950/50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-purple-700 dark:text-purple-300">3. 人工费用</span>
                    <Badge variant="outline" className="text-xs">每吨成本</Badge>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <code className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded">
                      司机税前工资 ÷ 装载量 ÷ 汇率
                    </code>
                  </div>
                  <div className="mt-1 text-sm">
                    <code className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded">
                      {params.driverSalary.toLocaleString()} ÷ {params.loadCapacity} ÷ {params.exchangeRate} = <span className="font-bold text-purple-600">{results.costs.laborExpense.toFixed(2)} 元/吨</span>
                    </code>
                  </div>
                </div>

                {/* 餐费 */}
                <div className="p-3 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-green-700 dark:text-green-300">4. 餐费</span>
                    <Badge variant="outline" className="text-xs">每吨成本</Badge>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <code className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded">
                      餐费 ÷ 装载量 ÷ 汇率
                    </code>
                  </div>
                  <div className="mt-1 text-sm">
                    <code className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded">
                      {params.mealCost.toLocaleString()} ÷ {params.loadCapacity} ÷ {params.exchangeRate} = <span className="font-bold text-green-600">{results.costs.mealExpense.toFixed(2)} 元/吨</span>
                    </code>
                  </div>
                </div>

                {/* 维修费用 */}
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-yellow-700 dark:text-yellow-300">5. 维修费用</span>
                    <Badge variant="outline" className="text-xs">每吨成本</Badge>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <code className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded">
                      维修费标准 × 公里数 ÷ 汇率
                    </code>
                  </div>
                  <div className="mt-1 text-sm">
                    <code className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded">
                      {params.repairFee} × {params.distance} ÷ {params.exchangeRate} = <span className="font-bold text-yellow-600">{results.costs.maintenanceExpense.toFixed(2)} 元/吨</span>
                    </code>
                  </div>
                </div>

                {/* 通行费 */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300">6. 通行费</span>
                    <Badge variant="secondary" className="text-xs">固定值</Badge>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <code className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded">
                      固定值 = <span className="font-bold text-slate-600">{results.costs.tollFee.toFixed(2)} 元/吨</span>
                    </code>
                  </div>
                </div>

                {/* 总计 */}
                <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-lg border-2 border-blue-300">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-800 dark:text-blue-200">中盘变动成本合计</span>
                    <span className="font-bold text-xl text-blue-700 dark:text-blue-300">
                      {results.costs.totalVariableCost.toFixed(2)} 元/吨
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                    <code className="bg-white/50 dark:bg-slate-800/50 px-2 py-0.5 rounded">
                      {results.costs.fuelExpense.toFixed(2)} + {results.costs.laborExpense.toFixed(2)} + {results.costs.mealExpense.toFixed(2)} + {results.costs.maintenanceExpense.toFixed(2)} + {results.costs.tollFee.toFixed(2)}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 成本汇总 */}
            <Card className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="font-medium">总成本 =</span>
                    <code className="bg-white dark:bg-slate-900 px-3 py-1 rounded">
                      {results.costs.totalVariableCost.toFixed(2)} + {results.costs.shortDistanceCost.toFixed(2)} + {results.costs.agvYardCost.toFixed(2)} + {results.costs.hotelCost.toFixed(2)}
                    </code>
                    <span className="font-bold text-lg">= {(results.costs.totalVariableCost + results.costs.shortDistanceCost + results.costs.agvYardCost + results.costs.hotelCost).toFixed(2)} 元/吨</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 数据汇总 */}
          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>完整数据汇总</CardTitle>
                <CardDescription>
                  包含所有输入参数和计算结果
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>参数名称</TableHead>
                      <TableHead>Parameter</TableHead>
                      <TableHead className="text-right">数值</TableHead>
                      <TableHead>单位</TableHead>
                      <TableHead>类型</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* 收入部分 */}
                    <TableRow className="bg-green-50 dark:bg-green-950">
                      <TableCell colSpan={5} className="font-bold text-green-700 dark:text-green-300">
                        收入参数
                      </TableCell>
                    </TableRow>
                    {incomeParams.map(param => (
                      <TableRow key={param.key}>
                        <TableCell className="font-medium">{param.label}</TableCell>
                        <TableCell className="text-slate-500">{param.labelEn}</TableCell>
                        <TableCell className="text-right font-mono">
                          {params[param.key]?.toLocaleString() || '0'}
                        </TableCell>
                        <TableCell>{param.unit}</TableCell>
                        <TableCell>
                          <Badge variant={param.type === 'variable' ? 'default' : 'secondary'} className="text-xs">
                            {param.type === 'variable' ? '可变' : '固定'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* 成本部分 */}
                    <TableRow className="bg-orange-50 dark:bg-orange-950">
                      <TableCell colSpan={5} className="font-bold text-orange-700 dark:text-orange-300">
                        成本参数
                      </TableCell>
                    </TableRow>
                    {costParams.map(param => (
                      <TableRow key={param.key}>
                        <TableCell className="font-medium">{param.label}</TableCell>
                        <TableCell className="text-slate-500">{param.labelEn}</TableCell>
                        <TableCell className="text-right font-mono">
                          {params[param.key]?.toLocaleString() || '0'}
                        </TableCell>
                        <TableCell>{param.unit}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              param.type === 'calculated' ? 'outline' : 
                              param.type === 'variable' ? 'default' : 'secondary'
                            } 
                            className="text-xs"
                          >
                            {param.type === 'calculated' ? '计算值' : 
                             param.type === 'variable' ? '可变' : '固定'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* 计算结果 */}
                    <TableRow className="bg-blue-50 dark:bg-blue-950">
                      <TableCell colSpan={5} className="font-bold text-blue-700 dark:text-blue-300">
                        计算结果
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">收入</TableCell>
                      <TableCell className="text-slate-500">Revenue</TableCell>
                      <TableCell className="text-right font-mono text-green-600 font-bold">
                        {results.revenue.toFixed(2)}
                      </TableCell>
                      <TableCell>元/吨</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">结果</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">总变动成本</TableCell>
                      <TableCell className="text-slate-500">Total Variable Cost</TableCell>
                      <TableCell className="text-right font-mono text-orange-600 font-bold">
                        {results.costs.totalVariableCost.toFixed(2)}
                      </TableCell>
                      <TableCell>元/吨</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">结果</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">短盘成本</TableCell>
                      <TableCell className="text-slate-500">Short Distance Cost</TableCell>
                      <TableCell className="text-right font-mono">
                        {results.costs.shortDistanceCost.toFixed(2)}
                      </TableCell>
                      <TableCell>元/吨</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">结果</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">AGV堆场</TableCell>
                      <TableCell className="text-slate-500">AGV Yard Fee</TableCell>
                      <TableCell className="text-right font-mono">
                        {results.costs.agvYardCost.toFixed(2)}
                      </TableCell>
                      <TableCell>元/吨</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">结果</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">住宿费</TableCell>
                      <TableCell className="text-slate-500">Hotel Cost</TableCell>
                      <TableCell className="text-right font-mono">
                        {results.costs.hotelCost.toFixed(2)}
                      </TableCell>
                      <TableCell>元/吨</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">结果</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">利润</TableCell>
                      <TableCell className="text-slate-500">Profit</TableCell>
                      <TableCell className={`text-right font-mono font-bold ${results.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {results.profit.toFixed(2)}
                      </TableCell>
                      <TableCell>元/吨</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">结果</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">利润率</TableCell>
                      <TableCell className="text-slate-500">Profit Margin</TableCell>
                      <TableCell className={`text-right font-mono font-bold ${results.profitMargin >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                        {results.profitMargin.toFixed(2)}%
                      </TableCell>
                      <TableCell>%</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">结果</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t mt-8">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-slate-500">
            ETT Coal Transportation Price Model v1.0 | 数据仅供参考，实际以合同为准
          </p>
        </div>
      </footer>
    </div>
  );
}
