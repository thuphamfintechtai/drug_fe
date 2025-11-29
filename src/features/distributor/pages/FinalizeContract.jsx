import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import { navigationItems } from "../constants/navigationItems";
import { Button, Spin, Descriptions, Tag, Alert } from "antd";
import { CardUI } from "../../shared/components/ui/cardUI";
import { useDistributorContractDetail, useFinalizeContractAndMint } from "../apis/contract";
import { signMessageWithMetaMask, finalizeDistributorPharmacyContract } from "../../utils/web3Helper";
import { toast } from "sonner";
import { contractStatusColor, contractStatusLabel } from "../hooks/useContracts";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/api";

export default function FinalizeContract() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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

  const { mutateAsync: finalizeContract } =
    useFinalizeContractAndMint();

  const rawContract =
    contractResponse?.data?.data ||
    contractResponse?.data ||
    null;

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

  const {
    data: pharmaciesResponse,
    isLoading: loadingPharmacies,
  } = useQuery({
    queryKey: ["pharmaciesForFinalize"],
    queryFn: async () => {
      const response = await api.get("/distributor/pharmacies");
      return response.data;
    },
    enabled: !!contract && !contract.pharmacyWalletAddress,
  });

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
        throw new Error("Không tìm thấy địa chỉ ví của Pharmacy trong hợp đồng");
      }

      // Step 3: Finalize contract and mint NFT on blockchain
      toast.info("Đang finalize hợp đồng và mint NFT trên blockchain...", {
        position: "top-right",
        duration: 3000,
      });

      const blockchainResult = await finalizeDistributorPharmacyContract(pharmacyAddress);

      if (!blockchainResult.success) {
        throw new Error(blockchainResult.message || "Không thể finalize hợp đồng trên blockchain");
      }

      // Nếu contract đã được finalize trước đó, vẫn tiếp tục
      if (blockchainResult.alreadyFinalized) {
        console.log("⚠️ [handleFinalize] Contract đã được finalize trước đó, tiếp tục...");
      } else {
        toast.success("Finalize hợp đồng và mint NFT trên blockchain thành công!", {
          position: "top-right",
          duration: 2000,
        });
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
        <Alert
          message="Không tìm thấy hợp đồng"
          type="error"
          showIcon
        />
      </DashboardLayout>
    );
  }

  const canFinalize = contract.status === "approved";

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <CardUI
          title="Ký Hợp đồng & Mint NFT"
          subtitle="Xác nhận lần cuối và mint NFT hợp đồng trên blockchain"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-[#00a3c4]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="bg-white rounded-xl border border-card-primary shadow-sm p-8 max-w-3xl mx-auto"
      >
        {!canFinalize && (
          <Alert
            message="Không thể ký hợp đồng"
            description={
              contract.status === "pending"
                ? "Hợp đồng đang chờ Pharmacy xác nhận"
                : contract.status === "signed"
                ? "Hợp đồng đã được ký"
                : "Trạng thái hợp đồng không hợp lệ"
            }
            type="warning"
            showIcon
            className="mb-6"
          />
        )}

        <Descriptions title="Thông tin Hợp đồng" bordered column={1}>
          <Descriptions.Item label="Mã hợp đồng">
            <span className="font-mono text-sm">{contract._id}</span>
          </Descriptions.Item>
          
          <Descriptions.Item label="Tên file">
            {contract.contractFileName || "N/A"}
          </Descriptions.Item>

          <Descriptions.Item label="Nhà thuốc">
            {resolvedPharmacyName}
          </Descriptions.Item>

          <Descriptions.Item label="Trạng thái">
            <Tag color={contractStatusColor(contract.status)}>
              {contractStatusLabel(contract.status)}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Wallet Distributor">
            <span className="font-mono text-xs">
              {contract.distributorWalletAddress ||
                contract.distributorAddress ||
                "N/A"}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Wallet Pharmacy">
            <span className="font-mono text-xs">
              {resolvedPharmacyWallet || "N/A"}
            </span>
          </Descriptions.Item>

          {contract.pharmacySignedAt && (
            <Descriptions.Item label="Pharmacy đã ký lúc">
              {new Date(contract.pharmacySignedAt).toLocaleString("vi-VN")}
            </Descriptions.Item>
          )}

          {contract.tokenId && (
            <Descriptions.Item label="Token ID">
              <span className="font-mono font-bold text-green-600">
                #{contract.tokenId}
              </span>
            </Descriptions.Item>
          )}

          {contract.blockchainTxHash && (
            <Descriptions.Item label="Transaction Hash">
              <a
                href={`https://etherscan.io/tx/${contract.blockchainTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-mono text-xs"
              >
                {contract.blockchainTxHash}
              </a>
            </Descriptions.Item>
          )}

          {contract.createdAt && (
            <Descriptions.Item label="Ngày tạo">
              {new Date(contract.createdAt).toLocaleString("vi-VN")}
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* Info Box */}
        {canFinalize && (
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mt-6">
            <h4 className="font-semibold text-cyan-900 mb-2">
              Sẵn sàng ký hợp đồng
            </h4>
            <p className="text-sm text-cyan-800">
              Pharmacy đã xác nhận hợp đồng. Bạn có thể ký lần cuối để hoàn tất
              và mint NFT hợp đồng trên blockchain.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <Button
            type="default"
            size="large"
            onClick={() => navigate("/distributor/contracts")}
            className="flex-1"
          >
            Quay lại
          </Button>
          {canFinalize && (
            <Button
              type="primary"
              size="large"
              onClick={handleFinalize}
              loading={loading}
              className="flex-1 bg-[#00a3c4] hover:bg-[#007b91]"
            >
              Ký & Mint NFT
            </Button>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

