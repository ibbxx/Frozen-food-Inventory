import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/query-client";
import { AuthProvider } from "../features/auth/AuthProvider";

export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
