import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const defaultQueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 1,
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
