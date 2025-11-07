import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import TruckAnimationButton from "../../components/TruckAnimationButton";
import BlockchainTransferView from "../../components/BlockchainTransferView";
import TruckLoader from "../../components/TruckLoader";
import {
  getProductionHistory,
  getDistributors,
  createTransferToDistributor,
  getAvailableTokensForProduction,
  saveTransferTransaction,
} from "../../services/manufacturer/manufacturerService";
import {
  transferNFTToDistributor,
  getCurrentWalletAddress,
} from "../../utils/web3Helper";
import { useAuth } from "../../context/AuthContext";

export default function TransferManagement() {
  const { user } = useAuth();
  const [productions, setProductions] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const transferProgressIntervalRef = useRef(null); // FIX: Track transfer progress interval

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

  const navigationItems = [
    {
      path: "/manufacturer",
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
      path: "/manufacturer/drugs",
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
      path: "/manufacturer/production",
      label: "Sản xuất thuốc",
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
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/manufacturer/transfer",
      label: "Chuyển giao",
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
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/manufacturer/production-history",
      label: "Lịch sử sản xuất",
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
      path: "/manufacturer/transfer-history",
      label: "Lịch sử chuyển giao",
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
      path: "/manufacturer/profile",
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
      // FIX: Cleanup all intervals
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (transferProgressIntervalRef.current) {
        clearInterval(transferProgressIntervalRef.current);
      }
    };
  }, []);

  // FIX: Simplified loadData - removed complex progress logic
  const loadData = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      // Simple progress simulation
      progressIntervalRef.current = setInterval(() => {
        setLoadingProgress((prev) => Math.min(prev + 0.02, 0.9));
      }, 50);

      const [prodRes, distRes] = await Promise.all([
        getProductionHistory({ status: "minted" }),
        getDistributors({ page: 1, limit: 100 }),
      ]);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      if (prodRes.data.success) {
        setProductions(prodRes.data.data.productions || []);
      }

      if (distRes.data?.success && distRes.data?.data) {
        const list = distRes.data.data.distributors;
        setDistributors(Array.isArray(list) ? list : []);
      } else {
        setDistributors([]);
      }

      // Complete progress
      setLoadingProgress(1);
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      console.error("Lỗi khi tải dữ liệu:", error);
      setLoadingProgress(0);
    } finally {
      setLoading(false);
      setTimeout(() => setLoadingProgress(0), 500);
    }
  };

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
      const res = await getAvailableTokensForProduction(production._id);
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

  // FIX: Prevent double submission
  const handleSubmit = async () => {
    if (buttonAnimating) return; // Already processing

    if (!formData.distributorId || !formData.quantity) {
      alert("Vui lòng chọn nhà phân phối và nhập số lượng");
      return;
    }

    if (
      parseInt(formData.quantity) <= 0 ||
      parseInt(formData.quantity) > selectedProduction.quantity
    ) {
      alert("Số lượng không hợp lệ");
      return;
    }

    const requestedQty = parseInt(formData.quantity);
    const tokenIds = (availableTokenIds || []).slice(0, requestedQty);

    if (tokenIds.length === 0) {
      alert("Không tìm thấy tokenId phù hợp để chuyển.");
      return;
    }

    setButtonAnimating(true);
    setButtonDone(false);
    setShowBlockchainView(false);

    try {
      const response = await createTransferToDistributor({
        productionId: selectedProduction._id,
        distributorId: formData.distributorId,
        tokenIds,
        amounts: tokenIds.map(() => 1),
        notes: formData.notes || "",
      });

      if (response.data.success) {
        const { invoice, distributorAddress } = response.data.data || {};

        if (invoice && distributorAddress) {
          setShowBlockchainView(true);
          handleBlockchainTransfer(invoice, distributorAddress, tokenIds);
        } else {
          setButtonAnimating(false);
          alert("✅ Tạo yêu cầu chuyển giao thành công!");
          setShowDialog(false);
          setAvailableTokenIds([]);
          loadData();
        }
      }
    } catch (error) {
      console.error("Lỗi khi tạo chuyển giao:", error);
      alert(
        "❌ Không thể tạo chuyển giao: " +
          (error.response?.data?.message || error.message)
      );
      setButtonAnimating(false);
      setShowBlockchainView(false);
    }
  };

  // FIX: Cleanup interval properly
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
        alert(
          "Ví đang kết nối không khớp với ví của manufacturer.\nVui lòng chuyển sang: " +
            user.walletAddress
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

      await saveTransferTransaction({
        invoiceId: invoice._id,
        transactionHash: onchain.transactionHash,
        tokenIds,
      });

      setTransferProgress(1);
      setTransferStatus("completed");
      setButtonDone(true);
      setButtonAnimating(false);

      setTimeout(() => {
        setButtonDone(false);
        setShowBlockchainView(false);
        setShowDialog(false);
        setAvailableTokenIds([]);
        setTransferProgress(0);
        setTransferStatus("minting");
        loadData();
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

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={loadingProgress} showTrack />
          </div>
          <div className="text-lg text-slate-600 mt-6">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Banner */}
          <div className="bg-white rounded-xl border border-card-primary shadow-sm p-5 mb-6">
            <h1 className="text-xl font-semibold text-[#007b91] flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7h18M5 10h14M4 14h16M6 18h12"
                />
              </svg>
              Chuyển giao cho nhà phân phối
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Chọn lô sản xuất và distributor để chuyển quyền sở hữu NFT
            </p>
          </div>

          {/* Instructions */}
          <div className="rounded-2xl bg-white border border-card-primary shadow-sm p-6 mb-5">
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
                    Chọn lô sản xuất & Distributor
                  </div>
                  <div className="text-sm text-slate-600">
                    Chọn NFT cần chuyển và nhà phân phối nhận hàng
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  <div className="font-semibold text-slate-800">
                    Xác nhận trên hệ thống
                  </div>
                  <div className="text-sm text-slate-600">
                    Lưu vào database với trạng thái "pending"
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
                    Transfer NFT qua Smart Contract
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Productions Table */}
          <div className="bg-white rounded-2xl border border-card-primary shadow-sm overflow-hidden">
            {productions.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 mb-3 opacity-60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7h18M5 10h14M4 14h16M6 18h12"
                  />
                </svg>
                <p className="text-gray-500 text-sm">Không có dữ liệu</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Thuốc
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Số lô
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Số lượng NFT
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Ngày SX
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        HSD
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productions.map((prod, index) => (
                      <tr
                        key={prod._id || index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-gray-800">
                          {prod.drug?.tradeName || "N/A"}
                          <div className="text-xs text-slate-500">
                            {prod.drug?.atcCode}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100">
                            {prod.batchNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          <span className="font-semibold text-gray-800">
                            {prod.quantity}
                          </span>
                          <span className="text-xs text-slate-500 ml-1">
                            NFT
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {formatDate(prod.mfgDate)}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {formatDate(prod.expDate)}
                        </td>
                        <td className="px-6 py-4">
                          {prod.transferStatus === "transferred" ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                              Đã chuyển
                            </span>
                          ) : prod.transferStatus === "pending" ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
                              Chưa chuyển
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                              Không xác định
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleSelectProduction(prod)}
                            disabled={prod.transferStatus === "transferred"}
                            className={`px-4 py-2 border-2 rounded-full font-semibold transition-all duration-200 ${
                              prod.transferStatus === "transferred"
                                ? "border-gray-300 text-gray-400 cursor-not-allowed"
                                : "border-secondary !text-secondary hover:bg-secondary hover:!text-white hover:shadow-md hover:shadow-secondary/40"
                            }`}
                          >
                            {prod.transferStatus === "transferred"
                              ? "Đã chuyển"
                              : "Chuyển giao"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Blockchain Animation Overlay */}
      {showDialog && showBlockchainView && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-5xl px-4 flex justify-center">
            <BlockchainTransferView
              status={transferStatus}
              progress={transferProgress}
              onClose={() => {
                setShowBlockchainView(false);
                setTransferProgress(0);
                setTransferStatus("minting");
                setButtonAnimating(false);
                setButtonDone(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Transfer Dialog */}
      {showDialog && selectedProduction && !showBlockchainView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scroll">
            <style>{`
              /* Ẩn scrollbar trong modal để giao diện sạch hơn */
              .custom-scroll { scrollbar-width: none; -ms-overflow-style: none; }
              .custom-scroll::-webkit-scrollbar { width: 0; height: 0; }
              .custom-scroll::-webkit-scrollbar-track { background: transparent; }
              .custom-scroll::-webkit-scrollbar-thumb { background: transparent; }
            `}</style>

            <div className="bg-linear-to-r from-secondary to-primary px-8 py-6 rounded-t-3xl flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Chuyển giao NFT
                </h2>
                <p className="text-cyan-100 text-sm">
                  Chọn distributor và số lượng
                </p>
              </div>
              <button
                onClick={() => setShowDialog(false)}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-xl transition"
              >
                ✕
              </button>
            </div>

            <div className="p-8 space-y-4">
              {/* Production Info */}
              <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                <div className="font-bold text-cyan-800 mb-3">
                  Thông tin lô sản xuất:
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Thuốc:</span>
                    <span className="font-medium">
                      {selectedProduction.drug?.tradeName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Số lô:</span>
                    <span className="font-mono font-medium">
                      {selectedProduction.batchNumber || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tổng số NFT:</span>
                    <span className="font-bold text-orange-700">
                      {selectedProduction.quantity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">IPFS Hash:</span>
                    <span className="font-mono text-xs text-slate-700">
                      {selectedProduction.ipfsHash?.slice(0, 20)}...
                    </span>
                  </div>
                </div>
              </div>

              {/* Loading Tokens Indicator */}
              {loadingTokens && (
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                  <div className="text-sm text-blue-700 flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang tải danh sách token khả dụng...
                  </div>
                </div>
              )}

              {/* Select Distributor */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Chọn nhà phân phối *
                </label>
                <select
                  value={formData.distributorId}
                  onChange={(e) =>
                    setFormData({ ...formData, distributorId: e.target.value })
                  }
                  className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition-all duration-150"
                  disabled={loadingTokens}
                >
                  <option value="">-- Chọn distributor --</option>
                  {safeDistributors.map((dist) => (
                    <option key={dist._id} value={dist._id}>
                      {dist.name} ({dist.taxCode})
                    </option>
                  ))}
                </select>
              </div>

              {selectedDistributor && (
                <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                  <div className="text-sm font-semibold text-cyan-800 mb-2">
                    Thông tin distributor:
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-600">Tên:</span>{" "}
                      <span className="font-medium">
                        {selectedDistributor.name || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Mã số thuế:</span>{" "}
                      <span className="font-medium">
                        {selectedDistributor.taxCode || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Quốc gia:</span>{" "}
                      <span className="font-medium">
                        {selectedDistributor.country || "N/A"}
                      </span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-slate-600">Địa chỉ:</span>{" "}
                      <span className="font-medium">
                        {selectedDistributor.address || "N/A"}
                      </span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-slate-600">Wallet:</span>{" "}
                      <span className="font-mono text-xs break-all">
                        {selectedDistributor.walletAddress ||
                          selectedDistributor.user?.walletAddress ||
                          "Chưa có"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Số lượng NFT *
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition-all duration-150"
                  placeholder="Nhập số lượng"
                  min="1"
                  max={selectedProduction.quantity}
                  disabled={loadingTokens}
                />
                <div className="text-xs text-cyan-600 mt-1">
                  Tối đa: {selectedProduction.quantity} NFT{" "}
                  {availableTokenIds.length > 0 && (
                    <span>({availableTokenIds.length} khả dụng)</span>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Ghi chú
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition-all duration-150"
                  rows="3"
                  placeholder="Ghi chú về đơn chuyển giao..."
                  disabled={loadingTokens}
                />
              </div>

              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <div className="text-sm text-yellow-800">
                  Sau khi xác nhận, hệ thống sẽ tạo yêu cầu chuyển giao và gọi
                  smart contract để transfer NFT.
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl flex justify-end">
              <TruckAnimationButton
                onClick={handleSubmit}
                disabled={loadingTokens || buttonAnimating}
                buttonState={
                  buttonDone
                    ? "completed"
                    : buttonAnimating
                    ? "uploading"
                    : "idle"
                }
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
    </DashboardLayout>
  );
}
