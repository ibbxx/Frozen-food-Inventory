import { QueryClient } from "@tanstack/react-query";

function isRetryableError(error) {
  if (!error) return false;

  const code = typeof error === "object" && "code" in error ? String(error.code).toLowerCase() : "";
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  return (
    code === "57p01" ||
    code === "57p03" ||
    message.includes("shutting down") ||
    message.includes("terminating connection") ||
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("koneksi")
  );
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: (failureCount, error) => isRetryableError(error) && failureCount < 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
    },
  },
});
