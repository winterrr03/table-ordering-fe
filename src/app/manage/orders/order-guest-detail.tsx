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

  const calcTotals = (list: Orders) => {
    return list.reduce(
      (acc, order) => {
        const price = order.dish_snapshot.price;
        const discount = order.discount ?? 0;
        const subtotal = price * order.quantity;

        acc.before += subtotal;
        acc.saved += subtotal * discount;
        acc.after += subtotal * (1 - discount);
        return acc;
      },
      { before: 0, saved: 0, after: 0 }
    );
  };

  const totalsUnpaid = calcTotals(ordersFilterToPurchase);
  const totalsPaid = calcTotals(purchasedOrderFilter);

  const isAllPaid = ordersFilterToPurchase.length === 0;
  const showing = isAllPaid ? totalsPaid : totalsUnpaid;
  const activeOrders = isAllPaid
    ? purchasedOrderFilter
    : ordersFilterToPurchase;
  const discountPercent = Math.round((activeOrders[0]?.discount ?? 0) * 100);

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
        <span className="font-semibold">Tạm tính:</span>
        <Badge variant="outline">{formatCurrency(showing.before)}</Badge>
      </div>

      <div className="space-x-1">
        <span className="font-semibold">Giảm giá ({discountPercent}%):</span>
        <Badge variant="outline">-{formatCurrency(showing.saved)}</Badge>
      </div>

      <div className="space-x-1">
        <span className="font-semibold">Tổng cộng:</span>
        <Badge>{formatCurrency(showing.after)}</Badge>
      </div>

      <div className="space-x-1">
        <span className="font-semibold">
          {isAllPaid ? "Đã thanh toán:" : "Cần thanh toán:"}
        </span>
        <Badge>{formatCurrency(showing.after)}</Badge>
      </div>

      <div>
        <Button
          className="w-full"
          size={"sm"}
          variant={"secondary"}
          disabled={ordersFilterToPurchase.length === 0}
          onClick={pay}
        >
          Thanh toán tất cả
        </Button>
      </div>
    </div>
  );
}
