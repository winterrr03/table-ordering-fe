"use client";
import Image from "next/image";
import { Ban, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDishListQuery } from "@/queries/useDish";
import {
  cn,
  formatCurrency,
  getGuestSessionIdFromLocalStorage,
  handleErrorApi,
} from "@/lib/utils";
import { useMemo, useState } from "react";
import { GuestCreateOrdersBodyType } from "@/schemaValidations/guest.schema";
import Quantity from "@/app/guests/menu/quantity";
import { useGuestOrderMutation } from "@/queries/useGuest";
import { useRouter } from "next/navigation";
import { DishStatus } from "@/constants/types";

export default function MenuOrder() {
  const { data } = useDishListQuery();
  const dishes = useMemo(() => data?.payload.data ?? [], [data]);
  const { mutateAsync } = useGuestOrderMutation();
  const router = useRouter();

  const [ordersState, setOrdersState] = useState<GuestCreateOrdersBodyType>({
    guest_session_id: getGuestSessionIdFromLocalStorage() ?? "",
    orders: [],
  });

  const totalPrice = useMemo(() => {
    return dishes.reduce((result, dish) => {
      const order = ordersState.orders.find(
        (order) => order.dish_id === dish._id
      );
      if (!order) return result;
      return result + order.quantity * dish.price;
    }, 0);
  }, [dishes, ordersState]);

  const handleQuantityChange = (dishId: string, quantity: number) => {
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
          updatedOrders.push({ dish_id: dishId, quantity });
        }
      }
      return {
        ...prev,
        orders: updatedOrders,
      };
    });
  };

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
    <div className="relative pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {dishes
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

      {ordersState.orders.length > 0 && (
        <div className="fixed bottom-6 right-6 z-10">
          <Button
            onClick={handleOrder}
            className="bg-[#0f172b] hover:bg-[#1e293b] text-white shadow-xl 
             flex items-center gap-3 md:gap-4 
             px-6 py-5 md:px-8 md:py-6 
             rounded-full transition-all"
          >
            <UtensilsCrossed className="h-5 w-5 md:h-6 md:w-6" />
            <div className="flex flex-col items-start leading-tight">
              <span className="text-sm md:text-base font-semibold">
                {ordersState.orders.length} món
              </span>
              <span className="text-xs md:text-sm">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </Button>
        </div>
      )}
    </div>
  );
}
