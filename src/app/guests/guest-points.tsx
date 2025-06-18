"use client";

import { useAppContext } from "@/components/app-provider";
import { Coins } from "lucide-react";
import { useGuestInfoQuery } from "@/queries/useGuest";
import { Role } from "@/constants/types";

export default function GuestPoints() {
  const { role } = useAppContext();
  const { data, isLoading } = useGuestInfoQuery();

  if (role !== Role.Guest || !data || isLoading) return null;

  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground ml-2">
      <Coins className="h-4 w-4 text-yellow-500" />
      {data.payload.data.score || 0} điểm
    </div>
  );
}
