"use client";

import { useState, type ReactNode } from "react";
import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";
import { authApi } from "@/features/auth/auth-api";

export default function Providers({ children }: { children: ReactNode }) {
  const [store] = useState(() => configureStore({
    reducer: { [authApi.reducerPath]: authApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authApi.middleware),
    devTools: false,
  }));
  const [queryClient] = useState(() => new QueryClient());
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ReduxProvider>
  );
}
