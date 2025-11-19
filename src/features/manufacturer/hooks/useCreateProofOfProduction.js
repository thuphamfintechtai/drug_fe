import { useState, useEffect } from "react";
import { useAuth } from "../../shared/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { manufacturerAPIs } from "../apis/manufacturerAPIs";
import {
  mintNFT,
  isMetaMaskInstalled,
  connectWallet,
} from "../../utils/web3Helper";

export const useCreateProofOfProduction = () => {
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
  } = manufacturerAPIs.getDrugsByManufacturerId(user?._id);

  const generateMetadataMutation = manufacturerAPIs.generateNFTMetadata();
  const createProofMutation = manufacturerAPIs.createProofOfProduction();

  const drugs = drugsData?.data?.drugs || drugsData?.data || [];

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
      toast.error("Vui lòng cài đặt MetaMask để tiếp tục!");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    try {
      setLoading(true);
      const result = await connectWallet();
      if (result.success) {
        setWalletConnected(true);
        setWalletAddress(result.address);
        toast.success("Kết nối ví thành công!");
      }
    } catch (error) {
      toast.error("Không thể kết nối ví: " + error.message);
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
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    if (new Date(formData.mfgDate) >= new Date(formData.expDate)) {
      toast.error("Ngày hết hạn phải sau ngày sản xuất!");
      return;
    }

    if (parseInt(formData.quantity) <= 0) {
      toast.error("Số lượng phải lớn hơn 0!");
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
      toast.error(
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
      toast.error("Vui lòng kết nối ví MetaMask trước!");
      return;
    }

    try {
      setLoading(true);
      setStep(3);

      // Upload metadata to IPFS
      console.log("📤 Uploading metadata to IPFS...");
      const tokenURI = await manufacturerAPIs.uploadMetadataToIPFS(
        nftMetadata.metadata
      );
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
      toast.error("Không thể mint NFT: " + error.message);
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
        toast.success("✅ Tạo Proof of Production thành công!");
        navigate("/manufacturer/proofs");
      } else {
        throw new Error("Backend verification failed");
      }
    } catch (error) {
      console.error("Error saving to backend:", error);
      toast.error(
        "⚠️ NFT đã được mint nhưng không thể lưu vào hệ thống: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    setStep,
    formData,
    setFormData,
    nftMetadata,
    mintedNFT,
    walletConnected,
    walletAddress,
    loading,
    location,
    drugsLoading,
    drugsError,
    drugs,
    handleStep1Submit,
    handleConnectWallet,
    handleMintNFT,
    handleSaveToBackend,
  };
};
