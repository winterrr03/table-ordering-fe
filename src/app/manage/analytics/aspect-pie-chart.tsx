"use client";

import { AspectSentimentIndicatorSchemaType } from "@/schemaValidations/indicator.schema";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

const SENTIMENT_COLORS = {
  positive: "#22c55e", // Green
  neutral: "#6b7280", // Gray
  negative: "#ef4444", // Red
};

export function AspectPieChart({
  data,
}: {
  data: AspectSentimentIndicatorSchemaType;
}) {
  const chartData = data.sentiments
    .map((item) => ({
      name:
        item.sentiment === "positive"
          ? "Tích cực"
          : item.sentiment === "neutral"
          ? "Trung lập"
          : "Tiêu cực",
      value: Number(((item.percentage / 100) * data.review_count).toFixed(1)),
      percentage: item.percentage.toFixed(1),
      color: SENTIMENT_COLORS[item.sentiment],
    }))
    .filter((item) => item.value > 0);

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex justify-center mt-2">
        <div className="flex flex-col gap-1">
          {payload?.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-1 text-xs">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span>
                {entry.value}: {entry.payload.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={20}
            outerRadius={60}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
