"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GuestLoginBody,
  GuestLoginBodyType,
} from "@/schemaValidations/guest.schema";
import { useAppContext } from "@/components/app-provider";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useGuestLoginMutation } from "@/queries/useGuest";
import { useEffect } from "react";
import {
  generateSocketInstace,
  handleErrorApi,
  setGuestSessionIdToLocalStorage,
  setLastVisitedUrlToLocalStorage,
} from "@/lib/utils";

export default function GuestLoginForm() {
  const { setRole, setSocket } = useAppContext();
  const searchParams = useSearchParams();
  const params = useParams();
  const tableNumber = Number(params.number);
  const token = searchParams.get("token");
  const router = useRouter();
  const loginMutation = useGuestLoginMutation();
  const form = useForm<GuestLoginBodyType>({
    resolver: zodResolver(GuestLoginBody),
    defaultValues: {
      phone: "",
      token: token ?? "",
      tableNumber,
    },
  });

  useEffect(() => {
    if (!token) {
      router.push("/");
    }
  }, [token, router]);

  async function onSubmit(values: GuestLoginBodyType) {
    if (loginMutation.isPending) return;
    try {
      const result = await loginMutation.mutateAsync(values);
      setRole(result.payload.data.guest.role);
      setGuestSessionIdToLocalStorage(result.payload.data.guestSession._id);
      setLastVisitedUrlToLocalStorage(window.location.href);
      setSocket(generateSocketInstace(result.payload.data.accessToken));
      router.push("/guests/menu");
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
      });
    }
  }

  return (
    <Card className="mx-auto w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Đăng nhập gọi món</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-2 max-w-[600px] flex-shrink-0 w-full"
            noValidate
            onSubmit={form.handleSubmit(onSubmit, console.log)}
          >
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input id="phone" type="text" required {...field} />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Đăng nhập
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
