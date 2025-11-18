import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import {
  useGetDrugsByManufacturerId,
  useGenerateNFTMetadata,
  useCreateProofOfProduction,
} from "../../hooks/react-query/manufacturer/use.manufacturer";
import {
  mintNFT,
  isMetaMaskInstalled,
  connectWallet,
} from "../../utils/web3Helper";
import { uploadMetadataToIPFS } from "../../utils/ipfsHelper";
import { getManufacturerNavigationItems } from "../../utils/manufacturerNavigation.jsx";

export default function CreateProofOfProduction() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: Metadata, 3: Minting, 4: Saving

  const [formData, setFormData] = useState({
    drugId: "",
    mfgDate: "",
    expDate: "",
    quantity: "",
    qaInspector: "",
    qaReportUri: "",
    remainFrom: 0,
  });

  const [nftMetadata, setNftMetadata] = useState(null);
  const [mintedNFT, setMintedNFT] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  // React Query hooks
  const {
    data: drugsData,
    isLoading: drugsLoading,
    error: drugsError,
  } = useGetDrugsByManufacturerId(user?._id);

  const generateMetadataMutation = useGenerateNFTMetadata();
  const createProofMutation = useCreateProofOfProduction();

  const drugs = drugsData?.data?.drugs || drugsData?.data || [];

  // Tự động tính ngày hết hạn khi có mfgDate + expiryValue + expiryUnit
  useEffect(() => {
    if (formData.mfgDate && formData.expiryValue && formData.expiryUnit) {
      const mfg = new Date(formData.mfgDate);
      const exp = new Date(mfg);
      const num = parseInt(formData.expiryValue);

      if (!isNaN(num) && num > 0) {
        if (formData.expiryUnit === "day") {
          exp.setDate(exp.getDate() + num);
        }
        if (formData.expiryUnit === "month") {
          exp.setMonth(exp.getMonth() + num);
        }
        if (formData.expiryUnit === "year") {
          exp.setFullYear(exp.getFullYear() + num);
        }
        setFormData((prev) => ({
          ...prev,
          expDate: exp.toISOString().split("T")[0],
        }));
      }
    }
  }, [formData.mfgDate, formData.expiryValue, formData.expiryUnit]);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (!isMetaMaskInstalled()) {
      return;
    }

    try {
      const result = await connectWallet();
      if (result.success) {
        setWalletConnected(true);
        setWalletAddress(result.address);
      }
    } catch (error) {
      console.log("Wallet not connected");
    }
  };

  const handleConnectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      alert("Vui lòng cài đặt MetaMask để tiếp tục!");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    try {
      setLoading(true);
      const result = await connectWallet();
      if (result.success) {
        setWalletConnected(true);
        setWalletAddress(result.address);
        alert("Kết nối ví thành công!");
      }
    } catch (error) {
      alert("Không thể kết nối ví: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStep1Submit = async () => {
    // Validate form
    if (
      !formData.drugId ||
      !formData.mfgDate ||
      !formData.expDate ||
      !formData.quantity
    ) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    if (new Date(formData.mfgDate) >= new Date(formData.expDate)) {
      alert("Ngày hết hạn phải sau ngày sản xuất!");
      return;
    }

    if (parseInt(formData.quantity) <= 0) {
      alert("Số lượng phải lớn hơn 0!");
      return;
    }

    try {
      setLoading(true);
      setStep(2);

      // Generate metadata from backend using React Query
      const metadataResponse = await generateMetadataMutation.mutateAsync({
        drugId: formData.drugId,
        mfgDate: formData.mfgDate,
        expDate: formData.expDate,
        quantity: formData.quantity,
        qaReportUri: formData.qaReportUri || undefined,
      });

      if (metadataResponse.success) {
        setNftMetadata(metadataResponse.data);
        console.log("✅ Metadata generated:", metadataResponse.data);
      } else {
        throw new Error("Không thể tạo metadata");
      }
    } catch (error) {
      console.error("Error generating metadata:", error);
      alert(
        "Không thể tạo metadata: " +
          (error.response?.data?.message || error.message)
      );
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleMintNFT = async () => {
    if (!walletConnected) {
      alert("Vui lòng kết nối ví MetaMask trước!");
      return;
    }

    try {
      setLoading(true);
      setStep(3);

      // Upload metadata to IPFS
      console.log("📤 Uploading metadata to IPFS...");
      const tokenURI = await uploadMetadataToIPFS(nftMetadata.metadata);
      console.log("✅ Token URI:", tokenURI);

      // Mint NFT on blockchain
      // Lưu ý: contract.mintNFT nhận số lượng (uint256[]), không phải tokenURI
      console.log("🎨 Minting NFT on blockchain...");
      const quantity = parseInt(formData.quantity) || 1;
      const mintResult = await mintNFT(quantity);
      console.log("✅ NFT Minted:", mintResult);

      setMintedNFT({
        tokenId: mintResult.tokenId,
        tokenURI: tokenURI,
        chainTxHash: mintResult.transactionHash,
        contractAddress: mintResult.contractAddress,
      });

      // Proceed to step 4 - save to backend
      setStep(4);
      await handleSaveToBackend(mintResult, tokenURI);
    } catch (error) {
      console.error("Error minting NFT:", error);
      alert("Không thể mint NFT: " + error.message);
      setStep(2);
      setLoading(false);
    }
  };

  const handleSaveToBackend = async (mintResult, tokenURI) => {
    try {
      console.log("💾 Saving to backend...");

      const proofData = {
        drugId: formData.drugId,
        mfgDate: formData.mfgDate,
        expDate: formData.expDate,
        quantity: parseInt(formData.quantity),
        qaInspector: formData.qaInspector || undefined,
        qaReportUri: formData.qaReportUri || undefined,
        remainFrom: parseInt(formData.remainFrom) || 0,
        // NFT info from blockchain
        tokenId: mintResult.tokenId,
        tokenURI: tokenURI,
        chainTxHash: mintResult.transactionHash,
      };

      const response = await createProofMutation.mutateAsync(proofData);

      if (response.success) {
        console.log("✅ Proof created successfully:", response.data);
        alert("✅ Tạo Proof of Production thành công!");
        navigate("/manufacturer/proofs");
      } else {
        throw new Error("Backend verification failed");
      }
    } catch (error) {
      console.error("Error saving to backend:", error);
      alert(
        "⚠️ NFT đã được mint nhưng không thể lưu vào hệ thống: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const navigationItems = getManufacturerNavigationItems(location.pathname);

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🏭</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Tạo Proof of Production
              </h1>
              <p className="text-sm text-gray-500">
                Tạo chứng nhận sản xuất và mint NFT
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-6">
            {[
              { num: 1, label: "Thông tin" },
              { num: 2, label: "Metadata" },
              { num: 3, label: "Mint NFT" },
              { num: 4, label: "Hoàn tất" },
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                      step >= s.num
                        ? "bg-gradient-to-br from-cyan-500 to-teal-600 !text-white shadow-lg"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > s.num ? "✓" : s.num}
                  </div>
                  <span
                    className={`text-sm mt-2 font-medium ${
                      step >= s.num ? "text-cyan-600" : "text-gray-500"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                      step > s.num
                        ? "bg-gradient-to-r from-cyan-500 to-teal-600"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 1: Form */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              📋 Thông tin sản xuất
            </h2>

            <div className="space-y-4">
              {/* Chọn thuốc */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Chọn thuốc <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.drugId}
                  onChange={(e) =>
                    setFormData({ ...formData, drugId: e.target.value })
                  }
                  className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500"
                  disabled={drugsLoading}
                >
                  <option value="">-- Chọn thuốc --</option>
                  {drugsLoading ? (
                    <option value="">Đang tải...</option>
                  ) : drugsError ? (
                    <option value="">Lỗi khi tải danh sách thuốc</option>
                  ) : (
                    drugs.map((drug) => (
                      <option key={drug._id} value={drug._id}>
                        {drug.tradeName} ({drug.genericName}) - {drug.atcCode}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Ngày sản xuất + Thời hạn sử dụng */}
              <div className="grid grid-cols-2 gap-4">
                {/* Ngày sản xuất */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ngày sản xuất <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.mfgDate}
                    onChange={(e) =>
                      setFormData({ ...formData, mfgDate: e.target.value })
                    }
                    className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Thời hạn sử dụng (auto expDate) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Thời hạn sử dụng
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Nhập số"
                      value={formData.expiryValue || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          expiryValue: e.target.value,
                        })
                      }
                      className="flex-1 border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500"
                    />
                    <select
                      value={formData.expiryUnit || "year"}
                      onChange={(e) =>
                        setFormData({ ...formData, expiryUnit: e.target.value })
                      }
                      className="w-[45%] border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="year">Năm</option>
                      <option value="month">Tháng</option>
                      <option value="day">Ngày</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Ngày hết hạn (readonly) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ngày hết hạn <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.expDate}
                  readOnly
                  className="w-full border-2 border-cyan-300 rounded-xl p-3 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Số lượng + QA */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số lượng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500"
                    placeholder="Số lượng sản xuất"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kiểm định viên (ID người dùng - tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={formData.qaInspector}
                    onChange={(e) =>
                      setFormData({ ...formData, qaInspector: e.target.value })
                    }
                    className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500"
                    placeholder="Để trống nếu không bắt buộc"
                  />
                </div>
              </div>

              {/* Báo cáo QA */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Báo cáo QA (URL)
                </label>
                <input
                  type="text"
                  value={formData.qaReportUri}
                  onChange={(e) =>
                    setFormData({ ...formData, qaReportUri: e.target.value })
                  }
                  className="w-full border-2 border-cyan-300 rounded-xl p-3 focus:ring-2 focus:ring-cyan-500"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleStep1Submit}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 !text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {loading ? "Đang tạo metadata..." : "Tiếp tục →"}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Metadata Preview */}
        {step === 2 && nftMetadata && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              🎨 Xem trước NFT Metadata
            </h2>

            <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-lg text-gray-800 mb-4">
                {nftMetadata.metadata.name}
              </h3>
              <p className="text-gray-700 mb-4">
                {nftMetadata.metadata.description}
              </p>

              <div className="grid grid-cols-2 gap-3">
                {nftMetadata.metadata.attributes.map((attr, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">
                      {attr.trait_type}
                    </div>
                    <div className="font-semibold text-gray-800">
                      {attr.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wallet Connection */}
            {!walletConnected ? (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🔐</span>
                  <div>
                    <h3 className="font-bold text-amber-900">
                      Kết nối ví MetaMask
                    </h3>
                    <p className="text-sm text-amber-700">
                      Cần kết nối ví để mint NFT
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleConnectWallet}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 !text-white rounded-xl font-semibold shadow-lg"
                >
                  {loading ? "Đang kết nối..." : "🦊 Kết nối MetaMask"}
                </button>
              </div>
            ) : (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  <div>
                    <div className="font-semibold text-green-900">
                      Đã kết nối ví
                    </div>
                    <div className="text-sm text-green-700 font-mono">
                      {walletAddress}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
              >
                ← Quay lại
              </button>
              <button
                onClick={handleMintNFT}
                disabled={!walletConnected || loading}
                className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 !text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                🎨 Mint NFT
              </button>
            </div>
          </div>
        )}

        {/* Step 3 & 4: Processing */}
        {(step === 3 || step === 4) && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <span className="text-5xl">{step === 3 ? "🎨" : "💾"}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {step === 3 ? "Đang mint NFT..." : "Đang lưu thông tin..."}
              </h2>
              <p className="text-gray-600 mb-6">
                {step === 3
                  ? "Vui lòng xác nhận giao dịch trong MetaMask"
                  : "Đang xác thực và lưu vào hệ thống"}
              </p>
              <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
