import {
  OrderObjectByGuestSessionID,
  ServingGuestByTableNumber,
  Statics,
} from "@/app/manage/orders/order-table";
import { OrderStatus } from "@/constants/types";
import { GetOrdersResType } from "@/schemaValidations/order.schema";
import { useMemo } from "react";

export const useOrderService = (orderList: GetOrdersResType["data"]) => {
  const result = useMemo(() => {
    const statics: Statics = {
      status: {
        Pending: 0,
        Processing: 0,
        Delivered: 0,
        Paid: 0,
        Rejected: 0,
      },
      table: {},
    };
    const orderObjectByGuestSessionId: OrderObjectByGuestSessionID = {};
    const guestByTableNumber: ServingGuestByTableNumber = {};
    orderList.forEach((order) => {
      statics.status[order.status] = statics.status[order.status] + 1;
      const tableNumber = order.guest_session?.table.number;
      const sessionId = order.guest_session_id;
      if (tableNumber !== null && sessionId !== null) {
        {
          if (!statics.table[tableNumber as number]) {
            statics.table[tableNumber as number] = {};
          }
          const table = statics.table[tableNumber as number];
          const currentStatusCount = table[sessionId]?.[order.status] ?? 0;

          table[sessionId] = {
            ...table[sessionId],
            [order.status]: currentStatusCount + 1,
          };
        }

        if (sessionId) {
          if (!orderObjectByGuestSessionId[sessionId]) {
            orderObjectByGuestSessionId[sessionId] = [];
          }
          orderObjectByGuestSessionId[sessionId].push(order);
        }

        if (tableNumber && sessionId) {
          if (!guestByTableNumber[tableNumber]) {
            guestByTableNumber[tableNumber] = {};
          }
          guestByTableNumber[tableNumber][sessionId] =
            orderObjectByGuestSessionId[sessionId];
        }
      }
    });

    const servingGuestByTableNumber: ServingGuestByTableNumber = {};
    for (const tableNumber in guestByTableNumber) {
      const guestObject = guestByTableNumber[tableNumber];
      const servingGuestObject: OrderObjectByGuestSessionID = {};
      for (const guestId in guestObject) {
        const guestOrders = guestObject[guestId];
        const isServingGuest = guestOrders.some((order) =>
          [
            OrderStatus.Pending,
            OrderStatus.Processing,
            OrderStatus.Delivered,
          ].includes(order.status as any)
        );
        if (isServingGuest) {
          servingGuestObject[Number(guestId)] = guestOrders;
        }
      }
      if (Object.keys(servingGuestObject).length) {
        servingGuestByTableNumber[Number(tableNumber)] = servingGuestObject;
      }
    }
    return {
      statics,
      orderObjectByGuestSessionId,
      servingGuestByTableNumber,
    };
  }, [orderList]);
  return result;
};
