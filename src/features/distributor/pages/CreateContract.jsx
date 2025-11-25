import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import { navigationItems } from "../constants/navigationItems";
import { Form, Select, Button, Upload, message, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { CardUI } from "../../shared/components/ui/cardUI";
import { useNavigate } from "react-router-dom";
import { useCreateContractRequest } from "../apis/contract";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/api";
import {
  signMessageWithMetaMask,
  distributorCreateContractOnChain,
} from "../../utils/web3Helper";
import { toast } from "sonner";

export default function CreateContract() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const { mutateAsync: createContract } = useCreateContractRequest();

  // Get list of pharmacies
  const { data: pharmaciesResponse, isLoading: loadingPharmacies } = useQuery({
    queryKey: ["pharmaciesList"],
    queryFn: async () => {
      const response = await api.get("/distributor/pharmacies");
      return response.data;
    },
  });

  const pharmacies = pharmaciesResponse?.data?.pharmacies || [];

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const customUpload = async ({ file, onSuccess, onError }) => {
    try {
      // In a real app, you would upload to a file storage service (S3, Cloudinary, etc.)
      // For now, we'll simulate an upload
      const formData = new FormData();
      formData.append("file", file);

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In production, replace this with actual upload endpoint
      // const response = await api.post("/upload/contract", formData, {
      //   headers: { "Content-Type": "multipart/form-data" },
      // });
      
      // For now, create a fake URL
      const fakeUrl = `https://storage.example.com/contracts/${file.name}`;
      
      setUploadedFileUrl(fakeUrl);
      setUploadedFileName(file.name);
      
      onSuccess("ok");
      message.success(`${file.name} uploaded successfully`);
    } catch (error) {
      onError(error);
      message.error(`${file.name} upload failed.`);
    }
  };

  const handleSubmit = async (values) => {
    if (!uploadedFileUrl) {
      message.error("Vui lòng upload file hợp đồng");
      return;
    }

    try {
      setLoading(true);

      const selectedPharmacy = pharmacies.find(
        (pharmacy) =>
          pharmacy?._id === values.pharmacyId ||
          pharmacy?.id === values.pharmacyId ||
          pharmacy?.pharmacyId === values.pharmacyId
      );

      if (!selectedPharmacy) {
        throw new Error("Không tìm thấy thông tin nhà thuốc đã chọn");
      }

      const pharmacyWallet =
        selectedPharmacy.walletAddress ||
        selectedPharmacy.wallet ||
        selectedPharmacy.address;

      if (!pharmacyWallet) {
        throw new Error("Nhà thuốc chưa cấu hình địa chỉ ví");
      }

      // Step 1: Get MetaMask signature
      const signatureResult = await signMessageWithMetaMask(
        "Tạo yêu cầu hợp đồng với nhà thuốc"
      );

      if (!signatureResult || !signatureResult.signature) {
        throw new Error("Không thể lấy chữ ký từ MetaMask");
      }

      // Step 2: Tạo hợp đồng trên blockchain
      const blockchainResult = await distributorCreateContractOnChain(
        pharmacyWallet
      );

      // Step 3: Lưu thông tin hợp đồng vào backend
      const result = await createContract({
        pharmacyId: values.pharmacyId,
        contractFileUrl: uploadedFileUrl,
        contractFileName: uploadedFileName,
        distributorSignature: signatureResult.signature,
        distributorAddress: signatureResult.address,
        signedMessage: signatureResult.message,
        pharmacyAddress: pharmacyWallet,
        blockchainTxHash: blockchainResult.transactionHash,
        blockchainEvent: blockchainResult.event,
      });

      toast.success("Tạo yêu cầu hợp đồng thành công!");
      navigate("/distributor/contracts");
    } catch (error) {
      console.error("Error creating contract:", error);
      toast.error(error.message || "Lỗi khi tạo yêu cầu hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <CardUI
          title="Tạo Yêu cầu Hợp đồng"
          subtitle="Upload hợp đồng và chọn nhà thuốc để gửi yêu cầu ký hợp đồng"
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="bg-white rounded-xl border border-card-primary shadow-sm p-8 max-w-2xl mx-auto"
      >
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="space-y-6"
          >
            {/* Pharmacy Selection */}
            <Form.Item
              label="Chọn Nhà thuốc"
              name="pharmacyId"
              rules={[
                { required: true, message: "Vui lòng chọn nhà thuốc" },
              ]}
            >
              <Select
                placeholder="Chọn nhà thuốc"
                size="large"
                loading={loadingPharmacies}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={pharmacies.map((pharmacy) => ({
                  value: pharmacy._id,
                  label: pharmacy.businessName || pharmacy.name,
                }))}
              />
            </Form.Item>

            {/* File Upload */}
            <Form.Item
              label="Upload Hợp đồng (PDF/Word)"
              required
              help="Chỉ chấp nhận file PDF hoặc Word (DOC, DOCX)"
            >
              <Upload
                fileList={fileList}
                onChange={handleFileChange}
                customRequest={customUpload}
                accept=".pdf,.doc,.docx"
                maxCount={1}
                onRemove={() => {
                  setUploadedFileUrl(null);
                  setUploadedFileName(null);
                }}
              >
                <Button icon={<UploadOutlined />} size="large" block>
                  Chọn file hợp đồng
                </Button>
              </Upload>
            </Form.Item>

            {/* Info Box */}
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
              <h4 className="font-semibold text-cyan-900 mb-2">
                Quy trình ký hợp đồng
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-cyan-800">
                <li>Distributor upload hợp đồng và ký bằng MetaMask</li>
                <li>Pharmacy nhận và xem xét hợp đồng</li>
                <li>Pharmacy xác nhận và ký bằng MetaMask</li>
                <li>Distributor ký lần cuối và Mint NFT hợp đồng</li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="default"
                size="large"
                onClick={() => navigate("/distributor/contracts")}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                className="flex-1 bg-[#00a3c4] hover:bg-[#007b91]"
              >
                Tạo yêu cầu & Ký
              </Button>
            </div>
          </Form>
        </Spin>
      </motion.div>
    </DashboardLayout>
  );
}

