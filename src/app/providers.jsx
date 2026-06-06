import { QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "@/features/auth";
import { queryClient } from "@/shared/lib/query-client";

export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
