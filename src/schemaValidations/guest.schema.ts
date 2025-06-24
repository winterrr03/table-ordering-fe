import { Role } from "@/constants/types";
import { vietnamPhoneRegex } from "@/lib/utils";
import { OrderSchema } from "@/schemaValidations/order.schema";
import z from "zod";

export const GuestLoginBody = z
  .object({
    phone: z.string().regex(vietnamPhoneRegex, {
      message: "Số điện thoại không hợp lệ",
    }),
    tableNumber: z.number(),
    token: z.string(),
  })
  .strict();

export type GuestLoginBodyType = z.TypeOf<typeof GuestLoginBody>;

export const GuestLoginRes = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    guest: z.object({
      _id: z.string(),
      phone: z.string(),
      score: z.number(),
      role: z.enum([Role.Guest]),
      created_at: z.date(),
      updated_at: z.date(),
    }),
    guestSession: z.object({
      _id: z.string(),
      guest_id: z.string(),
      table_id: z.string(),
      refresh_token: z.string(),
      refresh_token_exp: z.date(),
      created_at: z.date(),
      updated_at: z.date(),
    }),
  }),
  message: z.string(),
});

export type GuestLoginResType = z.TypeOf<typeof GuestLoginRes>;

export const GuestCreateOrdersBody = z.object({
  guest_session_id: z.string(),
  orders: z.array(
    z.object({
      dish_id: z.string(),
      quantity: z.number(),
      discount: z.number(),
    })
  ),
});

export type GuestCreateOrdersBodyType = z.TypeOf<typeof GuestCreateOrdersBody>;

export const GuestCreateOrdersRes = z.object({
  message: z.string(),
  data: z.array(OrderSchema),
});

export type GuestCreateOrdersResType = z.TypeOf<typeof GuestCreateOrdersRes>;

export const GuestGetOrdersParams = z.object({
  guest_session_id: z.string(),
});

export type GuestGetOrdersParamsType = z.TypeOf<typeof GuestGetOrdersParams>;

export const GuestGetOrdersRes = GuestCreateOrdersRes;

export type GuestGetOrdersResType = z.TypeOf<typeof GuestGetOrdersRes>;

export const GuestInfoRes = z.object({
  data: z.object({
    _id: z.string(),
    phone: z.string(),
    score: z.number(),
    created_at: z.date(),
    updated_at: z.date(),
  }),
  message: z.string(),
});

export type GuestInfoResType = z.TypeOf<typeof GuestInfoRes>;

export const GuestFeedbackBody = z.object({
  text: z.string(),
  guest_id: z.string(),
});

export type GuestFeedbackBodyType = z.TypeOf<typeof GuestFeedbackBody>;

export const GuestFeedbackRes = z.object({
  message: z.string(),
});

export type GuestFeedbackResType = z.TypeOf<typeof GuestFeedbackRes>;

export const GuestCreatePaymentLinkBody = z
  .object({
    orderCode: z.number(),
    amount: z.number(),
    description: z.string(),
    returnUrl: z.string(),
    cancelUrl: z.string(),
  })
  .strict();

export type GuestCreatePaymentLinkBodyType = z.TypeOf<
  typeof GuestCreatePaymentLinkBody
>;

export const GuestPaymentLinkRes = z.object({
  data: z.object({
    checkoutUrl: z.string(),
  }),
  message: z.string(),
});

export type GuestPaymentLinkResType = z.TypeOf<typeof GuestPaymentLinkRes>;

export const GuestReceiveHookDataRes = z.object({
  message: z.string(),
  data: z.object({
    orders: z.array(OrderSchema),
    status: z.string(),
  }),
});

export type GuestReceiveHookDataResType = z.infer<
  typeof GuestReceiveHookDataRes
>;
