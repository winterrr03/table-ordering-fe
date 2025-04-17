import http from "@/lib/http";
import {
  LogoutBodyType,
  RefreshTokenBodyType,
  RefreshTokenResType,
} from "@/schemaValidations/auth.schema";
import {
  GuestLoginBodyType,
  GuestLoginResType,
} from "@/schemaValidations/guest.schema";

const guestApiRequest = {
  refreshTokenRequest: null as Promise<{
    status: number;
    payload: RefreshTokenResType;
  }> | null,
  sLogin: (body: GuestLoginBodyType) =>
    http.post<GuestLoginResType>("/guests/auth/login", body),
  login: (body: GuestLoginBodyType) =>
    http.post<GuestLoginResType>("/api/guests/auth/login", body, {
      baseUrl: "",
    }),
  sLogout: (
    body: LogoutBodyType & {
      accessToken: string;
    }
  ) =>
    http.post(
      "/guests/auth/logout",
      {
        refreshToken: body.refreshToken,
      },
      {
        headers: {
          Authorization: `Bearer ${body.accessToken}`,
        },
      }
    ),
  logout: () => http.post("/api/guests/auth/logout", null, { baseUrl: "" }),
  sRefreshToken: (body: RefreshTokenBodyType) =>
    http.post<RefreshTokenResType>("/guests/auth/refresh-token", body),
  async refreshToken() {
    if (this.refreshTokenRequest) {
      return this.refreshTokenRequest;
    }
    this.refreshTokenRequest = http.post<RefreshTokenResType>(
      "/api/guests/auth/refresh-token",
      null,
      {
        baseUrl: "",
      }
    );
    const result = await this.refreshTokenRequest;
    this.refreshTokenRequest = null;
    return result;
  },
};

export default guestApiRequest;
