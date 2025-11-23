/* eslint-disable no-undef */
import { useState, useEffect, useRef } from "react";
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

export const useTransferManagements = () => {
  const { user } = useAuth();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const transferProgressIntervalRef = useRef(null);
  const isMountedRef = useRef(true);

  // React Query hooks
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

  const productions = productionsData?.success
    ? productionsData.data?.productions || productionsData.data || []
    : [];

  const distributors = distributorsData?.success
    ? Array.isArray(distributorsData.data?.distributors)
      ? distributorsData.data.distributors
      : Array.isArray(distributorsData.data)
      ? distributorsData.data
      : []
    : [];

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

  // Comprehensive cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (transferProgressIntervalRef.current) {
        clearInterval(transferProgressIntervalRef.current);
        transferProgressIntervalRef.current = null;
      }
    };
  }, []);

  // Safe setState helper to prevent memory leaks
  const safeSetState = (setter) => {
    return (...args) => {
      if (isMountedRef.current) {
        setter(...args);
      }
    };
  };

  // FIX: Enhanced token extraction with detailed logging
  const extractTokenIds = (response) => {
    console.log("🔍 [extractTokenIds] Full response structure:", {
      response,
      type: typeof response,
      isArray: Array.isArray(response),
      keys: response ? Object.keys(response) : [],
    });

    // If response is already an array of token IDs
    if (Array.isArray(response)) {
      console.log("✅ [extractTokenIds] Response is array:", response);
      return response;
    }

    const paths = [
      ['data', 'data', 'availableTokenIds'],
      ['data', 'availableTokenIds'],
      ['data', 'data', 'tokens'],
      ['data', 'tokens'],
      ['data', 'tokenIds'],
      ['data', 'data', 'tokenIds'],
      ['availableTokenIds'],
      ['tokens'],
      ['tokenIds'],
      ['data', 'data'], // Array case
      ['data'], // Direct array in data
    ];
    
    for (const path of paths) {
      let value = response;
      let pathString = '';
      
      for (const key of path) {
        pathString += (pathString ? '.' : '') + key;
        value = value?.[key];
        
        if (value === undefined) {
          console.log(`⚠️ [extractTokenIds] Path ${pathString} not found`);
          break;
        }
      }
      
      if (Array.isArray(value)) {
        if (value.length > 0) {
          console.log(`✅ [extractTokenIds] Found tokenIds at: ${pathString}`, {
            count: value.length,
            sample: value.slice(0, 3),
          });
          return value;
        } else {
          console.log(`⚠️ [extractTokenIds] Found empty array at: ${pathString}`);
        }
      }
    }
    
    console.warn("❌ [extractTokenIds] No valid tokenIds array found", {
      response,
      checkedPaths: paths.map(p => p.join('.')),
    });
    
    return [];
  };

  // FIX: Completely rewritten handleSelectProduction
  const handleSelectProduction = async (production) => {
    console.group("🎯 [handleSelectProduction] START");
    console.log("Input production:", {
      _id: production?._id,
      id: production?.id,
      batchNumber: production?.batchNumber,
      quantity: production?.quantity,
      hasTokenIds: !!production?.tokenIds,
      tokenIdsType: typeof production?.tokenIds,
      tokenIdsIsArray: Array.isArray(production?.tokenIds),
      tokenIdsLength: production?.tokenIds?.length,
      tokenIds: production?.tokenIds,
      fullProduction: production,
    });

    // Validate production
    if (!production) {
      console.error("❌ [handleSelectProduction] No production provided");
      toast.error("Lỗi: Không có thông tin lô sản xuất", {
        position: "top-right",
      });
      console.groupEnd();
      return;
    }

    const productionId = production._id || production.id;
    if (!productionId) {
      console.error("❌ [handleSelectProduction] No valid ID:", production);
      toast.error("Lỗi: Lô sản xuất không có ID hợp lệ", {
        position: "top-right",
      });
      console.groupEnd();
      return;
    }

    // Reset and initialize states
    console.log("📝 [handleSelectProduction] Initializing states...");
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

    // Check if production already has valid tokenIds
    const hasValidTokenIds = 
      production.tokenIds && 
      Array.isArray(production.tokenIds) && 
      production.tokenIds.length > 0;

    console.log("🔍 [handleSelectProduction] Checking production.tokenIds:", {
      exists: !!production.tokenIds,
      isArray: Array.isArray(production.tokenIds),
      length: production.tokenIds?.length,
      hasValidTokenIds,
      tokenIds: production.tokenIds,
    });

    if (hasValidTokenIds) {
      console.log("✅ [handleSelectProduction] Using tokenIds from production:", {
        count: production.tokenIds.length,
        tokenIds: production.tokenIds,
      });
      
      if (isMountedRef.current) {
        setAvailableTokenIds(production.tokenIds);
        setFormData(prev => ({
          ...prev,
          quantity: production.tokenIds.length.toString(),
        }));
        setLoadingTokens(false);
        
        toast.success(`Tìm thấy ${production.tokenIds.length} NFT khả dụng từ production data`, {
          position: "top-right",
          duration: 2000,
        });
      }
      
      console.groupEnd();
      return;
    }

    // Fetch available tokens from API
    console.log("🌐 [handleSelectProduction] Fetching from API...");
    
    try {
      let response = null;
      let res = null;
      let successEndpoint = null;
      
      // Try multiple possible endpoints
      const endpoints = [
        `/api/manufacturer/production/${productionId}/available-tokens`,
        `/api/production/${productionId}/available-tokens`,
        `/manufacturer/production/${productionId}/available-tokens`,
        `/production/${productionId}/available-tokens`,
        `/api/productions/${productionId}/available-tokens`,
        `/productions/${productionId}/available-tokens`,
      ];

      console.log("🔄 [handleSelectProduction] Trying endpoints:", endpoints);

      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 [handleSelectProduction] Attempting: ${endpoint}`);
          
          const apiResponse = await api.get(endpoint);
          
          console.log(`✅ [handleSelectProduction] Success with ${endpoint}:`, {
            status: apiResponse.status,
            data: apiResponse.data,
          });
          
          response = apiResponse;
          res = apiResponse.data;
          successEndpoint = endpoint;
          break;
          
        } catch (err) {
          console.log(`❌ [handleSelectProduction] Failed ${endpoint}:`, {
            status: err.response?.status,
            message: err.message,
          });
          continue;
        }
      }

      if (!response || !res) {
        throw new Error("All API endpoints failed - no valid response received");
      }

      console.log("✅ [handleSelectProduction] API call successful:", {
        endpoint: successEndpoint,
        status: response.status,
        responseData: res,
      });

      if (!isMountedRef.current) {
        console.log("⚠️ [handleSelectProduction] Component unmounted, aborting");
        console.groupEnd();
        return;
      }

      // Extract token IDs
      const tokenIdsArray = extractTokenIds(res);
      
      console.log("📊 [handleSelectProduction] Token analysis:", {
        totalProductionQuantity: production.quantity,
        extractedTokensCount: tokenIdsArray.length,
        extractedTokens: tokenIdsArray,
        transferredCount: production.quantity - tokenIdsArray.length,
      });

      if (!isMountedRef.current) {
        console.log("⚠️ [handleSelectProduction] Component unmounted, aborting");
        console.groupEnd();
        return;
      }

      setAvailableTokenIds(tokenIdsArray);

      if (tokenIdsArray.length > 0) {
        setFormData(prev => ({
          ...prev,
          quantity: tokenIdsArray.length.toString(),
        }));
        
        toast.success(`Tìm thấy ${tokenIdsArray.length} NFT khả dụng từ API`, {
          position: "top-right",
          duration: 2000,
        });
      } else {
        toast.warning("Không còn token khả dụng để chuyển", {
          position: "top-right",
          duration: 3000,
        });
      }

      console.log("✅ [handleSelectProduction] Successfully set token IDs");
      
    } catch (error) {
      console.error("❌ [handleSelectProduction] API error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
      });

      if (!isMountedRef.current) {
        console.log("⚠️ [handleSelectProduction] Component unmounted, aborting error handling");
        console.groupEnd();
        return;
      }

      // Fallback: Try to use tokenIds from production object
      if (production.tokenIds && Array.isArray(production.tokenIds) && production.tokenIds.length > 0) {
        console.log("⚠️ [handleSelectProduction] Using fallback tokenIds from production");
        
        setAvailableTokenIds(production.tokenIds);
        setFormData(prev => ({
          ...prev,
          quantity: production.tokenIds.length.toString(),
        }));
        
        toast.info(`Sử dụng ${production.tokenIds.length} NFT từ dữ liệu production (fallback)`, {
          position: "top-right",
          duration: 3000,
        });
      } else {
        console.error("❌ [handleSelectProduction] No fallback available");
        
        setAvailableTokenIds([]);
        
        const errorMsg = error.response?.data?.message || error.message || "Lỗi không xác định";
        toast.error(`Không thể tải danh sách token: ${errorMsg}`, {
          position: "top-right",
          duration: 5000,
        });
      }
      
    } finally {
      if (isMountedRef.current) {
        setLoadingTokens(false);
        console.log("✅ [handleSelectProduction] Loading complete");
      }
      console.groupEnd();
    }
  };

  // Improved validation
  const handleSubmit = async () => {
    console.group("🚀 [handleSubmit] START");
    
    if (buttonAnimating) {
      console.log("⚠️ [handleSubmit] Already processing, ignoring");
      console.groupEnd();
      return;
    }

    console.log("📝 [handleSubmit] Form data:", formData);
    console.log("📝 [handleSubmit] Available tokens:", {
      count: availableTokenIds.length,
      tokens: availableTokenIds,
    });

    if (!formData.distributorId || !formData.quantity) {
      toast.error("Vui lòng chọn nhà phân phối và nhập số lượng", {
        position: "top-right",
      });
      console.groupEnd();
      return;
    }

    const requestedQty = parseInt(formData.quantity);

    if (isNaN(requestedQty) || requestedQty <= 0) {
      toast.error("Số lượng phải là số nguyên dương", { position: "top-right" });
      console.groupEnd();
      return;
    }

    if (availableTokenIds.length === 0) {
      toast.error("Không có token khả dụng để chuyển", { position: "top-right" });
      console.groupEnd();
      return;
    }

    if (requestedQty > availableTokenIds.length) {
      toast.error(
        `Chỉ có ${availableTokenIds.length} token khả dụng. Vui lòng nhập số lượng từ 1 đến ${availableTokenIds.length}`,
        { position: "top-right", duration: 4000 }
      );
      console.groupEnd();
      return;
    }

    const tokenIds = availableTokenIds.slice(0, requestedQty);
    
    console.log("✅ [handleSubmit] Validation passed:", {
      requestedQty,
      tokenIdsToTransfer: tokenIds,
    });

    setButtonAnimating(true);
    setButtonDone(false);
    setShowBlockchainView(false);

    try {
      console.log("🌐 [handleSubmit] Creating transfer...");
      
      const response = await createTransferMutation.mutateAsync({
        productionId: selectedProduction._id,
        distributorId: formData.distributorId,
        tokenIds,
        amounts: tokenIds.map(() => 1),
        notes: formData.notes || "",
      });

      console.log("✅ [handleSubmit] Transfer created:", response);

      if (!isMountedRef.current) {
        console.log("⚠️ [handleSubmit] Component unmounted");
        console.groupEnd();
        return;
      }

      if (response.success) {
        const { invoice, distributorAddress } = response.data || {};

        if (invoice && distributorAddress) {
          console.log("🔗 [handleSubmit] Starting blockchain transfer...");
          setShowBlockchainView(true);
          handleBlockchainTransfer(invoice, distributorAddress, tokenIds);
        } else {
          console.log("✅ [handleSubmit] Transfer created (no blockchain)");
          setButtonAnimating(false);
          toast.success("Tạo yêu cầu chuyển giao thành công!", {
            position: "top-right",
          });
          handleCloseDialog();
          refetchProductions();
        }
      }
      
    } catch (error) {
      console.error("❌ [handleSubmit] Error:", error);

      if (!isMountedRef.current) {
        console.groupEnd();
        return;
      }

      const errorMessage = error.response?.data?.message || error.message || "Lỗi không xác định";
      toast.error("Không thể tạo chuyển giao: " + errorMessage, {
        position: "top-right",
        duration: 5000,
      });

      setButtonAnimating(false);
      setShowBlockchainView(false);
    }
    
    console.groupEnd();
  };

  const handleBlockchainTransfer = async (
    invoice,
    distributorAddress,
    tokenIds
  ) => {
    console.group("⛓️ [handleBlockchainTransfer] START");
    
    setTransferProgress(0);
    setTransferStatus("minting");

    if (transferProgressIntervalRef.current) {
      clearInterval(transferProgressIntervalRef.current);
      transferProgressIntervalRef.current = null;
    }

    try {
      if (!isMountedRef.current) {
        console.groupEnd();
        return;
      }

      setTransferProgress(0.1);
      const currentWallet = await getCurrentWalletAddress();

      console.log("🔍 [handleBlockchainTransfer] Wallet check:", {
        currentWallet,
        userWallet: user?.walletAddress,
        match: currentWallet.toLowerCase() === user?.walletAddress?.toLowerCase(),
      });

      if (
        user?.walletAddress &&
        currentWallet.toLowerCase() !== user.walletAddress.toLowerCase()
      ) {
        toast.error(
          `Ví hiện tại (${currentWallet.slice(0,6)}...${currentWallet.slice(-4)}) không khớp với ví manufacturer (${user.walletAddress.slice(0,6)}...${user.walletAddress.slice(-4)})`,
          { position: "top-right", duration: 6000 }
        );
        throw new Error("Wrong wallet connected");
      }

      if (!isMountedRef.current) {
        console.groupEnd();
        return;
      }

      setTransferProgress(0.2);
      setTransferStatus("transferring");

      console.log("🚀 [handleBlockchainTransfer] Starting NFT transfer:", {
        tokenIds,
        distributorAddress,
      });

      const transferPromise = transferNFTToDistributor(
        tokenIds,
        distributorAddress
      );

      transferProgressIntervalRef.current = setInterval(() => {
        if (!isMountedRef.current) return;
        setTransferProgress((prev) =>
          prev < 0.8 ? Math.min(prev + 0.01, 0.8) : prev
        );
      }, 100);

      const onchain = await transferPromise;

      console.log("✅ [handleBlockchainTransfer] NFT transferred:", onchain);

      if (!isMountedRef.current) {
        console.groupEnd();
        return;
      }

      if (transferProgressIntervalRef.current) {
        clearInterval(transferProgressIntervalRef.current);
        transferProgressIntervalRef.current = null;
      }

      setTransferProgress(0.85);
      setTransferStatus("saving");

      console.log("💾 [handleBlockchainTransfer] Saving transaction...");

      await saveTransferTransactionMutation.mutateAsync({
        invoiceId: invoice._id,
        transactionHash: onchain.transactionHash,
        tokenIds,
      });

      if (!isMountedRef.current) {
        console.groupEnd();
        return;
      }

      setTransferProgress(1);
      setTransferStatus("completed");
      setButtonDone(true);
      setButtonAnimating(false);

      console.log("✅ [handleBlockchainTransfer] SUCCESS");

      toast.success(
        `Chuyển giao ${tokenIds.length} NFT thành công! TxHash: ${onchain.transactionHash.slice(0,10)}...`,
        { position: "top-right", duration: 5000 }
      );

      setTimeout(() => {
        if (!isMountedRef.current) return;
        handleCloseDialog();
        refetchProductions();
      }, 2000);

    } catch (error) {
      console.error("❌ [handleBlockchainTransfer] Error:", error);

      if (transferProgressIntervalRef.current) {
        clearInterval(transferProgressIntervalRef.current);
        transferProgressIntervalRef.current = null;
      }

      if (!isMountedRef.current) {
        console.groupEnd();
        return;
      }

      setTransferStatus("error");
      setTransferProgress(0);
      setButtonAnimating(false);
      setButtonDone(false);

      let errorMessage = "Có lỗi xảy ra khi chuyển NFT";

      if (error.code === 4001) {
        errorMessage = "Bạn đã từ chối giao dịch trong MetaMask";
      } else if (error.message?.includes("insufficient funds")) {
        errorMessage = "Không đủ gas fee để thực hiện giao dịch";
      } else if (error.message?.includes("Wrong wallet")) {
        errorMessage = "Vui lòng kết nối đúng ví manufacturer";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        position: "top-right",
        duration: 6000,
      });
    }
    
    console.groupEnd();
  };

  const handleCloseDialog = () => {
    console.log("🔒 [handleCloseDialog] Closing and resetting...");
    
    if (transferProgressIntervalRef.current) {
      clearInterval(transferProgressIntervalRef.current);
      transferProgressIntervalRef.current = null;
    }

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
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Chưa có";
    const date = new Date(dateValue);
    return isNaN(date.getTime())
      ? "Không hợp lệ"
      : date.toLocaleDateString("vi-VN");
  };

  const safeDistributors = Array.isArray(distributors) ? distributors : [];
  const selectedDistributor = safeDistributors.find(
    (d) => d._id === formData.distributorId
  );

  return {
    productions,
    loading,
    loadingProgress,
    showDialog,
    selectedProduction,
    availableTokenIds,
    loadingTokens,
    buttonAnimating,
    setButtonAnimating,
    buttonDone,
    setButtonDone,
    showBlockchainView,
    setShowBlockchainView,
    transferProgress,
    setTransferProgress,
    transferStatus,
    setTransferStatus,
    formData,
    setFormData,
    handleSelectProduction,
    handleSubmit,
    handleCloseDialog,
    formatDate,
    safeDistributors,
    selectedDistributor,
  };
};