import api from "../../utils/api";
import { useQuery } from "@tanstack/react-query";

export const nftAPIs = {
  getMyNFTs: () => {
    return useQuery({
      queryKey: ["getMyNFTs"],
      queryFn: async () => {
        const response = await api.get("/nft-tracking/my-nfts");
        return response.data;
      },
    });
  },

  getNFTById: (nftId) => {
    return useQuery({
      queryKey: ["getNFTById", nftId],
      queryFn: async () => {
        const response = await api.get(`/nft-tracking/${nftId}`);
        return response.data;
      },
    });
  },

  getNFTTrackingHistory: (tokenId) => {
    return useQuery({
      queryKey: ["getNFTTrackingHistory", tokenId],
      queryFn: async () => {
        const response = await api.get(`/nft-tracking/history/${tokenId}`);
        return response.data;
      },
    });
  },

  getNFTByBatchNumber: (batchNumber) => {
    return useQuery({
      queryKey: ["getNFTByBatchNumber", batchNumber],
      queryFn: async () => {
        const response = await api.get(`/nft-tracking/batch/${batchNumber}`);
        return response.data;
      },
    });
  },
};
