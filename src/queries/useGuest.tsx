import guestApiRequest from "@/apiRequests/guest";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGuestLoginMutation = () => {
  return useMutation({
    mutationFn: guestApiRequest.login,
  });
};

export const useGuestLogoutMutation = () => {
  return useMutation({
    mutationFn: guestApiRequest.logout,
  });
};

export const useGuestOrderMutation = () => {
  return useMutation({
    mutationFn: guestApiRequest.order,
  });
};

export const useGuestGetOrderListQuery = (id: string) => {
  return useQuery({
    queryKey: ["guest-orders"],
    queryFn: () => guestApiRequest.getOrderList(id),
  });
};

export const useGuestInfoQuery = () => {
  return useQuery({
    queryKey: ["guest-info"],
    queryFn: () => guestApiRequest.getGuestInfo(),
  });
};

export const useGuestFeedbackMutation = () => {
  return useMutation({
    mutationFn: guestApiRequest.feedback,
  });
};
