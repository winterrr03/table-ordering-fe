import OrdersCart from "@/app/guests/orders/orders-cart";
import { Suspense } from "react";

export default function OrdersPage() {
  return (
    <div className="max-w-[500px] mx-auto space-y-6">
      <h1 className="text-center text-xl font-bold">Đơn hàng</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <OrdersCart />
      </Suspense>
    </div>
  );
}
