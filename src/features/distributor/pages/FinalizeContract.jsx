import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import { navigationItems } from "../constants/navigationItems";
import { Button, Spin, Descriptions, Tag, Alert } from "antd";
import { CardUI } from "../../shared/components/ui/cardUI";
import { useDistributorContractDetail, useFinalizeContractAndMint } from "../apis/contract";
import { signMessageWithMetaMask } from "../../utils/web3Helper";
import { toast } from "sonner";
import { contractStatusColor, contractStatusLabel } from "../hooks/useContracts";

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

  const contract = contractResponse?.data?.data;

  const handleFinalize = async () => {
    try {
      setLoading(true);

      // Step 1: Get MetaMask signature
      const signature = await signMessageWithMetaMask(
        "Ký hợp đồng lần cuối và Mint NFT"
      );

      if (!signature || !signature.privateKey) {
        throw new Error("Không thể lấy chữ ký từ MetaMask");
      }

      // Step 2: Finalize contract and mint NFT
      const result = await finalizeContract({
        contractId: contractId,
        pharmacyAddress: contract.pharmacyWalletAddress,
        distributorPrivateKey: signature.privateKey,
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
            {contract.pharmacy?.businessName || contract.pharmacy?.name || "N/A"}
          </Descriptions.Item>

          <Descriptions.Item label="Trạng thái">
            <Tag color={contractStatusColor(contract.status)}>
              {contractStatusLabel(contract.status)}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Wallet Distributor">
            <span className="font-mono text-xs">
              {contract.distributorWalletAddress}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Wallet Pharmacy">
            <span className="font-mono text-xs">
              {contract.pharmacyWalletAddress}
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

          <Descriptions.Item label="Ngày tạo">
            {new Date(contract.createdAt).toLocaleString("vi-VN")}
          </Descriptions.Item>
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

