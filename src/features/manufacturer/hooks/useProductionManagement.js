/* eslint-disable no-undef */
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { manufacturerAPIs } from "../apis/manufacturerAPIs";

export const useProductionManagement = () => {
  const [searchParams] = useSearchParams();
  const [showDialog, setShowDialog] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);

  // React Query hooks
  const {
    data: drugsData,
    isLoading: loading,
    error: drugsError,
  } = manufacturerAPIs.getDrugs();

  const uploadToIPFSMutation = manufacturerAPIs.uploadToIPFS();
  const saveMintedNFTsMutation = manufacturerAPIs.saveMintedNFTs();

  const drugs = drugsData?.success
    ? drugsData.data?.drugs || drugsData.data || []
    : [];

  const [step, setStep] = useState(1);
  const [uploadButtonState, setUploadButtonState] = useState("idle");
  const [mintButtonState, setMintButtonState] = useState("idle");
  const [processingMint, setProcessingMint] = useState(false); // FIX: Separate state for minting

  const [formData, setFormData] = useState({
    drugId: "",
    batchNumber: "",
    quantity: "",
    manufacturingDate: "",
    expiryDate: "",
    notes: "",
  });

  const [ipfsData, setIpfsData] = useState(null);
  const [mintResult, setMintResult] = useState(null);
  const [shelfLifeValue, setShelfLifeValue] = useState("");
  const [shelfLifeUnit, setShelfLifeUnit] = useState("month");
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    checkInitialWalletConnection();

    // FIX: Listen for account changes
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
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        // Cleanup event listener
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      };
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Khi load bằng IPFS từ trang lịch sử: tự nạp ipfsUrl + quantity và chuyển sang bước mint
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
      setStep(2); // Bỏ qua bước upload, sẵn sàng mint
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (formData.manufacturingDate && shelfLifeValue) {
      const computed = addDuration(
        formData.manufacturingDate,
        shelfLifeValue,
        shelfLifeUnit
      );
      setFormData((prev) => ({ ...prev, expiryDate: computed }));
    }
  }, [formData.manufacturingDate, shelfLifeValue, shelfLifeUnit]);

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

  const validateForm = () => {
    const newErrors = {};

    // Validate số lô: chỉ chữ và số, không ký tự đặc biệt, tối đa 30 ký tự (đã được tự động chuyển sang uppercase trong onChange)
    if (!formData.batchNumber.trim()) {
      newErrors.batchNumber = "Số lô không được để trống";
    } else if (!/^[A-Z0-9]+$/.test(formData.batchNumber)) {
      newErrors.batchNumber = "Số lô chỉ được chứa chữ cái và số";
    } else if (formData.batchNumber.length > 30) {
      newErrors.batchNumber = "Số lô không được vượt quá 30 ký tự";
    }

    // Validate số lượng: > 0 và < 10,000,000
    const quantity = parseInt(formData.quantity);
    if (!formData.quantity || isNaN(quantity) || quantity <= 0) {
      newErrors.quantity = "Số lượng phải lớn hơn 0";
    } else if (quantity >= 10000000) {
      newErrors.quantity = "Số lượng phải nhỏ hơn 10,000,000";
    }

    // Validate ngày sản xuất: không quá 60 ngày trước và không được lớn hơn ngày hiện tại
    if (!formData.manufacturingDate) {
      newErrors.manufacturingDate = "Ngày sản xuất không được để trống";
    } else {
      const validationResult = validateAndFixManufacturingDate(
        formData.manufacturingDate
      );

      // Nếu ngày không hợp lệ, tự động sửa về ngày hiện tại
      if (!validationResult.isValid) {
        setFormData((prev) => ({
          ...prev,
          manufacturingDate: validationResult.fixedDate,
        }));
        // Không set error vì đã tự động sửa
      }
    }

    // Validate thời hạn sử dụng: không được bỏ trống và không quá 10 năm
    const shelfLifeValidation = validateShelfLife(
      shelfLifeValue,
      shelfLifeUnit,
      formData.manufacturingDate
    );
    if (!shelfLifeValidation.isValid) {
      newErrors.shelfLife = shelfLifeValidation.error;
    }

    // Validate thuốc
    if (!formData.drugId) {
      newErrors.drugId = "Vui lòng chọn thuốc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartProduction = () => {
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
  };

  const handleUploadToIPFS = async () => {
    // Validate form trước khi submit
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra và sửa các lỗi trong form", {
        position: "top-right",
      });
      return;
    }

    setUploadButtonState("uploading");

    try {
      // Parse quantity từ formData
      const quantity = parseInt(formData.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        toast.error("Số lượng không hợp lệ", { position: "top-right" });
        setUploadButtonState("idle");
        return;
      }

      const selectedDrug = drugs.find((d) => d._id === formData.drugId);
      const metadata = {
        name: `${selectedDrug?.tradeName || "Unknown"} - Batch ${
          formData.batchNumber
        }`,
        description: `Lô sản xuất ${
          selectedDrug?.tradeName || "Unknown"
        } - Số lô: ${formData.batchNumber}`,
        image:
          selectedDrug?.image ||
          "https://via.placeholder.com/400x400?text=Drug+Image",
        attributes: [
          { trait_type: "Drug", value: selectedDrug?.tradeName || "Unknown" },
          {
            trait_type: "Generic Name",
            value: selectedDrug?.genericName || "N/A",
          },
          { trait_type: "Batch", value: formData.batchNumber },
          {
            trait_type: "Manufacturing Date",
            value: formData.manufacturingDate || "N/A",
          },
          { trait_type: "Expiry Date", value: formData.expiryDate || "N/A" },
          { trait_type: "ATC Code", value: selectedDrug?.atcCode || "N/A" },
          {
            trait_type: "Dosage Form",
            value: selectedDrug?.dosageForm || "N/A",
          },
          { trait_type: "Strength", value: selectedDrug?.strength || "N/A" },
        ],
      };

      const uploadPayload = { quantity, metadata };
      console.log("Uploading to IPFS:", uploadPayload);

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

        console.log("IPFS data:", ipfsData);
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
  };

  const checkWalletConnection = async () => {
    if (!isMetaMaskInstalled()) {
      toast.error("Vui lòng cài đặt MetaMask để mint NFT!", {
        position: "top-right",
      });
      return false;
    }

    try {
      const result = await connectWallet();
      if (result && result.success && result.address) {
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
  };

  const parseTokenIdsFromReceipt = (receipt, contract, expectedQuantity) => {
    const tokenIds = [];
    let foundEvent = false;

    // Try mintNFTEvent first
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed?.name === "mintNFTEvent" && parsed.args.tokenIds) {
          const ids = parsed.args.tokenIds;
          if (Array.isArray(ids)) {
            ids.forEach((id) => tokenIds.push(id.toString()));
          } else {
            tokenIds.push(ids.toString());
          }
          foundEvent = true;
          break;
        }
      } catch (e) {
        // Skip unparseable logs
      }
    }

    // Fallback: TransferSingle/TransferBatch
    if (!foundEvent) {
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
            foundEvent = true;
            break;
          }
        } catch (e) {
          // Skip
        }
      }
    }

    // Sort and validate
    tokenIds.sort((a, b) => {
      const bigA = BigInt(a);
      const bigB = BigInt(b);
      return bigA < bigB ? -1 : bigA > bigB ? 1 : 0;
    });

    // FIX: Generate missing token IDs if needed
    if (tokenIds.length < expectedQuantity && tokenIds.length > 0) {
      const lastId = BigInt(tokenIds[tokenIds.length - 1]);
      let nextId = lastId + BigInt(1);

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

  const handleMintNFT = async () => {
    if (processingMint) {
      return;
    }

    if (!ipfsData) {
      toast.error("Chưa có dữ liệu IPFS", { position: "top-right" });
      return;
    }

    if (!formData.drugId || !formData.batchNumber || !formData.quantity) {
      toast.error("Thiếu thông tin bắt buộc", { position: "top-right" });
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (quantity <= 0 || quantity >= 10000000) {
      toast.error("Số lượng không hợp lệ (1-9,999,999)", {
        position: "top-right",
      });
      return;
    }

    if (!walletConnected) {
      const connected = await checkWalletConnection();
      if (!connected) {
        return;
      }
    }

    setProcessingMint(true);
    setMintButtonState("minting");
    setStep(3);

    try {
      const ipfsUrl = ipfsData.ipfsUrl || `ipfs://${ipfsData.ipfsHash}`;
      console.log("Mint NFT:", { quantity, ipfsUrl });

      const contract = await getNFTContract();
      const amounts = Array(quantity).fill(1);

      console.log("Call mintNFT with amounts:", amounts);

      const tx = await contract.mintNFT(amounts);
      console.log("TX submitted:", tx.hash);

      const receipt = await tx.wait();
      console.log("TX confirmed:", receipt);

      // FIX: Use improved parsing function
      const tokenIds = parseTokenIdsFromReceipt(receipt, contract, quantity);
      console.log("📋 Final token IDs:", tokenIds);

      if (tokenIds.length === 0) {
        throw new Error(
          "Không tìm thấy token IDs. Kiểm tra smart contract events."
        );
      }

      // Save to backend
      const selectedDrug = drugs.find((d) => d._id === formData.drugId);

      const saveData = {
        drugId: formData.drugId,
        tokenIds: tokenIds,
        transactionHash: tx.hash,
        quantity: quantity,
        ipfsUrl: ipfsUrl,
        mfgDate: formData.manufacturingDate || undefined,
        expDate: formData.expiryDate || undefined,
        batchNumber: formData.batchNumber || undefined,
        metadata: {
          name: `${selectedDrug?.tradeName || "Unknown"} - Batch ${
            formData.batchNumber
          }`,
          description: `Lô sản xuất ${selectedDrug?.tradeName}`,
          drug: selectedDrug?.tradeName,
          genericName: selectedDrug?.genericName,
          atcCode: selectedDrug?.atcCode,
        },
      };

      console.log("Saving to backend:", saveData);

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
  };

  const handleClose = () => {
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
  };

  const selectedDrug = drugs.find((d) => d._id === formData.drugId);

  // Helper function để kiểm tra và sửa ngày sản xuất nếu không hợp lệ
  const validateAndFixManufacturingDate = (dateStr) => {
    if (!dateStr) {
      return { isValid: false, fixedDate: "" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minDate = new Date(today);
    minDate.setDate(today.getDate() - 60);
    minDate.setHours(0, 0, 0, 0);

    const mfgDate = new Date(dateStr);
    mfgDate.setHours(0, 0, 0, 0);

    // Nếu ngày không hợp lệ, trả về ngày hiện tại
    if (mfgDate < minDate || mfgDate > today) {
      return {
        isValid: false,
        fixedDate: today.toISOString().split("T")[0],
      };
    }

    return { isValid: true, fixedDate: dateStr };
  };

  // Helper function để lấy giới hạn tối đa cho thời hạn sử dụng dựa trên đơn vị (10 năm)
  const getMaxShelfLife = (unit) => {
    switch (unit) {
      case "year":
        return 10;
      case "month":
        return 120; // 10 năm * 12 tháng
      case "day":
        return 3653; // 10 năm * 365.25 ngày (làm tròn lên)
      default:
        return 10;
    }
  };

  // Helper function để kiểm tra thời hạn sử dụng có vượt quá 10 năm không
  const validateShelfLife = (value, unit, manufacturingDate) => {
    if (!value || !value.trim()) {
      return { isValid: false, error: "Thời hạn sử dụng không được để trống" };
    }

    const shelfLifeNum = parseFloat(value);
    if (isNaN(shelfLifeNum) || shelfLifeNum <= 0) {
      return { isValid: false, error: "Thời hạn sử dụng phải lớn hơn 0" };
    }

    // Kiểm tra giới hạn tối đa dựa trên đơn vị
    const maxShelfLife = getMaxShelfLife(unit);
    if (shelfLifeNum > maxShelfLife) {
      return {
        isValid: false,
        error: `Thời hạn sử dụng không được vượt quá ${maxShelfLife} ${
          unit === "year" ? "năm" : unit === "month" ? "tháng" : "ngày"
        } (10 năm)`,
      };
    }

    // Kiểm tra với ngày sản xuất nếu có
    if (manufacturingDate) {
      const expiryDateStr = addDuration(manufacturingDate, value, unit);
      if (expiryDateStr) {
        const expiryDate = new Date(expiryDateStr);
        const mfgDate = new Date(manufacturingDate);
        const maxExpiryDate = new Date(mfgDate);
        maxExpiryDate.setFullYear(mfgDate.getFullYear() + 10);

        if (expiryDate > maxExpiryDate) {
          return {
            isValid: false,
            error:
              "Thời hạn sử dụng không được vượt quá 10 năm từ ngày sản xuất",
          };
        }
      }
    }

    return { isValid: true, error: "" };
  };

  const addDuration = (dateStr, amount, unit) => {
    if (!dateStr || !amount) {
      return "";
    }
    const d = new Date(dateStr);
    const n = parseFloat(amount);
    if (Number.isNaN(n)) {
      return "";
    }

    if (unit === "day") {
      // Hỗ trợ số thập phân cho ngày (làm tròn)
      d.setDate(d.getDate() + Math.round(n));
    } else if (unit === "month") {
      // Làm tròn số tháng
      const months = Math.round(n);
      const currentDate = d.getDate();
      d.setMonth(d.getMonth() + months);
      if (d.getDate() < currentDate) {
        d.setDate(0);
      }
    } else if (unit === "year") {
      // Làm tròn số năm
      const years = Math.round(n);
      d.setFullYear(d.getFullYear() + years);
    }

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDateMDY = (dateStr) => {
    if (!dateStr) {
      return "";
    }
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) {
      return "";
    }
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };

  return {
    drugs,
    loading,
    drugsError,
    uploadToIPFSMutation,
    saveMintedNFTsMutation,
    showDialog,
    setShowDialog,
    loadingProgress,
    setLoadingProgress,
    progressIntervalRef,
    setStep,
    uploadButtonState,
    setUploadButtonState,
    mintButtonState,
    setMintButtonState,
    processingMint,
    setProcessingMint,
    formData,
    setFormData,
    ipfsData,
    setIpfsData,
    mintResult,
    setMintResult,
    shelfLifeValue,
    setShelfLifeValue,
    shelfLifeUnit,
    setShelfLifeUnit,
    walletConnected,
    setWalletConnected,
    walletAddress,
    setWalletAddress,
    errors,
    setErrors,
    selectedDrug,
    validateAndFixManufacturingDate,
    getMaxShelfLife,
    validateShelfLife,
    addDuration,
    formatDateMDY,
    handleStartProduction,
    handleUploadToIPFS,
    checkWalletConnection,
    parseTokenIdsFromReceipt,
    handleMintNFT,
    handleClose,
    validateForm,
  };
};
