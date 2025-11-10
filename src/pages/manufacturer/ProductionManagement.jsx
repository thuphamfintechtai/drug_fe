import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import TruckAnimationButton from "../../components/TruckAnimationButton";
import NFTMintButton from "../../components/NFTMintButton";
import BlockchainMintingView from "../../components/BlockchainMintingView";
import TruckLoader from "../../components/TruckLoader";
import { toast } from "react-hot-toast";
import {
  getDrugs,
  uploadToIPFS,
  saveMintedNFTs,
} from "../../services/manufacturer/manufacturerService";
import {
  mintNFT,
  isMetaMaskInstalled,
  connectWallet,
  getNFTContract,
  getWeb3Provider,
  getCurrentWalletAddress,
} from "../../utils/web3Helper";
import { ethers } from "ethers";

export default function ProductionManagement() {
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);

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

  const navigationItems = [
    {
      path: "/manufacturer",
      label: "Tổng quan",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/manufacturer/drugs",
      label: "Quản lý thuốc",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/manufacturer/production",
      label: "Sản xuất thuốc",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/manufacturer/transfer",
      label: "Chuyển giao",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/manufacturer/production-history",
      label: "Lịch sử sản xuất",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/manufacturer/transfer-history",
      label: "Lịch sử chuyển giao",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/manufacturer/profile",
      label: "Hồ sơ",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      active: false,
    },
  ];

  useEffect(() => {
    loadDrugs();
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

  const loadDrugs = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      progressIntervalRef.current = setInterval(() => {
        setLoadingProgress((prev) => Math.min(prev + 0.02, 0.9));
      }, 50);

      const response = await getDrugs();

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      if (response.data.success) {
        setDrugs(response.data.data.drugs || []);
      }

      setLoadingProgress(1);
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      console.error("Lỗi khi tải danh sách thuốc:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setLoadingProgress(0), 500);
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

      const response = await uploadToIPFS(uploadPayload);

      if (response.data.success) {
        const ipfsData = response.data.data || response.data;
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
    if (processingMint) return;

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
      if (!connected) return;
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

      const response = await saveMintedNFTs(saveData);

      if (response.data.success) {
        setMintResult(response.data.data);
        setTimeout(() => {
          setMintButtonState("completed");
          setStep(4);
        }, 3500);
      } else {
        throw new Error(response.data.message || "Backend failed");
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
    if (!dateStr) return { isValid: false, fixedDate: "" };

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
    if (!dateStr || !amount) return "";
    const d = new Date(dateStr);
    const n = parseFloat(amount);
    if (Number.isNaN(n)) return "";

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
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={loadingProgress} showTrack />
          </div>
          <div className="text-lg text-slate-600 mt-6">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Banner */}
          <div className="bg-white rounded-xl border border-card-primary shadow-sm p-5">
            <h1 className="text-xl font-semibold text-[#007b91] flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7h18M5 10h14M4 14h16M6 18h12"
                />
              </svg>
              Sản xuất thuốc & Mint NFT
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Tạo lô sản xuất và mint NFT trên blockchain (2 bước: IPFS + Smart
              Contract)
            </p>
          </div>

          {/* Instructions */}
          <div className="rounded-2xl bg-white border border-card-primary shadow-sm p-6">
            <h2 className="text-xl font-bold text-[#007b91] mb-4">
              Quy trình sản xuất
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div>
                  <div className="font-semibold text-slate-800">
                    Nhập thông tin sản xuất
                  </div>
                  <div className="text-sm text-slate-600">
                    Chọn thuốc, số lô, số lượng, ngày sản xuất & hạn sử dụng
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  <div className="font-semibold text-slate-800">
                    Upload lên IPFS
                  </div>
                  <div className="text-sm text-slate-600">
                    Lưu metadata lên Pinata IPFS
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div>
                  <div className="font-semibold text-slate-800">
                    Mint NFT trên Blockchain
                  </div>
                  <div className="text-sm text-slate-600">
                    Gọi Smart Contract để mint NFT
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <button
              onClick={handleStartProduction}
              className="px-4 py-2.5 rounded-full bg-gradient-to-r from-secondary to-primary !text-white font-medium shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              Bắt đầu sản xuất mới
            </button>
          </div>
        </div>
      )}

      {/* Production Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scroll">
            <style>{`
              /* Ẩn scrollbar trong modal để giao diện sạch hơn */
              .custom-scroll { scrollbar-width: none; -ms-overflow-style: none; }
              .custom-scroll::-webkit-scrollbar { width: 0; height: 0; }
              .custom-scroll::-webkit-scrollbar-track { background: transparent; }
              .custom-scroll::-webkit-scrollbar-thumb { background: transparent; }
            `}</style>

            {/* Header */}
            <div className="bg-gradient-to-r from-secondary to-primary px-8 py-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold !text-white">
                    Sản xuất & Mint NFT
                  </h2>
                  <p className="text-cyan-100 text-sm">
                    {step === 1 && "Bước 1/2: Nhập thông tin sản xuất"}
                    {step === 2 && "Bước 2/2: Sẵn sàng mint NFT"}
                    {step === 3 && "Đang mint NFT..."}
                    {step === 4 && "Hoàn thành!"}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={step === 3}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center !text-white text-xl transition disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Step 1: Form */}
            {step === 1 && (
              <div className="p-8 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Chọn thuốc *
                  </label>
                  <select
                    value={formData.drugId}
                    onChange={(e) => {
                      setFormData({ ...formData, drugId: e.target.value });
                      if (errors.drugId) {
                        setErrors({ ...errors, drugId: "" });
                      }
                    }}
                    className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 ${
                      errors.drugId
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                    }`}
                  >
                    <option value="">-- Chọn thuốc --</option>
                    {drugs.map((drug) => (
                      <option key={drug._id} value={drug._id}>
                        {drug.tradeName} ({drug.atcCode})
                      </option>
                    ))}
                  </select>
                  {errors.drugId && (
                    <p className="mt-1 text-sm text-red-600">{errors.drugId}</p>
                  )}
                </div>

                {selectedDrug && (
                  <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                    <div className="text-sm font-semibold text-cyan-800 mb-2">
                      Thông tin thuốc:
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-slate-600">Tên hoạt chất:</span>{" "}
                        <span className="font-medium">
                          {selectedDrug.genericName}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600">Dạng bào chế:</span>{" "}
                        <span className="font-medium">
                          {selectedDrug.dosageForm}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600">Hàm lượng:</span>{" "}
                        <span className="font-medium">
                          {selectedDrug.strength}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600">Quy cách:</span>{" "}
                        <span className="font-medium">
                          {selectedDrug.packaging}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số lô sản xuất *
                    </label>
                    <input
                      type="text"
                      value={formData.batchNumber}
                      maxLength={30}
                      onChange={(e) => {
                        // Chỉ cho phép chữ và số, tự động chuyển sang uppercase, giới hạn 30 ký tự
                        let value = e.target.value
                          .replace(/[^A-Za-z0-9]/g, "")
                          .toUpperCase();

                        // Giới hạn tối đa 30 ký tự
                        if (value.length > 30) {
                          value = value.substring(0, 30);
                        }

                        setFormData({
                          ...formData,
                          batchNumber: value,
                        });
                        // Clear error khi người dùng nhập
                        if (errors.batchNumber) {
                          setErrors({ ...errors, batchNumber: "" });
                        }
                      }}
                      className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 ${
                        errors.batchNumber
                          ? "border-red-500 focus:ring-red-400"
                          : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                      }`}
                      placeholder="VD: LOT2024001"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {formData.batchNumber.length}/30 ký tự
                    </div>
                    {errors.batchNumber && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.batchNumber}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số lượng (hộp) *
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => {
                        let value = e.target.value;

                        // Cho phép rỗng để người dùng có thể xóa
                        if (value === "") {
                          setFormData({ ...formData, quantity: value });
                          if (errors.quantity) {
                            setErrors({ ...errors, quantity: "" });
                          }
                          return;
                        }

                        // Loại bỏ dấu trừ và các ký tự không phải số
                        value = value.replace(/[^0-9]/g, "");

                        if (value === "") {
                          setFormData({ ...formData, quantity: "" });
                          if (errors.quantity) {
                            setErrors({ ...errors, quantity: "" });
                          }
                          return;
                        }

                        const numValue = parseInt(value);

                        // Kiểm tra giới hạn tối đa
                        if (numValue >= 10000000) {
                          value = "9999999";
                        }

                        setFormData({ ...formData, quantity: value });

                        // Clear error khi người dùng nhập
                        if (errors.quantity) {
                          setErrors({ ...errors, quantity: "" });
                        }
                      }}
                      onKeyDown={(e) => {
                        // Ngăn chặn nhập dấu trừ, dấu cộng, chữ e, E, dấu chấm
                        if (
                          e.key === "-" ||
                          e.key === "+" ||
                          e.key === "e" ||
                          e.key === "E" ||
                          e.key === "."
                        ) {
                          e.preventDefault();
                        }
                      }}
                      className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 ${
                        errors.quantity
                          ? "border-red-500 focus:ring-red-400"
                          : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                      }`}
                      placeholder="VD: 1000"
                      min="1"
                      max="9999999"
                    />
                    <div className="text-xs text-cyan-600 mt-1">
                      Sẽ mint {formData.quantity || 0} NFT (1 NFT = 1 hộp thuốc)
                    </div>
                    {errors.quantity && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.quantity}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ngày sản xuất *
                    </label>
                    <input
                      type="date"
                      value={formData.manufacturingDate}
                      onChange={(e) => {
                        const selectedDate = e.target.value;

                        if (!selectedDate) {
                          setFormData({
                            ...formData,
                            manufacturingDate: selectedDate,
                          });
                          if (errors.manufacturingDate) {
                            setErrors({ ...errors, manufacturingDate: "" });
                          }
                          return;
                        }

                        // Kiểm tra và sửa ngày nếu không hợp lệ
                        const validationResult =
                          validateAndFixManufacturingDate(selectedDate);

                        setFormData({
                          ...formData,
                          manufacturingDate: validationResult.fixedDate,
                        });

                        // Clear error khi người dùng chọn ngày
                        if (errors.manufacturingDate) {
                          setErrors({ ...errors, manufacturingDate: "" });
                        }
                      }}
                      onBlur={(e) => {
                        const selectedDate = e.target.value;
                        if (!selectedDate) return;

                        // Kiểm tra lại khi blur và tự động sửa nếu không hợp lệ
                        const validationResult =
                          validateAndFixManufacturingDate(selectedDate);

                        if (!validationResult.isValid) {
                          setFormData({
                            ...formData,
                            manufacturingDate: validationResult.fixedDate,
                          });
                        }
                      }}
                      min={(() => {
                        const today = new Date();
                        const minDate = new Date(today);
                        minDate.setDate(today.getDate() - 60);
                        return minDate.toISOString().split("T")[0];
                      })()}
                      max={new Date().toISOString().split("T")[0]}
                      className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 ${
                        errors.manufacturingDate
                          ? "border-red-500 focus:ring-red-400"
                          : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                      }`}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Phạm vi: Từ 60 ngày trước đến hôm nay
                    </div>
                    {errors.manufacturingDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.manufacturingDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Thời hạn sử dụng *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        max={getMaxShelfLife(shelfLifeUnit)}
                        value={shelfLifeValue}
                        onChange={(e) => {
                          let value = e.target.value;

                          // Cho phép rỗng để người dùng có thể xóa
                          if (value === "") {
                            setShelfLifeValue(value);
                            if (errors.shelfLife) {
                              setErrors({ ...errors, shelfLife: "" });
                            }
                            return;
                          }

                          // Loại bỏ ký tự không phải số và dấu chấm
                          value = value.replace(/[^0-9.]/g, "");

                          // Chỉ cho phép một dấu chấm
                          const parts = value.split(".");
                          if (parts.length > 2) {
                            value = parts[0] + "." + parts.slice(1).join("");
                          }

                          const numValue = parseFloat(value);
                          const maxValue = getMaxShelfLife(shelfLifeUnit);

                          // Kiểm tra giới hạn tối đa
                          if (!isNaN(numValue) && numValue > maxValue) {
                            value = maxValue.toString();
                          }

                          setShelfLifeValue(value);

                          // Validate realtime
                          if (value) {
                            const validation = validateShelfLife(
                              value,
                              shelfLifeUnit,
                              formData.manufacturingDate
                            );
                            if (!validation.isValid) {
                              setErrors({
                                ...errors,
                                shelfLife: validation.error,
                              });
                            } else {
                              // Clear error khi hợp lệ
                              if (errors.shelfLife) {
                                setErrors({ ...errors, shelfLife: "" });
                              }
                            }
                          } else {
                            // Clear error khi rỗng (để người dùng có thể xóa)
                            if (
                              errors.shelfLife &&
                              errors.shelfLife !==
                                "Thời hạn sử dụng không được để trống"
                            ) {
                              setErrors({ ...errors, shelfLife: "" });
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (!value || !value.trim()) {
                            // Không làm gì khi blur nếu rỗng, để validation form xử lý
                            return;
                          }

                          // Validate khi blur
                          const validation = validateShelfLife(
                            value,
                            shelfLifeUnit,
                            formData.manufacturingDate
                          );
                          if (!validation.isValid) {
                            setErrors({
                              ...errors,
                              shelfLife: validation.error,
                            });
                          }
                        }}
                        className={`w-full border-2 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:outline-none hover:shadow-sm transition-all duration-150 ${
                          errors.shelfLife
                            ? "border-red-500 focus:ring-red-400"
                            : "border-gray-300 focus:ring-gray-400 hover:border-gray-400"
                        }`}
                        placeholder="VD: 12"
                      />
                      <select
                        value={shelfLifeUnit}
                        onChange={(e) => {
                          const newUnit = e.target.value;
                          setShelfLifeUnit(newUnit);

                          // Kiểm tra lại giá trị với đơn vị mới
                          if (shelfLifeValue) {
                            const maxValue = getMaxShelfLife(newUnit);
                            const numValue = parseFloat(shelfLifeValue);

                            // Nếu giá trị vượt quá giới hạn mới, tự động điều chỉnh
                            if (!isNaN(numValue) && numValue > maxValue) {
                              setShelfLifeValue(maxValue.toString());
                            }

                            // Validate lại
                            const validation = validateShelfLife(
                              numValue > maxValue
                                ? maxValue.toString()
                                : shelfLifeValue,
                              newUnit,
                              formData.manufacturingDate
                            );
                            if (!validation.isValid) {
                              setErrors({
                                ...errors,
                                shelfLife: validation.error,
                              });
                            } else {
                              setErrors({ ...errors, shelfLife: "" });
                            }
                          } else {
                            // Clear error khi chọn đơn vị mới
                            if (errors.shelfLife) {
                              setErrors({ ...errors, shelfLife: "" });
                            }
                          }
                        }}
                        className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition-all duration-150"
                      >
                        <option value="day">ngày</option>
                        <option value="month">tháng</option>
                        <option value="year">năm</option>
                      </select>
                    </div>
                    <div className="mt-2 text-cyan-600 text-sm font-medium">
                      Ngày hết hạn:{" "}
                      {formatDateMDY(formData.expiryDate) || "mm/dd/yyyy"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Giới hạn tối đa: {getMaxShelfLife(shelfLifeUnit)}{" "}
                      {shelfLifeUnit === "year"
                        ? "năm"
                        : shelfLifeUnit === "month"
                        ? "tháng"
                        : "ngày"}{" "}
                      (10 năm)
                    </div>
                    {errors.shelfLife && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.shelfLife}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full border-2 border-gray-300 rounded-xl p-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none hover:border-gray-400 hover:shadow-sm transition-all duration-150"
                    rows="3"
                    placeholder="Ghi chú thêm về lô sản xuất..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: IPFS Success */}
            {step === 2 && ipfsData && (
              <div className="p-8 space-y-4">
                {/* Box: Bước 1 hoàn thành */}
                <div className="rounded-xl p-5 border border-cyan-200 bg-cyan-50">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white text-cyan-600 border border-cyan-200 shadow-sm flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293A1 1 0 006.293 10.707l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <div>
                      <div className="font-semibold text-cyan-800">
                        Bước 1 hoàn thành!
                      </div>
                      <div className="text-sm text-cyan-700">
                        Dữ liệu đã được lưu lên IPFS thành công.
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">IPFS Hash:</span>
                      <span className="font-mono text-cyan-700">
                        {ipfsData.ipfsHash}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Số lượng NFT:</span>
                      <span className="font-bold text-cyan-800">
                        {ipfsData.amount || formData.quantity}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Box: Thông tin sản xuất */}
                <div className="rounded-xl p-5 border border-cyan-200 bg-cyan-50">
                  <div className="font-semibold text-cyan-800 mb-3">
                    Thông tin sản xuất:
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Thuốc:</span>
                      <span className="font-medium">
                        {selectedDrug?.tradeName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Số lô:</span>
                      <span className="font-mono font-medium">
                        {formData.batchNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Số lượng:</span>
                      <span className="font-bold text-slate-800">
                        {formData.quantity} hộp
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">NSX:</span>
                      <span className="font-medium">
                        {formData.manufacturingDate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">HSD:</span>
                      <span className="font-medium">{formData.expiryDate}</span>
                    </div>
                  </div>
                </div>

                {/* Box: Cảnh báo */}
                <div className="rounded-xl p-4 border border-amber-200 bg-amber-50">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white text-amber-600 border border-amber-200 shadow-sm flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l6.518 11.594A1.999 1.999 0 0116.518 18H3.482a2 2 0 01-1.743-3.307L8.257 3.1zM11 14a1 1 0 10-2 0 1 1 0 002 0zm-1-2a1 1 0 01-1-1V8a1 1 0 112 0v3a1 1 0 01-1 1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <div>
                      <div className="font-semibold text-amber-800">
                        Sẵn sàng mint NFT
                      </div>
                      <div className="text-sm text-amber-700">
                        Bước tiếp theo sẽ gọi smart contract để mint{" "}
                        {formData.quantity} NFT lên blockchain. Quá trình này
                        không thể hoàn tác.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Minting */}
            {step === 3 && (
              <div className="p-6">
                <BlockchainMintingView
                  status={
                    mintButtonState === "completed" ? "completed" : "minting"
                  }
                />
              </div>
            )}

            {/* Step 4: Success */}
            {step === 4 && mintResult && (
              <div className="p-8">
                <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-8 text-center">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-white border border-cyan-200 text-cyan-600 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-8 h-8"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293A1 1 0 006.293 10.707l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-cyan-900">
                    Sản xuất thành công!
                  </div>
                  <div className="text-sm text-cyan-700 mt-1">
                    NFT đã được mint và lưu vào hệ thống
                  </div>

                  <div className="mt-6 text-left bg-white rounded-xl border border-cyan-100 p-5">
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-slate-600">Số lô:</div>
                      <div className="text-right font-mono font-medium">
                        {formData.batchNumber}
                      </div>
                      <div className="text-slate-600">Số lượng NFT:</div>
                      <div className="text-right font-bold text-cyan-800">
                        {formData.quantity}
                      </div>
                      {mintResult.transactionHash && (
                        <>
                          <div className="text-slate-600">
                            Transaction Hash:
                          </div>
                          <div className="text-right font-mono text-xs text-cyan-700">
                            {mintResult.transactionHash.slice(0, 10)}...
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl flex justify-end space-x-8">
              {step === 1 && (
                <TruckAnimationButton
                  onClick={handleUploadToIPFS}
                  disabled={uploadButtonState === "uploading"}
                  buttonState={uploadButtonState}
                  defaultText="Bước 1: Upload IPFS"
                  uploadingText="Đang vận chuyển dữ liệu..."
                  successText="Upload thành công"
                />
              )}
              {step === 2 && (
                <>
                  <button
                    onClick={handleMintNFT}
                    disabled={processingMint}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#00b4d8] to-[#48cae4] !text-white font-medium shadow-md hover:shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {mintButtonState === "minting"
                      ? "Đang mint..."
                      : mintButtonState === "completed"
                      ? "Mint thành công!"
                      : "Mint NFT ngay"}
                  </button>
                </>
              )}
              {step === 4 && (
                <>
                  <button
                    onClick={handleClose}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#00b4d8] to-[#48cae4] !text-white font-medium shadow-md hover:shadow-lg transition"
                  >
                    Hoàn thành
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
