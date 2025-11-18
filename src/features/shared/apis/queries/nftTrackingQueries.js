import api from "../../../utils/api";
import { useQuery } from "@tanstack/react-query";

export const nftTrackingQueries = {
  getTrackingByNftId: (nftId) => {
    return useQuery({
      queryKey: ["getTrackingByNftId", nftId],
      queryFn: async () => {
        const response = await api.get(
          `/NFTTracking/NFTTracking/${encodeURIComponent(nftId)}`
        );
        return response.data;
      },
    });
  },

  trackNFT: (nftId) => {
    return useQuery({
      queryKey: ["trackNFT", nftId],
      queryFn: async () => {
        const response = await api.get(`/NFTTracking/${nftId}`);
        return response.data;
      },
    });
  },
};
