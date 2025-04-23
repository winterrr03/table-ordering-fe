"use client";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <>
      {dishes
        .filter((dish) => dish.status !== DishStatus.Hidden)
        .map((dish) => (
          <div
            key={dish._id}
            className={cn("flex gap-4", {
              "pointer-events-none": dish.status === DishStatus.Unavailable,
            })}
          >
            <div className="flex-shrink-0 relative">
              {dish.status === DishStatus.Unavailable && (
                <span className="absolute inset-0 flex items-center justify-center text-sm">
                  Hết hàng
                </span>
              )}
              <Image
                src={dish.image}
                alt={dish.name}
                height={100}
                width={100}
                quality={100}
                className="object-cover w-[80px] h-[80px] rounded-md"
              />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm">{dish.name}</h3>
              <p className="text-xs">{dish.description}</p>
              <p className="text-xs font-semibold">
                {formatCurrency(dish.price)}
              </p>
            </div>
            <div className="flex-shrink-0 ml-auto flex justify-center items-center">
              <Quantity
                onChange={(value) => handleQuantityChange(dish._id, value)}
                value={
                  ordersState.orders.find((order) => order.dish_id === dish._id)
                    ?.quantity ?? 0
                }
              />
            </div>
          </div>
        ))}
      <div className="sticky bottom-0">
        <Button
          className="w-full justify-between"
          onClick={handleOrder}
          disabled={ordersState.orders.length === 0}
        >
          <span>Đặt hàng · {ordersState.orders.length} món</span>
          <span>{formatCurrency(totalPrice)}</span>
        </Button>
      </div>
    </>
  );
}
