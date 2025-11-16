import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import distributorService from "../../../services/distributor/distributorService";
import * as invoiceService from "../../../services/distributor/invoiceService";
import * as proofService from "../../../services/distributor/proofService";
import * as proofOfPharmacyService from "../../../services/distributor/proofOfPharmacyService";
import * as pharmacyService from "../../../services/distributor/pharmacyService";
import * as nftService from "../../../services/distributor/nftService";

const getApiErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Đã xảy ra lỗi";

// ============ QUẢN LÝ ĐƠN HÀNG TỪ PHARMA COMPANY ============
export const useGetInvoicesFromManufacturer = (params) => {
  return useQuery({
    queryKey: ["get-invoices-from-manufacturer", params],
    queryFn: () => distributorService.getInvoicesFromManufacturer(params),
    enabled: !!params,
  });
};

// ============ DASHBOARD DISTRIBUTOR ============
export const useGetStatistics = () => {
  return useQuery({
    queryKey: ["get-statistics"],
    queryFn: () => distributorService.getStatistics(),
  });
};

export const useGetDashboardStats = () => {
  return useQuery({
    queryKey: ["get-dashboard-stats"],
    queryFn: () => distributorService.getDashboardStats(),
  });
};

export const useGetChartOneWeek = () => {
  return useQuery({
    queryKey: ["get-chart-one-week"],
    queryFn: () => distributorService.getChartOneWeek(),
  });
};

export const useGetChartTodayYesterday = () => {
  return useQuery({
    queryKey: ["get-chart-today-yesterday"],
    queryFn: () => distributorService.getChartTodayYesterday(),
  });
};

export const useGetMonthlyTrends = (months) => {
  return useQuery({
    queryKey: ["get-monthly-trends", months],
    queryFn: () => distributorService.getMonthlyTrends(months),
  });
};

// ============ DISTRIBUTOR CORE ============
export const useDistributorGetProfile = () => {
  return useMutation({
    mutationKey: ["distributor-profile"],
    mutationFn: distributorService.getProfile,
  });
};

export const useDistributorGetDistributionHistory = () => {
  return useMutation({
    mutationKey: ["distributor-distribution-history"],
    mutationFn: distributorService.getDistributionHistory,
  });
};

export const useDistributorGetTransferToPharmacyHistory = () => {
  return useMutation({
    mutationKey: ["distributor-transfer-history"],
    mutationFn: distributorService.getTransferToPharmacyHistory,
  });
};

export const useDistributorGetPharmacies = () => {
  return useMutation({
    mutationKey: ["distributor-pharmacies"],
    mutationFn: distributorService.getPharmacies,
  });
};

export const useDistributorTransferToPharmacy = () => {
  return useMutation({
    mutationKey: ["distributor-transfer-to-pharmacy"],
    mutationFn: distributorService.transferToPharmacy,
  });
};

export const useDistributorSaveTransferTransaction = () => {
  return useMutation({
    mutationKey: ["distributor-save-transfer-transaction"],
    mutationFn: distributorService.saveTransferToPharmacyTransaction,
  });
};

export const useDistributorGetInvoiceDetail = () => {
  return useMutation({
    mutationKey: ["distributor-invoice-detail"],
    mutationFn: distributorService.getInvoiceDetail,
  });
};

export const useDistributorConfirmReceipt = (toastOptions = {}) => {
  const hasSuccessMessage =
    Object.prototype.hasOwnProperty.call(toastOptions, "successMessage") &&
    toastOptions.successMessage !== undefined;
  const hasErrorMessage =
    Object.prototype.hasOwnProperty.call(toastOptions, "errorMessage") &&
    toastOptions.errorMessage !== undefined;

  return useMutation({
    mutationKey: ["distributor-confirm-receipt"],
    mutationFn: distributorService.confirmReceipt,
    onSuccess: (data, variables, context) => {
      toastOptions.onSuccess?.(data, variables, context);
      if (hasSuccessMessage) {
        const message =
          typeof toastOptions.successMessage === "function"
            ? toastOptions.successMessage(data, variables, context)
            : toastOptions.successMessage;
        if (message) {
          toast.success(message);
        }
      }
    },
    onError: (error, variables, context) => {
      toastOptions.onError?.(error, variables, context);
      if (hasErrorMessage) {
        const message =
          typeof toastOptions.errorMessage === "function"
            ? toastOptions.errorMessage(error, variables, context)
            : toastOptions.errorMessage;
        toast.error(message || getApiErrorMessage(error));
      }
    },
  });
};

export const useDistributorGetDrugs = () => {
  return useMutation({
    mutationKey: ["distributor-drugs"],
    mutationFn: distributorService.getDrugs,
  });
};

export const useDistributorSearchDrugByATC = () => {
  return useMutation({
    mutationKey: ["distributor-search-drug-atc"],
    mutationFn: distributorService.searchDrugByATCCode,
  });
};

export const useDistributorTrackDrugByNFTId = () => {
  return useMutation({
    mutationKey: ["distributor-track-drug-by-nft"],
    mutationFn: distributorService.trackDrugByNFTId,
  });
};

// ============ INVOICE SERVICE ============
export const useDistributorGetMyInvoices = () => {
  return useMutation({
    mutationKey: ["distributor-my-invoices"],
    mutationFn: invoiceService.getMyInvoices,
  });
};

export const useDistributorGetInvoiceById = () => {
  return useMutation({
    mutationKey: ["distributor-invoice-by-id"],
    mutationFn: invoiceService.getInvoiceById,
  });
};

export const useDistributorCreateInvoice = () => {
  return useMutation({
    mutationKey: ["distributor-create-invoice"],
    mutationFn: invoiceService.createInvoice,
  });
};

export const useDistributorUpdateInvoiceStatus = () => {
  return useMutation({
    mutationKey: ["distributor-update-invoice-status"],
    mutationFn: ({ id, data }) => invoiceService.updateInvoiceStatus(id, data),
  });
};

export const useDistributorGetInvoiceStats = () => {
  return useMutation({
    mutationKey: ["distributor-invoice-stats"],
    mutationFn: invoiceService.getInvoiceStats,
  });
};

// ============ PROOF OF DISTRIBUTION ============
export const useDistributorGetDistributions = () => {
  return useMutation({
    mutationKey: ["distributor-distributions"],
    mutationFn: proofService.getDistributions,
  });
};

export const useDistributorGetDistributionDetail = () => {
  return useMutation({
    mutationKey: ["distributor-distribution-detail"],
    mutationFn: proofService.getDistributionDetail,
  });
};

export const useDistributorConfirmDistribution = () => {
  return useMutation({
    mutationKey: ["distributor-confirm-distribution"],
    mutationFn: proofService.confirmDistribution,
  });
};

export const useDistributorGetDistributionStats = () => {
  return useMutation({
    mutationKey: ["distributor-proof-stats"],
    mutationFn: proofService.getDistributionStats,
  });
};

export const useDistributorUpdateDistributionStatus = () => {
  return useMutation({
    mutationKey: ["distributor-update-distribution-status"],
    mutationFn: ({ id, data }) =>
      proofService.updateDistributionStatus(id, data),
  });
};

// ============ PROOF OF PHARMACY ============
export const useDistributorCreateProofToPharmacy = () => {
  return useMutation({
    mutationKey: ["distributor-create-proof-to-pharmacy"],
    mutationFn: proofOfPharmacyService.createProofToPharmacy,
  });
};

export const useDistributorGetDeliveriesToPharmacy = () => {
  return useMutation({
    mutationKey: ["distributor-deliveries-to-pharmacy"],
    mutationFn: proofOfPharmacyService.getDeliveriesToPharmacy,
  });
};

export const useDistributorUpdatePharmacyDeliveryStatus = () => {
  return useMutation({
    mutationKey: ["distributor-update-pharmacy-delivery-status"],
    mutationFn: ({ id, data }) =>
      proofOfPharmacyService.updatePharmacyDeliveryStatus(id, data),
  });
};

export const useDistributorGetAllProofOfPharmacies = () => {
  return useMutation({
    mutationKey: ["distributor-proof-of-pharmacy-all"],
    mutationFn: proofOfPharmacyService.getAllProofOfPharmacies,
  });
};

export const useDistributorGetProofOfPharmacyById = () => {
  return useMutation({
    mutationKey: ["distributor-proof-of-pharmacy-detail"],
    mutationFn: proofOfPharmacyService.getProofOfPharmacyById,
  });
};

// ============ PHARMACY SERVICE ============
export const useDistributorGetAllPharmacies = () => {
  return useMutation({
    mutationKey: ["distributor-all-pharmacies"],
    mutationFn: pharmacyService.getAllPharmacies,
  });
};

// ============ NFT SERVICE ============
export const useDistributorTrackNFT = () => {
  return useMutation({
    mutationKey: ["distributor-track-nft"],
    mutationFn: nftService.trackNFT,
  });
};
