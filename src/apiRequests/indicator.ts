import http from "@/lib/http";
import {
  AspectSentimentIndicatorResType,
  DashboardIndicatorQueryParamsType,
  DashboardIndicatorResType,
  reviewWithAspectsResType,
} from "@/schemaValidations/indicator.schema";
import queryString from "query-string";

const indicatorApiRequest = {
  getDashboardIndicators: (queryParams: DashboardIndicatorQueryParamsType) =>
    http.get<DashboardIndicatorResType>(
      "/indicators/dashboard?" +
        queryString.stringify({
          fromDate: queryParams.fromDate?.toISOString(),
          toDate: queryParams.toDate?.toISOString(),
        })
    ),
  getAnalyticsIndicators: () =>
    http.get<AspectSentimentIndicatorResType>("/indicators/analytics"),
  getReviewsIndicators: () =>
    http.get<reviewWithAspectsResType>("/indicators/reviews"),
};

export default indicatorApiRequest;
