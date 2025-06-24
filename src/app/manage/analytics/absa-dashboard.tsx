"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AspectPieChart } from "./aspect-pie-chart";
import AutoPagination from "@/components/auto-pagination";
import {
  useAnalyticsIndicator,
  useReviewsIndicator,
} from "@/queries/useIndicator";

const ASPECT_LABELS: { [key: string]: string } = {
  "AMBIENCE#GENERAL": "Không gian chung",
  "DRINKS#PRICES": "Giá đồ uống",
  "DRINKS#QUALITY": "Chất lượng đồ uống",
  "DRINKS#STYLE&OPTIONS": "Đa dạng đồ uống",
  "FOOD#PRICES": "Giá món ăn",
  "FOOD#QUALITY": "Chất lượng món ăn",
  "FOOD#STYLE&OPTIONS": "Đa dạng món ăn",
  "LOCATION#GENERAL": "Vị trí",
  "RESTAURANT#GENERAL": "Nhà hàng nói chung",
  "RESTAURANT#MISCELLANEOUS": "Khác",
  "RESTAURANT#PRICES": "Giá cả chung",
  "SERVICE#GENERAL": "Dịch vụ",
};

interface AspectSentiment {
  aspect: string;
  sentiment: "positive" | "neutral" | "negative";
  confidence: number;
}

const SentimentBadges = ({ aspects }: { aspects: AspectSentiment[] }) => {
  const groupedAspects = aspects.reduce(
    (acc, aspect) => {
      acc[aspect.sentiment].push({
        aspect: aspect.aspect,
        confidence: aspect.confidence,
      });
      return acc;
    },
    {
      positive: [] as { aspect: string; confidence: number }[],
      neutral: [] as { aspect: string; confidence: number }[],
      negative: [] as { aspect: string; confidence: number }[],
    }
  );

  const getSentimentConfig = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return {
          label: "Positive:",
          badgeClass:
            "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
          labelClass: "text-green-700 font-medium",
        };
      case "neutral":
        return {
          label: "Neutral:",
          badgeClass:
            "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
          labelClass: "text-gray-700 font-medium",
        };
      case "negative":
        return {
          label: "Negative:",
          badgeClass: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
          labelClass: "text-red-700 font-medium",
        };
      default:
        return {
          label: "",
          badgeClass: "",
          labelClass: "",
        };
    }
  };

  return (
    <div className="space-y-3">
      {Object.entries(groupedAspects).map(([sentiment, aspectList]) => {
        if (aspectList.length === 0) return null;

        const config = getSentimentConfig(sentiment);

        return (
          <div key={sentiment} className="space-y-1">
            <div className={`text-sm ${config.labelClass}`}>{config.label}</div>
            <div className="flex flex-wrap gap-1">
              {aspectList.map((item, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={`text-xs ${config.badgeClass} transition-colors`}
                  title={`Confidence: ${(item.confidence * 100).toFixed(0)}%`}
                >
                  {ASPECT_LABELS[item.aspect] || item.aspect}
                </Badge>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const PAGE_SIZE = 5;

export function ABSADashboard() {
  const [page, setPage] = useState(1);

  const aspectListQuery = useAnalyticsIndicator();
  const aspectData = aspectListQuery.data?.payload.data ?? [];

  const reviewListQuery = useReviewsIndicator();
  const allReviews = reviewListQuery.data?.payload.data ?? [];

  const paginatedReviews = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return allReviews.slice(start, start + PAGE_SIZE);
  }, [allReviews, page]);

  const totalPages = Math.ceil(allReviews.length / PAGE_SIZE);

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="overview">Tổng quan</TabsTrigger>
        <TabsTrigger value="feedback">Chi tiết</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {aspectData.map((data) => (
            <Card key={data.aspect} className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {ASPECT_LABELS[data.aspect] || data.aspect}
                </CardTitle>
                <CardDescription className="text-xs">
                  {data.review_count > 0
                    ? `${data.review_count} đánh giá`
                    : "Không có dữ liệu"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-48 flex items-center justify-center">
                  {data.review_count > 0 ? (
                    <AspectPieChart data={data} />
                  ) : (
                    <div className="text-center text-gray-500">
                      <p className="text-sm">Không có dữ liệu</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="feedback" className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <div>
              <CardTitle>Chi tiết phản hồi khách hàng</CardTitle>
              <CardDescription>
                Danh sách các phản hồi và phân tích cảm xúc theo khía cạnh
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0 w-full">
            <div className="overflow-x-auto w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="w-1/2 p-6 font-semibold">
                      Nội dung phản hồi
                    </TableHead>
                    <TableHead className="w-1/2 p-6 font-semibold">
                      Phân tích cảm xúc
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReviews.map((review) => (
                    <TableRow
                      key={review._id}
                      className="border-b transition-colors duration-200"
                    >
                      <TableCell className="p-6 align-top">
                        <p className="text-sm leading-relaxedfont-normal">
                          {review.text}
                        </p>
                      </TableCell>
                      <TableCell className="p-6 align-top">
                        <SentimentBadges aspects={review.aspects} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="text-xs text-muted-foreground py-4 flex-1 px-4">
                Hiển thị <strong>{paginatedReviews.length}</strong> trong{" "}
                <strong>{allReviews.length}</strong> kết quả
              </div>
              <div>
                <AutoPagination
                  page={page}
                  pageSize={totalPages}
                  isLink={false}
                  onClick={(p) => setPage(p)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
