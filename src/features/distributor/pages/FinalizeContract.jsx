import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import { navigationItems } from "../constants/navigationItems";
import { Spin } from "antd";
import {
  useDistributorContractDetail,
  useFinalizeContractAndMint,
} from "../apis/contract";
import {
  signMessageWithMetaMask,
  finalizeDistributorPharmacyContract,
} from "../../utils/web3Helper";
import { toast } from "sonner";
import {
  contractStatusColor,
  contractStatusLabel,
} from "../hooks/useContracts";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/api";
import { useAuth } from "../../shared/context/AuthContext";

export default function FinalizeContract() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const { data: contractResponse, isLoading: loadingContract } =
    useDistributorContractDetail(contractId);

  const { mutateAsync: finalizeContract } = useFinalizeContractAndMint();

  const rawContract =
    contractResponse?.data?.data || contractResponse?.data || null;

  const contract = rawContract
    ? {
        ...rawContract,
        _id: rawContract._id || rawContract.id || contractId,
        pharmacyId:
          rawContract.pharmacyId ||
          rawContract.pharmacy?._id ||
          rawContract.pharmacy?.id ||
          null,
        pharmacyWalletAddress:
          rawContract.pharmacyWalletAddress ||
          rawContract.pharmacyAddress ||
          rawContract.pharmacyWallet ||
          null,
        pharmacyName:
          rawContract.pharmacy?.businessName ||
          rawContract.pharmacy?.name ||
          rawContract.pharmacyName ||
          rawContract.pharmacyId ||
          "N/A",
      }
    : null;

  const { data: pharmaciesResponse } = useQuery({
    queryKey: ["pharmaciesForFinalize"],
    queryFn: async () => {
      const response = await api.get("/distributor/pharmacies");
      return response.data;
    },
    enabled: true,
  });

  const pharmacies = pharmaciesResponse?.data?.pharmacies || [];

  const fallbackPharmacyInfo = useMemo(() => {
    if (!contract || contract.pharmacyWalletAddress) {
      return null;
    }
    const pharmacies = pharmaciesResponse?.data?.pharmacies || [];
    return (
      pharmacies.find(
        (item) =>
          item._id === contract.pharmacyId ||
          item.id === contract.pharmacyId ||
          item._id === contract.pharmacyName
      ) || null
    );
  }, [contract, pharmaciesResponse]);

  const resolvedPharmacyWallet =
    contract?.pharmacyWalletAddress ||
    fallbackPharmacyInfo?.walletAddress ||
    fallbackPharmacyInfo?.wallet ||
    null;

  const resolvedPharmacyName =
    contract?.pharmacyName ||
    fallbackPharmacyInfo?.businessName ||
    fallbackPharmacyInfo?.name ||
    fallbackPharmacyInfo?._id ||
    "N/A";

  const resolvedDistributorWallet =
    contract?.distributorWalletAddress ||
    contract?.distributorAddress ||
    user?.walletAddress ||
    user?.distributor?.walletAddress ||
    null;

  const handleFinalize = async () => {
    try {
      setLoading(true);

      // Step 1: Get MetaMask signature
      const signatureResult = await signMessageWithMetaMask(
        "Ký hợp đồng lần cuối và Mint NFT"
      );

      if (!signatureResult || !signatureResult.signature) {
        throw new Error("Không thể lấy chữ ký từ MetaMask");
      }

      // Step 2: Resolve pharmacy address
      const pharmacyAddress = resolvedPharmacyWallet;
      if (!pharmacyAddress) {
        throw new Error(
          "Không tìm thấy địa chỉ ví của Pharmacy trong hợp đồng"
        );
      }

      // Step 3: Finalize contract and mint NFT on blockchain
      toast.info("Đang finalize hợp đồng và mint NFT trên blockchain...", {
        position: "top-right",
        duration: 3000,
      });

      const blockchainResult = await finalizeDistributorPharmacyContract(
        pharmacyAddress
      );

      if (!blockchainResult.success) {
        throw new Error(
          blockchainResult.message ||
            "Không thể finalize hợp đồng trên blockchain"
        );
      }

      // Nếu contract đã được finalize trước đó, vẫn tiếp tục
      if (blockchainResult.alreadyFinalized) {
        console.log(
          "⚠️ [handleFinalize] Contract đã được finalize trước đó, tiếp tục..."
        );
      } else {
        toast.success(
          "Finalize hợp đồng và mint NFT trên blockchain thành công!",
          {
            position: "top-right",
            duration: 2000,
          }
        );
      }

      // Step 4: Call API to save transaction and tokenId
      const result = await finalizeContract({
        contractId: contractId,
        pharmacyAddress: pharmacyAddress,
        tokenId: blockchainResult.tokenId,
        transactionHash: blockchainResult.transactionHash,
        distributorPrivateKey: null, // Không cần private key
      });

      toast.success("Ký hợp đồng và Mint NFT thành công!");
      navigate("/distributor/contracts");
    } catch (error) {
      console.error("Error finalizing contract:", error);
      toast.error(error.message || "Lỗi khi ký hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  if (loadingContract) {
    return (
      <DashboardLayout navigationItems={navigationItems}>
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!contract) {
    return (
      <DashboardLayout navigationItems={navigationItems}>
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 w-full">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg
                className="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-red-900 mb-1">
                Không tìm thấy hợp đồng
              </h3>
              <p className="text-sm text-red-800">
                Vui lòng kiểm tra lại mã hợp đồng hoặc quay lại danh sách hợp
                đồng.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const canFinalize = contract.status === "approved";

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <div className="space-y-6">
        {/* Banner */}
        <motion.section
          className="relative overflow-hidden rounded-2xl mb-6 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-r from-primary to-secondary"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative px-6 py-8 md:px-10 md:py-12 !text-white">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm mb-2">
                  Ký Hợp đồng & Mint NFT
                </h1>
                <p className="!text-white/90">
                  Xác nhận lần cuối và mint NFT hợp đồng trên blockchain
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 w-full"
        >
          {!canFinalize && (
            <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg
                    className="w-5 h-5 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-900 mb-1">
                    Không thể ký hợp đồng
                  </h4>
                  <p className="text-sm text-yellow-800">
                    {contract.status === "pending"
                      ? "Hợp đồng đang chờ Pharmacy xác nhận"
                      : contract.status === "signed"
                      ? "Hợp đồng đã được ký"
                      : "Trạng thái hợp đồng không hợp lệ"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Contract Info Card */}
          <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl border-2 border-slate-200 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-primary to-secondary px-6 py-4 border-b border-primary/20">
              <h2 className="text-lg font-semibold !text-white flex items-center gap-2">
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
                Thông tin Hợp đồng
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-slate-100">
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                    Mã hợp đồng
                  </div>
                  <div className="text-base text-slate-800 font-mono flex-1">
                    {contract._id}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-slate-100">
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                    Tên file
                  </div>
                  <div className="text-base text-slate-800 flex-1">
                    {contract.contractFileName || "N/A"}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-slate-100">
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                    Nhà thuốc
                  </div>
                  <div className="text-base text-slate-800 flex-1">
                    {resolvedPharmacyName}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-slate-100">
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                    Trạng thái
                  </div>
                  <div className="flex-1">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        contractStatusColor(contract.status) === "green"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : contractStatusColor(contract.status) === "blue"
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : contractStatusColor(contract.status) === "orange"
                          ? "bg-orange-100 text-orange-700 border border-orange-200"
                          : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                      }`}
                    >
                      {contractStatusLabel(contract.status)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start py-3 border-b border-slate-100">
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0 sm:pt-1">
                    Wallet Distributor
                  </div>
                  <div className="text-sm text-slate-800 font-mono break-all flex-1">
                    {resolvedDistributorWallet || "N/A"}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start py-3 border-b border-slate-100">
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0 sm:pt-1">
                    Wallet Pharmacy
                  </div>
                  <div className="text-sm text-slate-800 font-mono break-all flex-1">
                    {resolvedPharmacyWallet || "N/A"}
                  </div>
                </div>

                {contract.pharmacySignedAt && (
                  <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-slate-100">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                      Pharmacy đã ký lúc
                    </div>
                    <div className="text-base text-slate-800 flex-1">
                      {new Date(contract.pharmacySignedAt).toLocaleString(
                        "vi-VN"
                      )}
                    </div>
                  </div>
                )}

                {contract.tokenId && (
                  <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-slate-100">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                      Token ID
                    </div>
                    <div className="flex-1">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg font-mono font-bold text-green-700 bg-green-50 border border-green-200">
                        #{contract.tokenId}
                      </span>
                    </div>
                  </div>
                )}

                {contract.blockchainTxHash && (
                  <div className="flex flex-col sm:flex-row sm:items-start py-3 border-b border-slate-100">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0 sm:pt-1">
                      Transaction Hash
                    </div>
                    <div className="text-sm text-slate-800 font-mono break-all flex-1">
                      <a
                        href={`https://sepolia.etherscan.io/tx/${contract.blockchainTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-secondary hover:underline"
                      >
                        {contract.blockchainTxHash}
                      </a>
                    </div>
                  </div>
                )}

                {contract.createdAt && (
                  <div className="flex flex-col sm:flex-row sm:items-center py-3">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide w-full sm:w-40 shrink-0 mb-1 sm:mb-0">
                      Ngày tạo
                    </div>
                    <div className="text-sm text-slate-800 flex-1">
                      {new Date(contract.createdAt).toLocaleString("vi-VN")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pharmacies List */}
          {pharmacies.length > 0 && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 w-full mb-6"
            >
              <div className="bg-gradient-to-r from-primary to-secondary px-6 py-4 border-b border-primary/20 -m-8 mb-6 rounded-t-2xl">
                <h2 className="text-lg font-semibold !text-white flex items-center gap-2">
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Danh sách Nhà thuốc ({pharmacies.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pharmacies.map((pharmacy) => (
                  <div
                    key={pharmacy._id}
                    className="bg-gradient-to-br from-slate-50 to-white rounded-xl border-2 border-slate-200 p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-slate-800 mb-1">
                          {pharmacy.name || pharmacy.user?.username || "N/A"}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {pharmacy.contactEmail || pharmacy.user?.email || ""}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                        {pharmacy.status || "active"}
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-medium">
                          Wallet:
                        </span>
                        <span className="font-mono text-slate-700 break-all">
                          {pharmacy.walletAddress ||
                            pharmacy.user?.walletAddress ||
                            "N/A"}
                        </span>
                      </div>
                      {pharmacy.licenseNo && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-medium">
                            License:
                          </span>
                          <span className="text-slate-700">
                            {pharmacy.licenseNo}
                          </span>
                        </div>
                      )}
                      {pharmacy.contactPhone && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-medium">
                            Phone:
                          </span>
                          <span className="text-slate-700">
                            {pharmacy.contactPhone}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Info Box */}
          {canFinalize && (
            <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 border-2 border-emerald-200 rounded-xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-emerald-900 mb-2 text-lg">
                    Sẵn sàng ký hợp đồng
                  </h4>
                  <p className="text-sm text-emerald-800 leading-relaxed">
                    Pharmacy đã xác nhận hợp đồng. Bạn có thể ký lần cuối để
                    hoàn tất và mint NFT hợp đồng trên blockchain.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => navigate("/distributor/contracts")}
              className="flex-1 px-6 py-3.5 rounded-xl bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Quay lại
            </button>
            {canFinalize && (
              <button
                type="button"
                onClick={handleFinalize}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-primary via-secondary to-primary hover:from-secondary hover:via-primary hover:to-secondary shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 relative z-10"
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span className="relative z-10">Đang xử lý...</span>
                  </>
                ) : (
                  <span className="flex items-center gap-2 relative z-10">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span>Ký & Mint NFT</span>
                  </span>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
