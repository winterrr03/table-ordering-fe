"use client";
import Image from "next/image";
import { Ban, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDishListFilterQuery } from "@/queries/useDish";
import {
  cn,
  formatCurrency,
  getGuestSessionIdFromLocalStorage,
  handleErrorApi,
} from "@/lib/utils";
import { useMemo, useState } from "react";
import { GuestCreateOrdersBodyType } from "@/schemaValidations/guest.schema";
import Quantity from "@/app/guests/menu/quantity";
import {
  useGuestGetOrderListQuery,
  useGuestInfoQuery,
  useGuestOrderMutation,
} from "@/queries/useGuest";
import { useRouter } from "next/navigation";
import { DishStatus, DishType, OrderStatus } from "@/constants/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MenuOrder() {
  const { data: foodData } = useDishListFilterQuery({
    page: 1,
    limit: 100,
    type: DishType.Food,
  });
  const { data: drinkData } = useDishListFilterQuery({
    page: 1,
    limit: 100,
    type: DishType.Drink,
  });

  const { data: userInfo } = useGuestInfoQuery();

  const foodDishes = useMemo(
    () => foodData?.payload.data.items ?? [],
    [foodData]
  );

  const drinkDishes = useMemo(
    () => drinkData?.payload.data.items ?? [],
    [drinkData]
  );

  const allDishes = useMemo(
    () => [...foodDishes, ...drinkDishes],
    [foodDishes, drinkDishes]
  );

  const score = userInfo?.payload.data.score ?? 0;

  const discount = useMemo(() => {
    if (score >= 10000) return 0.15;
    if (score >= 5000) return 0.1;
    if (score >= 2000) return 0.05;
    return 0;
  }, [score]);

  const { mutateAsync, isPending } = useGuestOrderMutation();
  const router = useRouter();

  const [ordersState, setOrdersState] = useState<GuestCreateOrdersBodyType>({
    guest_session_id: getGuestSessionIdFromLocalStorage() ?? "",
    orders: [],
  });

  const ordersDish = useMemo(() => {
    return ordersState.orders.map((order) => {
      const dishInfo = allDishes.find((d) => d._id === order.dish_id);
      return {
        dish_id: order.dish_id,
        name: dishInfo?.name ?? "",
        image: dishInfo?.image ?? "",
        price: dishInfo?.price ?? 0,
        quantity: order.quantity,
      };
    });
  }, [ordersState, allDishes]);

  const totalPrice = useMemo(() => {
    return allDishes.reduce((result, dish) => {
      const order = ordersState.orders.find(
        (order) => order.dish_id === dish._id
      );
      if (!order) return result;
      return result + order.quantity * dish.price;
    }, 0);
  }, [allDishes, ordersState]);

  const guest_session_id = getGuestSessionIdFromLocalStorage() ?? "";
  const { data: ordersData } = useGuestGetOrderListQuery(guest_session_id);
  const guestOrders = useMemo(
    () => ordersData?.payload.data ?? [],
    [ordersData]
  );

  const allOrdersPaid = useMemo(() => {
    const statusCounts = guestOrders.reduce(
      (acc, o) => {
        if (o.status === OrderStatus.Paid) acc.paid++;
        else if (o.status !== OrderStatus.Rejected) acc.unpaid++;
        return acc;
      },
      { paid: 0, unpaid: 0 }
    );
    return statusCounts.unpaid === 0 && statusCounts.paid > 0;
  }, [guestOrders]);

  const handleQuantityChange = (dishId: string, quantity: number) => {
    if (allOrdersPaid) return;
    setOrdersState((prev) => {
      const existingIndex = prev.orders.findIndex(
        (order) => order.dish_id === dishId
      );
      let updatedOrders = [...prev.orders];

      if (quantity === 0) {
        if (existingIndex !== -1) {
          updatedOrders.splice(existingIndex, 1);
        }
      } else {
        if (existingIndex !== -1) {
          updatedOrders[existingIndex] = {
            ...updatedOrders[existingIndex],
            quantity,
          };
        } else {
          updatedOrders.push({ dish_id: dishId, quantity, discount });
        }
      }
      return {
        ...prev,
        orders: updatedOrders,
      };
    });
  };

  const [showPopup, setShowPopup] = useState(false);

  const openPopup = () => setShowPopup(true);
  const closePopup = () => setShowPopup(false);

  const handleOrder = async () => {
    try {
      await mutateAsync(ordersState);
      router.push("/guests/orders");
    } catch (error) {
      handleErrorApi({
        error,
      });
    }
  };

  return (
    <Tabs defaultValue="food" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="food">Đồ ăn</TabsTrigger>
        <TabsTrigger value="drink">Thức uống</TabsTrigger>
      </TabsList>
      <TabsContent value="food" className="space-y-6">
        <div className="relative pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {foodDishes
              .filter((dish) => dish.status !== DishStatus.Hidden)
              .map((dish) => (
                <div
                  key={dish._id}
                  className={cn(
                    "bg-[#0f172b] rounded-lg shadow-md overflow-hidden h-full transition-shadow hover:shadow-lg",
                    {
                      "opacity-60 pointer-events-none":
                        dish.status === DishStatus.Unavailable,
                    }
                  )}
                >
                  <div className="relative h-40">
                    <Image
                      src={dish.image || "/placeholder.svg"}
                      alt={dish.name}
                      fill
                      className="object-cover"
                      quality={100}
                    />
                    {dish.status === DishStatus.Unavailable && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                        <Ban className="h-8 w-8 mb-1" />
                        <span className="font-bold">Hết hàng</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col h-[calc(100%-10rem)] text-white">
                    <div className="mb-2">
                      <h3 className="font-medium text-base">{dish.name}</h3>
                      <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                        {dish.description}
                      </p>
                    </div>

                    <div className="mt-auto">
                      <div className="flex justify-between items-center mb-3">
                        <p className="font-semibold text-sm text-white">
                          {formatCurrency(dish.price)}
                        </p>
                        <div>
                          <Quantity
                            disabled={allOrdersPaid}
                            onChange={(value) =>
                              handleQuantityChange(dish._id, value)
                            }
                            value={
                              ordersState.orders.find(
                                (order) => order.dish_id === dish._id
                              )?.quantity ?? 0
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </TabsContent>
      <TabsContent value="drink" className="space-y-6">
        <div className="relative pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {drinkDishes
              .filter((dish) => dish.status !== DishStatus.Hidden)
              .map((dish) => (
                <div
                  key={dish._id}
                  className={cn(
                    "bg-[#0f172b] rounded-lg shadow-md overflow-hidden h-full transition-shadow hover:shadow-lg",
                    {
                      "opacity-60 pointer-events-none":
                        dish.status === DishStatus.Unavailable,
                    }
                  )}
                >
                  <div className="relative h-40">
                    <Image
                      src={dish.image || "/placeholder.svg"}
                      alt={dish.name}
                      fill
                      className="object-cover"
                      quality={100}
                    />
                    {dish.status === DishStatus.Unavailable && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                        <Ban className="h-8 w-8 mb-1" />
                        <span className="font-bold">Hết hàng</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col h-[calc(100%-10rem)] text-white">
                    <div className="mb-2">
                      <h3 className="font-medium text-base">{dish.name}</h3>
                      <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                        {dish.description}
                      </p>
                    </div>

                    <div className="mt-auto">
                      <div className="flex justify-between items-center mb-3">
                        <p className="font-semibold text-sm text-white">
                          {formatCurrency(dish.price)}
                        </p>
                        <div>
                          <Quantity
                            onChange={(value) =>
                              handleQuantityChange(dish._id, value)
                            }
                            value={
                              ordersState.orders.find(
                                (order) => order.dish_id === dish._id
                              )?.quantity ?? 0
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </TabsContent>
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đơn hàng của bạn</DialogTitle>
            <DialogDescription>Kiểm tra trước khi xác nhận</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {ordersDish.map((dish, idx) => (
              <div
                key={dish.dish_id}
                className="flex items-center gap-2 text-sm"
              >
                <span className="w-5">{idx + 1}.</span>
                <Image
                  src={dish.image}
                  alt={dish.name}
                  title={dish.name}
                  width={30}
                  height={30}
                  className="h-[30px] w-[30px] rounded object-cover"
                />
                <span className="flex-1 truncate">{dish.name}</span>
                <span className="font-semibold">
                  x{ordersState.orders[idx].quantity}
                </span>
                <span className="italic">
                  {formatCurrency(
                    dish.price * ordersState.orders[idx].quantity
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-sm">
            <span>Tạm tính:</span>
            <span>{formatCurrency(totalPrice)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Giảm giá ({discount * 100}%):</span>
            <span>-{formatCurrency(totalPrice * discount)}</span>
          </div>

          <div className="flex justify-between font-semibold pt-1 border-t mt-2">
            <span>Tổng cộng:</span>
            <span>{formatCurrency(totalPrice * (1 - discount))}</span>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={closePopup}>
              Hủy
            </Button>
            <Button
              onClick={async () => {
                await handleOrder();
                closePopup();
              }}
              disabled={isPending}
            >
              {isPending ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {allOrdersPaid && (
        <div className="fixed bottom-6 right-6 z-10 bg-[#0f172b] hover:bg-[#1e293b] text-white shadow-xl px-4 py-2 rounded-full">
          Bạn đã hoàn tất thanh toán, không thể đặt thêm món mới.
        </div>
      )}

      {ordersState.orders.length > 0 && !allOrdersPaid && (
        <div className="fixed bottom-6 right-6 z-10">
          <Button
            onClick={openPopup}
            className="bg-[#0f172b] hover:bg-[#1e293b] text-white shadow-xl 
             flex items-center gap-3 md:gap-4 
             px-6 py-5 md:px-8 md:py-6 
             rounded-full transition-all"
          >
            <UtensilsCrossed className="h-5 w-5 md:h-6 md:w-6" />
            <div className="flex flex-col items-start leading-tight">
              Đặt món
            </div>
          </Button>
        </div>
      )}
    </Tabs>
  );
}
