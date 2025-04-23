import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderStatus } from "@/constants/types";
import {
  OrderStatusIcon,
  formatCurrency,
  formatDateTimeToLocaleString,
  formatDateTimeToTimeString,
  getVietnameseOrderStatus,
  handleErrorApi,
} from "@/lib/utils";
import { usePayForGuestMutation } from "@/queries/useOrder";
import {
  GetOrdersResType,
  PayGuestOrdersResType,
} from "@/schemaValidations/order.schema";
import Image from "next/image";
import { Fragment } from "react";

type GuestSession = GetOrdersResType["data"][0]["guest_session"];
type Orders = GetOrdersResType["data"];
export default function OrderGuestDetail({
  guestSession,
  orders,
  onPaySuccess,
}: {
  guestSession: GuestSession;
  orders: Orders;
  onPaySuccess?: (data: PayGuestOrdersResType) => void;
}) {
  const ordersFilterToPurchase = guestSession
    ? orders.filter(
        (order) =>
          order.status !== OrderStatus.Paid &&
          order.status !== OrderStatus.Rejected
      )
    : [];
  const purchasedOrderFilter = guestSession
    ? orders.filter((order) => order.status === OrderStatus.Paid)
    : [];

  const payForGuestMutation = usePayForGuestMutation();

  const pay = async () => {
    if (payForGuestMutation.isPending || !guestSession) return;
    try {
      const result = await payForGuestMutation.mutateAsync({
        guest_session_id: guestSession._id,
      });
      onPaySuccess && onPaySuccess(result.payload);
    } catch (error) {
      handleErrorApi({
        error,
      });
    }
  };

  return (
    <div className="space-y-2 text-sm">
      {guestSession && (
        <Fragment>
          <div className="space-x-1">
            <span className="font-semibold">Số điện thoại:</span>
            <span>{guestSession.guest.phone}</span>
            <span className="font-semibold">(#{guestSession.guest._id})</span>
            <span>|</span>
            <span className="font-semibold">Bàn:</span>
            <span>{guestSession.table.number}</span>
          </div>
          <div className="space-x-1">
            <span className="font-semibold">Ngày đăng ký:</span>
            <span>
              {formatDateTimeToLocaleString(guestSession.guest.created_at)}
            </span>
          </div>
        </Fragment>
      )}

      <div className="space-y-1">
        <div className="font-semibold">Đơn hàng:</div>
        {orders.map((order, index) => {
          return (
            <div key={order._id} className="flex gap-2 items-center text-xs">
              <span className="w-[10px]">{index + 1}</span>
              <span title={getVietnameseOrderStatus(order.status)}>
                {order.status === OrderStatus.Pending && (
                  <OrderStatusIcon.Pending className="w-4 h-4" />
                )}
                {order.status === OrderStatus.Processing && (
                  <OrderStatusIcon.Processing className="w-4 h-4" />
                )}
                {order.status === OrderStatus.Rejected && (
                  <OrderStatusIcon.Rejected className="w-4 h-4 text-red-400" />
                )}
                {order.status === OrderStatus.Delivered && (
                  <OrderStatusIcon.Delivered className="w-4 h-4" />
                )}
                {order.status === OrderStatus.Paid && (
                  <OrderStatusIcon.Paid className="w-4 h-4 text-yellow-400" />
                )}
              </span>
              <Image
                src={order.dish_snapshot.image}
                alt={order.dish_snapshot.name}
                title={order.dish_snapshot.name}
                width={30}
                height={30}
                className="h-[30px] w-[30px] rounded object-cover"
              />
              <span
                className="truncate w-[70px] sm:w-[100px]"
                title={order.dish_snapshot.name}
              >
                {order.dish_snapshot.name}
              </span>
              <span className="font-semibold" title={`Tổng: ${order.quantity}`}>
                x{order.quantity}
              </span>
              <span className="italic">
                {formatCurrency(order.quantity * order.dish_snapshot.price)}
              </span>
              <span
                className="hidden sm:inline"
                title={`Tạo: ${formatDateTimeToLocaleString(
                  order.created_at
                )} | Cập nhật: ${formatDateTimeToLocaleString(order.updated_at)}
          `}
              >
                {formatDateTimeToLocaleString(order.created_at)}
              </span>
              <span
                className="sm:hidden"
                title={`Tạo: ${formatDateTimeToLocaleString(
                  order.created_at
                )} | Cập nhật: ${formatDateTimeToLocaleString(order.updated_at)}
          `}
              >
                {formatDateTimeToTimeString(order.created_at)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="space-x-1">
        <span className="font-semibold">Chưa thanh toán:</span>
        <Badge>
          <span>
            {formatCurrency(
              ordersFilterToPurchase.reduce((acc, order) => {
                return acc + order.quantity * order.dish_snapshot.price;
              }, 0)
            )}
          </span>
        </Badge>
      </div>
      <div className="space-x-1">
        <span className="font-semibold">Đã thanh toán:</span>
        <Badge variant={"outline"}>
          <span>
            {formatCurrency(
              purchasedOrderFilter.reduce((acc, order) => {
                return acc + order.quantity * order.dish_snapshot.price;
              }, 0)
            )}
          </span>
        </Badge>
      </div>

      <div>
        <Button
          className="w-full"
          size={"sm"}
          variant={"secondary"}
          disabled={ordersFilterToPurchase.length === 0}
          onClick={pay}
        >
          Thanh toán tất cả ({ordersFilterToPurchase.length} đơn)
        </Button>
      </div>
    </div>
  );
}
