"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DashboardIndicatorResType } from "@/schemaValidations/indicator.schema";
import { useMemo } from "react";

const colors = [
  "hsl(12, 76%, 61%)",
  "hsl(173, 58%, 39%)",
  "hsl(197, 37%, 24%)",
  "hsl(43, 74%, 66%)",
  "hsl(27, 87%, 67%)",
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function DishBarChart({
  chartData,
}: {
  chartData: Pick<
    DashboardIndicatorResType["data"]["dishIndicator"][0],
    "name" | "successOrders"
  >[];
}) {
  const chartDateColors = useMemo(
    () =>
      chartData.slice(0, 5).map((data, index) => {
        return {
          ...data,
          fill: colors[index] ?? colors[colors.length - 1],
        };
      }),
    [chartData]
  );
  console.log(chartConfig);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Xếp hạng món ăn</CardTitle>
        <CardDescription>Được gọi nhiều nhất</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartDateColors}
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={2}
              axisLine={false}
              tickFormatter={(value) => {
                return value;
              }}
            />
            <XAxis dataKey="successOrders" type="number" hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              dataKey="successOrders"
              name={"Đơn thanh toán"}
              layout="vertical"
              radius={5}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm"></CardFooter>
    </Card>
  );
}
