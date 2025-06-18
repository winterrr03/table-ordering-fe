"use client";

import { useAppContext } from "@/components/app-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OrderStatus } from "@/constants/types";
import {
  decodeToken,
  formatCurrency,
  getAccessTokenFromLocalStorage,
  getGuestSessionIdFromLocalStorage,
  getHasRatedFeedbackFromLocalStorage,
  getVietnameseOrderStatus,
  handleErrorApi,
  setHasRatedFeedbackToLocalStorage,
} from "@/lib/utils";
import {
  useGuestFeedbackMutation,
  useGuestGetOrderListQuery,
} from "@/queries/useGuest";
import {
  PayGuestOrdersResType,
  UpdateOrderResType,
} from "@/schemaValidations/order.schema";
import { useQueryClient } from "@tanstack/react-query";

import { CheckCircle, Clock } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function OrdersCart() {
  const guest_session_id = getGuestSessionIdFromLocalStorage() ?? "";
  const token = getAccessTokenFromLocalStorage();
  const payload = token ? decodeToken(token) : null;
  const guest_id = payload?.userId as string;
  const { data, refetch } = useGuestGetOrderListQuery(guest_session_id);
  const orders = useMemo(() => data?.payload.data ?? [], [data]);
  const { socket } = useAppContext();
  const guestFeedbackMutation = useGuestFeedbackMutation();
  const [feedback, setFeedback] = useState("");
  const [open, setOpen] = useState(false);
  const [hasRated, setHasRated] = useState(
    getHasRatedFeedbackFromLocalStorage()
  );
  const router = useRouter();
  const queryClient = useQueryClient();

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

  const allOrdersPaid =
    waitingForPaying.quantity === 0 && paid.quantity > 0 && !hasRated;

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

  const getStatusColor = (
    status: (typeof OrderStatus)[keyof typeof OrderStatus]
  ) => {
    switch (status) {
      case OrderStatus.Paid:
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case OrderStatus.Delivered:
        return "bg-sky-100 text-sky-800 border-sky-200";
      case OrderStatus.Processing:
        return "bg-orange-100 text-orange-800 border-orange-200";
      case OrderStatus.Rejected:
        return "bg-rose-100 text-rose-800 border-rose-200";
      case OrderStatus.Pending:
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  const handleSubmitFeedback = async () => {
    if (!guest_id || !feedback.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá.");
      return;
    }
    if (guestFeedbackMutation.isPending) return;
    try {
      const result = await guestFeedbackMutation.mutateAsync({
        guest_id,
        text: feedback.trim(),
      });
      toast.success("Thành công", {
        description: result.payload.message,
      });
      queryClient.invalidateQueries({ queryKey: ["guest-info"] });
      setFeedback("");
      setOpen(false);
      setHasRatedFeedbackToLocalStorage(true);
      setHasRated(true);
      router.push("/guests/menu");
    } catch (error) {
      handleErrorApi({ error });
    }
  };

  return (
    <>
      {allOrdersPaid && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="fixed bottom-20 right-4 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-full shadow-lg">
              Gửi đánh giá
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Đánh giá trải nghiệm</DialogTitle>
              <DialogDescription>
                Hãy chia sẻ cảm nhận của bạn về trải nghiệm tại quán.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="feedback" className="text-right pt-1.5">
                  Đánh giá
                </Label>
                <Textarea
                  id="feedback"
                  placeholder="Nhập cảm nhận của bạn tại đây..."
                  className="col-span-3 min-h-[120px]"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleSubmitFeedback}>Gửi đánh giá</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <div className="space-y-4 pb-32">
        {orders.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
          </Card>
        ) : (
          orders.map((order) => (
            <Card
              key={order._id}
              className="overflow-hidden shadow-sm hover:shadow transition-shadow min-h-[110px]"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
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

                  <div className="flex-grow space-y-2">
                    <h3 className="font-medium">{order.dish_snapshot.name}</h3>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(order.dish_snapshot.price)} x{" "}
                      <Badge
                        variant="secondary"
                        className="px-1.5 py-0 text-xs rounded-full"
                      >
                        {order.quantity}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(
                        order.status
                      )} px-2 py-1 text-xs w-[100px] text-center truncate`}
                    >
                      {getVietnameseOrderStatus(order.status)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-md">
          <div className="max-w-[500px] mx-auto p-4 space-y-3">
            {paid.quantity > 0 && (
              <div className="flex justify-between items-center p-2 rounded-md bg-green-200 dark:bg-green-900">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-700 dark:text-green-300" />
                  <span className="font-semibold text-green-950 dark:text-white">
                    Đơn đã thanh toán · {paid.quantity} món
                  </span>
                </div>
                <span className="font-bold text-green-950 dark:text-white">
                  {formatCurrency(paid.price)}
                </span>
              </div>
            )}

            {waitingForPaying.quantity > 0 && (
              <div className="flex justify-between items-center p-2 rounded-md bg-amber-200 dark:bg-amber-900">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                  <span className="font-semibold text-amber-950 dark:text-white">
                    Đơn chưa thanh toán · {waitingForPaying.quantity} món
                  </span>
                </div>
                <span className="font-bold text-amber-950 dark:text-white">
                  {formatCurrency(waitingForPaying.price)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
