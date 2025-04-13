import http from "@/lib/http";
import {
  AccountResType,
  ChangePasswordBodyType,
  ChangePasswordV2BodyType,
  ChangePasswordV2ResType,
  UpdateMeBodyType,
} from "@/schemaValidations/account.schema";

const accountApiRequest = {
  me: () => http.get<AccountResType>("/accounts/me"),
  sMe: (accessToken: string) =>
    http.get<AccountResType>("/accounts/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  updateMe: (body: UpdateMeBodyType) =>
    http.patch<AccountResType>("/accounts/me", body),
  changePassword: (body: ChangePasswordBodyType) =>
    http.patch<AccountResType>("/accounts/change-password", body),
  sChangePasswordV2: (accessToken: string, body: ChangePasswordV2BodyType) =>
    http.patch<ChangePasswordV2ResType>("/accounts/change-password-v2", body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  changePasswordV2: (body: ChangePasswordV2BodyType) =>
    http.patch<ChangePasswordV2ResType>(
      `/api/accounts/change-password-v2`,
      body,
      {
        baseUrl: "",
      }
    ),
};

export default accountApiRequest;
