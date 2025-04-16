import http from "@/lib/http";
import {
  CreateTableBodyType,
  TableListResType,
  TableResType,
  UpdateTableBodyType,
} from "@/schemaValidations/table.schema";

const prefix = "/tables";
const tableApiRequest = {
  list: () => http.get<TableListResType>(`${prefix}`),
  getTable: (id: string) => http.get<TableResType>(`${prefix}/${id}`),
  addTable: (body: CreateTableBodyType) =>
    http.post<TableResType>(`${prefix}`, body),
  updateTable: (id: string, body: UpdateTableBodyType) =>
    http.patch<TableResType>(`${prefix}/${id}`, body),
  deleteTable: (id: string) => http.delete<TableResType>(`${prefix}/${id}`),
};

export default tableApiRequest;
