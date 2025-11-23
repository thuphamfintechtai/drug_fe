/* eslint-disable no-undef */
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useDistributorDistributionHistory,
  useDistributorPharmacies,
  useTransferToPharmacy as useTransferToPharmacyMutation,
  useSaveTransferTransaction,
} from "../apis/distributor";
import api from "../../utils/api";

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

  // Debug logs
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
  const { mutateAsync: transferToPharmacyMutation } =
    useTransferToPharmacyMutation();
  const { mutateAsync: saveTransferTransaction } = useSaveTransferTransaction();

  useEffect(() => {
    if (distributionHistoryData) {
      // Xử lý nhiều cấu trúc response khác nhau
      let nextDistributions = [];
      
      // Case 1: { success: true, data: { distributions: [...] } }
      if (distributionHistoryData.success && distributionHistoryData.data?.distributions) {
        nextDistributions = Array.isArray(distributionHistoryData.data.distributions)
          ? distributionHistoryData.data.distributions
          : [];
      }
      // Case 2: { data: { success: true, data: { distributions: [...] } } }
      else if (distributionHistoryData.data?.success && distributionHistoryData.data.data?.distributions) {
        nextDistributions = Array.isArray(distributionHistoryData.data.data.distributions)
          ? distributionHistoryData.data.data.distributions
          : [];
      }
      // Case 3: { data: { distributions: [...] } }
      else if (distributionHistoryData.data?.distributions) {
        nextDistributions = Array.isArray(distributionHistoryData.data.distributions)
          ? distributionHistoryData.data.distributions
          : [];
      }
      // Case 4: Direct array
      else if (Array.isArray(distributionHistoryData.data)) {
        nextDistributions = distributionHistoryData.data;
      }
      // Case 5: { data: [...] }
      else if (Array.isArray(distributionHistoryData)) {
        nextDistributions = distributionHistoryData;
      }

      console.log("📦 [useTransferToPharmacy] Parsed distributions:", {
        raw: distributionHistoryData,
        parsed: nextDistributions,
        count: nextDistributions.length,
      });

      setDistributions(nextDistributions);
      queryClient.setQueryData(TRANSFER_CACHE_KEY, {
        distributions: nextDistributions,
        pharmacies: pharmacies || [],
      });
    }
  }, [distributionHistoryData, queryClient, pharmacies]);

  useEffect(() => {
    if (pharmaciesData) {
      // Xử lý nhiều cấu trúc response khác nhau
      let nextPharmacies = [];
      
      // Case 1: { success: true, data: { pharmacies: [...] } }
      if (pharmaciesData.success && pharmaciesData.data?.pharmacies) {
        nextPharmacies = Array.isArray(pharmaciesData.data.pharmacies)
          ? pharmaciesData.data.pharmacies
          : [];
      }
      // Case 2: { data: { success: true, data: { pharmacies: [...] } } }
      else if (pharmaciesData.data?.success && pharmaciesData.data.data?.pharmacies) {
        nextPharmacies = Array.isArray(pharmaciesData.data.data.pharmacies)
          ? pharmaciesData.data.data.pharmacies
          : [];
      }
      // Case 3: { data: { pharmacies: [...] } }
      else if (pharmaciesData.data?.pharmacies) {
        nextPharmacies = Array.isArray(pharmaciesData.data.pharmacies)
          ? pharmaciesData.data.pharmacies
          : [];
      }
      // Case 4: Direct array
      else if (Array.isArray(pharmaciesData.data)) {
        nextPharmacies = pharmaciesData.data;
      }
      // Case 5: { data: [...] }
      else if (Array.isArray(pharmaciesData)) {
        nextPharmacies = pharmaciesData;
      }

      console.log("💊 [useTransferToPharmacy] Parsed pharmacies:", {
        raw: pharmaciesData,
        parsed: nextPharmacies,
        count: nextPharmacies.length,
      });

      setPharmacies(nextPharmacies);
      queryClient.setQueryData(TRANSFER_CACHE_KEY, {
        distributions: distributions || [],
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

      // Parse distributions với nhiều cấu trúc response
      let nextDistributions = [];
      if (distributionResponse) {
        // Case 1: { success: true, data: { distributions: [...] } }
        if (distributionResponse.success && distributionResponse.data?.distributions) {
          nextDistributions = Array.isArray(distributionResponse.data.distributions)
            ? distributionResponse.data.distributions
            : [];
        }
        // Case 2: { data: { success: true, data: { distributions: [...] } } }
        else if (distributionResponse.data?.success && distributionResponse.data.data?.distributions) {
          nextDistributions = Array.isArray(distributionResponse.data.data.distributions)
            ? distributionResponse.data.data.distributions
            : [];
        }
        // Case 3: { data: { distributions: [...] } }
        else if (distributionResponse.data?.distributions) {
          nextDistributions = Array.isArray(distributionResponse.data.distributions)
            ? distributionResponse.data.distributions
            : [];
        }
        // Case 4: Direct array
        else if (Array.isArray(distributionResponse.data)) {
          nextDistributions = distributionResponse.data;
        }
        // Case 5: { data: [...] }
        else if (Array.isArray(distributionResponse)) {
          nextDistributions = distributionResponse;
        }
      }

      console.log("📦 [useTransferToPharmacy] Loaded distributions:", {
        raw: distributionResponse,
        parsed: nextDistributions,
        count: nextDistributions.length,
      });

      // Parse pharmacies với nhiều cấu trúc response
      let nextPharmacies = [];
      if (pharmaciesResponse) {
        // Case 1: { success: true, data: { pharmacies: [...] } }
        if (pharmaciesResponse.success && pharmaciesResponse.data?.pharmacies) {
          nextPharmacies = Array.isArray(pharmaciesResponse.data.pharmacies)
            ? pharmaciesResponse.data.pharmacies
            : [];
        }
        // Case 2: { data: { success: true, data: { pharmacies: [...] } } }
        else if (pharmaciesResponse.data?.success && pharmaciesResponse.data.data?.pharmacies) {
          nextPharmacies = Array.isArray(pharmaciesResponse.data.data.pharmacies)
            ? pharmaciesResponse.data.data.pharmacies
            : [];
        }
        // Case 3: { data: { pharmacies: [...] } }
        else if (pharmaciesResponse.data?.pharmacies) {
          nextPharmacies = Array.isArray(pharmaciesResponse.data.pharmacies)
            ? pharmaciesResponse.data.pharmacies
            : [];
        }
        // Case 4: Direct array
        else if (Array.isArray(pharmaciesResponse.data)) {
          nextPharmacies = pharmaciesResponse.data;
        }
        // Case 5: { data: [...] }
        else if (Array.isArray(pharmaciesResponse)) {
          nextPharmacies = pharmaciesResponse;
        }
      }

      console.log("💊 [useTransferToPharmacy] Loaded pharmacies:", {
        raw: pharmaciesResponse,
        parsed: nextPharmacies,
        count: nextPharmacies.length,
      });

      setDistributions(nextDistributions);
      setPharmacies(nextPharmacies);

      queryClient.setQueryData(TRANSFER_CACHE_KEY, {
        distributions: nextDistributions,
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
      toast.error(
        `Không thể tải dữ liệu: ${
          error.response?.data?.message || error.message || "Lỗi không xác định"
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
    console.log("🔍 [extractTokenIds] Distribution object:", distributionObj);

    // Case 1: manufacturerInvoice.tokenIds
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

    // Case 2: invoice.tokenIds
    if (
      distributionObj.invoice?.tokenIds &&
      Array.isArray(distributionObj.invoice.tokenIds)
    ) {
      const tokenIds = distributionObj.invoice.tokenIds.map((id) => String(id));
      console.log("✅ [extractTokenIds] Found in invoice.tokenIds:", tokenIds);
      return tokenIds;
    }

    // Case 3: proofOfDistribution.tokenIds
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

    // Case 4: Direct tokenIds
    if (distributionObj.tokenIds && Array.isArray(distributionObj.tokenIds)) {
      const tokenIds = distributionObj.tokenIds.map((id) => String(id));
      console.log("✅ [extractTokenIds] Found in tokenIds:", tokenIds);
      return tokenIds;
    }

    // Case 5: nftInfos array
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

    // Case 6: manufacturerInvoice._id hoặc invoiceId để gọi API
    console.warn("⚠️ [extractTokenIds] No tokenIds found in distribution object");
    return [];
  };

  const handleSelectDistribution = async (dist) => {
    console.log("📦 [handleSelectDistribution] Selected distribution:", dist);
    let tokenIds = extractTokenIds(dist);

    if (tokenIds.length === 0) {
      setDialogLoading(true);
    }

    try {
      // Nếu không tìm thấy tokenIds, thử lấy từ API
      if (tokenIds.length === 0) {
        console.log("🔍 [handleSelectDistribution] No tokenIds found, trying to fetch from API...");
        
        // Thử nhiều cách lấy invoiceId
        const manufacturerInvoiceId =
          dist?.manufacturerInvoice?._id || 
          dist?.manufacturerInvoice?.id ||
          dist?.manufacturerInvoice ||
          dist?.invoice?._id ||
          dist?.invoice?.id ||
          dist?.invoice ||
          dist?.invoiceId ||
          dist?._id;

        console.log("🔍 [handleSelectDistribution] Invoice ID to fetch:", manufacturerInvoiceId);

        if (manufacturerInvoiceId && typeof manufacturerInvoiceId === "string") {
          try {
            console.log("📡 [handleSelectDistribution] Fetching invoice detail from API...");
            const invoiceDetailRes = await queryClient.fetchQuery({
              queryKey: ["getInvoiceDetail", manufacturerInvoiceId],
              queryFn: async () => {
                const response = await api.get(
                  `/distributor/invoices/${manufacturerInvoiceId}/detail`
                );
                return response.data;
              },
            });
            
            console.log("📡 [handleSelectDistribution] Invoice detail response:", invoiceDetailRes);

            // Xử lý nhiều cấu trúc response
            let invoiceDetail = null;
            if (invoiceDetailRes?.success && invoiceDetailRes.data) {
              invoiceDetail = invoiceDetailRes.data;
            } else if (invoiceDetailRes?.data) {
              invoiceDetail = invoiceDetailRes.data;
            } else if (invoiceDetailRes) {
              invoiceDetail = invoiceDetailRes;
            }

            if (invoiceDetail) {
              // Tìm tokenIds trong nhiều path
              const foundTokenIds = 
                invoiceDetail.tokenIds ||
                invoiceDetail.data?.tokenIds ||
                invoiceDetail.invoice?.tokenIds ||
                invoiceDetail.manufacturerInvoice?.tokenIds;

              if (foundTokenIds && Array.isArray(foundTokenIds) && foundTokenIds.length > 0) {
                tokenIds = foundTokenIds.map((id) => String(id));
                console.log("✅ [handleSelectDistribution] Found tokenIds from invoice API:", tokenIds);
              } else {
                console.warn(
                  "⚠️ [handleSelectDistribution] API getInvoiceDetail không trả về tokenIds:",
                  invoiceDetail
                );
              }
            }
          } catch (invoiceError) {
            console.error("❌ [handleSelectDistribution] Lỗi khi gọi getInvoiceDetail:", invoiceError);
            // Không throw error, để tiếp tục với tokenIds rỗng
          }
        }

        // Nếu vẫn không có tokenIds, thử gọi distribution detail API
        if (tokenIds.length === 0 && dist?._id) {
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

            // Xử lý nhiều cấu trúc response
            let distributionDetail = null;
            if (distributionDetailRes?.success && distributionDetailRes.data) {
              distributionDetail = distributionDetailRes.data;
            } else if (distributionDetailRes?.data) {
              distributionDetail = distributionDetailRes.data?.data || distributionDetailRes.data;
            } else if (distributionDetailRes) {
              distributionDetail = distributionDetailRes;
            }

            if (distributionDetail) {
              // Tìm tokenIds trong nhiều path từ distribution detail
              const foundTokenIds = 
                distributionDetail.tokenIds ||
                distributionDetail.data?.tokenIds ||
                distributionDetail.invoice?.tokenIds ||
                distributionDetail.manufacturerInvoice?.tokenIds ||
                distributionDetail.proofOfDistribution?.tokenIds;

              if (foundTokenIds && Array.isArray(foundTokenIds) && foundTokenIds.length > 0) {
                tokenIds = foundTokenIds.map((id) => String(id));
                console.log("✅ [handleSelectDistribution] Found tokenIds from distribution detail API:", tokenIds);
              } else {
                console.warn(
                  "⚠️ [handleSelectDistribution] Distribution detail API không trả về tokenIds:",
                  distributionDetail
                );
              }
            }
          } catch (distributionError) {
            console.error("❌ [handleSelectDistribution] Lỗi khi gọi distribution detail API:", distributionError);
            // Không throw error, để tiếp tục với tokenIds rỗng
          }
        }

        if (tokenIds.length === 0) {
          console.warn("⚠️ [handleSelectDistribution] Không tìm thấy invoiceId hoặc distributionId để gọi API");
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
      console.log("Đang kiểm tra balance trên blockchain...");
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
          `Không đủ số lượng NFT để chuyển giao! Chi tiết: ${issuesList}. Nguyên nhân: NFT chưa được transfer từ Manufacturer → Distributor trên blockchain. Vui lòng yêu cầu Manufacturer thực hiện transfer NFT trước.`,
          {
            position: "top-right",
            duration: 8000,
          }
        );
        setSubmitLoading(false);
        return;
      }
    } catch (balanceError) {
      console.error("Lỗi khi kiểm tra balance:", balanceError);
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
        toast.error(`Lỗi khi kiểm tra balance: ${balanceError.message}`, {
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

        console.log(" Invoice đã được tạo:", {
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
            console.log(" Smart contract thành công:", {
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
              console.error("Lỗi khi lưu transaction hash:", saveError);
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
          console.error("Lỗi khi gọi smart contract:", transferError);
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
      console.error("Lỗi:", error);
      toast.error(`${error.response?.data?.message || error.message}`, {
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
