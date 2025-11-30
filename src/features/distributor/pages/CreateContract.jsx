/* eslint-disable no-undef */
import { useState } from "react";
import DashboardLayout from "../../shared/components/DashboardLayout";
import { navigationItems } from "../constants/navigationItems";
import { Form, Select, Button, Upload, message, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useCreateContractRequest } from "../apis/contract";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
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

  const { mutateAsync: createContract } = useCreateContractRequest();

  // Get list of pharmacies
  const { data: pharmaciesResponse, isLoading: loadingPharmacies } = useQuery({
    queryKey: ["pharmaciesList"],
    queryFn: async () => {
      const response = await api.get("/distributor/pharmacies/available");
      return response.data;
    },
  });

  const pharmacies =
    pharmaciesResponse?.data?.pharmacies ||
    pharmaciesResponse?.pharmacies ||
    [];

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
        selectedPharmacy.user?.walletAddress ||
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm mb-2">
                  Tạo Yêu cầu Hợp đồng
                </h1>
                <p className="!text-white/90">
                  Upload hợp đồng và chọn nhà thuốc để gửi yêu cầu ký hợp đồng
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 max-w-3xl mx-auto"
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
                label={
                  <span className="text-sm font-semibold text-slate-700">
                    Chọn Nhà thuốc
                  </span>
                }
                name="pharmacyId"
                rules={[{ required: true, message: "Vui lòng chọn nhà thuốc" }]}
              >
                <Select
                  placeholder="Chọn nhà thuốc"
                  size="large"
                  loading={loadingPharmacies}
                  showSearch
                  className="rounded-xl"
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
                label={
                  <span className="text-sm font-semibold text-slate-700">
                    Upload Hợp đồng (PDF/Word)
                  </span>
                }
                required
                help={
                  <span className="text-xs text-slate-500">
                    Chỉ chấp nhận file PDF hoặc Word (DOC, DOCX)
                  </span>
                }
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
                  className="w-full"
                >
                  <Button
                    icon={<UploadOutlined />}
                    size="large"
                    block
                    className="h-12 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <span className="font-semibold">Chọn file hợp đồng</span>
                  </Button>
                </Upload>
              </Form.Item>

              {/* Info Box */}
              <div className=" border-2 border-secondary rounded-xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-secondary rounded-lg">
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
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-primary mb-3 text-lg">
                      Quy trình ký hợp đồng
                    </h4>
                    <ol className="space-y-2.5 text-sm text-slate-700">
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center text-xs font-bold">
                          1
                        </span>
                        <span>
                          Distributor upload hợp đồng và ký bằng MetaMask
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center text-xs font-bold">
                          2
                        </span>
                        <span>Pharmacy nhận và xem xét hợp đồng</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center text-xs font-bold">
                          3
                        </span>
                        <span>Pharmacy xác nhận và ký bằng MetaMask</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center text-xs font-bold">
                          4
                        </span>
                        <span>
                          Distributor ký lần cuối và Mint NFT hợp đồng
                        </span>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate("/distributor/contracts");
                  }}
                  className="flex-1 px-6 py-3.5 rounded-xl bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold shadow-sm hover:shadow-md transition-all duration-200 relative z-10 hover:scale-[1.02] active:scale-[0.98] cursor-pointer w-full flex items-center justify-center"
                >
                  <span>Hủy</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-primary via-secondary to-primary hover:from-secondary hover:via-primary hover:to-secondary shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative z-10 overflow-hidden group"
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
                    <span className="flex items-center gap-2 !text-white">
                      <svg
                        className="w-5 h-5 relative z-10"
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
                      <span className="relative z-10">Tạo yêu cầu & Ký</span>
                    </span>
                  )}
                </button>
              </div>
            </Form>
          </Spin>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
