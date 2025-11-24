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
  const transferProgressIntervalRef = useRef(null); // FIX: Track transfer progress interval

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

  useEffect(() => {
    if (productions.length > 0 && import.meta.env.DEV) {
      console.log("📋 Productions loaded:", {
        count: productions.length,
        sample: productions[0]
          ? {
              _id: productions[0]._id,
              id: productions[0].id,
              batchNumber: productions[0].batchNumber,
              quantity: productions[0].quantity,
              allKeys: Object.keys(productions[0]),
            }
          : null,
      });
    }
  }, [productions]);

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
  const [loadingTokens, setLoadingTokens] = useState(false); // FIX: Separate loading state

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

  useEffect(() => {
    return () => {
      // FIX: Cleanup all intervals
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (transferProgressIntervalRef.current) {
        clearInterval(transferProgressIntervalRef.current);
      }
    };
  }, []);

  // FIX: Use separate loading state to not hide dialog
  const handleSelectProduction = async (production) => {
    // Validate production object and _id
    if (!production) {
      console.error("Production object is null or undefined");
      toast.error("Lỗi: Không tìm thấy thông tin sản xuất", {
        position: "top-right",
      });
      return;
    }

    const productionId = production._id || production.id;
    if (!productionId) {
      console.error("Production ID is missing:", production);
      toast.error("Lỗi: Không tìm thấy ID sản xuất", {
        position: "top-right",
      });
      return;
    }

    setSelectedProduction(production);
    setFormData({
      productionId: productionId,
      distributorId: "",
      quantity: production.quantity?.toString() || "",
      notes: "",
    });

    setShowDialog(true); // Show dialog first
    setLoadingTokens(true); // Use separate loading state

    try {
      const response = await api.get(
        `/production/${productionId}/available-tokens`
      );
      const res = response.data;
      const ids =
        res?.data?.data?.availableTokenIds ||
        res?.data?.availableTokenIds ||
        [];
      setAvailableTokenIds(Array.isArray(ids) ? ids : []);
    } catch (e) {
      console.error("Không thể tải token khả dụng:", e);
      toast.error("Không thể tải danh sách token khả dụng", {
        position: "top-right",
      });
      setAvailableTokenIds([]);
    } finally {
      setLoadingTokens(false);
    }
  };

  // FIX: Prevent double submission + validate quantity properly
  const handleSubmit = async () => {
    if (buttonAnimating) {
      return;
    } // Already processing

    if (!formData.distributorId || !formData.quantity) {
      toast.error("Vui lòng chọn nhà phân phối và nhập số lượng", {
        position: "top-right",
      });
      return;
    }

    // Convert to number and validate
    const requestedQty = Number(formData.quantity);
    const availableCount = availableTokenIds?.length || 0;

    // FIX: Proper quantity validation with better type handling
    if (
      isNaN(requestedQty) ||
      !Number.isInteger(requestedQty) ||
      requestedQty <= 0
    ) {
      toast.error("Số lượng phải là số nguyên dương", {
        position: "top-right",
      });
      return;
    }

    // Check against available token IDs first (this is the actual limit)
    if (availableCount === 0) {
      toast.error("Không có token khả dụng để chuyển", {
        position: "top-right",
      });
      return;
    }

    if (requestedQty > availableCount) {
      toast.error(
        `Số lượng không hợp lệ: Chỉ có ${availableCount} token khả dụng, nhưng bạn nhập ${requestedQty}`,
        { position: "top-right" }
      );
      return;
    }

    const tokenIds = (availableTokenIds || []).slice(0, requestedQty);

    if (tokenIds.length !== requestedQty) {
      toast.error(
        `Lỗi: Không thể lấy đủ ${requestedQty} token (chỉ lấy được ${tokenIds.length})`,
        { position: "top-right" }
      );
      return;
    }

    setButtonAnimating(true);
    setButtonDone(false);
    setShowBlockchainView(false);

    try {
      const response = await createTransferMutation.mutateAsync({
        productionId: selectedProduction._id,
        distributorId: formData.distributorId,
        tokenIds,
        amounts: tokenIds.map(() => 1),
        notes: formData.notes || "",
      });

      if (response.success) {
        const { invoice, distributorAddress } = response.data || {};

        if (invoice && distributorAddress) {
          setShowBlockchainView(true);
          handleBlockchainTransfer(invoice, distributorAddress, tokenIds);
        } else {
          setButtonAnimating(false);
          toast.success("Tạo yêu cầu chuyển giao thành công!", {
            position: "top-right",
          });
          setShowDialog(false);
          setAvailableTokenIds([]);
          refetchProductions();
        }
      }
    } catch (error) {
      console.error("Lỗi khi tạo chuyển giao:", error);
      toast.error(
        "Không thể tạo chuyển giao: " +
          (error.response?.data?.message || error.message),
        { position: "top-right" }
      );
      setButtonAnimating(false);
      setShowBlockchainView(false);
    }
  };

  // FIX: Cleanup interval properly + handle close dialog
  const handleBlockchainTransfer = async (
    invoice,
    distributorAddress,
    tokenIds
  ) => {
    setTransferProgress(0);
    setTransferStatus("minting");

    // Clear old interval if exists
    if (transferProgressIntervalRef.current) {
      clearInterval(transferProgressIntervalRef.current);
    }

    try {
      setTransferProgress(0.1);
      const currentWallet = await getCurrentWalletAddress();

      if (
        user?.walletAddress &&
        currentWallet.toLowerCase() !== user.walletAddress.toLowerCase()
      ) {
        toast.error(
          "Ví đang kết nối không khớp với ví của manufacturer. Vui lòng chuyển sang: " +
            user.walletAddress,
          { position: "top-right" }
        );
        throw new Error("Wrong wallet connected");
      }

      setTransferProgress(0.2);
      const transferPromise = transferNFTToDistributor(
        tokenIds,
        distributorAddress
      );

      setTimeout(() => setTransferProgress((prev) => Math.max(prev, 0.3)), 500);

      // Simulate progress
      transferProgressIntervalRef.current = setInterval(() => {
        setTransferProgress((prev) =>
          prev < 0.9 ? Math.min(prev + 0.005, 0.9) : prev
        );
      }, 50);

      const onchain = await transferPromise;

      if (transferProgressIntervalRef.current) {
        clearInterval(transferProgressIntervalRef.current);
        transferProgressIntervalRef.current = null;
      }

      setTransferProgress(0.9);

      await saveTransferTransactionMutation.mutateAsync({
        invoiceId: invoice._id,
        transactionHash: onchain.transactionHash,
        tokenIds,
      });

      setTransferProgress(1);
      setTransferStatus("completed");
      setButtonDone(true);
      setButtonAnimating(false);

      // Thông báo thành công khi hoàn tất on-chain + lưu DB
      toast.success("Chuyển giao NFT thành công!", {
        position: "top-right",
      });

      setTimeout(() => {
        setButtonDone(false);
        setShowBlockchainView(false);
        setShowDialog(false);
        setAvailableTokenIds([]);
        setTransferProgress(0);
        setTransferStatus("minting");
        // FIX: Reset form data
        setFormData({
          productionId: "",
          distributorId: "",
          quantity: "",
          notes: "",
        });
        setSelectedProduction(null);
        refetchProductions();
      }, 2000);
    } catch (e) {
      // FIX: Always cleanup interval
      if (transferProgressIntervalRef.current) {
        clearInterval(transferProgressIntervalRef.current);
        transferProgressIntervalRef.current = null;
      }

      console.error("Lỗi blockchain transfer:", e);
      setTransferStatus("error");
      setTransferProgress(0);
      setButtonAnimating(false);
      setButtonDone(false);
    }
  };

  // FIX: Handle close dialog button - cleanup all state
  const handleCloseDialog = () => {
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
    // FIX: Clear interval if still running
    if (transferProgressIntervalRef.current) {
      clearInterval(transferProgressIntervalRef.current);
      transferProgressIntervalRef.current = null;
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Chưa có";
    }
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
    productionsLoading,
    productionsError,
    refetchProductions,
    distributors,
    distributorsLoading,
    distributorsError,
    createTransferMutation,
    saveTransferTransactionMutation,
    loading,
    showDialog,
    setShowDialog,
    selectedProduction,
    setSelectedProduction,
    availableTokenIds,
    setAvailableTokenIds,
    loadingTokens,
    setLoadingTokens,
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
    handleBlockchainTransfer,
    handleCloseDialog,
    formatDate,
    safeDistributors,
    selectedDistributor,
  };
};
