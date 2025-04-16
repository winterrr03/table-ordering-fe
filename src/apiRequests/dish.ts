import http from "@/lib/http";
import {
  CreateDishBodyType,
  DishListResType,
  DishResType,
  UpdateDishBodyType,
} from "@/schemaValidations/dish.schema";

const prefix = "/dishes";
const dishApiRequest = {
  list: () =>
    http.get<DishListResType>("dishes", { next: { tags: ["dishes"] } }),
  getDish: (id: string) => http.get<DishResType>(`${prefix}/${id}`),
  addDish: (body: CreateDishBodyType) =>
    http.post<DishResType>(`${prefix}`, body),
  updateDish: (id: string, body: UpdateDishBodyType) =>
    http.patch<DishResType>(`${prefix}/${id}`, body),
  deleteDish: (id: string) => http.delete<DishResType>(`${prefix}/${id}`),
};

export default dishApiRequest;
