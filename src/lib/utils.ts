import { EntityError } from "@/lib/http";
import { clsx, type ClassValue } from "clsx";
import { UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import jwt from "jsonwebtoken";
import authApiRequest from "@/apiRequests/auth";
import envConfig from "@/config";
import { DishStatus, OrderStatus, Role, TableStatus } from "@/constants/types";
import { TokenPayload } from "@/types/jwt.types";
import guestApiRequest from "@/apiRequests/guest";
import { format } from "date-fns";
import { BookX, CookingPot, HandCoins, Loader, Truck } from "lucide-react";
import { io } from "socket.io-client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const normalizePath = (path: string) => {
  return path.startsWith("/") ? path.slice(1) : path;
};

const isBrowser = typeof window !== "undefined";

export const getAccessTokenFromLocalStorage = () =>
  isBrowser ? localStorage.getItem("accessToken") : null;

export const getRefreshTokenFromLocalStorage = () =>
  isBrowser ? localStorage.getItem("refreshToken") : null;

export const setAccessTokenToLocalStorage = (value: string) =>
  isBrowser && localStorage.setItem("accessToken", value);

export const setRefreshTokenToLocalStorage = (value: string) =>
  isBrowser && localStorage.setItem("refreshToken", value);

export const setHasRatedFeedbackToLocalStorage = (value: boolean) =>
  isBrowser && localStorage.setItem("hasRatedFeedback", JSON.stringify(value));

export const getHasRatedFeedbackFromLocalStorage = () =>
  isBrowser
    ? JSON.parse(localStorage.getItem("hasRatedFeedback") || "false")
    : false;

export const removeHasRatedFeedbackFromLocalStorage = () =>
  isBrowser && localStorage.removeItem("hasRatedFeedback");

export const removeTokensFromLocalStorage = () => {
  isBrowser && localStorage.removeItem("accessToken");
  isBrowser && localStorage.removeItem("refreshToken");
};

export const getGuestSessionIdFromLocalStorage = () =>
  isBrowser ? localStorage.getItem("guestSessionId") : null;

export const setGuestSessionIdToLocalStorage = (value: string) =>
  isBrowser && localStorage.setItem("guestSessionId", value);

export const removeGuestSessionIdFromLocalStorage = () =>
  isBrowser && localStorage.removeItem("guestSessionId");

export const getLastVisitedUrlFromLocalStorage = () =>
  isBrowser ? localStorage.getItem("lastVisitedUrl") : null;

export const setLastVisitedUrlToLocalStorage = (value: string) =>
  isBrowser && localStorage.setItem("lastVisitedUrl", value);

export const removeLastVisitedUrlFromLocalStorage = () =>
  isBrowser && localStorage.removeItem("lastVisitedUrl");

export const handleErrorApi = ({
  error,
  setError,
  duration,
}: {
  error: any;
  setError?: UseFormSetError<any>;
  duration?: number;
}) => {
  if (error instanceof EntityError && setError) {
    error.payload.errors.forEach((item) => {
      setError(item.field, {
        type: "server",
        message: item.message,
      });
    });
  } else {
    toast("Lỗi", {
      description: error?.payload?.message ?? "Lỗi không xác định",
      duration: duration ?? 5000,
    });
  }
};

export const checkAndRefreshToken = async (param?: {
  onError?: () => void;
  onSuccess?: () => void;
  force?: boolean;
}) => {
  const accessToken = getAccessTokenFromLocalStorage();
  const refreshToken = getRefreshTokenFromLocalStorage();
  if (!accessToken || !refreshToken) return;
  const decodedAccessToken = decodeToken(accessToken);
  const decodedRefreshToken = decodeToken(refreshToken);
  const now = Math.round(new Date().getTime() / 1000);
  if (decodedRefreshToken.exp <= now) {
    removeTokensFromLocalStorage();
    return param?.onError && param.onError();
  }
  if (
    param?.force ||
    decodedAccessToken.exp - now <
      (decodedAccessToken.exp - decodedAccessToken.iat) / 3
  ) {
    try {
      const role = decodedRefreshToken.role;
      const res =
        role === Role.Guest
          ? await guestApiRequest.refreshToken()
          : await authApiRequest.refreshToken();
      setAccessTokenToLocalStorage(res.payload.data.accessToken);
      setRefreshTokenToLocalStorage(res.payload.data.refreshToken);
      param?.onSuccess && param.onSuccess();
    } catch (error) {
      param?.onError && param.onError();
    }
  }
};

export const formatCurrency = (number: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(number);
};

export const getVietnameseDishStatus = (
  status: (typeof DishStatus)[keyof typeof DishStatus]
) => {
  switch (status) {
    case DishStatus.Available:
      return "Có sẵn";
    case DishStatus.Unavailable:
      return "Không có sẵn";
    default:
      return "Ẩn";
  }
};

export const getTypeDish = (type: string) => {
  switch (type) {
    case "Food":
      return "Đồ ăn";
    case "Drink":
      return "Thức uống";
    default:
      return "Không";
  }
};

export const getVietnameseTableStatus = (
  status: (typeof TableStatus)[keyof typeof TableStatus]
) => {
  switch (status) {
    case TableStatus.Available:
      return "Có sẵn";
    case TableStatus.Reserved:
      return "Đã đặt";
    default:
      return "Ẩn";
  }
};

export const getVietnameseOrderStatus = (
  status: (typeof OrderStatus)[keyof typeof OrderStatus]
) => {
  switch (status) {
    case OrderStatus.Delivered:
      return "Đã phục vụ";
    case OrderStatus.Paid:
      return "Đã thanh toán";
    case OrderStatus.Pending:
      return "Chờ xử lý";
    case OrderStatus.Processing:
      return "Đang nấu";
    default:
      return "Từ chối";
  }
};

export const getTableLink = ({
  token,
  tableNumber,
}: {
  token: string;
  tableNumber: number;
}) => {
  return (
    envConfig.NEXT_PUBLIC_URL + "/tables/" + tableNumber + "?token=" + token
  );
};

export const decodeToken = (token: string) => {
  return jwt.decode(token) as TokenPayload;
};

export const vietnamPhoneRegex =
  /^(03[2-9]|05[6|8|9]|07[0|6-9]|08[1-5|8]|09[0-9]|086|088|089|091|094|092|059|099)[0-9]{7}$/;

export function removeAccents(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export const simpleMatchText = (fullText: string, matchText: string) => {
  return removeAccents(fullText.toLowerCase()).includes(
    removeAccents(matchText.trim().toLowerCase())
  );
};

export const formatDateTimeToLocaleString = (date: string | Date) => {
  return format(
    date instanceof Date ? date : new Date(date),
    "HH:mm:ss dd/MM/yyyy"
  );
};

export const formatDateTimeToTimeString = (date: string | Date) => {
  return format(date instanceof Date ? date : new Date(date), "HH:mm:ss");
};

export const generateSocketInstace = (accessToken: string) => {
  return io(envConfig.NEXT_PUBLIC_API_ENDPOINT, {
    auth: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const OrderStatusIcon = {
  [OrderStatus.Pending]: Loader,
  [OrderStatus.Processing]: CookingPot,
  [OrderStatus.Rejected]: BookX,
  [OrderStatus.Delivered]: Truck,
  [OrderStatus.Paid]: HandCoins,
};
