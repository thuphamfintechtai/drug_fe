/* eslint-disable no-undef */
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../shared/context/AuthContext";
import { manufacturerAPIs } from "../apis/manufacturerAPIs";
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
  } = manufacturerAPIs.getProductionHistory({ status: "minted" });

  const {
    data: distributorsData,
    isLoading: distributorsLoading,
    error: distributorsError,
  } = manufacturerAPIs.getDistributors({ page: 1, limit: 100 });

  const createTransferMutation = manufacturerAPIs.createTransferToDistributor();
  const saveTransferTransactionMutation =
    manufacturerAPIs.saveTransferTransaction();

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
    setSelectedProduction(production);
    setFormData({
      productionId: production._id,
      distributorId: "",
      quantity: production.quantity.toString(),
      notes: "",
    });

    setShowDialog(true); // Show dialog first
    setLoadingTokens(true); // Use separate loading state

    try {
      const res = await manufacturerAPIs.getAvailableTokensForProduction(
        production._id
      );
      const ids =
        res?.data?.data?.availableTokenIds ||
        res?.data?.availableTokenIds ||
        [];
      setAvailableTokenIds(Array.isArray(ids) ? ids : []);
    } catch (e) {
      console.error("Không thể tải token khả dụng:", e);
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

    const requestedQty = parseInt(formData.quantity);

    // FIX: Proper quantity validation
    if (
      isNaN(requestedQty) ||
      requestedQty <= 0 ||
      requestedQty > selectedProduction.quantity
    ) {
      toast.error("Số lượng không hợp lệ", { position: "top-right" });
      return;
    }

    const tokenIds = (availableTokenIds || []).slice(0, requestedQty);

    if (tokenIds.length === 0) {
      toast.error("Không tìm thấy tokenId phù hợp để chuyển.", {
        position: "top-right",
      });
      return;
    }

    // FIX: Check if token count matches requested quantity
    if (tokenIds.length < requestedQty) {
      toast.error(
        `Chỉ có ${tokenIds.length} token khả dụng, nhưng bạn yêu cầu ${requestedQty}`,
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
