import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as drugService from "../../../services/manufacturer/drugService";
import * as proofService from "../../../services/manufacturer/proofService";
import * as manufacturerService from "../../../services/manufacturer/manufacturerService";
import * as nftService from "../../../services/manufacturer/nftService";

const getApiErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Đã xảy ra lỗi";

// ============ DRUG SERVICE ============
export const useGetMyDrugs = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["manufacturer-my-drugs", page, limit],
    queryFn: () => drugService.getMyDrugs(page, limit),
  });
};

export const useGetAllDrugs = () => {
  return useQuery({
    queryKey: ["manufacturer-all-drugs"],
    queryFn: () => drugService.getAllDrugs(),
  });
};

export const useGetDrugById = (drugId) => {
  return useQuery({
    queryKey: ["manufacturer-drug-by-id", drugId],
    queryFn: () => drugService.getDrugById(drugId),
    enabled: !!drugId,
  });
};

export const useGetDrugsByManufacturerId = (manufacturerId) => {
  return useQuery({
    queryKey: ["manufacturer-drugs-by-manufacturer-id", manufacturerId],
    queryFn: () => drugService.getDrugsByManufacturerId(manufacturerId),
    enabled: !!manufacturerId,
  });
};

export const useSearchDrugByCode = (atcCode) => {
  return useQuery({
    queryKey: ["manufacturer-search-drug-by-code", atcCode],
    queryFn: () => drugService.searchDrugByCode(atcCode),
    enabled: !!atcCode,
  });
};

export const useCreateDrug = () => {
  return useMutation({
    mutationKey: ["manufacturer-create-drug"],
    mutationFn: drugService.createDrug,
    onSuccess: () => {
      toast.success("Tạo thuốc thành công!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
};

// ============ PROOF SERVICE ============
export const useGetMyProofs = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["manufacturer-my-proofs", page, limit],
    queryFn: () => proofService.getMyProofs(page, limit),
  });
};

export const useGetAllProofs = (params = {}) => {
  return useQuery({
    queryKey: ["manufacturer-all-proofs", params],
    queryFn: () => proofService.getAllProofs(params),
  });
};

export const useGetProofById = (proofId) => {
  return useQuery({
    queryKey: ["manufacturer-proof-by-id", proofId],
    queryFn: () => proofService.getProofById(proofId),
    enabled: !!proofId,
  });
};

export const useSearchProofByBatch = (batchNumber) => {
  return useQuery({
    queryKey: ["manufacturer-search-proof-by-batch", batchNumber],
    queryFn: () => proofService.searchProofByBatch(batchNumber),
    enabled: !!batchNumber,
  });
};

export const useGetProofStats = () => {
  return useQuery({
    queryKey: ["manufacturer-proof-stats"],
    queryFn: () => proofService.getProofStats(),
  });
};

export const useGenerateNFTMetadata = () => {
  return useMutation({
    mutationKey: ["manufacturer-generate-nft-metadata"],
    mutationFn: proofService.generateNFTMetadata,
  });
};

export const useCreateProofOfProduction = () => {
  return useMutation({
    mutationKey: ["manufacturer-create-proof-of-production"],
    mutationFn: proofService.createProofOfProduction,
    onSuccess: () => {
      toast.success("Tạo Proof of Production thành công!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
};

export const useUpdateProof = () => {
  return useMutation({
    mutationKey: ["manufacturer-update-proof"],
    mutationFn: ({ proofId, updateData }) =>
      proofService.updateProof(proofId, updateData),
    onSuccess: () => {
      toast.success("Cập nhật Proof thành công!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
};

// ============ MANUFACTURER SERVICE ============
export const useGetDrugs = (params = {}) => {
  return useQuery({
    queryKey: ["manufacturer-drugs", params],
    queryFn: async () => {
      const response = await manufacturerService.getDrugs(params);
      return response.data;
    },
  });
};

export const useGetDrugByIdFromService = (drugId) => {
  return useQuery({
    queryKey: ["manufacturer-drug-by-id-service", drugId],
    queryFn: async () => {
      const response = await manufacturerService.getDrugById(drugId);
      return response.data;
    },
    enabled: !!drugId,
  });
};

export const useSearchDrugByATC = (atcCode) => {
  return useQuery({
    queryKey: ["manufacturer-search-drug-atc", atcCode],
    queryFn: async () => {
      const response = await manufacturerService.searchDrugByATC(atcCode);
      return response.data;
    },
    enabled: !!atcCode,
  });
};

export const useAddDrug = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["manufacturer-add-drug"],
    mutationFn: async (data) => {
      const response = await manufacturerService.addDrug(data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Thêm thuốc thành công!");
      // Invalidate và refetch danh sách thuốc
      queryClient.invalidateQueries({ queryKey: ["manufacturer-drugs"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
};

export const useUpdateDrug = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["manufacturer-update-drug"],
    mutationFn: async ({ drugId, data }) => {
      const response = await manufacturerService.updateDrug(drugId, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Cập nhật thuốc thành công!");
      // Invalidate và refetch danh sách thuốc
      queryClient.invalidateQueries({ queryKey: ["manufacturer-drugs"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
};

export const useDeleteDrug = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["manufacturer-delete-drug"],
    mutationFn: async (drugId) => {
      const response = await manufacturerService.deleteDrug(drugId);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Xóa thuốc thành công!");
      // Invalidate và refetch danh sách thuốc
      queryClient.invalidateQueries({ queryKey: ["manufacturer-drugs"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
};

export const useUploadToIPFS = () => {
  return useMutation({
    mutationKey: ["manufacturer-upload-to-ipfs"],
    mutationFn: async (data) => {
      const response = await manufacturerService.uploadToIPFS(data);
      return response.data;
    },
  });
};

export const useSaveMintedNFTs = () => {
  return useMutation({
    mutationKey: ["manufacturer-save-minted-nfts"],
    mutationFn: async (data) => {
      const response = await manufacturerService.saveMintedNFTs(data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Lưu NFT thành công!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
};

export const useCreateTransferToDistributor = () => {
  return useMutation({
    mutationKey: ["manufacturer-create-transfer-to-distributor"],
    mutationFn: async (data) => {
      const response = await manufacturerService.createTransferToDistributor(
        data
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Tạo chuyển giao thành công!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
};

export const useSaveTransferTransaction = () => {
  return useMutation({
    mutationKey: ["manufacturer-save-transfer-transaction"],
    mutationFn: async (data) => {
      const response = await manufacturerService.saveTransferTransaction(data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Lưu giao dịch thành công!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
};

export const useGetProductionHistory = (params = {}) => {
  return useQuery({
    queryKey: ["manufacturer-production-history", params],
    queryFn: async () => {
      const response = await manufacturerService.getProductionHistory(params);
      return response.data;
    },
  });
};

export const useGetAvailableTokensForProduction = (productionId) => {
  return useQuery({
    queryKey: ["manufacturer-available-tokens", productionId],
    queryFn: async () => {
      const response =
        await manufacturerService.getAvailableTokensForProduction(productionId);
      return response.data;
    },
    enabled: !!productionId,
  });
};

export const useGetTransferHistory = (params = {}) => {
  return useQuery({
    queryKey: ["manufacturer-transfer-history", params],
    queryFn: async () => {
      const response = await manufacturerService.getTransferHistory(params);
      return response.data;
    },
  });
};

export const useGetStatistics = () => {
  return useQuery({
    queryKey: ["manufacturer-statistics"],
    queryFn: async () => {
      const response = await manufacturerService.getStatistics();
      return response.data;
    },
  });
};

export const useGetDashboardStats = () => {
  return useQuery({
    queryKey: ["manufacturer-dashboard-stats"],
    queryFn: async () => {
      const response = await manufacturerService.getDashboardStats();
      return response.data;
    },
  });
};

export const useGetChartOneWeek = () => {
  return useQuery({
    queryKey: ["manufacturer-chart-one-week"],
    queryFn: async () => {
      const response = await manufacturerService.getChartOneWeek();
      return response.data;
    },
  });
};

export const useGetChartTodayYesterday = () => {
  return useQuery({
    queryKey: ["manufacturer-chart-today-yesterday"],
    queryFn: async () => {
      const response = await manufacturerService.getChartTodayYesterday();
      return response.data;
    },
  });
};

export const useGetChartProductionsByDateRange = (startDate, endDate) => {
  return useQuery({
    queryKey: [
      "manufacturer-chart-productions-by-date-range",
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const response = await manufacturerService.getChartProductionsByDateRange(
        startDate,
        endDate
      );
      return response.data;
    },
    enabled: !!startDate && !!endDate,
  });
};

export const useGetChartDistributionsByDateRange = (startDate, endDate) => {
  return useQuery({
    queryKey: [
      "manufacturer-chart-distributions-by-date-range",
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const response =
        await manufacturerService.getChartDistributionsByDateRange(
          startDate,
          endDate
        );
      return response.data;
    },
    enabled: !!startDate && !!endDate,
  });
};

export const useGetChartTransfersByDateRange = (startDate, endDate) => {
  return useQuery({
    queryKey: [
      "manufacturer-chart-transfers-by-date-range",
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const response = await manufacturerService.getChartTransfersByDateRange(
        startDate,
        endDate
      );
      return response.data;
    },
    enabled: !!startDate && !!endDate,
  });
};

export const useGetMonthlyTrends = (months = 6) => {
  return useQuery({
    queryKey: ["manufacturer-monthly-trends", months],
    queryFn: async () => {
      const response = await manufacturerService.getMonthlyTrends(months);
      return response.data;
    },
  });
};

export const useGetPerformanceMetrics = (startDate, endDate) => {
  return useQuery({
    queryKey: ["manufacturer-performance-metrics", startDate, endDate],
    queryFn: async () => {
      const response = await manufacturerService.getPerformanceMetrics(
        startDate,
        endDate
      );
      return response.data;
    },
    enabled: !!startDate && !!endDate,
  });
};

export const useGetComplianceStats = () => {
  return useQuery({
    queryKey: ["manufacturer-compliance-stats"],
    queryFn: async () => {
      const response = await manufacturerService.getComplianceStats();
      return response.data;
    },
  });
};

export const useGetBlockchainStats = () => {
  return useQuery({
    queryKey: ["manufacturer-blockchain-stats"],
    queryFn: async () => {
      const response = await manufacturerService.getBlockchainStats();
      return response.data;
    },
  });
};

export const useGetAlertsStats = () => {
  return useQuery({
    queryKey: ["manufacturer-alerts-stats"],
    queryFn: async () => {
      const response = await manufacturerService.getAlertsStats();
      return response.data;
    },
  });
};

export const useGetProductAnalytics = () => {
  return useQuery({
    queryKey: ["manufacturer-product-analytics"],
    queryFn: async () => {
      const response = await manufacturerService.getProductAnalytics();
      return response.data;
    },
  });
};

export const useGetSupplyChainStats = () => {
  return useQuery({
    queryKey: ["manufacturer-supply-chain-stats"],
    queryFn: async () => {
      const response = await manufacturerService.getSupplyChainStats();
      return response.data;
    },
  });
};

export const useGetManufactureIPFSStatus = () => {
  return useQuery({
    queryKey: ["manufacturer-ipfs-status"],
    queryFn: async () => {
      const response = await manufacturerService.getManufactureIPFSStatus();
      return response.data;
    },
  });
};

export const useGetProfile = () => {
  return useQuery({
    queryKey: ["manufacturer-profile"],
    queryFn: async () => {
      const response = await manufacturerService.getProfile();
      return response.data;
    },
  });
};

export const useGetDistributors = (params = {}) => {
  return useQuery({
    queryKey: ["manufacturer-distributors", params],
    queryFn: async () => {
      const response = await manufacturerService.getDistributors(params);
      return response.data;
    },
  });
};

// ============ NFT SERVICE ============
export const useGetMyNFTs = () => {
  return useQuery({
    queryKey: ["manufacturer-my-nfts"],
    queryFn: () => nftService.getMyNFTs(),
  });
};

export const useGetNFTById = (nftId) => {
  return useQuery({
    queryKey: ["manufacturer-nft-by-id", nftId],
    queryFn: () => nftService.getNFTById(nftId),
    enabled: !!nftId,
  });
};

export const useGetNFTTrackingHistory = (tokenId) => {
  return useQuery({
    queryKey: ["manufacturer-nft-tracking-history", tokenId],
    queryFn: () => nftService.getNFTTrackingHistory(tokenId),
    enabled: !!tokenId,
  });
};

export const useGetNFTByBatchNumber = (batchNumber) => {
  return useQuery({
    queryKey: ["manufacturer-nft-by-batch-number", batchNumber],
    queryFn: () => nftService.getNFTByBatchNumber(batchNumber),
    enabled: !!batchNumber,
  });
};
