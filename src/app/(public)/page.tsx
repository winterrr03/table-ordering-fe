"use client";

import dishApiRequest from "@/apiRequests/dish";
import { formatCurrency } from "@/lib/utils";
import { useDishListQuery } from "@/queries/useDish";
import { DishListResType } from "@/schemaValidations/dish.schema";
import Image from "next/image";

export default async function Home() {
  const dishListQuery = useDishListQuery();
  const dishList = dishListQuery.data?.payload.data ?? [];

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative w-full h-[70vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-background.jpg"
            alt="Delicious food background"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
              Trải nghiệm ẩm thực tuyệt vời
            </h1>
            <p className="text-xl mb-8">
              Đặt món ăn yêu thích của bạn một cách dễ dàng và nhanh chóng.
              Thưởng thức hương vị tuyệt vời ngay tại quán.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Món ăn mới nhất
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dishList.slice(0, 4).map((dish) => (
              <div
                key={dish._id}
                className="bg-card text-card-foreground rounded-lg overflow-hidden shadow-md transition-transform hover:scale-[1.03]"
              >
                <div className="relative h-48">
                  <Image
                    src={dish.image}
                    alt={dish.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 flex flex-col h-full">
                  <h3 className="text-lg font-semibold mb-2">{dish.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 min-h-[48px] line-clamp-3">
                    {dish.description}
                  </p>
                  <span className="font-bold text-destructive">
                    {formatCurrency(dish.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Khách hàng nói gì về chúng tôi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-card p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mr-4">
                    {/* Avatar mặc định dạng icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-8 h-8 text-muted-foreground"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-card-foreground font-semibold">
                      Một khách hàng ẩn danh
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Đã dùng bữa gần đây
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  "Thức ăn rất ngon và dịch vụ tuyệt vời. Tôi đặc biệt thích món
                  đặc sản của nhà hàng. Chắc chắn sẽ quay lại!"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            Sẵn sàng để thưởng thức?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Những món ăn tuyệt vời đang chờ bạn tại quán! Hãy ghé thăm nhà hàng
            của chúng tôi và đặt món ngay tại bàn để tận hưởng hương vị độc đáo
            cùng không gian ấm cúng và phục vụ tận tình.
          </p>
        </div>
      </section>
    </div>
  );
}
