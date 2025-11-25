/* eslint-disable no-undef */
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useDistributorDistributionHistory,
  useDistributorPharmacies,
  useTransferToPharmacy as useTransferToPharmacyMutation,
  useSaveTransferTransaction,
  useUpdateInvoiceStatus,
} from "../apis/distributor";
import api from "../../utils/api";
import {
  checkDistributorNFTBalances,
  connectWallet,
  getCurrentAccount,
  finalizeDistributorPharmacyContract,
  createDistributorPharmacyContract,
  distributorTransferToPharmacyOnChain,
} from "../../utils/web3Helper";

// ✅ VALIDATION FUNCTIONS
const validateTokenIds = (tokenIds) => {
  if (!Array.isArray(tokenIds) || tokenIds.length === 0) {
    return { valid: false, error: "tokenIds phải là array không rỗng" };
  }

  const trimmed = tokenIds.map((id) => String(id).trim()).filter((id) => id !== "");
  if (trimmed.length === 0) {
    return { valid: false, error: "tokenIds không được rỗng" };
  }

  const unique = [...new Set(trimmed)];
  if (unique.length !== trimmed.length) {
    const duplicates = findDuplicates(trimmed);
    return {
      valid: false,
      error: "tokenIds không được có giá trị trùng lặp",
      duplicates,
    };
  }

  return { valid: true, tokenIds: unique };
};

const validateQuantity = (quantity, tokenIdsLength) => {
  if (quantity === null || quantity === undefined || quantity === "") {
    return { valid: true }; // Optional field
  }

  const qty = typeof quantity === "number" ? quantity : parseInt(quantity);
  if (isNaN(qty)) {
    return { valid: false, error: "quantity phải là số" };
  }

  if (qty !== tokenIdsLength) {
    return {
      valid: false,
      error: `quantity (${qty}) phải bằng số lượng tokenIds (${tokenIdsLength})`,
    };
  }

  return { valid: true };
};

const validateTransactionHash = (hash) => {
  if (!hash || typeof hash !== "string") {
    return { valid: false, error: "transactionHash không hợp lệ" };
  }

  if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
    return {
      valid: false,
      error: "transactionHash phải có định dạng Ethereum hash (0x + 64 hex chars)",
    };
  }

  return { valid: true };
};

const findDuplicates = (arr) => {
  const seen = new Set();
  const duplicates = new Set();

  arr.forEach((item) => {
    if (seen.has(item)) {
      duplicates.add(item);
    } else {
      seen.add(item);
    }
  });

  return Array.from(duplicates);
};

export const useTransferToPharmacy = () => {
  const queryClient = useQueryClient();
  const TRANSFER_CACHE_KEY = ["distributor", "transfer-to-pharmacy"];

  const normalizeDistribution = (item = {}) => {
    const manufacturerObj =
      item.manufacturer ||
      item.fromManufacturer ||
      (item.manufacturerName
        ? { fullName: item.manufacturerName }
        : item.manufacturerId
        ? { fullName: item.manufacturerId }
        : null);

    const manufacturerId =
      item.manufacturerId ||
      item?.manufacturer?._id ||
      item?.fromManufacturer?._id ||
      item._fromManufacturerId ||
      (typeof item.manufacturer === "string" ? item.manufacturer : undefined);

    const invoiceNumber =
      item.manufacturerInvoice?.invoiceNumber ||
      item.invoice?.invoiceNumber ||
      item.invoiceNumber ||
      item?.manufacturerInvoice?.invoice?.number ||
      item?.invoice?.code ||
      item?.code ||
      item?.id;

    const manufacturerInvoice =
      item.manufacturerInvoice ||
      item.invoice ||
      (invoiceNumber ? { invoiceNumber } : undefined);

    const tokenIds = Array.isArray(item.tokenIds)
      ? item.tokenIds.map((id) => String(id))
      : item.tokenIds;

    const quantity =
      item.distributedQuantity ??
      item.quantity ??
      (Array.isArray(tokenIds) ? tokenIds.length : undefined);

    const batchNumber = item.batchNumber || item._batchNumber || undefined;

    return {
      ...item,
      _id: item._id || item.id || item.distributionId,
      manufacturer: manufacturerObj || undefined,
      manufacturerId,
      manufacturerInvoice,
      invoiceNumber,
      batchNumber,
      drugId:
        item.drugId ||
        item._drugId ||
        item?.drug?._id ||
        item?.drug?.id ||
        item?.proofOfProduction?.drugId ||
        item?.manufacturerInvoice?.drugId ||
        item?.manufacturerInvoice?._drugId ||
        item?.invoice?.drugId ||
        item?.invoice?._drugId,
      distributedQuantity: quantity,
      tokenIds,
      distributionDate:
        item.distributionDate || item.receivedAt || item.createdAt || null,
      chainTxHash: item.chainTxHash || item._chainTxHash || undefined,
    };
  };

  const extractTokenIdsFromInvoiceDetail = (detail = {}) => {
    const candidates = [
      detail.tokenIds,
      detail._tokenIds,
      detail?.data?.tokenIds,
      detail?.invoice?.tokenIds,
      detail?.manufacturerInvoice?.tokenIds,
    ];
    for (const candidate of candidates) {
      if (Array.isArray(candidate) && candidate.length > 0) {
        return candidate.map((id) => String(id));
      }
    }
    return [];
  };

  const parseInvoiceDetail = (detail = {}) => {
    if (!detail || typeof detail !== "object") {
      return {};
    }

    const invoiceNumber =
      detail.invoiceNumber ||
      detail?.invoice?.invoiceNumber ||
      detail?.manufacturerInvoice?.invoiceNumber ||
      detail?._invoiceNumber?._value ||
      detail?._invoiceNumber?.value ||
      detail?.invoiceCode ||
      detail?._id;

    const tokenIds = extractTokenIdsFromInvoiceDetail(detail);
    const status = (detail.status || detail._status || "").toLowerCase();
    const quantity =
      detail.quantity ??
      detail?._quantity?._value ??
      detail?._quantity?.value ??
      detail?._quantity ??
      null;

    const drugId =
      detail.drugId ||
      detail._drugId ||
      detail?.drug?._id ||
      detail?.drug?.id;

    const batchNumber = detail.batchNumber || detail._batchNumber || undefined;

    return {
      id: detail._id || detail.id,
      invoiceNumber,
      status,
      tokenIds,
      drugId,
      batchNumber,
      manufacturerId:
        detail._fromManufacturerId ||
        detail.fromManufacturerId ||
        detail.manufacturerId,
      invoiceDate: detail.invoiceDate || detail._invoiceDate || null,
      quantity,
    };
  };

  const resolveDrugId = (distribution = {}) => {
    return (
      distribution.drugId ||
      distribution._drugId ||
      distribution?.manufacturerInvoice?.drugId ||
      distribution?.manufacturerInvoice?._drugId ||
      distribution?.invoice?.drugId ||
      distribution?.invoice?._drugId ||
      distribution?.proofOfProduction?.drugId ||
      distribution?.proofOfProduction?._drugId ||
      distribution?.drug?._id ||
      distribution?.drug?.id
    );
  };

  const findInvoiceIdByTokens = async (tokenIds, batchNumber) => {
    if (!Array.isArray(tokenIds) || tokenIds.length === 0) {
      return null;
    }

    try {
      console.log("🔍 [findInvoiceIdByTokens] Searching for invoice with tokenIds:", tokenIds, "batchNumber:", batchNumber);
      
      const response = await api.get("/distributor/invoices");
      
      let invoices = [];
      if (response.data?.success && response.data?.data) {
        invoices = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data?.data)) {
        invoices = response.data.data;
      } else if (Array.isArray(response.data)) {
        invoices = response.data;
      }

      console.log("📋 [findInvoiceIdByTokens] Found invoices:", invoices.length);

      const targetTokenId = tokenIds[0];
      const matchedInvoice = invoices.find((inv) => {
        const invTokenIds = inv.tokenIds || inv._tokenIds || [];
        return invTokenIds.some(id => String(id) === String(targetTokenId));
      });

      if (matchedInvoice) {
        console.log("✅ [findInvoiceIdByTokens] Found matching invoice:", matchedInvoice._id || matchedInvoice.id);
        return matchedInvoice._id || matchedInvoice.id;
      }

      console.warn("⚠️ [findInvoiceIdByTokens] No matching invoice found");
      return null;
    } catch (error) {
      console.error("❌ [findInvoiceIdByTokens] Error:", error);
      return null;
    }
  };

  const [distributions, setDistributions] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  const [formData, setFormData] = useState({
    pharmacyId: "",
    quantity: "",
    notes: "",
  });
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [showChainView, setShowChainView] = useState(false);
  const [chainStatus, setChainStatus] = useState("minting");
  const [chainProgress, setChainProgress] = useState(0);
  const chainIntervalRef = useRef(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const {
    data: distributionHistoryData,
    isLoading: distributionLoading,
    error: distributionError,
    refetch: refetchDistributionHistory
  } = useDistributorDistributionHistory({ status: "confirmed" });
  
  const {
    data: pharmaciesData,
    isLoading: pharmaciesLoading,
    error: pharmaciesError,
    refetch: refetchPharmacies
  } = useDistributorPharmacies();

  useEffect(() => {
    if (distributionHistoryData) {
      console.log("🔍 [useTransferToPharmacy] Distribution History Data:", distributionHistoryData);
    }
    if (distributionError) {
      console.error("❌ [useTransferToPharmacy] Distribution History Error:", distributionError);
    }
  }, [distributionHistoryData, distributionError]);

  useEffect(() => {
    if (pharmaciesData) {
      console.log("🔍 [useTransferToPharmacy] Pharmacies Data:", pharmaciesData);
    }
    if (pharmaciesError) {
      console.error("❌ [useTransferToPharmacy] Pharmacies Error:", pharmaciesError);
    }
  }, [pharmaciesData, pharmaciesError]);

  const { mutateAsync: transferToPharmacyMutation } = useTransferToPharmacyMutation();
  const { mutateAsync: saveTransferTransaction } = useSaveTransferTransaction();
  const { mutateAsync: updateInvoiceStatus } = useUpdateInvoiceStatus();

  useEffect(() => {
    if (distributionHistoryData) {
      let nextDistributions = [];

      if (distributionHistoryData.success && distributionHistoryData.data?.distributions) {
        nextDistributions = Array.isArray(distributionHistoryData.data.distributions)
          ? distributionHistoryData.data.distributions
          : [];
      } else if (distributionHistoryData.data?.success && distributionHistoryData.data.data?.distributions) {
        nextDistributions = Array.isArray(distributionHistoryData.data.data.distributions)
          ? distributionHistoryData.data.data.distributions
          : [];
      } else if (distributionHistoryData.data?.distributions) {
        nextDistributions = Array.isArray(distributionHistoryData.data.distributions)
          ? distributionHistoryData.data.distributions
          : [];
      } else if (distributionHistoryData.success && Array.isArray(distributionHistoryData.data)) {
        nextDistributions = distributionHistoryData.data;
      } else if (Array.isArray(distributionHistoryData.data)) {
        nextDistributions = distributionHistoryData.data;
      } else if (Array.isArray(distributionHistoryData)) {
        nextDistributions = distributionHistoryData;
      }

      console.log("📦 [useTransferToPharmacy] Parsed distributions:", {
        raw: distributionHistoryData,
        parsed: nextDistributions,
        count: nextDistributions.length,
      });

      const normalized = nextDistributions.map((item) =>
        normalizeDistribution(item)
      );
      setDistributions(normalized);
      queryClient.setQueryData(TRANSFER_CACHE_KEY, {
        distributions: normalized,
        pharmacies: pharmacies || [],
      });
    }
  }, [distributionHistoryData, queryClient, pharmacies]);

  useEffect(() => {
    if (pharmaciesData) {
      let nextPharmacies = [];

      if (pharmaciesData.success && pharmaciesData.data?.pharmacies) {
        nextPharmacies = Array.isArray(pharmaciesData.data.pharmacies)
          ? pharmaciesData.data.pharmacies
          : [];
      } else if (pharmaciesData.data?.success && pharmaciesData.data.data?.pharmacies) {
        nextPharmacies = Array.isArray(pharmaciesData.data.data.pharmacies)
          ? pharmaciesData.data.data.pharmacies
          : [];
      } else if (pharmaciesData.data?.pharmacies) {
        nextPharmacies = Array.isArray(pharmaciesData.data.pharmacies)
          ? pharmaciesData.data.pharmacies
          : [];
      } else if (Array.isArray(pharmaciesData.data)) {
        nextPharmacies = pharmaciesData.data;
      } else if (Array.isArray(pharmaciesData)) {
        nextPharmacies = pharmaciesData;
      }

      console.log("💊 [useTransferToPharmacy] Parsed pharmacies:", {
        raw: pharmaciesData,
        parsed: nextPharmacies,
        count: nextPharmacies.length,
      });

      const normalizedDistributions = distributions?.length
        ? distributions
        : [];
      setPharmacies(nextPharmacies);
      queryClient.setQueryData(TRANSFER_CACHE_KEY, {
        distributions: normalizedDistributions,
        pharmacies: nextPharmacies,
      });
    }
  }, [pharmaciesData, queryClient, distributions]);

  useEffect(() => {
    const cached = queryClient.getQueryData(TRANSFER_CACHE_KEY);
    if (cached) {
      setDistributions(cached.distributions || []);
      setPharmacies(cached.pharmacies || []);
      setLoading(false);
      setLoadingProgress(0);
    } else {
      loadData(true);
    }
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (chainIntervalRef.current) {
        clearInterval(chainIntervalRef.current);
      }
    };
  }, []);

  const loadData = async (
    showLoader = distributions.length === 0 || pharmacies.length === 0
  ) => {
    const shouldShowLoader = showLoader;
    try {
      if (shouldShowLoader) {
        setLoading(true);
        setLoadingProgress(0);

        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }

        progressIntervalRef.current = setInterval(() => {
          setLoadingProgress((prev) =>
            prev < 0.9 ? Math.min(prev + 0.02, 0.9) : prev
          );
        }, 50);
      }

      const [distributionResult, pharmaciesResult] = await Promise.all([
        refetchDistributionHistory(),
        refetchPharmacies(),
      ]);

      const distributionResponse = distributionResult?.data;
      const pharmaciesResponse = pharmaciesResult?.data;

      let nextDistributions = [];
      if (distributionResponse) {
        if (distributionResponse.success && distributionResponse.data?.distributions) {
          nextDistributions = Array.isArray(distributionResponse.data.distributions)
            ? distributionResponse.data.distributions
            : [];
        } else if (distributionResponse.data?.success && distributionResponse.data.data?.distributions) {
          nextDistributions = Array.isArray(distributionResponse.data.data.distributions)
            ? distributionResponse.data.data.distributions
            : [];
        } else if (distributionResponse.data?.distributions) {
          nextDistributions = Array.isArray(distributionResponse.data.distributions)
            ? distributionResponse.data.distributions
            : [];
        } else if (distributionResponse.success && Array.isArray(distributionResponse.data)) {
          nextDistributions = distributionResponse.data;
        } else if (Array.isArray(distributionResponse.data)) {
          nextDistributions = distributionResponse.data;
        } else if (Array.isArray(distributionResponse)) {
          nextDistributions = distributionResponse;
        }
      }

      console.log("📦 [useTransferToPharmacy] Loaded distributions:", {
        raw: distributionResponse,
        parsed: nextDistributions,
        count: nextDistributions.length,
      });

      let nextPharmacies = [];
      if (pharmaciesResponse) {
        if (pharmaciesResponse.success && pharmaciesResponse.data?.pharmacies) {
          nextPharmacies = Array.isArray(pharmaciesResponse.data.pharmacies)
            ? pharmaciesResponse.data.pharmacies
            : [];
        } else if (pharmaciesResponse.data?.success && pharmaciesResponse.data.data?.pharmacies) {
          nextPharmacies = Array.isArray(pharmaciesResponse.data.data.pharmacies)
            ? pharmaciesResponse.data.data.pharmacies
            : [];
        } else if (pharmaciesResponse.data?.pharmacies) {
          nextPharmacies = Array.isArray(pharmaciesResponse.data.pharmacies)
            ? pharmaciesResponse.data.pharmacies
            : [];
        } else if (Array.isArray(pharmaciesResponse.data)) {
          nextPharmacies = pharmaciesResponse.data;
        } else if (Array.isArray(pharmaciesResponse)) {
          nextPharmacies = pharmaciesResponse;
        }
      }

      console.log("💊 [useTransferToPharmacy] Loaded pharmacies:", {
        raw: pharmaciesResponse,
        parsed: nextPharmacies,
        count: nextPharmacies.length,
      });

      const normalizedDistributions = nextDistributions.map((item) =>
        normalizeDistribution(item)
      );
      setDistributions(normalizedDistributions);
      setPharmacies(nextPharmacies);

      queryClient.setQueryData(TRANSFER_CACHE_KEY, {
        distributions: normalizedDistributions,
        pharmacies: nextPharmacies,
      });

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      setLoadingProgress(1);
      await new Promise((r) => setTimeout(r, 300));
    } catch (error) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      console.error("❌ [useTransferToPharmacy] Lỗi khi tải dữ liệu:", {
        error,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setDistributions([]);
      setPharmacies([]);
      
      // ✅ IMPROVED: Error message rõ ràng hơn
      const errorMessage = error.response?.data?.message || error.message || "Lỗi không xác định";
      toast.error(`Không thể tải dữ liệu: ${errorMessage}`, {
        position: "top-right",
        duration: 4000,
      });
    } finally {
      if (shouldShowLoader) {
        setLoading(false);
        setLoadingProgress(0);
      }
    }
  };

  const extractTokenIds = (distributionObj) => {
    console.log("🔍 [extractTokenIds] Distribution object:", distributionObj);

    if (
      distributionObj.manufacturerInvoice?.tokenIds &&
      Array.isArray(distributionObj.manufacturerInvoice.tokenIds)
    ) {
      const tokenIds = distributionObj.manufacturerInvoice.tokenIds.map((id) =>
        String(id)
      );
      console.log("✅ [extractTokenIds] Found in manufacturerInvoice.tokenIds:", tokenIds);
      return tokenIds;
    }

    if (
      distributionObj.invoice?.tokenIds &&
      Array.isArray(distributionObj.invoice.tokenIds)
    ) {
      const tokenIds = distributionObj.invoice.tokenIds.map((id) => String(id));
      console.log("✅ [extractTokenIds] Found in invoice.tokenIds:", tokenIds);
      return tokenIds;
    }

    if (
      distributionObj.proofOfDistribution?.tokenIds &&
      Array.isArray(distributionObj.proofOfDistribution.tokenIds)
    ) {
      const tokenIds = distributionObj.proofOfDistribution.tokenIds.map((id) =>
        String(id)
      );
      console.log("✅ [extractTokenIds] Found in proofOfDistribution.tokenIds:", tokenIds);
      return tokenIds;
    }

    if (distributionObj.tokenIds && Array.isArray(distributionObj.tokenIds)) {
      const tokenIds = distributionObj.tokenIds.map((id) => String(id));
      console.log("✅ [extractTokenIds] Found in tokenIds:", tokenIds);
      return tokenIds;
    }

    if (distributionObj.nftInfos && Array.isArray(distributionObj.nftInfos)) {
      const tokenIds = distributionObj.nftInfos
        .map((nft) => {
          if (typeof nft === "string") {
            return nft;
          }
          return String(nft.tokenId || nft._id || nft.nftInfo?.tokenId || "");
        })
        .filter(Boolean);
      if (tokenIds.length > 0) {
        console.log("✅ [extractTokenIds] Found in nftInfos:", tokenIds);
        return tokenIds;
      }
    }

    console.warn("⚠️ [extractTokenIds] No tokenIds found in distribution object");
    return [];
  };

  const handleSelectDistribution = async (dist) => {
    console.log("📦 [handleSelectDistribution] Selected distribution:", dist);
    let tokenIds = extractTokenIds(dist);
    let enrichedDistribution = normalizeDistribution(dist);

    const needsDetailFetch = tokenIds.length === 0 || !enrichedDistribution.drugId;

    if (needsDetailFetch) {
      setDialogLoading(true);
    }

    try {
      if (needsDetailFetch) {
        console.log(
          "🔍 [handleSelectDistribution] Missing tokenIds or drugId, trying to fetch from API..."
        );

        let invoiceIdToFetch = null;

        if (tokenIds.length > 0 && !enrichedDistribution.drugId) {
          console.log("🔍 [handleSelectDistribution] Have tokenIds but missing drugId, searching for invoice...");
          invoiceIdToFetch = await findInvoiceIdByTokens(tokenIds, enrichedDistribution.batchNumber);
        } else {
          invoiceIdToFetch =
            dist?.manufacturerInvoice?._id ||
            dist?.manufacturerInvoice?.id ||
            dist?.manufacturerInvoice ||
            dist?.manufacturerInvoiceId ||
            dist?.invoice?._id ||
            dist?.invoice?.id ||
            dist?.invoice ||
            dist?.invoiceId;
        }

        console.log("🔍 [handleSelectDistribution] Invoice ID to fetch:", invoiceIdToFetch);

        if (invoiceIdToFetch && typeof invoiceIdToFetch === "string") {
          try {
            console.log("📡 [handleSelectDistribution] Fetching invoice detail from API...");
            const invoiceDetailRes = await queryClient.fetchQuery({
              queryKey: ["getInvoiceDetail", invoiceIdToFetch],
              queryFn: async () => {
                const response = await api.get(
                  `/distributor/invoices/${invoiceIdToFetch}/detail`
                );
                return response.data;
              },
            });

            console.log("📡 [handleSelectDistribution] Invoice detail response:", invoiceDetailRes);

            let invoiceDetail = null;
            if (invoiceDetailRes?.success && invoiceDetailRes.data) {
              invoiceDetail = invoiceDetailRes.data;
            } else if (invoiceDetailRes?.data) {
              invoiceDetail = invoiceDetailRes.data;
            } else if (invoiceDetailRes) {
              invoiceDetail = invoiceDetailRes;
            }

            if (invoiceDetail) {
              const parsedInvoice = parseInvoiceDetail(invoiceDetail);

              if ((!tokenIds || tokenIds.length === 0) && parsedInvoice.tokenIds?.length) {
                tokenIds = parsedInvoice.tokenIds;
                console.log(
                  "✅ [handleSelectDistribution] Found tokenIds from invoice API:",
                  tokenIds
                );
              }

              enrichedDistribution = {
                ...enrichedDistribution,
                manufacturerInvoice:
                  enrichedDistribution.manufacturerInvoice ||
                  (parsedInvoice.invoiceNumber
                    ? { invoiceNumber: parsedInvoice.invoiceNumber }
                    : enrichedDistribution.manufacturerInvoice),
                invoiceNumber:
                  parsedInvoice.invoiceNumber || enrichedDistribution.invoiceNumber,
                manufacturerId:
                  enrichedDistribution.manufacturerId || parsedInvoice.manufacturerId,
                manufacturer:
                  enrichedDistribution.manufacturer ||
                  (parsedInvoice.manufacturerId
                    ? { fullName: parsedInvoice.manufacturerId }
                    : enrichedDistribution.manufacturer),
                drugId: parsedInvoice.drugId || enrichedDistribution.drugId,
                distributedQuantity:
                  enrichedDistribution.distributedQuantity ||
                  parsedInvoice.quantity ||
                  enrichedDistribution.distributedQuantity,
                distributionDate:
                  enrichedDistribution.distributionDate ||
                  parsedInvoice.invoiceDate ||
                  enrichedDistribution.distributionDate,
              };

              console.log("✅ [handleSelectDistribution] Enriched with invoice data, drugId:", enrichedDistribution.drugId);
            }
          } catch (invoiceError) {
            console.error("❌ [handleSelectDistribution] Lỗi khi gọi getInvoiceDetail:", invoiceError);
          }
        }

        if ((tokenIds.length === 0 || !enrichedDistribution.drugId) && dist?._id) {
          try {
            console.log("📡 [handleSelectDistribution] Trying distribution detail API...");
            const distributionDetailRes = await queryClient.fetchQuery({
              queryKey: ["getDistributionDetail", dist._id],
              queryFn: async () => {
                const response = await api.get(
                  `/distributor/distributions/${dist._id}`
                );
                return response.data;
              },
            });

            console.log("📡 [handleSelectDistribution] Distribution detail response:", distributionDetailRes);

            let distributionDetail = null;
            if (distributionDetailRes?.success && distributionDetailRes.data) {
              distributionDetail = distributionDetailRes.data;
            } else if (distributionDetailRes?.data) {
              distributionDetail = distributionDetailRes.data?.data || distributionDetailRes.data;
            } else if (distributionDetailRes) {
              distributionDetail = distributionDetailRes;
            }

            if (distributionDetail) {
              const detailNormalized = normalizeDistribution(distributionDetail);

              if (
                (!tokenIds || tokenIds.length === 0) &&
                Array.isArray(detailNormalized.tokenIds)
              ) {
                tokenIds = detailNormalized.tokenIds;
                console.log(
                  "✅ [handleSelectDistribution] Found tokenIds from distribution detail API:",
                  tokenIds
                );
              }

              enrichedDistribution = {
                ...enrichedDistribution,
                ...detailNormalized,
                drugId: enrichedDistribution.drugId || detailNormalized.drugId,
              };
            }
          } catch (distributionError) {
            console.error("❌ [handleSelectDistribution] Lỗi khi gọi distribution detail API:", distributionError);
          }
        }

        if (tokenIds.length === 0) {
          console.warn("⚠️ [handleSelectDistribution] Không tìm thấy invoiceId hoặc distributionId để gọi API");
        }
      }

      const distributionWithTokens = {
        ...enrichedDistribution,
        drugId: resolveDrugId(enrichedDistribution),
        tokenIds,
        distributedQuantity:
          enrichedDistribution.distributedQuantity ??
          (Array.isArray(tokenIds) ? tokenIds.length : undefined),
      };

      console.log("📦 [handleSelectDistribution] Final distribution with drugId:", {
        id: distributionWithTokens._id,
        drugId: distributionWithTokens.drugId,
        tokenIds: distributionWithTokens.tokenIds,
        quantity: distributionWithTokens.distributedQuantity,
      });

      setSelectedDistribution(distributionWithTokens);
      setFormData({
        pharmacyId: "",
        quantity: distributionWithTokens.distributedQuantity
          ? distributionWithTokens.distributedQuantity.toString()
          : "",
        notes: "",
      });

      if (tokenIds.length === 0) {
        console.warn(
          "⚠️ Không tìm thấy tokenIds trong distribution:",
          dist._id
        );
        toast.warning(
          "Không tìm thấy NFT tokens cho lô hàng này. Vui lòng kiểm tra lại hoặc liên hệ quản trị viên.",
          {
            position: "top-right",
            duration: 5000,
          }
        );
      }

      if (!distributionWithTokens.drugId) {
        console.warn(
          "⚠️ Không tìm thấy drugId trong distribution:",
          dist._id
        );
        toast.warning(
          "Không tìm thấy thông tin thuốc. Vui lòng kiểm tra lại hoặc liên hệ quản trị viên.",
          {
            position: "top-right",
            duration: 5000,
          }
        );
      }

      setShowDialog(true);
    } catch (error) {
      console.error("❌ [handleSelectDistribution] Lỗi:", error);
      
      // ✅ IMPROVED: Error message rõ ràng hơn
      const errorMessage = error.response?.data?.message || error.message || "Lỗi không xác định";
      toast.error(`Lỗi khi tải thông tin distribution: ${errorMessage}`, {
        position: "top-right",
        duration: 5000,
      });
      
      setSelectedDistribution({
        ...enrichedDistribution,
        tokenIds,
      });
      setFormData({
        pharmacyId: "",
        quantity: enrichedDistribution.distributedQuantity
          ? enrichedDistribution.distributedQuantity.toString()
          : "",
        notes: "",
      });
      setShowDialog(true);
    } finally {
      setDialogLoading(false);
    }
  };

  const handleSubmit = async () => {
    // ✅ VALIDATION: Kiểm tra form data
    if (!formData.pharmacyId) {
      toast.error("Vui lòng chọn nhà thuốc", {
        position: "top-right",
        duration: 4000,
      });
      return;
    }

    const tokenIds = selectedDistribution.tokenIds || [];

    if (tokenIds.length === 0) {
      toast.error(
        "Không tìm thấy NFT tokens. Vui lòng chọn lô hàng khác hoặc liên hệ quản trị viên.",
        {
          position: "top-right",
          duration: 5000,
        }
      );
      return;
    }

    // ✅ VALIDATE TOKENIDS: Không rỗng, không trùng lặp
    const tokenIdsValidation = validateTokenIds(tokenIds);
    if (!tokenIdsValidation.valid) {
      toast.error(tokenIdsValidation.error, {
        position: "top-right",
        duration: 5000,
      });
      if (tokenIdsValidation.duplicates) {
        console.error("Duplicate tokenIds:", tokenIdsValidation.duplicates);
      }
      return;
    }

    const validatedTokenIds = tokenIdsValidation.tokenIds;

    // ✅ VALIDATE QUANTITY: Nếu có quantity, phải bằng tokenIds.length
    const requestedQty = formData.quantity ? parseInt(formData.quantity) : validatedTokenIds.length;
    const quantityValidation = validateQuantity(requestedQty, validatedTokenIds.length);
    if (!quantityValidation.valid) {
      toast.error(quantityValidation.error, {
        position: "top-right",
        duration: 5000,
      });
      return;
    }

    // ✅ VALIDATE QUANTITY RANGE: Không được vượt quá số lượng có sẵn
    if (
      isNaN(requestedQty) ||
      requestedQty <= 0 ||
      requestedQty > selectedDistribution.distributedQuantity
    ) {
      toast.error(
        `Số lượng không hợp lệ. Vui lòng nhập từ 1 đến ${selectedDistribution.distributedQuantity}`,
        {
          position: "top-right",
          duration: 4000,
        }
      );
      return;
    }

    const selectedTokenIds = validatedTokenIds.slice(0, requestedQty);

    if (selectedTokenIds.length < requestedQty) {
      const confirmMessage =
        `Chỉ có ${selectedTokenIds.length} NFT khả dụng trong khi bạn yêu cầu ${requestedQty}.\n\n` +
        `Bạn có muốn tiếp tục với ${selectedTokenIds.length} NFT không?`;

      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    const amounts = selectedTokenIds.map(() => 1);

    if (submitLoading) {
      return;
    }

    setSubmitLoading(true);

    // Lưu invoiceId để sử dụng trong error handling
    let invoiceId = null;

    try {
      // ✅ STEP 1: Kiểm tra và kết nối ví MetaMask
      console.log("🔐 [handleSubmit] Đang kiểm tra kết nối ví...");
      
      let currentAccount = await getCurrentAccount();
      
      if (!currentAccount) {
        console.log("🔐 [handleSubmit] Chưa kết nối ví, đang yêu cầu kết nối...");
        toast.info("Vui lòng kết nối ví MetaMask để tiếp tục", {
          position: "top-right",
          duration: 3000,
        });
        
        try {
          const walletConnection = await connectWallet();
          
          if (!walletConnection.success || !walletConnection.account) {
            throw new Error("Không thể kết nối ví MetaMask");
          }
          
          currentAccount = walletConnection.account;
          console.log("✅ [handleSubmit] Đã kết nối ví:", currentAccount);
          
          toast.success("Đã kết nối ví thành công!", {
            position: "top-right",
            duration: 2000,
          });
        } catch (walletError) {
          console.error("❌ [handleSubmit] Lỗi khi kết nối ví:", walletError);
          
          let errorMessage = "Không thể kết nối ví MetaMask";
          
          if (walletError.code === 4001) {
            errorMessage = "Bạn đã từ chối kết nối ví";
          } else if (walletError.message) {
            errorMessage = walletError.message;
          }
          
          toast.error(errorMessage, {
            position: "top-right",
            duration: 5000,
          });
          
          setSubmitLoading(false);
          return;
        }
      } else {
        console.log("✅ [handleSubmit] Ví đã được kết nối:", currentAccount);
      }

      // ✅ STEP 2: Kiểm tra balance NFT trên blockchain
      console.log("📊 [handleSubmit] Đang kiểm tra balance NFT...");
      
      let balanceCheck;
      try {
        balanceCheck = await checkDistributorNFTBalances(selectedTokenIds);
      } catch (balanceError) {
        console.error("❌ [handleSubmit] Lỗi khi kiểm tra balance:", balanceError);
        
        // ✅ IMPROVED: Xử lý các loại lỗi khác nhau
        if (balanceError.message?.includes("Contract not deployed")) {
          toast.warning(
            "Smart contract chưa được deploy. Vui lòng liên hệ quản trị viên.",
            {
              position: "top-right",
              duration: 5000,
            }
          );
          setSubmitLoading(false);
          return;
        } else if (balanceError.message?.includes("MetaMask")) {
          toast.warning(
            "Không thể kết nối với MetaMask. Vui lòng kiểm tra lại ví của bạn.",
            {
              position: "top-right",
              duration: 5000,
            }
          );
          setSubmitLoading(false);
          return;
        } else {
          // Cho phép tiếp tục trong các trường hợp lỗi khác (với cảnh báo)
          toast.warning(
            `Không thể kiểm tra balance: ${balanceError.message}. Tiếp tục với rủi ro.`,
            {
              position: "top-right",
              duration: 5000,
            }
          );
          balanceCheck = { canTransfer: true }; // Giả định có thể transfer
        }
      }

      if (balanceCheck && !balanceCheck.canTransfer) {
        const issuesList = balanceCheck.issues
          .filter((issue) => issue.tokenId)
          .map(
            (issue) =>
              `Token #${issue.tokenId}: có ${issue.balance}, cần ${issue.needed}`
          )
          .join("\n• ");

        toast.error(
          `Không đủ NFT để chuyển giao!\n\n• ${issuesList}\n\nNguyên nhân: NFT chưa được transfer từ Manufacturer. Vui lòng yêu cầu Manufacturer thực hiện transfer trước.`,
          {
            position: "top-right",
            duration: 8000,
          }
        );
        setSubmitLoading(false);
        return;
      }

      const resolvedDrugId = resolveDrugId(selectedDistribution);

      if (!resolvedDrugId) {
        toast.error(
          "Không tìm thấy thông tin thuốc (drugId). Vui lòng chọn lô hàng khác.",
          {
            position: "top-right",
            duration: 5000,
          }
        );
        setSubmitLoading(false);
        return;
      }

      const payload = {
        pharmacyId: formData.pharmacyId,
        drugId: resolvedDrugId,
        tokenIds: selectedTokenIds,
        quantity: selectedTokenIds.length,
        notes: formData.notes || undefined,
      };

      const selectedPharmacy = pharmacies.find(
        (p) => p._id === formData.pharmacyId
      );

      const pharmacyAddress =
        selectedPharmacy?.walletAddress ||
        selectedPharmacy?.address ||
        selectedPharmacy?.user?.walletAddress;

      if (!pharmacyAddress) {
        toast.error(
          "Nhà thuốc chưa cấu hình địa chỉ ví. Vui lòng kiểm tra lại.",
          {
            position: "top-right",
            duration: 5000,
          }
        );
        setSubmitLoading(false);
        return;
      }

      const transferAmounts = selectedTokenIds.map(() => 1);

      // Hiển thị UI blockchain progress
      setShowDialog(false);
      setShowChainView(true);
      setChainStatus("minting");
      setChainProgress(0.08);

      if (chainIntervalRef.current) {
        clearInterval(chainIntervalRef.current);
      }

      chainIntervalRef.current = setInterval(() => {
        setChainProgress((prev) =>
          prev < 0.9 ? Math.min(prev + 0.02, 0.9) : prev
        );
      }, 120);

      let transferResult;

      try {
        console.log("🔗 [handleSubmit] Đang chuẩn bị contract trên blockchain...");

        try {
          console.log("📝 [handleSubmit] Đang kiểm tra và setup contract với pharmacy...");
          
          // Thử tạo contract trước (nếu chưa có)
          try {
            console.log("📝 [handleSubmit] Đang tạo contract với pharmacy (nếu chưa có)...");
            toast.info("Đang tạo contract với pharmacy...", {
              position: "top-right",
              duration: 2000,
            });

            await createDistributorPharmacyContract(pharmacyAddress);
            console.log("✅ [handleSubmit] Contract đã được tạo");
            
            toast.success("Contract đã được tạo!", {
              position: "top-right",
              duration: 2000,
            });

            // Đợi một chút để transaction được confirm
            await new Promise((resolve) => setTimeout(resolve, 2000));
          } catch (createError) {
            // Nếu contract đã tồn tại, không sao, tiếp tục
            if (createError.message?.includes("already exists") || 
                createError.message?.includes("đã tồn tại")) {
              console.log("ℹ️ [handleSubmit] Contract đã tồn tại, tiếp tục...");
            } else {
              console.warn("⚠️ [handleSubmit] Lỗi khi tạo contract (có thể đã tồn tại):", createError.message);
            }
          }

          // Thử finalize contract
          try {
            console.log("📝 [handleSubmit] Đang finalize contract với pharmacy...");
            toast.info("Đang finalize contract với pharmacy...", {
              position: "top-right",
              duration: 3000,
            });

            const finalizeResult = await finalizeDistributorPharmacyContract(pharmacyAddress);
            
            console.log("✅ [handleSubmit] Contract đã được finalize:", {
              transactionHash: finalizeResult.transactionHash,
              blockNumber: finalizeResult.blockNumber,
            });

            toast.success("Contract đã được finalize!", {
              position: "top-right",
              duration: 2000,
            });

            // Đợi một chút để transaction được confirm
            await new Promise((resolve) => setTimeout(resolve, 2000));
          } catch (finalizeError) {
            // Nếu pharmacy chưa approve, hiển thị thông báo rõ ràng và dừng lại
            if (finalizeError.message?.includes("Pharmacy has not approved") || 
                finalizeError.message?.includes("chưa approve")) {
              console.error("❌ [handleSubmit] Pharmacy chưa approve contract:", finalizeError);
              
              const pharmacyName = selectedPharmacy?.name || "N/A";
              
              toast.error(
                `⚠️ Pharmacy chưa approve contract!\n\n` +
                `📋 Flow contract đúng:\n` +
                `1. Distributor tạo contract request (đã hoàn thành)\n` +
                `2. Pharmacy approve contract (⚠️ ĐANG THIẾU)\n` +
                `3. Distributor finalize contract\n` +
                `4. Transfer NFT\n\n` +
                `Thông tin:\n` +
                `- Pharmacy: ${pharmacyName}\n` +
                `- Pharmacy Address: ${pharmacyAddress}\n\n` +
                `Giải pháp:\n` +
                `1. Yêu cầu pharmacy đăng nhập và approve contract:\n` +
                `   → Vào trang "Quản lý Contract"\n` +
                `   → Tìm contract với bạn\n` +
                `   → Click "Xác nhận & Ký"\n` +
                `2. Sau khi pharmacy approve, thử lại transfer NFT\n` +
                `3. Hoặc liên hệ backend team để tự động approve contract`,
                {
                  position: "top-right",
                  duration: 20000,
                }
              );
              
              setChainStatus("error");
              setChainProgress(0.3);
              setSubmitLoading(false);
              return; // Dừng lại, không tiếp tục transfer NFT
            }
            
            // Nếu contract đã được finalize rồi, tiếp tục
            if (finalizeError.message?.includes("already finalized") || 
                finalizeError.message?.includes("đã được finalize")) {
              console.log("ℹ️ [handleSubmit] Contract đã được finalize, tiếp tục...");
            } else {
              console.warn("⚠️ [handleSubmit] Lỗi khi finalize contract:", finalizeError.message);
              // Vẫn tiếp tục thử transfer NFT, có thể contract đã được finalize trước đó
            }
          }
        } catch (contractError) {
          console.error("❌ [handleSubmit] Lỗi khi setup contract:", contractError);
          // Vẫn tiếp tục thử transfer NFT
        }

        // ✅ STEP 4.2: Transfer NFT trên blockchain
        toast.info("Vui lòng xác nhận giao dịch trong MetaMask...", {
          position: "top-right",
          duration: 4000,
        });

        transferResult = await distributorTransferToPharmacyOnChain(
          selectedTokenIds,
          transferAmounts,
          pharmacyAddress
        );

        console.log("✅ [handleSubmit] Smart contract thành công:", {
          transactionHash: transferResult.transactionHash,
          blockNumber: transferResult.blockNumber,
        });

        if (chainIntervalRef.current) {
          clearInterval(chainIntervalRef.current);
        }

        setChainProgress(1);
        setChainStatus("completed");

      } catch (transferError) {
        console.error("❌ [handleSubmit] Lỗi khi chuyển NFT:", transferError);
        
        if (chainIntervalRef.current) {
          clearInterval(chainIntervalRef.current);
        }
        
        setChainStatus("error");
        setChainProgress((prev) => (prev < 0.3 ? 0.3 : prev));
        
        // ✅ IMPROVED: Xử lý các loại lỗi blockchain khác nhau
        let errorMessage = "Lỗi không xác định";
        let duration = 6000;
        
        if (transferError.code === 4001) {
          errorMessage = "Bạn đã từ chối giao dịch trong MetaMask";
        } else if (transferError.message?.includes("insufficient funds")) {
          errorMessage = "Không đủ gas fee để thực hiện giao dịch";
        } else if (transferError.message?.includes("nonce")) {
          errorMessage = "Lỗi nonce. Vui lòng reset MetaMask và thử lại";
        } else if (transferError.message?.includes("Receiver is not a Pharmacy") || 
                   transferError.message?.includes("chưa được đăng ký")) {
          // Lỗi pharmacy chưa được đăng ký - hiển thị thông báo dài hơn
          errorMessage = transferError.message;
          duration = 10000; // Hiển thị lâu hơn để user đọc được
        } else if (transferError.message?.includes("not finalized") || 
                   transferError.message?.includes("not signed") ||
                   transferError.message?.includes("finalized/signed") ||
                   transferError.message?.includes("Contract is not finalized")) {
          // Lỗi contract chưa được finalize/sign trên blockchain
          // Smart contract yêu cầu contract giữa distributor và pharmacy phải được finalize trước
          const selectedPharmacy = pharmacies.find(p => p._id === formData.pharmacyId);
          const pharmacyName = selectedPharmacy?.name || "N/A";
          
          errorMessage = 
            `⚠️ Contract chưa được finalize trên blockchain!\n\n` +
            `Smart contract yêu cầu contract giữa distributor và pharmacy phải được finalize trên blockchain trước khi transfer NFT.\n\n` +
            `Thông tin:\n` +
            `- Pharmacy: ${pharmacyName}\n` +
            `- Invoice ID: ${invoiceId || "N/A"}\n\n` +
            `Nguyên nhân:\n` +
            `- Chưa có contract giữa distributor và pharmacy này\n` +
            `- Hoặc contract đã tồn tại nhưng chưa được finalize trên blockchain\n\n` +
            `Giải pháp:\n` +
            `1. Tạo contract giữa distributor và pharmacy (nếu chưa có)\n` +
            `   → Vào trang "Quản lý Contract" → Tạo contract mới với pharmacy này\n` +
            `2. Finalize contract trên blockchain\n` +
            `   → Vào trang "Quản lý Contract" → Chọn contract → Finalize\n` +
            `3. Sau khi contract đã được finalize, thử lại transfer NFT\n\n` +
            `Hoặc liên hệ backend team để:\n` +
            `- Tự động tạo và finalize contract khi tạo invoice\n` +
            `- Hoặc finalize contract hiện có\n\n` +
            `Lỗi chi tiết: ${transferError.message}`;
          duration = 20000; // Hiển thị lâu hơn để user đọc được
        } else if (transferError.message) {
          errorMessage = transferError.message;
        }
        
        toast.error(`Lỗi blockchain: ${errorMessage}`, {
          position: "top-right",
          duration: duration,
        });
        setSubmitLoading(false);
        return;
      }

      toast.success("NFT đã được chuyển trên blockchain!", {
        position: "top-right",
        duration: 3000,
      });

      // ✅ STEP 5: Lưu dữ liệu vào backend sau khi blockchain thành công
      toast.info("Đang lưu dữ liệu chuyển giao...", {
        position: "top-right",
        duration: 2000,
      });

      let response;
      try {
        response = await transferToPharmacyMutation({
          ...payload,
          blockchainTxHash: transferResult.transactionHash,
          blockchainEvent: transferResult.event,
        });
      } catch (error) {
        const errorMessage =
          error?.response?.data?.message || error?.message || "Không thể lưu dữ liệu";
        toast.error(errorMessage, {
          position: "top-right",
          duration: 6000,
        });
        setChainStatus("error");
        setSubmitLoading(false);
        return;
      }

      let responseBody = response;
      if (response?.data && typeof response.data === "object") {
        responseBody = response.data;
      }
      if (responseBody?.success === false) {
        throw new Error(responseBody?.message || "Không thể tạo invoice");
      }

      const responseData = responseBody?.data ?? responseBody;
      const commercialInvoice =
        responseData?.commercialInvoice ??
        responseData?.invoice ??
        responseData;

      invoiceId = commercialInvoice?._id ?? commercialInvoice?.invoiceId;

      try {
        const transactionHash = transferResult.transactionHash;
        const hashValidation = validateTransactionHash(transactionHash);
        if (!hashValidation.valid) {
          throw new Error(hashValidation.error);
        }

        const saveResponse = await saveTransferTransaction({
          invoiceId,
          transactionHash,
          tokenIds: selectedTokenIds,
        });

        const saveBody = saveResponse?.data ?? saveResponse;
        if (!saveBody?.success) {
          throw new Error(saveBody?.message || "Lỗi khi lưu transaction hash");
        }

        toast.success("Chuyển giao NFT hoàn tất!", {
          position: "top-right",
          duration: 5000,
        });

        await new Promise((r) => setTimeout(r, 1000));
        setShowChainView(false);
        setShowDialog(false);
        setFormData({
          pharmacyId: "",
          quantity: "",
          notes: "",
        });
        await loadData(true);
      } catch (saveError) {
        console.error("❌ [handleSubmit] Lỗi khi lưu transaction hash:", saveError);
        toast.error(saveError.message, {
          position: "top-right",
          duration: 6000,
        });
        setChainStatus("error");
      }
    } catch (error) {
      console.error("❌ [handleSubmit] Lỗi tổng thể:", error);
      
      // ✅ IMPROVED: Error handling tốt hơn
      let errorMessage = "Lỗi không xác định";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(`Lỗi: ${errorMessage}`, {
        position: "top-right",
        duration: 5000,
      });
    } finally {
      setSubmitLoading(false);
      if (chainIntervalRef.current) {
        clearInterval(chainIntervalRef.current);
      }
    }
  };

  return {
    distributions,
    pharmacies,
    loading,
    loadingProgress,
    showDialog,
    setShowDialog,
    selectedDistribution,
    formData,
    setFormData,
    dialogLoading,
    setDialogLoading,
    showChainView,
    setShowChainView,
    chainStatus,
    setChainStatus,
    chainProgress,
    setChainProgress,
    submitLoading,
    setSubmitLoading,
    handleSelectDistribution,
    handleSubmit,
  };
};