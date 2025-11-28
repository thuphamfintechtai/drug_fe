/* eslint-disable no-undef */
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useAuth } from "../../shared/context/AuthContext";
import {
  useManufacturerProductionHistory,
  useManufacturerDistributors,
  useCreateTransferToDistributor,
  useSaveTransferTransaction,
} from "../apis/manufacturerAPIs";
import api from "../../utils/api";
import { toast } from "sonner";
import {
  transferNFTToDistributor,
  getCurrentWalletAddress,
} from "../../utils/web3Helper";

// ============================================
// CONSTANTS
// ============================================
const MAX_PROGRESS_BEFORE_COMPLETION = 0.95; // Increase to show "saving" progress
const PROGRESS_INCREMENT = 0.01;
const PROGRESS_INTERVAL_MS = 100;
const REQUEST_TIMEOUT_MS = 30000;
const AUTO_SAVE_RETRY_ATTEMPTS = 3;
const AUTO_SAVE_RETRY_DELAY_MS = 2000;

const TOKEN_ENDPOINTS = [
  `/production/{id}/available-tokens`,
  `/manufacturer/production/{id}/available-tokens`,
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

const isValidMongoId = (value) =>
  typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value);

const isValidTxHash = (value) =>
  typeof value === "string" &&
  /^0x[a-fA-F0-9]{64}$/.test((value || "").trim());

const sanitizeInput = (input) => {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .replace(/[<>]/g, "")
    .slice(0, 500);
};

const extractTokenIds = (responseObj) => {
  if (!responseObj) return [];

  const extractionPaths = [
    () => responseObj.tokenIds,
    () => responseObj.data?.tokenIds,
    () => responseObj.availableTokens,
    () => responseObj.data?.availableTokens,
    () => responseObj.tokens,
    () => responseObj.data?.tokens,
  ];

  for (const extractor of extractionPaths) {
    try {
      const value = extractor();
      if (!value) continue;

      if (Array.isArray(value)) {
        const tokenIds = value
          .map((item) => {
            if (typeof item === "string") return item;
            return String(item.tokenId || item._id || item.id || "");
          })
          .filter(Boolean);

        if (tokenIds.length > 0) {
          return tokenIds;
        }
      }
    } catch (e) {
      continue;
    }
  }

  return [];
};

const formatDate = (dateValue) => {
  if (!dateValue) return "Chưa có";
  const date = new Date(dateValue);
  return isNaN(date.getTime())
    ? "Không hợp lệ"
    : date.toLocaleDateString("vi-VN");
};

const normalizeProduction = (prod) => {
  const id = prod._id || prod.id;
  const drugId = prod.drugId || prod.drug?._id || prod.drug?.id;
  const batchNumber =
    prod.batchNumber ||
    prod.proofOfProduction?.batchNumber ||
    prod.drug?.batchNumber ||
    "";

  return {
    ...prod,
    id,
    drugId,
    batchNumber,
    mfgDate: prod.mfgDate || prod.manufacturingDate,
    expDate: prod.expDate || prod.expiryDate,
  };
};

const getStatusInfo = (status) => {
  const normalizedStatus = (status || "").toLowerCase();

  switch (normalizedStatus) {
    case "distributed":
    case "transferred":
      return {
        label: "Đã chuyển",
        className: "bg-green-100 text-green-700 border-green-200",
        canTransfer: false,
        buttonText: "Đã chuyển",
      };
    case "completed":
    case "minted":
      return {
        label: "Chưa chuyển",
        className: "bg-yellow-100 text-yellow-700 border-yellow-200",
        canTransfer: true,
        buttonText: "Chuyển giao",
      };
    case "pending":
    case "processing":
      return {
        label: "Đang chờ",
        className: "bg-gray-100 text-gray-700 border-gray-200",
        canTransfer: false,
        buttonText: "Đang chờ mint",
      };
    case "failed":
    case "error":
      return {
        label: "Thất bại",
        className: "bg-red-100 text-red-700 border-red-200",
        canTransfer: false,
        buttonText: "Mint thất bại",
      };
    default:
      return {
        label: "Không xác định",
        className: "bg-gray-100 text-gray-500 border-gray-200",
        canTransfer: false,
        buttonText: "Chưa sẵn sàng",
      };
  }
};

// ============================================
// MAIN HOOK - AUTO SAVE VERSION
// ============================================

export const useTransferManagements = () => {
  const { user } = useAuth();

  const transferProgressIntervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);
  const savedTransactionHashesRef = useRef(new Set()); // Track saved transaction hashes
  const isSavingRef = useRef(false); // Track if currently saving to prevent duplicate calls

  const {
    data: productionsData,
    isLoading: productionsLoading,
    error: productionsError,
    refetch: refetchProductions,
  } = useManufacturerProductionHistory({ status: "minted" });

  const {
    data: distributorsData,
    isLoading: distributorsLoading,
    error: distributorsError,
  } = useManufacturerDistributors({ page: 1, limit: 100 });

  const createTransferMutation = useCreateTransferToDistributor();
  const saveTransferTransactionMutation = useSaveTransferTransaction();

  const loading = productionsLoading || distributorsLoading;

  const productions = useMemo(() => {
    if (!productionsData?.success) return [];
    const rawProductions = Array.isArray(productionsData.data)
      ? productionsData.data
      : productionsData.data?.productions || [];
    return rawProductions.map(normalizeProduction);
  }, [productionsData]);

  const distributors = useMemo(() => {
    if (!distributorsData?.success) return [];
    return Array.isArray(distributorsData.data?.distributors)
      ? distributorsData.data.distributors
      : Array.isArray(distributorsData.data)
      ? distributorsData.data
      : [];
  }, [distributorsData]);

  const [showDialog, setShowDialog] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [availableTokenIds, setAvailableTokenIds] = useState([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [buttonAnimating, setButtonAnimating] = useState(false);
  const [buttonDone, setButtonDone] = useState(false);
  const [showBlockchainView, setShowBlockchainView] = useState(false);
  const [transferProgress, setTransferProgress] = useState(0);
  const [transferStatus, setTransferStatus] = useState("minting");

  const [formData, setFormData] = useState({
    productionId: "",
    distributorId: "",
    quantity: "",
    notes: "",
  });

  const selectedDistributor = useMemo(() => {
    if (!formData.distributorId || distributors.length === 0) return null;
    return distributors.find(
      (d) => d._id === formData.distributorId || d.id === formData.distributorId
    );
  }, [distributors, formData.distributorId]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (transferProgressIntervalRef.current) {
        clearInterval(transferProgressIntervalRef.current);
        transferProgressIntervalRef.current = null;
      }
    };
  }, []);

  const handleSelectProduction = useCallback(async (production) => {
    if (!production) {
      toast.error("Lỗi: Không có thông tin lô sản xuất", {
        position: "top-right",
      });
      return;
    }

    const productionId = production.id;
    if (!productionId) {
      toast.error("Lỗi: Lô sản xuất không có ID hợp lệ", {
        position: "top-right",
      });
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setSelectedProduction(production);
    setFormData({
      productionId: productionId,
      distributorId: "",
      quantity: "",
      notes: "",
    });
    setAvailableTokenIds([]);
    setLoadingTokens(true);
    setShowDialog(true);

    const hasValidTokenIds =
      production.tokenIds &&
      Array.isArray(production.tokenIds) &&
      production.tokenIds.length > 0;

    if (hasValidTokenIds) {
      if (isMountedRef.current) {
        setAvailableTokenIds(production.tokenIds);
        setFormData((prev) => ({
          ...prev,
          quantity: production.tokenIds.length.toString(),
        }));
        setLoadingTokens(false);
        toast.success(`Tìm thấy ${production.tokenIds.length} NFT khả dụng`, {
          position: "top-right",
          duration: 2000,
        });
      }
      return;
    }

    try {
      let response = null;
      let tokenIds = [];

      for (const endpointTemplate of TOKEN_ENDPOINTS) {
        const endpoint = endpointTemplate.replace("{id}", productionId);
        try {
          const apiResponse = await Promise.race([
            api.get(endpoint, {
              signal: abortControllerRef.current.signal,
            }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Timeout")), REQUEST_TIMEOUT_MS)
            ),
          ]);

          response = apiResponse;
          tokenIds = extractTokenIds(apiResponse.data);
          if (tokenIds.length > 0) break;
        } catch (err) {
          if (err.name === "AbortError" || err.message === "Timeout") {
            throw err;
          }
          continue;
        }
      }

      if (!isMountedRef.current) return;

      if (!response) {
        throw new Error("Tất cả API endpoints đều thất bại");
      }

      setAvailableTokenIds(tokenIds);

      if (tokenIds.length > 0) {
        setFormData((prev) => ({
          ...prev,
          quantity: tokenIds.length.toString(),
        }));
        toast.success(`Tìm thấy ${tokenIds.length} NFT khả dụng`, {
          position: "top-right",
          duration: 2000,
        });
      } else {
        toast.warning("Không còn token khả dụng để chuyển", {
          position: "top-right",
          duration: 3000,
        });
      }
    } catch (error) {
      if (!isMountedRef.current) return;
      if (error.name === "AbortError") return;

      if (
        production.tokenIds &&
        Array.isArray(production.tokenIds) &&
        production.tokenIds.length > 0
      ) {
        setAvailableTokenIds(production.tokenIds);
        setFormData((prev) => ({
          ...prev,
          quantity: production.tokenIds.length.toString(),
        }));
        toast.info(
          `Sử dụng ${production.tokenIds.length} NFT từ dữ liệu production`,
          { position: "top-right", duration: 3000 }
        );
      } else {
        setAvailableTokenIds([]);
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "Lỗi không xác định";
        toast.error(`Không thể tải danh sách token: ${errorMsg}`, {
          position: "top-right",
          duration: 5000,
        });
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingTokens(false);
      }
    }
  }, []);

  const handleBlockchainTransfer = useCallback(
    async (invoiceId, distributorAddress, tokenIds) => {
      setTransferProgress(0.2);
      setTransferStatus("preparing");

      if (transferProgressIntervalRef.current) {
        clearInterval(transferProgressIntervalRef.current);
        transferProgressIntervalRef.current = null;
      }

      try {
        if (!isMountedRef.current) return null;

        setTransferProgress(0.3);
        const currentWallet = await getCurrentWalletAddress();

        if (!user?.walletAddress) {
          throw new Error(
            "Không tìm thấy địa chỉ ví của manufacturer trong hệ thống"
          );
        }

        if (currentWallet.toLowerCase() !== user.walletAddress.toLowerCase()) {
          toast.error(
            `Ví hiện tại (${currentWallet.slice(
              0,
              6
            )}...${currentWallet.slice(
              -4
            )}) không khớp với ví manufacturer (${user.walletAddress.slice(
              0,
              6
            )}...${user.walletAddress.slice(-4)})`,
            { position: "top-right", duration: 6000 }
          );
          throw new Error("Wrong wallet connected");
        }

        if (!isMountedRef.current) return null;

        setTransferProgress(0.4);
        setTransferStatus("transferring");

        transferProgressIntervalRef.current = setInterval(() => {
          if (!isMountedRef.current) {
            if (transferProgressIntervalRef.current) {
              clearInterval(transferProgressIntervalRef.current);
              transferProgressIntervalRef.current = null;
            }
            return;
          }
          setTransferProgress((prev) =>
            prev < MAX_PROGRESS_BEFORE_COMPLETION
              ? Math.min(prev + PROGRESS_INCREMENT, MAX_PROGRESS_BEFORE_COMPLETION)
              : prev
          );
        }, PROGRESS_INTERVAL_MS);

        const onchain = await transferNFTToDistributor(
          tokenIds,
          distributorAddress
        );

        if (!isMountedRef.current) return null;

        if (!onchain || !onchain.transactionHash) {
          throw new Error(
            "Transaction failed: No transaction hash returned from blockchain"
          );
        }

        if (onchain.status === 0 || onchain.status === false) {
          throw new Error(
            "Transaction reverted on blockchain. Please check your wallet and try again."
          );
        }

        if (transferProgressIntervalRef.current) {
          clearInterval(transferProgressIntervalRef.current);
          transferProgressIntervalRef.current = null;
        }

        setTransferProgress(MAX_PROGRESS_BEFORE_COMPLETION);
        setTransferStatus("completed");

        return onchain.transactionHash;
      } catch (error) {
        console.error("❌ Blockchain transfer error:", error);

        if (transferProgressIntervalRef.current) {
          clearInterval(transferProgressIntervalRef.current);
          transferProgressIntervalRef.current = null;
        }

        if (!isMountedRef.current) return null;

        setTransferStatus("error");
        setTransferProgress(0);
        setShowBlockchainView(false);
        setButtonAnimating(false);
        setButtonDone(false);

        let errorMessage = "Có lỗi xảy ra khi chuyển NFT";

        if (error.code === 4001) {
          errorMessage = "Bạn đã từ chối giao dịch trong MetaMask";
        } else if (error.message?.includes("insufficient funds")) {
          errorMessage = "Không đủ gas fee để thực hiện giao dịch";
        } else if (error.message?.includes("Wrong wallet")) {
          errorMessage = "Vui lòng kết nối đúng ví manufacturer";
        } else if (error.message?.includes("reverted")) {
          errorMessage =
            "Giao dịch bị revert trên blockchain. Vui lòng kiểm tra lại.";
        } else if (error.message) {
          errorMessage = error.message;
        }

        toast.error(errorMessage, {
          position: "top-right",
          duration: 6000,
        });

        throw error;
      }
    },
    [user?.walletAddress]
  );

  // 🆕 AUTO SAVE: Save transaction with retry logic
  const autoSaveTransaction = useCallback(
    async (invoiceId, tokenIds, transactionHash) => {
      // Check if already saving to prevent duplicate calls
      if (isSavingRef.current) {
        console.log("⚠️ [autoSaveTransaction] Already saving, skipping duplicate call");
        return true; // Already in progress, return success
      }

      // Check if this transaction hash has already been saved
      const normalizedHash = transactionHash.trim().toLowerCase();
      if (savedTransactionHashesRef.current.has(normalizedHash)) {
        console.log("⚠️ [autoSaveTransaction] Transaction hash already saved, skipping:", normalizedHash);
        return true; // Already saved, return success
      }

      // Mark as saving
      isSavingRef.current = true;

      console.log("💾 [autoSaveTransaction] Starting auto-save...", {
        invoiceId,
        tokenIds,
        transactionHash,
      });

      setTransferStatus("saving");

      for (let attempt = 1; attempt <= AUTO_SAVE_RETRY_ATTEMPTS; attempt++) {
        try {
          console.log(`💾 [autoSaveTransaction] Attempt ${attempt}/${AUTO_SAVE_RETRY_ATTEMPTS}`);

          await saveTransferTransactionMutation.mutateAsync({
            invoiceId,
            tokenIds,
            transactionHash: transactionHash.trim(),
          });

          console.log("✅ [autoSaveTransaction] Save successful!");

          // Mark this transaction hash as saved to prevent duplicate calls
          savedTransactionHashesRef.current.add(normalizedHash);

          // Reset saving flag
          isSavingRef.current = false;

          // Success - update progress to 100%
          setTransferProgress(1);
          setTransferStatus("completed");

          toast.success(
            "Chuyển giao thành công! Invoice đã được lưu và cập nhật.",
            {
              position: "top-right",
              duration: 4000,
            }
          );

          // Auto close dialog after short delay
          setTimeout(() => {
            if (isMountedRef.current) {
              handleCloseDialog();
              refetchProductions();
            }
          }, 2000);

          return true; // Success
        } catch (error) {
          console.error(
            `❌ [autoSaveTransaction] Attempt ${attempt} failed:`,
            error
          );

          if (attempt < AUTO_SAVE_RETRY_ATTEMPTS) {
            // Retry after delay
            console.log(
              `⏳ [autoSaveTransaction] Retrying in ${AUTO_SAVE_RETRY_DELAY_MS}ms...`
            );
            await new Promise((resolve) =>
              setTimeout(resolve, AUTO_SAVE_RETRY_DELAY_MS)
            );
          } else {
            // All attempts failed
            console.error("❌ [autoSaveTransaction] All retry attempts failed");

            // Reset saving flag
            isSavingRef.current = false;

            setTransferStatus("error");

            const errorMsg =
              error?.response?.data?.message ||
              error?.message ||
              "Lỗi không xác định";

            toast.error(
              `Blockchain đã chuyển NFT thành công, nhưng không thể lưu vào hệ thống: ${errorMsg}\n\n` +
                `Transaction Hash: ${transactionHash}\n\n` +
                `Vui lòng liên hệ support hoặc thử lại sau.`,
              {
                position: "top-center",
                duration: 10000,
                style: { maxWidth: "600px" },
              }
            );

            return false; // Failed
          }
        }
      }

      // Reset saving flag if we exit the loop without success
      isSavingRef.current = false;
      return false;
    },
    [saveTransferTransactionMutation, refetchProductions]
  );

  // 🆕 UPDATED: handleSubmit with auto-save
  const handleSubmit = useCallback(async () => {
    if (buttonAnimating) return;

    if (!formData.distributorId) {
      toast.error("Vui lòng chọn nhà phân phối", {
        position: "top-right",
      });
      return;
    }

    const tokenIds = (availableTokenIds || []).map((id) => String(id));
    if (tokenIds.length === 0) {
      toast.error("Không có token khả dụng để chuyển", {
        position: "top-right",
      });
      return;
    }

    const distributorAddress =
      selectedDistributor?.walletAddress ||
      selectedDistributor?.user?.walletAddress;

    if (!distributorAddress) {
      toast.error("Lỗi: Nhà phân phối không có địa chỉ ví", {
        position: "top-right",
        duration: 5000,
      });
      return;
    }

    const drugId = selectedProduction?.drugId;
    const batchNumber = selectedProduction?.batchNumber;

    if (!drugId || !batchNumber) {
      toast.error("Thiếu thông tin thuốc hoặc batch number", {
        position: "top-right",
      });
      return;
    }

    setButtonAnimating(true);
    setButtonDone(false);
    setShowBlockchainView(true);
    setTransferProgress(0.05);
    setTransferStatus("issuing");

    try {
      const sanitizedNotes = sanitizeInput(formData.notes);

      const issuePayload = {
        distributorId: formData.distributorId,
        drugId,
        tokenIds,
        notes: sanitizedNotes,
        batchNumber,
      };

      console.log("📄 [handleSubmit] Issuing invoice...");

      const issueResponse = await createTransferMutation.mutateAsync(
        issuePayload
      );

      const invoiceCandidate =
        issueResponse?.data?.invoice ||
        issueResponse?.data?.transfer ||
        issueResponse?.invoice ||
        issueResponse?.transfer ||
        issueResponse?.data ||
        issueResponse;

      const invoiceId =
        invoiceCandidate?._id ||
        invoiceCandidate?.id ||
        invoiceCandidate?.invoiceId ||
        issueResponse?.invoiceId ||
        issueResponse?.data?.invoiceId;

      if (!invoiceId || !isValidMongoId(invoiceId)) {
        throw new Error("API không trả về invoiceId hợp lệ");
      }

      const invoiceTokenIds = Array.isArray(invoiceCandidate?.tokenIds)
        ? invoiceCandidate.tokenIds.map((id) => String(id))
        : tokenIds;

      console.log("✅ [handleSubmit] Invoice issued:", invoiceId);

      // Transfer on blockchain
      console.log("⛓️ [handleSubmit] Starting blockchain transfer...");

      const onchainHash = await handleBlockchainTransfer(
        invoiceId,
        distributorAddress,
        invoiceTokenIds
      );

      if (!onchainHash || !isValidTxHash(onchainHash)) {
        throw new Error(
          "Transaction hash không hợp lệ hoặc không nhận được từ blockchain"
        );
      }

      console.log("✅ [handleSubmit] Blockchain transfer complete:", onchainHash);

      // 🆕 AUTO SAVE: Automatically save transaction
      console.log("💾 [handleSubmit] Starting auto-save...");

      const saveSuccess = await autoSaveTransaction(
        invoiceId,
        invoiceTokenIds,
        onchainHash
      );

      if (!saveSuccess) {
        // Save failed but blockchain succeeded
        // User needs to contact support with transaction hash
        console.warn(
          "⚠️ [handleSubmit] Auto-save failed but blockchain succeeded"
        );
        
        setButtonAnimating(false);
        setShowBlockchainView(false);
      } else {
        // Complete success
        console.log("✅ [handleSubmit] Complete success!");
        setButtonDone(true);
      }
    } catch (error) {
      console.error("❌ [handleSubmit] Error:", error);

      if (!isMountedRef.current) return;

      // Reset saving flag on error
      isSavingRef.current = false;

      const errorMessage =
        error.response?.data?.message || error.message || "Lỗi không xác định";
      toast.error("Không thể chuyển giao: " + errorMessage, {
        position: "top-right",
        duration: 5000,
      });

      setButtonAnimating(false);
      setShowBlockchainView(false);
      setTransferProgress(0);
      setTransferStatus("error");
    }
  }, [
    buttonAnimating,
    formData,
    availableTokenIds,
    selectedDistributor,
    selectedProduction,
    createTransferMutation,
    handleBlockchainTransfer,
    autoSaveTransaction,
  ]);

  const handleCloseDialog = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (transferProgressIntervalRef.current) {
      clearInterval(transferProgressIntervalRef.current);
      transferProgressIntervalRef.current = null;
    }

    // Reset saving flag when closing dialog
    isSavingRef.current = false;

    setShowDialog(false);
    setShowBlockchainView(false);
    setSelectedProduction(null);
    setFormData({
      productionId: "",
      distributorId: "",
      quantity: "",
      notes: "",
    });
    setAvailableTokenIds([]);
    setTransferProgress(0);
    setTransferStatus("minting");
    setButtonAnimating(false);
    setButtonDone(false);
    setLoadingTokens(false);
  }, []);

  return {
    productions,
    loading,
    distributors,
    selectedDistributor,
    showDialog,
    selectedProduction,
    availableTokenIds,
    loadingTokens,
    buttonAnimating,
    buttonDone,
    showBlockchainView,
    transferProgress,
    transferStatus,
    formData,
    setFormData,
    handleSelectProduction,
    handleSubmit,
    handleCloseDialog,
    formatDate,
    getStatusInfo,
    setButtonAnimating,
    setButtonDone,
    setShowBlockchainView,
    setTransferProgress,
    setTransferStatus,
  };
};