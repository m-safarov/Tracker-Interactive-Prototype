import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { AccountProfile, ChangePasswordBody, LoginBody, RegisterBody, UpdateProfileBody } from "./schema";

type AuthResponse = { destination: string };
type AuthError = { message: string; field?: "email" | "current_password" };

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api", credentials: "same-origin" }),

  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginBody>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),

      async onQueryStarted(_, { queryFulfilled }) {
        const result = await queryFulfilled.catch(() => null);

        if (result) {
          window.location.replace(result.data.destination);
        }
      },
    }),

    register: builder.mutation<AuthResponse, RegisterBody>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),
    getProfile: builder.query<AccountProfile, void>({
      query: () => "/auth/me",
    }),

    updateProfile: builder.mutation<AccountProfile, UpdateProfileBody>({
      query: (body) => ({
        url: "/auth/me",
        method: "PATCH",
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const saved = await queryFulfilled.catch(() => null);
        if (saved) {
          dispatch(authApi.util.updateQueryData("getProfile", undefined, () => saved.data));
        }
      },
    }),

    changePassword: builder.mutation<void, ChangePasswordBody>({
      query: (body) => ({
        url: "/auth/change-password",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = authApi;

export function getAuthError(error: unknown): AuthError {
  if (error && typeof error === "object" && "data" in error) {
    const response = error.data as { error?: AuthError } | null | undefined;
    if (typeof response?.error?.message === "string") {
      return response.error;
    }
  }

  return { message: "Could not connect to Tracker. Please try again." };
}
