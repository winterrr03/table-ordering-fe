import http from "@/lib/http";
import {
  CreateDishBodyType,
  DishListResType,
  DishListWithPaginationQueryType,
  DishListWithPaginationResType,
  DishResType,
  UpdateDishBodyType,
} from "@/schemaValidations/dish.schema";
import queryString from "query-string";

const prefix = "/dishes";
const dishApiRequest = {
  list: () =>
    http.get<DishListResType>(`${prefix}`, { next: { tags: ["dishes"] } }),
  listFilter: (queryParams: DishListWithPaginationQueryType) =>
    http.get<DishListWithPaginationResType>(
      `${prefix}/pagination?` +
        queryString.stringify({
          page: queryParams.page,
          limit: queryParams.limit,
          type: queryParams.type,
        })
    ),
  getDish: (id: string) => http.get<DishResType>(`${prefix}/${id}`),
  addDish: (body: CreateDishBodyType) =>
    http.post<DishResType>(`${prefix}`, body),
  updateDish: (id: string, body: UpdateDishBodyType) =>
    http.patch<DishResType>(`${prefix}/${id}`, body),
  deleteDish: (id: string) => http.delete<DishResType>(`${prefix}/${id}`),
};

export default dishApiRequest;
