import dishApiRequest from "@/apiRequests/dish";
import {
  DishListWithPaginationQueryType,
  UpdateDishBodyType,
} from "@/schemaValidations/dish.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useDishListQuery = () => {
  return useQuery({
    queryKey: ["dishes"],
    queryFn: dishApiRequest.list,
  });
};

export const useDishListFilterQuery = (
  queryParams: DishListWithPaginationQueryType
) => {
  return useQuery({
    queryFn: () => dishApiRequest.listFilter(queryParams),
    queryKey: ["dishesFilter", queryParams],
  });
};

export const useGetDishQuery = ({
  id,
  enabled,
}: {
  id: string;
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: ["dishes", id],
    queryFn: () => dishApiRequest.getDish(id),
    enabled,
  });
};

export const useAddDishMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dishApiRequest.addDish,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["dishes"],
      });
    },
  });
};

export const useUpdateDishMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateDishBodyType & { id: string }) =>
      dishApiRequest.updateDish(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["dishes"],
      });
    },
  });
};

export const useDeleteDishMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dishApiRequest.deleteDish,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["dishes"],
      });
    },
  });
};
