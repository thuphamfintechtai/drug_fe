import { useState, useMemo } from "react";
import { useConfirmContract, usePharmacyContractDetail } from "../../distributor/apis/contract";
import { signMessageWithMetaMask, pharmacyConfirmContractOnChain } from "../../utils/web3Helper";
import { toast } from "sonner";
import { usePharmacyContracts } from "./useContracts";

export const useContractsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const {
    loading,
    loadingProgress,
    filteredContracts,
    searchText,
    setSearchText,
    fetchData,
  } = usePharmacyContracts();

  const { mutateAsync: confirmContract } = useConfirmContract();

  // Fetch contract detail when detail dialog opens
  const { data: contractDetailResponse, isLoading: loadingDetail } = 
    usePharmacyContractDetail(showDetailDialog ? selectedContract?.id : null);

  // Fetch contract detail for confirm dialog
  const { data: confirmContractDetailResponse, isLoading: loadingConfirmDetail } = 
    usePharmacyContractDetail(showConfirmDialog ? selectedContract?.id : null);

  // Support different possible response shapes from backend
  const contractDetail = useMemo(() => {
    return (
      contractDetailResponse?.data?.data || 
      contractDetailResponse?.data || 
      contractDetailResponse || 
      selectedContract
    );
  }, [contractDetailResponse, selectedContract]);

  // Contract detail for confirm dialog
  const confirmContractDetail = useMemo(() => {
    return (
      confirmContractDetailResponse?.data?.data || 
      confirmContractDetailResponse?.data || 
      confirmContractDetailResponse || 
      selectedContract
    );
  }, [confirmContractDetailResponse, selectedContract]);

  // Pagination
  const pagination = useMemo(() => {
    const totalItems = filteredContracts.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedContracts = filteredContracts.slice(startIndex, endIndex);

    return {
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      paginatedContracts,
    };
  }, [filteredContracts, currentPage, pageSize]);

  const handleSearch = (searchValue = null) => {
    const term = (searchValue !== null ? searchValue : searchText)
      .trim()
      .toLowerCase();
    setSearchText(term);
  };

  const handleClearSearch = () => {
    setSearchText("");
  };

  const handleConfirmContract = async () => {
    if (!selectedContract) return;

    try {
      setIsConfirming(true);

      // Step 1: Get MetaMask signature
      const signature = await signMessageWithMetaMask(
        "Xác nhận hợp đồng với nhà phân phối"
      );

      if (!signature || !signature.signature) {
        throw new Error("Không thể lấy chữ ký từ MetaMask");
      }

      const distributorAddress =
        selectedContract.distributorAddress ||
        selectedContract.distributor?.walletAddress;

      if (!distributorAddress) {
        throw new Error(
          "Không tìm thấy địa chỉ ví của nhà phân phối trong hợp đồng"
        );
      }

      // Step 2: Confirm on-chain
      const blockchainResult = await pharmacyConfirmContractOnChain(
        distributorAddress
      );

      // Step 3: Confirm contract via backend
      await confirmContract({
        contractId: selectedContract.id,
        distributorAddress,
        pharmacySignature: signature.signature,
        pharmacyAddress: signature.address,
        signedMessage: signature.message,
        blockchainTxHash: blockchainResult.transactionHash,
        blockchainEvent: blockchainResult.event,
      });

      toast.success("Xác nhận hợp đồng thành công!");
      setShowConfirmDialog(false);
      setSelectedContract(null);
      fetchData();
    } catch (error) {
      console.error("Error confirming contract:", error);
      toast.error(error.message || "Lỗi khi xác nhận hợp đồng");
    } finally {
      setIsConfirming(false);
    }
  };

  const openDetailDialog = (contract) => {
    setSelectedContract(contract);
    setShowDetailDialog(true);
  };

  const closeDetailDialog = () => {
    setShowDetailDialog(false);
  };

  const openConfirmDialog = (contract) => {
    setSelectedContract(contract);
    setShowConfirmDialog(true);
  };

  const closeConfirmDialog = () => {
    if (!isConfirming) {
      setShowConfirmDialog(false);
    }
  };

  const handleRowClick = (contract) => {
    setSelectedContract(contract);
    setShowDetailDialog(true);
  };

  const handleConfirmFromDetail = () => {
    setShowDetailDialog(false);
    setShowConfirmDialog(true);
  };

  return {
    // State
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    selectedContract,
    showDetailDialog,
    showConfirmDialog,
    isConfirming,

    // Data
    loading,
    loadingProgress,
    filteredContracts,
    searchText,
    contractDetail,
    confirmContractDetail,
    loadingDetail,
    loadingConfirmDetail,

    // Pagination
    ...pagination,

    // Handlers
    handleSearch,
    handleClearSearch,
    handleConfirmContract,
    openDetailDialog,
    closeDetailDialog,
    openConfirmDialog,
    closeConfirmDialog,
    handleRowClick,
    handleConfirmFromDetail,
    setSearchText,
  };
};

