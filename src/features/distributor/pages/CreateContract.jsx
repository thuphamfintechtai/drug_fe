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
  const [selectedFile, setSelectedFile] = useState(null);

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

  const handleFileChange = ({ fileList: newFileList, file }) => {
    setFileList(newFileList);
    // Lưu file gốc để gửi lên server
    if (file && file.status !== "removed") {
      setSelectedFile(file.originFileObj || file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (values) => {
    if (!selectedFile) {
      message.error("Vui lòng chọn file hợp đồng");
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

      // Step 3: Tạo FormData để gửi multipart/form-data
      const formData = new FormData();
      formData.append("pharmacyId", values.pharmacyId);
      formData.append("file", selectedFile);
      // distributorPrivateKey là optional, có thể bỏ qua

      // Step 4: Gửi request với FormData
      const result = await createContract(formData);

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
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24"></div>
          </div>

          <div className="relative px-6 py-8 md:px-10 md:py-10 lg:py-12 flex flex-col items-center text-center">
            <div className="mb-3 flex items-center justify-center">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 md:w-10 md:h-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight drop-shadow-sm mb-3 !text-white">
              Tạo Yêu cầu Hợp đồng
            </h1>
            <p className="text-base md:text-lg !text-white/90 max-w-2xl leading-relaxed">
              Upload hợp đồng và chọn nhà thuốc để gửi yêu cầu ký hợp đồng
            </p>
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Form Section */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
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
                      Chọn Nhà thuốc <span className="text-red-500">*</span>
                    </span>
                  }
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
                    className="rounded-xl !h-14"
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
                      Upload Hợp đồng (PDF/Word){" "}
                      <span className="text-red-500">*</span>
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
                    accept=".pdf,.doc,.docx"
                    maxCount={1}
                    beforeUpload={() => false}
                    onRemove={() => {
                      setSelectedFile(null);
                    }}
                    className="w-full"
                  >
                    <Button
                      icon={<UploadOutlined />}
                      size="large"
                      block
                      className="h-14 rounded-xl border-2 border-dashed border-slate-300 hover:border-primary hover:bg-primary/5 transition-all font-semibold"
                    >
                      <span>Chọn file hợp đồng</span>
                    </Button>
                  </Upload>
                </Form.Item>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate("/distributor/contracts");
                    }}
                    className="w-full sm:flex-1 px-6 py-3 rounded-xl bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
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
                      <>
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
                      </>
                    )}
                  </button>
                </div>
              </Form>
            </Spin>
          </div>

          {/* Info Box Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 border-2 border-primary/20 rounded-xl p-5 md:p-6 h-full sticky top-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl shrink-0">
                    <svg
                      className="w-6 h-6 text-white"
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
                  <h4 className="font-bold text-slate-800 text-lg">
                    Quy trình ký hợp đồng
                  </h4>
                </div>
                <ol className="space-y-4 text-sm text-slate-700">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-xs font-bold shadow-md">
                      1
                    </span>
                    <span className="pt-1.5">
                      Distributor upload hợp đồng và ký bằng MetaMask
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-xs font-bold shadow-md">
                      2
                    </span>
                    <span className="pt-1.5">
                      Pharmacy nhận và xem xét hợp đồng
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-xs font-bold shadow-md">
                      3
                    </span>
                    <span className="pt-1.5">
                      Pharmacy xác nhận và ký bằng MetaMask
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-xs font-bold shadow-md">
                      4
                    </span>
                    <span className="pt-1.5">
                      Distributor ký lần cuối và Mint NFT hợp đồng
                    </span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
