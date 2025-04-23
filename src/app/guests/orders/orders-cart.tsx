"use client";

import { useAppContext } from "@/components/app-provider";
import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/constants/types";
import {
  formatCurrency,
  getGuestSessionIdFromLocalStorage,
  getVietnameseOrderStatus,
} from "@/lib/utils";
import { useGuestGetOrderListQuery } from "@/queries/useGuest";
import {
  PayGuestOrdersResType,
  UpdateOrderResType,
} from "@/schemaValidations/order.schema";
import Image from "next/image";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

export default function OrdersCart() {
  const guest_session_id = getGuestSessionIdFromLocalStorage() ?? "";
  const { data, refetch } = useGuestGetOrderListQuery(guest_session_id);
  const orders = useMemo(() => data?.payload.data ?? [], [data]);
  const { socket } = useAppContext();

  const { waitingForPaying, paid } = useMemo(() => {
    return orders.reduce(
      (result, order) => {
        if (
          order.status === OrderStatus.Delivered ||
          order.status === OrderStatus.Processing ||
          order.status === OrderStatus.Pending
        ) {
          return {
            ...result,
            waitingForPaying: {
              price:
                result.waitingForPaying.price +
                order.dish_snapshot.price * order.quantity,
              quantity: result.waitingForPaying.quantity + order.quantity,
            },
          };
        }
        if (order.status === OrderStatus.Paid) {
          return {
            ...result,
            paid: {
              price:
                result.paid.price + order.dish_snapshot.price * order.quantity,
              quantity: result.paid.quantity + order.quantity,
            },
          };
        }
        return result;
      },
      {
        waitingForPaying: {
          price: 0,
          quantity: 0,
        },
        paid: {
          price: 0,
          quantity: 0,
        },
      }
    );
  }, [orders]);

  useEffect(() => {
    if (socket?.connected) {
      onConnect();
    }

    function onConnect() {
      console.log(socket?.id);
    }

    function onDisconnect() {
      console.log("disconnect");
    }

    function onUpdateOrder(data: UpdateOrderResType["data"]) {
      const {
        dish_snapshot: { name },
        quantity,
      } = data;
      toast("Cập nhật thành công", {
        description: `Món ${name} (SL: ${quantity}) vừa được cập nhật sang trạng thái "${getVietnameseOrderStatus(
          data.status
        )}"`,
      });
      refetch();
    }

    function onPayment(data: PayGuestOrdersResType["data"]) {
      const { guest_session } = data[0];
      toast("Thành công", {
        description: `${guest_session?.guest.phone} tại bàn ${guest_session?.guest.phone} thanh toán thành công ${data.length} đơn`,
      });
      refetch();
    }

    socket?.on("connect", onConnect);
    socket?.on("disconnect", onDisconnect);
    socket?.on("update-order", onUpdateOrder);
    socket?.on("payment", onPayment);

    return () => {
      socket?.off("connect", onConnect);
      socket?.off("disconnect", onDisconnect);
      socket?.off("update-order", onUpdateOrder);
      socket?.off("payment", onPayment);
    };
  }, [refetch, socket]);

  return (
    <>
      {orders.map((order, index) => (
        <div key={order._id} className="flex gap-4">
          <div className="text-sm font-semibold">{index + 1}</div>
          <div className="flex-shrink-0 relative">
            <Image
              src={order.dish_snapshot.image}
              alt={order.dish_snapshot.name}
              height={100}
              width={100}
              quality={100}
              className="object-cover w-[80px] h-[80px] rounded-md"
            />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm">{order.dish_snapshot.name}</h3>
            <div className="text-xs font-semibold">
              {formatCurrency(order.dish_snapshot.price)} x{" "}
              <Badge className="px-1">{order.quantity}</Badge>
            </div>
          </div>
          <div className="flex-shrink-0 ml-auto flex justify-center items-center">
            <Badge variant={"outline"}>
              {getVietnameseOrderStatus(order.status)}
            </Badge>
          </div>
        </div>
      ))}
      {paid.quantity !== 0 && (
        <div className="sticky bottom-0 ">
          <div className="w-full flex space-x-4 text-xl font-semibold">
            <span>Đơn đã thanh toán · {paid.quantity} món</span>
            <span>{formatCurrency(paid.price)}</span>
          </div>
        </div>
      )}
      <div className="sticky bottom-0 ">
        <div className="w-full flex space-x-4 text-xl font-semibold">
          <span>Đơn chưa thanh toán · {waitingForPaying.quantity} món</span>
          <span>{formatCurrency(waitingForPaying.price)}</span>
        </div>
      </div>
    </>
  );
}
