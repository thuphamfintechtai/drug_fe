import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import { navigationItems } from "../constants/navigationItems";
import { Button, Spin, Descriptions, Tag, Alert } from "antd";
import { CardUI } from "../../shared/components/ui/cardUI";
import { usePharmacyContractDetail, useConfirmContract } from "../../distributor/apis/contract";
import { signMessageWithMetaMask } from "../../utils/web3Helper";
import { toast } from "sonner";
import { contractStatusColor, contractStatusLabel } from "../hooks/useContracts";

export default function ConfirmContract() {
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
    usePharmacyContractDetail(contractId);

  const { mutateAsync: confirmContract } =
    useConfirmContract();

  const contract = contractResponse?.data?.data;

  const handleConfirm = async () => {
    try {
      setLoading(true);

      // Step 1: Get MetaMask signature
      const signature = await signMessageWithMetaMask(
        "Xác nhận hợp đồng với nhà phân phối"
      );

      if (!signature || !signature.privateKey) {
        throw new Error("Không thể lấy chữ ký từ MetaMask");
      }

      // Step 2: Confirm contract
      const result = await confirmContract({
        contractId: contractId,
        distributorAddress: contract.distributorWalletAddress,
        pharmacyPrivateKey: signature.privateKey,
      });

      toast.success("Xác nhận hợp đồng thành công!");
      navigate("/pharmacy/contracts");
    } catch (error) {
      console.error("Error confirming contract:", error);
      toast.error(error.message || "Lỗi khi xác nhận hợp đồng");
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

  const canConfirm = contract.status === "pending";

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <CardUI
          title="Xác nhận Hợp đồng"
          subtitle="Xem xét và xác nhận hợp đồng từ nhà phân phối"
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
        {!canConfirm && (
          <Alert
            message="Không thể xác nhận hợp đồng"
            description={
              contract.status === "approved"
                ? "Hợp đồng đã được xác nhận. Đang chờ Distributor ký lần cuối."
                : contract.status === "signed"
                ? "Hợp đồng đã hoàn tất"
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

          <Descriptions.Item label="File hợp đồng">
            {contract.contractFileUrl ? (
              <a
                href={contract.contractFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                📄 Xem file hợp đồng
              </a>
            ) : (
              "N/A"
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Nhà phân phối">
            {contract.distributor?.businessName || contract.distributor?.name || "N/A"}
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
        {canConfirm && (
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mt-6">
            <h4 className="font-semibold text-cyan-900 mb-2">
              Xác nhận hợp đồng
            </h4>
            <p className="text-sm text-cyan-800 mb-2">
              Vui lòng xem xét kỹ nội dung hợp đồng trước khi xác nhận.
            </p>
            <p className="text-sm text-cyan-800">
              Sau khi bạn xác nhận, Distributor sẽ ký lần cuối và mint NFT hợp đồng trên blockchain.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <Button
            type="default"
            size="large"
            onClick={() => navigate("/pharmacy/contracts")}
            className="flex-1"
          >
            Quay lại
          </Button>
          {canConfirm && (
            <Button
              type="primary"
              size="large"
              onClick={handleConfirm}
              loading={loading}
              className="flex-1 bg-[#00a3c4] hover:bg-[#007b91]"
            >
              Xác nhận & Ký
            </Button>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

