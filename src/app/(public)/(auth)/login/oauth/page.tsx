"use client";

import { useAppContext } from "@/components/app-provider";
import { decodeToken, generateSocketInstace } from "@/lib/utils";
import { useSetTokenToCookieMutation } from "@/queries/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function OAuthPage() {
  const { mutateAsync } = useSetTokenToCookieMutation();
  const router = useRouter();
  const count = useRef(0);
  const { setRole, setSocket } = useAppContext();
  const searchParams = useSearchParams();
  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");
  const message = searchParams.get("message");
  useEffect(() => {
    if (accessToken && refreshToken) {
      if (count.current === 0) {
        const { role } = decodeToken(accessToken);
        mutateAsync({ accessToken, refreshToken })
          .then(() => {
            setRole(role);
            setSocket(generateSocketInstace(accessToken));
            router.push("/manage/dashboard");
          })
          .catch((e) => {
            toast("Lỗi", {
              description: e.message || "Có lỗi xảy ra",
            });
          });
        count.current++;
      }
    } else {
      if (count.current === 0) {
        setTimeout(() => {
          toast("Lỗi", {
            description: message || "Có lỗi xảy ra",
          });
        });
        count.current++;
      }
    }
  }, [
    accessToken,
    refreshToken,
    setRole,
    router,
    setSocket,
    message,
    mutateAsync,
  ]);
  return null;
}
