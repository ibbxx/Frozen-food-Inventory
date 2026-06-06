import { QueryClient } from "@tanstack/react-query";

function isRetryableNetworkError(error) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return message.includes("failed to fetch") || message.includes("network") || message.includes("koneksi");
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
      retry: (failureCount, error) => isRetryableNetworkError(error) && failureCount < 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 4000),
    },
  },
});
