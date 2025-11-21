import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const defaultQueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Network mode for better offline handling
      networkMode: "online",
      // Structural sharing for better performance
      structuralSharing: true,
    },
    mutations: {
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: "online",
    },
  },
};

export default function ReactQueryProvider({ children }) {
  const [queryClient] = useState(
    () => new QueryClient(defaultQueryClientConfig)
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
