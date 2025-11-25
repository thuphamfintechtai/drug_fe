/* eslint-disable no-undef */
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ethers } from "ethers";
import {
  useManufacturerDrugs,
  useUploadToIPFS,
  useSaveMintedNFTs,
} from "../apis/manufacturerAPIs";
import {
  isMetaMaskInstalled,
  getWeb3Provider,
  connectWallet,
  getNFTContract,
} from "../../utils/web3Helper";

// ============================================
// CONSTANTS
// ============================================
const MAX_BATCH_LENGTH = 30;
const MAX_QUANTITY = 1;
const MANUFACTURING_DATE_RANGE_DAYS = 60;
const MAX_SHELF_LIFE_YEARS = 10;

const SHELF_LIFE_LIMITS = {
  year: 10,
  month: 120, // 10 years * 12
  day: 3653, // 10 years * 365.25
};

// ============================================
// HELPER FUNCTIONS (Pure functions - no side effects)
// ============================================

/**
 * Validate MongoDB ObjectId format
 */
const isValidMongoId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

/**
 * Find drug by id (_id or id field)
 */
const findDrugById = (drugs, drugId) => {
  if (!drugId || !drugs || drugs.length === 0) return null;
  return drugs.find((d) => (d._id || d.id) === drugId);
};

/**
 * Validate and fix manufacturing date
 * Returns: { isValid: boolean, fixedDate: string, error?: string }
 */
const validateManufacturingDate = (dateStr) => {
  if (!dateStr) {
    return {
      isValid: false,
      fixedDate: "",
      error: "Ngày sản xuất không được để trống",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDate = new Date(today);
  minDate.setDate(today.getDate() - MANUFACTURING_DATE_RANGE_DAYS);
  minDate.setHours(0, 0, 0, 0);

  const mfgDate = new Date(dateStr);
  mfgDate.setHours(0, 0, 0, 0);

  if (isNaN(mfgDate.getTime())) {
    return {
      isValid: false,
      fixedDate: today.toISOString().split("T")[0],
      error: "Ngày sản xuất không hợp lệ",
    };
  }

  if (mfgDate < minDate) {
    return {
      isValid: false,
      fixedDate: minDate.toISOString().split("T")[0],
      error: `Ngày sản xuất phải trong vòng ${MANUFACTURING_DATE_RANGE_DAYS} ngày qua`,
    };
  }

  if (mfgDate > today) {
    return {
      isValid: false,
      fixedDate: today.toISOString().split("T")[0],
      error: "Ngày sản xuất không được là tương lai",
    };
  }

  return { isValid: true, fixedDate: dateStr };
};

/**
 * Calculate expiry date from manufacturing date
 */
const calculateExpiryDate = (mfgDateStr, amount, unit) => {
  if (!mfgDateStr || !amount) return "";

  const date = new Date(mfgDateStr);
  const value = parseFloat(amount);

  if (isNaN(date.getTime()) || isNaN(value) || value <= 0) return "";

  switch (unit) {
    case "day":
      date.setDate(date.getDate() + Math.round(value));
      break;
    case "month": {
      const months = Math.round(value);
      const currentDate = date.getDate();
      date.setMonth(date.getMonth() + months);
      if (date.getDate() < currentDate) {
        date.setDate(0); // Last day of previous month
      }
      break;
    }
    case "year":
      date.setFullYear(date.getFullYear() + Math.round(value));
      break;
    default:
      return "";
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Validate shelf life
 */
const validateShelfLife = (value, unit, mfgDate) => {
  if (!value || !value.trim()) {
    return { isValid: false, error: "Thời hạn sử dụng không được để trống" };
  }

  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue <= 0) {
    return { isValid: false, error: "Thời hạn sử dụng phải lớn hơn 0" };
  }

  const maxValue = SHELF_LIFE_LIMITS[unit] || 10;
  if (numValue > maxValue) {
    const unitText = unit === "year" ? "năm" : unit === "month" ? "tháng" : "ngày";
    return {
      isValid: false,
      error: `Thời hạn sử dụng không được vượt quá ${maxValue} ${unitText}`,
    };
  }

  // Check with manufacturing date
  if (mfgDate) {
    const expiryDate = calculateExpiryDate(mfgDate, value, unit);
    if (expiryDate) {
      const expDate = new Date(expiryDate);
      const mfgDateObj = new Date(mfgDate);
      const maxExpiryDate = new Date(mfgDateObj);
      maxExpiryDate.setFullYear(mfgDateObj.getFullYear() + MAX_SHELF_LIFE_YEARS);

      if (expDate > maxExpiryDate) {
        return {
          isValid: false,
          error: `Hạn sử dụng không được vượt quá ${MAX_SHELF_LIFE_YEARS} năm từ ngày sản xuất`,
        };
      }
    }
  }

  return { isValid: true };
};

/**
 * Format date to MM/DD/YYYY
 */
const formatDateMDY = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";

  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
};

/**
 * Parse token IDs from transaction receipt
 */
const parseTokenIdsFromReceipt = (receipt, contract, expectedQuantity) => {
  const tokenIds = [];

  // Try mintNFTEvent first
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed?.name === "mintNFTEvent" && parsed.args.tokenIds) {
        const ids = Array.isArray(parsed.args.tokenIds)
          ? parsed.args.tokenIds
          : [parsed.args.tokenIds];
        ids.forEach((id) => tokenIds.push(id.toString()));
        break;
      }
    } catch (e) {
      // Skip unparseable logs
    }
  }

  // Fallback: TransferSingle/TransferBatch
  if (tokenIds.length === 0) {
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);

        if (
          parsed?.name === "TransferSingle" &&
          parsed.args.from === ethers.ZeroAddress
        ) {
          tokenIds.push(parsed.args.id.toString());
        } else if (
          parsed?.name === "TransferBatch" &&
          parsed.args.from === ethers.ZeroAddress
        ) {
          const ids = parsed.args.ids || [];
          ids.forEach((id) => tokenIds.push(id.toString()));
        }
      } catch (e) {
        // Skip
      }
    }
  }

  // Sort token IDs
  tokenIds.sort((a, b) => {
    const bigA = BigInt(a);
    const bigB = BigInt(b);
    return bigA < bigB ? -1 : bigA > bigB ? 1 : 0;
  });

  // Generate missing token IDs if needed
  if (tokenIds.length > 0 && tokenIds.length < expectedQuantity) {
    let nextId = BigInt(tokenIds[tokenIds.length - 1]) + BigInt(1);
    while (tokenIds.length < expectedQuantity) {
      tokenIds.push(nextId.toString());
      nextId = nextId + BigInt(1);
    }
  }

  // Trim excess
  if (tokenIds.length > expectedQuantity) {
    tokenIds.splice(expectedQuantity);
  }

  return tokenIds;
};

// ============================================
// MAIN HOOK
// ============================================

export const useProductionManagement = () => {
  const [searchParams] = useSearchParams();

  // ========== React Query hooks ==========
  const {
    data: drugsData,
    isLoading: loading,
    error: drugsError,
  } = useManufacturerDrugs();

  const uploadToIPFSMutation = useUploadToIPFS();
  const saveMintedNFTsMutation = useSaveMintedNFTs();

  // ========== Derived state ==========
  const drugs = drugsData?.success
    ? drugsData.data?.drugs || drugsData.data || []
    : [];

  // ========== UI State ==========
  const [showDialog, setShowDialog] = useState(false);
  const [step, setStep] = useState(1); // 1: form, 2: ready to mint, 3: minting, 4: success
  const [uploadButtonState, setUploadButtonState] = useState("idle");
  const [mintButtonState, setMintButtonState] = useState("idle");
  const [processingMint, setProcessingMint] = useState(false);

  // ========== Form State ==========
  const [formData, setFormData] = useState({
    drugId: "",
    batchNumber: "",
    quantity: "",
    manufacturingDate: "",
    expiryDate: "",
    notes: "",
  });

  const [shelfLifeValue, setShelfLifeValue] = useState("");
  const [shelfLifeUnit, setShelfLifeUnit] = useState("month");
  const [errors, setErrors] = useState({});

  // ========== Blockchain State ==========
  const [ipfsData, setIpfsData] = useState(null);
  const [mintResult, setMintResult] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  // ========== Derived data ==========
  const selectedDrug = findDrugById(drugs, formData.drugId);

  // ========== Debug logging ==========
  useEffect(() => {
    if (drugs.length > 0) {
      console.log("📋 Drugs loaded:", {
        count: drugs.length,
        sample: drugs[0]
          ? {
              _id: drugs[0]._id,
              tradeName: drugs[0].tradeName,
              atcCode: drugs[0].atcCode,
            }
          : null,
      });
    }
  }, [drugs]);

  // ========== Wallet connection setup ==========
  useEffect(() => {
    const checkInitialWalletConnection = async () => {
      if (isMetaMaskInstalled()) {
        try {
          const provider = await getWeb3Provider();
          if (provider) {
            const accounts = await provider.listAccounts();
            if (accounts.length > 0) {
              setWalletAddress(accounts[0]);
              setWalletConnected(true);
            }
          }
        } catch (error) {
          console.log("Ví chưa được kết nối:", error.message);
        }
      }
    };

    checkInitialWalletConnection();

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          setWalletConnected(false);
          setWalletAddress("");
        } else {
          setWalletAddress(accounts[0]);
          setWalletConnected(true);
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, []);

  // ========== Load from URL params (history page) ==========
  useEffect(() => {
    const ipfsUrl = searchParams.get("ipfsUrl");
    const qty = searchParams.get("quantity");

    if (ipfsUrl) {
      const cidMatch = ipfsUrl.match(/\/ipfs\/([^/?#]+)/i);
      const ipfsHash = cidMatch ? cidMatch[1] : "";

      setIpfsData({
        ipfsUrl,
        ipfsHash,
        amount: qty ? parseInt(qty) : undefined,
      });

      if (qty && !isNaN(parseInt(qty))) {
        setFormData((prev) => ({ ...prev, quantity: String(parseInt(qty)) }));
      }

      setShowDialog(true);
      setStep(2); // Skip to mint step
    }
  }, [searchParams]);

  // ========== Auto-calculate expiry date ==========
  useEffect(() => {
    if (formData.manufacturingDate && shelfLifeValue) {
      const expiryDate = calculateExpiryDate(
        formData.manufacturingDate,
        shelfLifeValue,
        shelfLifeUnit
      );
      setFormData((prev) => ({ ...prev, expiryDate }));
    }
  }, [formData.manufacturingDate, shelfLifeValue, shelfLifeUnit]);

  // ========== Validation ==========
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Drug ID
    if (!formData.drugId) {
      newErrors.drugId = "Vui lòng chọn thuốc";
    } else if (!isValidMongoId(formData.drugId)) {
      newErrors.drugId = "ID thuốc không hợp lệ";
    } else if (!findDrugById(drugs, formData.drugId)) {
      newErrors.drugId = "Thuốc không tồn tại trong hệ thống";
    }

    // Batch number
    if (!formData.batchNumber.trim()) {
      newErrors.batchNumber = "Số lô không được để trống";
    } else if (!/^[A-Z0-9]+$/.test(formData.batchNumber)) {
      newErrors.batchNumber = "Số lô chỉ được chứa chữ cái và số";
    } else if (formData.batchNumber.length > MAX_BATCH_LENGTH) {
      newErrors.batchNumber = `Số lô không được vượt quá ${MAX_BATCH_LENGTH} ký tự`;
    }

    // Quantity
    const quantity = parseInt(formData.quantity);
    if (!formData.quantity || isNaN(quantity) || quantity <= 0) {
      newErrors.quantity = "Số lượng phải lớn hơn 0";
    } else if (quantity > MAX_QUANTITY) {
      newErrors.quantity = `Số lượng tối đa là ${MAX_QUANTITY}`;
    }

    // Manufacturing date - DON'T auto-fix, just validate
    const mfgValidation = validateManufacturingDate(formData.manufacturingDate);
    if (!mfgValidation.isValid) {
      newErrors.manufacturingDate = mfgValidation.error;
    }

    // Shelf life
    const shelfLifeValidation = validateShelfLife(
      shelfLifeValue,
      shelfLifeUnit,
      formData.manufacturingDate
    );
    if (!shelfLifeValidation.isValid) {
      newErrors.shelfLife = shelfLifeValidation.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, shelfLifeValue, shelfLifeUnit, drugs]);

  // ========== Handlers ==========

  const handleStartProduction = useCallback(() => {
    setStep(1);
    setUploadButtonState("idle");
    setMintButtonState("idle");
    setProcessingMint(false);
    setFormData({
      drugId: "",
      batchNumber: "",
      quantity: "",
      manufacturingDate: "",
      expiryDate: "",
      notes: "",
    });
    setIpfsData(null);
    setMintResult(null);
    setShelfLifeValue("");
    setShelfLifeUnit("month");
    setErrors({});
    setShowDialog(true);
  }, []);

  const handleUploadToIPFS = useCallback(async () => {
    // Validate form
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra và sửa các lỗi trong form", {
        position: "top-right",
      });
      return;
    }

    setUploadButtonState("uploading");

    try {
      const quantity = parseInt(formData.quantity);
      const drug = findDrugById(drugs, formData.drugId);

      if (!drug) {
        throw new Error("Không tìm thấy thông tin thuốc");
      }

      const metadata = {
        name: `${drug.tradeName} - Batch ${formData.batchNumber}`,
        description: `Lô sản xuất ${drug.tradeName} - Số lô: ${formData.batchNumber}`,
        image: drug.image || "https://via.placeholder.com/400x400?text=Drug+Image",
        attributes: [
          { trait_type: "Drug", value: drug.tradeName },
          { trait_type: "Generic Name", value: drug.genericName || "N/A" },
          { trait_type: "Batch", value: formData.batchNumber },
          { trait_type: "Manufacturing Date", value: formData.manufacturingDate },
          { trait_type: "Expiry Date", value: formData.expiryDate },
          { trait_type: "ATC Code", value: drug.atcCode || "N/A" },
          { trait_type: "Dosage Form", value: drug.dosageForm || "N/A" },
          { trait_type: "Strength", value: drug.strength || "N/A" },
        ],
      };

      const uploadPayload = {
        drugId: formData.drugId,
        quantity,
        metadata,
      };

      console.log("📤 Uploading to IPFS:", uploadPayload);

      const response = await uploadToIPFSMutation.mutateAsync(uploadPayload);

      if (response.success) {
        const ipfsData = response.data || response;
        setIpfsData(ipfsData);

        setTimeout(() => {
          setUploadButtonState("completed");
        }, 2500);

        setTimeout(() => {
          setStep(2);
          setUploadButtonState("idle");
          toast.success("Bước 1 thành công: Đã lưu thông tin lên IPFS!", {
            position: "top-right",
          });
        }, 4500);
      }
    } catch (error) {
      console.error("Lỗi khi upload IPFS:", error);
      toast.error(
        "Không thể upload lên IPFS: " +
          (error.response?.data?.message || error.message),
        { position: "top-right" }
      );
      setUploadButtonState("idle");
    }
  }, [formData, drugs, validateForm, uploadToIPFSMutation]);

  const checkWalletConnection = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      toast.error("Vui lòng cài đặt MetaMask để mint NFT!", {
        position: "top-right",
      });
      return false;
    }

    try {
      const result = await connectWallet();
      if (result?.success && result.address) {
        setWalletAddress(result.address);
        setWalletConnected(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Lỗi kết nối ví:", error);
      toast.error("Không thể kết nối ví MetaMask: " + error.message, {
        position: "top-right",
      });
      return false;
    }
  }, []);

  const handleMintNFT = useCallback(async () => {
    if (processingMint) return;

    // Validate prerequisites
    if (!ipfsData) {
      toast.error("Chưa có dữ liệu IPFS", { position: "top-right" });
      return;
    }

    if (!formData.drugId || !formData.batchNumber || !formData.quantity) {
      toast.error("Thiếu thông tin bắt buộc", { position: "top-right" });
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (quantity <= 0 || quantity > 9999999) {
      toast.error("Số lượng không hợp lệ (1-9,999,999)", {
        position: "top-right",
      });
      return;
    }

    // Check wallet
    if (!walletConnected) {
      const connected = await checkWalletConnection();
      if (!connected) return;
    }

    setProcessingMint(true);
    setMintButtonState("minting");
    setStep(3);

    try {
      const ipfsUrl = ipfsData.ipfsUrl || `ipfs://${ipfsData.ipfsHash}`;
      const contract = await getNFTContract();
      const amounts = Array(quantity).fill(1);

      console.log("🔗 Calling mintNFT with amounts:", amounts);

      const tx = await contract.mintNFT(amounts);
      console.log("📝 TX submitted:", tx.hash);

      const receipt = await tx.wait();
      console.log("✅ TX confirmed:", receipt);

      const tokenIds = parseTokenIdsFromReceipt(receipt, contract, quantity);
      console.log("🎫 Token IDs:", tokenIds);

      if (tokenIds.length === 0) {
        throw new Error("Không tìm thấy token IDs. Kiểm tra smart contract events.");
      }

      // Validate drug before saving
      const drug = findDrugById(drugs, formData.drugId);
      if (!drug) {
        throw new Error("Không tìm thấy thông tin thuốc đã chọn");
      }

      const saveData = {
        drugId: formData.drugId,
        tokenIds,
        transactionHash: tx.hash,
        quantity,
        ipfsUrl,
        mfgDate: formData.manufacturingDate || undefined,
        expDate: formData.expiryDate || undefined,
        batchNumber: formData.batchNumber || undefined,
        metadata: {
          name: `${drug.tradeName} - Batch ${formData.batchNumber}`,
          description: `Lô sản xuất ${drug.tradeName}`,
          drug: drug.tradeName,
          genericName: drug.genericName,
          atcCode: drug.atcCode,
        },
      };

      console.log("💾 Saving to backend:", saveData);

      const response = await saveMintedNFTsMutation.mutateAsync(saveData);

      if (response.success) {
        setMintResult(response.data || response);
        setTimeout(() => {
          setMintButtonState("completed");
          setStep(4);
        }, 3500);
      } else {
        throw new Error(response.message || "Backend failed");
      }
    } catch (error) {
      console.error("❌ Mint error:", error);

      let errorMsg = "Không thể mint NFT";

      if (error.code === "ACTION_REJECTED" || error.code === 4001) {
        errorMsg = "Giao dịch bị từ chối";
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }

      toast.error(errorMsg, { position: "top-right" });
      setMintButtonState("idle");
      setStep(2);
    } finally {
      setProcessingMint(false);
    }
  }, [
    processingMint,
    ipfsData,
    formData,
    walletConnected,
    drugs,
    checkWalletConnection,
    saveMintedNFTsMutation,
  ]);

  const handleClose = useCallback(() => {
    setShowDialog(false);
    setStep(1);
    setUploadButtonState("idle");
    setMintButtonState("idle");
    setProcessingMint(false);
    setFormData({
      drugId: "",
      batchNumber: "",
      quantity: "",
      manufacturingDate: "",
      expiryDate: "",
      notes: "",
    });
    setIpfsData(null);
    setMintResult(null);
    setShelfLifeValue("");
    setShelfLifeUnit("month");
    setErrors({});
  }, []);

  // ========== Return ==========
  return {
    // Data
    drugs,
    loading,
    drugsError,
    selectedDrug,

    // UI State
    showDialog,
    step,
    uploadButtonState,
    mintButtonState,
    processingMint,

    // Form State
    formData,
    setFormData,
    shelfLifeValue,
    setShelfLifeValue,
    shelfLifeUnit,
    setShelfLifeUnit,
    errors,
    setErrors,

    // Blockchain State
    ipfsData,
    mintResult,
    walletConnected,
    walletAddress,

    // Handlers
    handleStartProduction,
    handleUploadToIPFS,
    handleMintNFT,
    handleClose,

    // Utilities (for UI components)
    getMaxShelfLife: (unit) => SHELF_LIFE_LIMITS[unit] || 10,
    validateShelfLife,
    formatDateMDY,
    validateAndFixManufacturingDate: validateManufacturingDate,

    // Loading progress removed - không sử dụng
  };
};