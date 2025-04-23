import http from "@/lib/http";
import {
  CreateOrdersBodyType,
  CreateOrdersResType,
  GetOrderDetailResType,
  GetOrdersQueryParamsType,
  GetOrdersResType,
  PayGuestOrdersBodyType,
  PayGuestOrdersResType,
  UpdateOrderBodyType,
  UpdateOrderResType,
} from "@/schemaValidations/order.schema";
import queryString from "query-string";

const orderApiRequest = {
  getOrderList: (queryParams: GetOrdersQueryParamsType) =>
    http.get<GetOrdersResType>(
      "/orders?" +
        queryString.stringify({
          fromDate: queryParams.fromDate?.toISOString(),
          toDate: queryParams.toDate?.toISOString(),
        })
    ),
  createOrders: (body: CreateOrdersBodyType) =>
    http.post<CreateOrdersResType>("/orders", body),
  updateOrder: (orderId: string, body: UpdateOrderBodyType) =>
    http.patch<UpdateOrderResType>(`/orders/${orderId}`, body),
  getOrderDetail: (orderId: string) =>
    http.get<GetOrderDetailResType>(`/orders/${orderId}`),
  pay: (body: PayGuestOrdersBodyType) =>
    http.patch<PayGuestOrdersResType>(`/orders/pay`, body),
};

export default orderApiRequest;
