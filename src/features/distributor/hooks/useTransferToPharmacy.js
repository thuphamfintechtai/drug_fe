/* eslint-disable no-undef */
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { distributorQueries } from "../apis/distributor";

export const useTransferToPharmacy = () => {
  const queryClient = useQueryClient();
  const TRANSFER_CACHE_KEY = ["distributor", "transfer-to-pharmacy"];
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

  const { mutateAsync: fetchDistributionHistory } =
    distributorQueries.getDistributionHistory();
  const { mutateAsync: fetchPharmacies } = distributorQueries.getPharmacies();
  const { mutateAsync: transferToPharmacyMutation } =
    distributorQueries.transferToPharmacy();
  const { mutateAsync: saveTransferTransaction } =
    distributorQueries.saveTransferTransaction();
  const { mutateAsync: fetchInvoiceDetail } =
    distributorQueries.getInvoiceDetail();

  useEffect(() => {
    const cached = queryClient.getQueryData(TRANSFER_CACHE_KEY);
    if (cached) {
      setDistributions(cached.distributions || []);
      setPharmacies(cached.pharmacies || []);
      setLoading(false);
      setLoadingProgress(0);
    }
    loadData(!cached);
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

      const [distRes, pharmRes] = await Promise.all([
        fetchDistributionHistory({ status: "confirmed" }),
        fetchPharmacies(),
      ]);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      let nextDistributions = [];
      if (distRes.data.success) {
        nextDistributions = distRes.data.data.distributions || [];
        setDistributions(nextDistributions);
      }

      let nextPharmacies = [];
      if (pharmRes.data.success && pharmRes.data.data) {
        nextPharmacies = Array.isArray(pharmRes.data.data.pharmacies)
          ? pharmRes.data.data.pharmacies
          : [];
        setPharmacies(nextPharmacies);
      } else {
        setPharmacies([]);
      }

      queryClient.setQueryData(TRANSFER_CACHE_KEY, {
        distributions: nextDistributions,
        pharmacies: nextPharmacies,
      });

      setLoadingProgress(1);
      await new Promise((r) => setTimeout(r, 300));
    } catch (error) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      console.error("Lỗi khi tải dữ liệu:", error);
      setDistributions([]);
      setPharmacies([]);
      toast.error(
        `Không thể tải dữ liệu: ${
          error.response?.data?.message || error.message
        }`,
        {
          position: "top-right",
          duration: 4000,
        }
      );
    } finally {
      if (shouldShowLoader) {
        setLoading(false);
        setLoadingProgress(0);
      }
    }
  };

  const extractTokenIds = (distributionObj) => {
    if (
      distributionObj.manufacturerInvoice?.tokenIds &&
      Array.isArray(distributionObj.manufacturerInvoice.tokenIds)
    ) {
      return distributionObj.manufacturerInvoice.tokenIds.map((id) =>
        String(id)
      );
    }

    if (
      distributionObj.invoice?.tokenIds &&
      Array.isArray(distributionObj.invoice.tokenIds)
    ) {
      return distributionObj.invoice.tokenIds.map((id) => String(id));
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
        return tokenIds;
      }
    }

    if (distributionObj.tokenIds && Array.isArray(distributionObj.tokenIds)) {
      return distributionObj.tokenIds.map((id) => String(id));
    }

    return [];
  };

  const handleSelectDistribution = async (dist) => {
    let tokenIds = extractTokenIds(dist);

    if (tokenIds.length === 0) {
      setDialogLoading(true);
    }

    try {
      if (tokenIds.length === 0) {
        const manufacturerInvoiceId =
          dist?.manufacturerInvoice?._id || dist?.manufacturerInvoice;

        if (
          manufacturerInvoiceId &&
          typeof manufacturerInvoiceId === "string"
        ) {
          try {
            const invoiceDetailRes = await fetchInvoiceDetail(
              manufacturerInvoiceId
            );
            if (invoiceDetailRes?.data?.success && invoiceDetailRes.data.data) {
              const invoiceDetail = invoiceDetailRes.data.data;
              if (
                invoiceDetail.tokenIds &&
                Array.isArray(invoiceDetail.tokenIds) &&
                invoiceDetail.tokenIds.length > 0
              ) {
                tokenIds = invoiceDetail.tokenIds.map((id) => String(id));
              } else {
                console.warn(
                  "⚠️ API getInvoiceDetail không trả về tokenIds:",
                  invoiceDetail
                );
              }
            }
          } catch (invoiceError) {
            console.warn("Lỗi khi gọi getInvoiceDetail:", invoiceError);
          }
        }
      }

      const distributionWithTokens = {
        ...dist,
        tokenIds: tokenIds,
      };

      setSelectedDistribution(distributionWithTokens);
      setFormData({
        pharmacyId: "",
        quantity: dist.distributedQuantity?.toString() || "",
        notes: "",
      });

      if (tokenIds.length === 0) {
        console.warn(
          "⚠️ Không tìm thấy tokenIds trong distribution:",
          dist._id
        );
        toast.error(
          `⚠️ Cảnh báo: Không tìm thấy token IDs. Distribution này có thể chưa có NFT được gán. Vui lòng kiểm tra invoice từ manufacturer hoặc liên hệ quản trị viên.`,
          {
            position: "top-right",
            duration: 6000,
          }
        );
      }

      setShowDialog(true);
    } catch (error) {
      console.error("Lỗi khi xử lý distribution:", error);
      toast.error(
        `Lỗi khi xử lý distribution: ${
          error.response?.data?.message || error.message
        }`,
        {
          position: "top-right",
          duration: 5000,
        }
      );
      setSelectedDistribution({
        ...dist,
        tokenIds: tokenIds,
      });
      setFormData({
        pharmacyId: "",
        quantity: dist.distributedQuantity?.toString() || "",
        notes: "",
      });
      setShowDialog(true);
    } finally {
      setDialogLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.pharmacyId || !formData.quantity) {
      toast.error("Vui lòng chọn nhà thuốc và nhập số lượng", {
        position: "top-right",
        duration: 4000,
      });
      return;
    }

    const requestedQty = parseInt(formData.quantity);

    if (
      requestedQty <= 0 ||
      requestedQty > selectedDistribution.distributedQuantity
    ) {
      toast.error("Số lượng không hợp lệ", {
        position: "top-right",
        duration: 4000,
      });
      return;
    }

    const tokenIds = selectedDistribution.tokenIds || [];

    if (tokenIds.length === 0) {
      toast.error(
        "Không tìm thấy tokenIds! Distribution này chưa có NFT được gán. Vui lòng liên hệ quản trị viên.",
        {
          position: "top-right",
          duration: 5000,
        }
      );
      return;
    }

    const selectedTokenIds = tokenIds.slice(0, requestedQty);

    if (selectedTokenIds.length < requestedQty) {
      toast.error(
        `⚠️ Chỉ có ${selectedTokenIds.length} tokenIds khả dụng. Bạn yêu cầu ${requestedQty} nhưng chỉ có thể chuyển ${selectedTokenIds.length}.`,
        {
          position: "top-right",
          duration: 6000,
        }
      );
      if (
        !window.confirm(
          `⚠️ Chỉ có ${selectedTokenIds.length} tokenIds khả dụng.\n\n` +
            `Bạn yêu cầu ${requestedQty} nhưng chỉ có thể chuyển ${selectedTokenIds.length}.\n\n` +
            `Tiếp tục với ${selectedTokenIds.length} NFT?`
        )
      ) {
        return;
      }
    }

    const amounts = selectedTokenIds.map(() => {
      return 1;
    });

    if (submitLoading) {
      return;
    }
    setSubmitLoading(true);

    try {
      console.log("🔍 Đang kiểm tra balance trên blockchain...");
      const balanceCheck = await checkDistributorNFTBalances(selectedTokenIds);

      if (!balanceCheck.canTransfer) {
        const issuesList = balanceCheck.issues
          .filter((issue) => issue.tokenId)
          .map(
            (issue) =>
              `Token ID ${issue.tokenId}: có ${issue.balance}, cần ${issue.needed}`
          )
          .join(", ");

        toast.error(
          `❌ Không đủ số lượng NFT để chuyển giao! Chi tiết: ${issuesList}. Nguyên nhân: NFT chưa được transfer từ Manufacturer → Distributor trên blockchain. Vui lòng yêu cầu Manufacturer thực hiện transfer NFT trước.`,
          {
            position: "top-right",
            duration: 8000,
          }
        );
        setSubmitLoading(false);
        return;
      }
    } catch (balanceError) {
      console.error("❌ Lỗi khi kiểm tra balance:", balanceError);
      if (
        balanceError.message?.includes("Contract not deployed") ||
        balanceError.message?.includes("MetaMask")
      ) {
        toast.error(
          `⚠️ Không thể kiểm tra balance trên blockchain! Lỗi: ${balanceError.message}. Bạn có thể tiếp tục nhưng hãy đảm bảo NFT đã được transfer.`,
          {
            position: "top-right",
            duration: 6000,
          }
        );
        // Vẫn cho phép tiếp tục trong trường hợp này
      } else {
        toast.error(`❌ Lỗi khi kiểm tra balance: ${balanceError.message}`, {
          position: "top-right",
          duration: 5000,
        });
        setSubmitLoading(false);
        return;
      }
    }

    try {
      const payload = {
        pharmacyId: formData.pharmacyId,
        tokenIds: selectedTokenIds,
        amounts: amounts,
        quantity: selectedTokenIds.length,
        notes: formData.notes || undefined,
      };

      console.log("Payload gửi lên backend:", payload);

      const response = await transferToPharmacyMutation(payload);

      if (response.data.success) {
        const {
          commercialInvoice,
          pharmacyAddress,
          tokenIds: responseTokenIds,
          amounts: responseAmounts,
        } = response.data.data;

        console.log("✅ Invoice đã được tạo:", {
          invoiceId: commercialInvoice._id,
          invoiceNumber: commercialInvoice.invoiceNumber,
          status: commercialInvoice.status,
        });

        toast.success(
          `Invoice đã được tạo thành công! Đang chuyển NFT trên blockchain...`,
          {
            position: "top-right",
            duration: 4000,
          }
        );

        try {
          console.log("📤 Đang gọi smart contract để chuyển NFT...");
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

          const transferResult = await transferNFTToPharmacy(
            responseTokenIds,
            responseAmounts,
            pharmacyAddress
          );

          if (transferResult.success) {
            console.log("✅ Smart contract thành công:", {
              transactionHash: transferResult.transactionHash,
              blockNumber: transferResult.blockNumber,
            });

            if (chainIntervalRef.current) {
              clearInterval(chainIntervalRef.current);
            }

            setChainProgress(1);
            setChainStatus("completed");

            try {
              console.log("💾 Đang lưu transaction hash...");

              const saveResponse = await saveTransferTransaction({
                invoiceId: commercialInvoice._id,
                transactionHash: transferResult.transactionHash,
                tokenIds: responseTokenIds,
              });

              if (saveResponse.data.success) {
                console.log("Transaction hash đã được lưu");
                toast.success("Chuyển giao NFT thành công!", {
                  position: "top-right",
                  duration: 5000,
                });
                await new Promise((r) => setTimeout(r, 600));
                setShowChainView(false);
                setShowDialog(false);
                setFormData({
                  pharmacyId: "",
                  quantity: "",
                  notes: "",
                });
                loadData(true);
              } else {
                throw new Error(
                  saveResponse.data.message || "Lỗi khi lưu transaction hash"
                );
              }
            } catch (saveError) {
              console.error("❌ Lỗi khi lưu transaction hash:", saveError);
              setChainStatus("error");
              toast.error(
                `Lỗi khi lưu transaction hash: ${
                  saveError.response?.data?.message || saveError.message
                }`,
                {
                  position: "top-right",
                  duration: 5000,
                }
              );
            }
          } else {
            throw new Error("Smart contract transfer không thành công");
          }
        } catch (transferError) {
          console.error("❌ Lỗi khi gọi smart contract:", transferError);
          if (chainIntervalRef.current) {
            clearInterval(chainIntervalRef.current);
          }
          setChainStatus("error");
          setChainProgress((prev) => (prev < 0.3 ? 0.3 : prev));
          toast.error(
            `Lỗi khi chuyển NFT trên blockchain: ${
              transferError.message || "Unknown error"
            }`,
            {
              position: "top-right",
              duration: 6000,
            }
          );
        }
      }
    } catch (error) {
      console.error("❌ Lỗi:", error);
      toast.error(`❌ ${error.response?.data?.message || error.message}`, {
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
    setDistributions,
    pharmacies,
    setPharmacies,
    loading,
    setLoading,
    loadingProgress,
    setLoadingProgress,
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
  };
};
