import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/DashboardLayout";
import TruckLoader from "../../components/TruckLoader";
import TruckAnimationButton from "../../components/TruckAnimationButton";
import BlockchainTransferView from "../../components/BlockchainTransferView";
import {
  getDistributionHistory,
  getPharmacies,
  transferToPharmacy,
  saveTransferToPharmacyTransaction,
  getInvoiceDetail,
} from "../../services/distributor/distributorService";
import {
  transferNFTToPharmacy,
  checkDistributorNFTBalances,
} from "../../utils/web3Helper";

export default function TransferToPharmacy() {
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

  const navigationItems = [
    {
      path: "/distributor",
      label: "Tổng quan",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/invoices",
      label: "Đơn từ nhà SX",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/transfer-pharmacy",
      label: "Chuyển cho NT",
      icon: (
        <svg
          className="w-5 h-5 "
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
      active: true,
    },
    {
      path: "/distributor/distribution-history",
      label: "Lịch sử phân phối",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/transfer-history",
      label: "Lịch sử chuyển NT",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/drugs",
      label: "Quản lý thuốc",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/nft-tracking",
      label: "Tra cứu NFT",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/profile",
      label: "Hồ sơ",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      active: false,
    },
  ];

  useEffect(() => {
    loadData();
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (chainIntervalRef.current) {
        clearInterval(chainIntervalRef.current);
      }
    };
  }, []);

  const loadData = async () => {
    try {
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

      const [distRes, pharmRes] = await Promise.all([
        getDistributionHistory({ status: "confirmed" }),
        getPharmacies(),
      ]);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      if (distRes.data.success) {
        setDistributions(distRes.data.data.distributions || []);
      }

      if (pharmRes.data.success && pharmRes.data.data) {
        setPharmacies(
          Array.isArray(pharmRes.data.data.pharmacies)
            ? pharmRes.data.data.pharmacies
            : []
        );
      } else {
        setPharmacies([]);
      }

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
      setLoading(false);
      setLoadingProgress(0);
    }
  };

  const extractTokenIds = (distributionObj) => {
    // Ưu tiên 1: manufacturerInvoice.tokenIds
    if (
      distributionObj.manufacturerInvoice?.tokenIds &&
      Array.isArray(distributionObj.manufacturerInvoice.tokenIds)
    ) {
      return distributionObj.manufacturerInvoice.tokenIds.map((id) =>
        String(id)
      );
    }

    // Ưu tiên 2: invoice.tokenIds
    if (
      distributionObj.invoice?.tokenIds &&
      Array.isArray(distributionObj.invoice.tokenIds)
    ) {
      return distributionObj.invoice.tokenIds.map((id) => String(id));
    }

    // Ưu tiên 3: nftInfos
    if (distributionObj.nftInfos && Array.isArray(distributionObj.nftInfos)) {
      const tokenIds = distributionObj.nftInfos
        .map((nft) => {
          if (typeof nft === "string") return nft;
          return String(nft.tokenId || nft._id || nft.nftInfo?.tokenId || "");
        })
        .filter(Boolean);
      if (tokenIds.length > 0) return tokenIds;
    }

    // Ưu tiên 4: tokenIds trực tiếp
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
            const invoiceDetailRes = await getInvoiceDetail(
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

    const amounts = selectedTokenIds.map(() => 1);

    if (submitLoading) return;
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

      console.log("✅ Balance check passed");
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

      const response = await transferToPharmacy(payload);

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

              const saveResponse = await saveTransferToPharmacyTransaction({
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
                loadData();
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
      toast.error(
        `❌ ${error.response?.data?.message || error.message}`,
        {
          position: "top-right",
          duration: 5000,
        }
      );
    } finally {
      setSubmitLoading(false);
      if (chainIntervalRef.current) {
        clearInterval(chainIntervalRef.current);
      }
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const safePharmacies = Array.isArray(pharmacies) ? pharmacies : [];
  const selectedPharmacy = safePharmacies.find(
    (p) => p._id === formData.pharmacyId
  );

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {showChainView && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-md">
          <BlockchainTransferView
            status={chainStatus}
            progress={chainProgress}
            onClose={() => setShowChainView(false)}
            transferType="distributor-to-pharmacy"
          />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={loadingProgress} showTrack />
          </div>
          <div className="text-lg text-slate-600 mt-6">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-card-primary shadow-sm p-5 mb-6">
            <h1 className="text-xl font-semibold text-[#007b91]">
              Chuyển giao cho nhà thuốc
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Chọn NFT và pharmacy để chuyển quyền sở hữu
            </p>
          </div>

          <motion.div
            className="rounded-2xl bg-white border border-card-primary shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6 mb-5"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <h2 className="text-xl font-bold text-[#007b91] mb-4">
              Quy trình chuyển giao
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div>
                  <div className="font-semibold text-slate-800">
                    Chọn NFT & Pharmacy
                  </div>
                  <div className="text-sm text-slate-600">
                    Chọn lô hàng đã nhận từ manufacturer và nhà thuốc nhận hàng
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  <div className="font-semibold text-slate-800">
                    Tạo invoice
                  </div>
                  <div className="text-sm text-slate-600">
                    Frontend gọi API Backend để tạo invoice với trạng thái
                    "draft"
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div>
                  <div className="font-semibold text-slate-800">
                    Chuyển quyền sở hữu NFT
                  </div>
                  <div className="text-sm text-slate-600">
                    Frontend gọi Smart Contract để transfer NFT từ Distributor
                    wallet → Pharmacy wallet
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center flex-shrink-0">
                  4
                </div>
                <div>
                  <div className="font-semibold text-slate-800">
                    Lưu transaction hash
                  </div>
                  <div className="text-sm text-slate-600">
                    Frontend gọi API Backend để lưu transaction hash, invoice
                    status chuyển từ "draft" → "sent"
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl border border-card-primary shadow-sm overflow-hidden"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <h2 className="text-xl font-bold text-slate-800">
                Lô hàng có sẵn (đã nhận từ Manufacturer)
              </h2>
            </div>

            {distributions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-5xl mb-4"></div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Chưa có lô hàng nào
                </h3>
                <p className="text-slate-600">
                  Vui lòng nhận hàng từ nhà sản xuất trước
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Từ Manufacturer
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Đơn hàng
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Số lượng NFT
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Ngày nhận
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {distributions.map((dist, index) => (
                      <tr
                        key={dist._id || index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-semibold text-[#003544]">
                          {dist.fromManufacturer?.fullName ||
                            dist.fromManufacturer?.username ||
                            "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100">
                            {dist.manufacturerInvoice?.invoiceNumber || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-800">
                            {dist.distributedQuantity}
                          </span>
                          <span className="text-xs text-slate-500 ml-1">
                            NFT
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700 text-sm">
                          {dist.distributionDate
                            ? new Date(
                                dist.distributionDate
                              ).toLocaleDateString("vi-VN")
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleSelectDistribution(dist)}
                              className="px-4 py-2 border-2 border-[#3db6d9] bg-white !text-[#3db6d9] rounded-full font-semibold hover:bg-[#3db6d9] hover:!text-white hover:shadow-md hover:shadow-[#3db6d9]/40 transition-all duration-200"
                            >
                              Chuyển cho NT
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {showDialog && selectedDistribution && !showChainView && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => {
                setShowDialog(false);
                setDialogLoading(false);
              }}
            >
              <div
                className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scroll"
                onClick={(e) => e.stopPropagation()}
              >
                <style>{`
                  .custom-scroll { scrollbar-width: none; -ms-overflow-style: none; }
                  .custom-scroll::-webkit-scrollbar { width: 0; height: 0; }
                  .custom-scroll::-webkit-scrollbar-track { background: transparent; }
                  .custom-scroll::-webkit-scrollbar-thumb { background: transparent; }
                `}</style>
                <div className="bg-linear-to-r from-secondary to-primary px-8 py-6 rounded-t-3xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold !text-white">
                        Chuyển giao NFT cho Pharmacy
                      </h2>
                      <p className="text-cyan-100 text-sm">
                        Chọn nhà thuốc và số lượng
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowDialog(false);
                        setDialogLoading(false);
                      }}
                      className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center !text-white text-xl transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="p-8 space-y-4 relative">
                  {dialogLoading && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-3xl flex items-center justify-center z-10">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-card-primary border-t-cyan-500 mb-4"></div>
                        <div className="text-slate-600 font-medium">
                          Đang tải thông tin...
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-cyan-50 rounded-xl p-4 border border-card-primary">
                    <div className="font-bold text-cyan-800 mb-3">
                      Thông tin lô hàng:
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Đơn hàng:</span>
                        <span className="font-mono font-medium">
                          {selectedDistribution.manufacturerInvoice
                            ?.invoiceNumber ||
                            selectedDistribution.invoice?.invoiceNumber ||
                            "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Từ:</span>
                        <span className="font-medium">
                          {selectedDistribution.fromManufacturer?.fullName ||
                            selectedDistribution.fromManufacturer?.username ||
                            selectedDistribution.invoice?.fromManufacturer
                              ?.fullName ||
                            selectedDistribution.invoice?.fromManufacturer
                              ?.username ||
                            "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Tổng số NFT:</span>
                        <span className="font-bold text-orange-700">
                          {selectedDistribution.distributedQuantity || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Ngày nhận:</span>
                        <span className="font-medium">
                          {selectedDistribution.distributionDate
                            ? new Date(
                                selectedDistribution.distributionDate
                              ).toLocaleDateString("vi-VN")
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Chọn nhà thuốc *
                    </label>
                    <select
                      value={formData.pharmacyId}
                      onChange={(e) =>
                        setFormData({ ...formData, pharmacyId: e.target.value })
                      }
                      className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition"
                    >
                      <option value="">-- Chọn pharmacy --</option>
                      {safePharmacies.map((pharm) => (
                        <option key={pharm._id} value={pharm._id}>
                          {pharm.name} ({pharm.taxCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedPharmacy && (
                    <div className="bg-cyan-50 rounded-xl p-4 border border-card-primary">
                      <div className="text-sm font-semibold text-cyan-800 mb-2">
                        Thông tin nhà thuốc:
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-slate-600">Tên:</span>{" "}
                          <span className="font-medium">
                            {selectedPharmacy.name || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Mã số thuế:</span>{" "}
                          <span className="font-medium">
                            {selectedPharmacy.taxCode || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Số giấy phép:</span>{" "}
                          <span className="font-medium">
                            {selectedPharmacy.licenseNo || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Quốc gia:</span>{" "}
                          <span className="font-medium">
                            {selectedPharmacy.country || "N/A"}
                          </span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-slate-600">Địa chỉ:</span>{" "}
                          <span className="font-medium">
                            {selectedPharmacy.address || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Email:</span>{" "}
                          <span className="font-medium">
                            {selectedPharmacy.contactEmail || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">SĐT:</span>{" "}
                          <span className="font-medium">
                            {selectedPharmacy.contactPhone || "N/A"}
                          </span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-slate-600">Wallet:</span>{" "}
                          <span className="font-mono text-xs break-all">
                            {selectedPharmacy.walletAddress ||
                              selectedPharmacy.user?.walletAddress ||
                              "Chưa có"}
                          </span>
                        </div>
                      </div>

                      {selectedPharmacy.user && (
                        <div className="mt-3 pt-3 border-t border-card-primary">
                          <div className="text-xs font-semibold text-cyan-700 mb-1">
                            Thông tin tài khoản:
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
                            <div>
                              <span className="text-slate-600">Tên:</span>{" "}
                              <span className="font-medium">
                                {selectedPharmacy.user.fullName ||
                                  selectedPharmacy.user.username ||
                                  "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-600">Username:</span>{" "}
                              <span className="font-mono">
                                {selectedPharmacy.user.username || "N/A"}
                              </span>
                            </div>
                            <div className="md:col-span-2">
                              <span className="text-slate-600">Email:</span>{" "}
                              <span className="font-medium">
                                {selectedPharmacy.user.email || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số lượng NFT cần chuyển *
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition"
                      placeholder="Nhập số lượng"
                      min="1"
                      max={selectedDistribution.distributedQuantity}
                    />
                    <div className="text-xs text-cyan-600 mt-1">
                      Tối đa: {selectedDistribution.distributedQuantity} NFT
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ghi chú
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition"
                      rows="3"
                      placeholder="Ghi chú về đơn chuyển giao..."
                    />
                  </div>

                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <div className="text-sm text-yellow-800">
                      ⚠️ Sau khi xác nhận, invoice sẽ được tạo với trạng thái{" "}
                      <strong>"draft"</strong>. NFT sẽ được chuyển on-chain ngay
                      lập tức.
                    </div>
                  </div>
                </div>

                <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl flex justify-end">
                  <TruckAnimationButton
                    onClick={handleSubmit}
                    disabled={submitLoading}
                    buttonState={submitLoading ? "uploading" : "idle"}
                    defaultText="Xác nhận chuyển giao"
                    uploadingText="Đang xử lý..."
                    successText="Hoàn thành"
                    animationMode="infinite"
                    animationDuration={3}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
