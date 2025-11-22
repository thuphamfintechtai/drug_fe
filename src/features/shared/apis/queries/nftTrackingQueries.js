import api from "../../../utils/api";
import { useQuery } from "@tanstack/react-query";

// Individual hooks - must be called at top level of component/hook
export const useGetTrackingByNftId = (nftId) => {
  return useQuery({
    queryKey: ["getTrackingByNftId", nftId],
    queryFn: async () => {
      const response = await api.get(
        `/NFTTracking/NFTTracking/${encodeURIComponent(nftId)}`
      );
      return response.data;
    },
    enabled: !!nftId,
  });
};

export const useTrackNFT = (nftId) => {
  return useQuery({
    queryKey: ["trackNFT", nftId],
    queryFn: async () => {
      const response = await api.get(`/NFTTracking/${nftId}`);
      return response.data;
    },
    enabled: !!nftId,
  });
};

// Legacy exports for backward compatibility (deprecated - use individual hooks above)
export const nftTrackingQueries = {
  getTrackingByNftId: useGetTrackingByNftId,
  trackNFT: useTrackNFT,
};
