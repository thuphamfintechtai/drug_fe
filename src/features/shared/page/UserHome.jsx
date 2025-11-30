/* eslint-disable no-undef */
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsFillBoxSeamFill,
  BsTruck,
  BsShop,
  BsPersonFill,
  BsInfoCircle,
  BsCheckCircleFill,
  BsSearch,
  BsEye,
  BsShieldLock,
} from "react-icons/bs";
import { Scanner } from "@yudiel/react-qr-scanner";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useMetaMask } from "../hooks/useMetaMask";
import { formatWalletAddress } from "../../utils/walletUtils";
import TruckTransfer from "../components/TruckTransfer";
import VietnamDeliveryMapAdvanced from "../components/VietnamDeliveryMapAdvanced";

export default function UserHome() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const {
    account,
    isConnected,
    isInstalled,
    connect,
    isConnecting,
    disconnect,
    chainId,
  } = useMetaMask();
  const [tokenId, setTokenId] = useState("");
  const [drugSearch, setDrugSearch] = useState("");
  const [searchMode, setSearchMode] = useState("nft");
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [qrError, setQrError] = useState(null);
  const [showUploadQR, setShowUploadQR] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);
  const walletModalRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserDropdown]);

  useEffect(() => {
    const handleOpenWalletModal = () => {
      if (account) {
        setShowWalletModal(true);
      }
    };

    window.addEventListener("openWalletModal", handleOpenWalletModal);

    return () => {
      window.removeEventListener("openWalletModal", handleOpenWalletModal);
    };
  }, [account]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && showWalletModal) {
        setShowWalletModal(false);
      }
    };

    if (showWalletModal) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [showWalletModal]);

  const handleConnectMetaMask = async () => {
    if (!isInstalled) {
      toast.error(
        "MetaMask chưa được cài đặt. Vui lòng cài đặt MetaMask extension."
      );
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    const success = await connect();
    if (success) {
      toast.success("Đã kết nối với MetaMask!");
    } else {
      toast.error("Không thể kết nối với MetaMask.");
    }
  };

  const handleLogout = async () => {
    if (isConnected) {
      await disconnect();
    }
    // Clear state ngay lập tức trước khi navigate
    const { useAuthStore } = await import("../../auth/store");
    const { clearAuthCookies } = await import("../../auth/utils/cookieUtils");
    useAuthStore.getState().clearAuthState();
    clearAuthCookies();
    setShowUserDropdown(false);
    // Navigate ngay lập tức
    navigate("/", { replace: true });
    // Sau đó gọi API logout (không block)
    try {
      await logout();
      toast.success("Đã đăng xuất thành công!");
    } catch (error) {
      console.error("Logout API error:", error);
      toast.success("Đã đăng xuất thành công!");
    }
  };

  const formatAddress = (addr) => {
    if (!addr) {
      return "";
    }
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getNetworkName = (chainId) => {
    if (!chainId) {
      return "Mạng không xác định";
    }
    const networkMap = {
      "0x1": "Ethereum Mainnet",
      "0x5": "Goerli Testnet",
      "0xaa36a7": "Sepolia Testnet",
      "0x38": "BNB Smart Chain",
      "0x61": "BSC Testnet",
      "0x89": "Polygon",
      "0x13881": "Polygon Mumbai",
      "0x1e240": "PIONE Network",
    };
    const chainIdNum = parseInt(chainId, 16);
    return networkMap[chainId] || `Mạng không xác định #${chainIdNum}`;
  };

  const handleCopyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      toast.success("Đã sao chép địa chỉ ví!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnectMetaMask = async () => {
    await disconnect();
    setShowWalletModal(false);
    toast.success(
      "Đã ngắt kết nối ví MetaMask. Bạn sẽ cần chọn lại tài khoản khi kết nối lại."
    );
  };

  const walletAddress = account || user?.walletAddress || "";
  const displayWalletAddress = walletAddress
    ? formatWalletAddress(walletAddress, 6, 4)
    : "";

  const handleTrackDrug = () => {
    const trimmedTokenId = tokenId.trim();
    if (!trimmedTokenId) {
      toast.error("Vui lòng nhập mã lô, mã serial hoặc NFT ID");
      return;
    }
    navigate(`/track?tokenId=${trimmedTokenId}`);
  };

  const handleScanQR = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setShowQRScanner(true);
      setIsScanning(true);
    } catch (error) {
      console.error("Camera permission error:", error);
      toast.error(
        "Không thể truy cập camera. Vui lòng cấp quyền truy cập camera."
      );
    }
  };

  const handleQRResult = (result) => {
    if (result && result[0] && result[0].rawValue) {
      const scannedText = result[0].rawValue;
      console.log("QR Code scanned:", scannedText);
      setShowQRScanner(false);
      setIsScanning(false);
      processQRResult(scannedText);
    }
  };

  const handleQRError = (error) => {
    if (
      error &&
      !error.message?.includes("No QR code found") &&
      !error.message?.includes("NotFoundException")
    ) {
      console.log("QR scan error:", error);
      setQrError(error.message || "Lỗi khi quét QR");
    }
  };

  const processQRResult = (scannedText) => {
    if (!scannedText) {
      console.warn("processQRResult: scannedText is empty");
      return;
    }

    const trimmedText = String(scannedText).trim();
    if (!trimmedText) {
      console.warn("processQRResult: trimmedText is empty");
      return;
    }

    console.log("QR Code scanned (original):", trimmedText);

    // FIX: Chuyển đổi localhost:9000 sang production URL hoặc extract tokenId từ scanQR endpoint
    let processedText = trimmedText;

    // Nếu QR code chứa localhost:9000, thay thế bằng production domain
    if (trimmedText.includes("localhost:9000")) {
      const productionDomain = "https://ailusion.io.vn";
      processedText = trimmedText.replace(
        /https?:\/\/localhost:9000/g,
        productionDomain
      );
      processedText = processedText.replace(
        /localhost:9000/g,
        productionDomain
      );
      console.log("Converted localhost:9000 to production URL:", processedText);
    }

    // Nếu QR code là API endpoint scanQR, extract tokenId và navigate
    if (
      processedText.includes("/api/public/scanQR/") ||
      processedText.includes("/public/scanQR/")
    ) {
      const tokenIdMatch = processedText.match(/\/scanQR\/(\d+)/);
      if (tokenIdMatch && tokenIdMatch[1]) {
        const tokenId = tokenIdMatch[1];
        console.log("Extracted tokenId from QR URL:", tokenId);
        setTokenId(tokenId);
        setShowQRScanner(false);
        setIsScanning(false);
        setShowUploadQR(false);
        toast.success("Đã quét QR thành công!");
        setTimeout(() => {
          navigate(`/track?tokenId=${encodeURIComponent(tokenId)}`);
        }, 800);
        return;
      }
    }

    const isUrl =
      /^(https?:\/\/|drug-be.vercel.app|ailusion.io.vn|http:\/\/drug-be.vercel.app|https:\/\/drug-be.vercel.app|http:\/\/ailusion.io.vn|https:\/\/ailusion.io.vn)/i.test(
        processedText
      ) ||
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}/.test(
        processedText
      );

    if (isUrl) {
      try {
        let urlToNavigate = processedText;

        if (
          !processedText.startsWith("http://") &&
          !processedText.startsWith("https://")
        ) {
          if (processedText.startsWith("drug-be.vercel.app")) {
            urlToNavigate = `https://${processedText}`;
          } else {
            urlToNavigate = `https://${processedText}`;
          }
        }

        const url = new URL(urlToNavigate);
        console.log("QR contains URL, redirecting to:", url.href);

        setShowQRScanner(false);
        setIsScanning(false);
        setShowUploadQR(false);
        toast.success("Đã quét QR thành công! Đang chuyển hướng...");

        setTimeout(() => {
          const finalUrl =
            processedText.startsWith("http://") ||
            processedText.startsWith("https://")
              ? processedText
              : url.href;
          console.log("Final redirect URL:", finalUrl);
          window.location.href = finalUrl;
        }, 800);
      } catch (e) {
        console.error("Error parsing URL:", e);
        setShowQRScanner(false);
        setIsScanning(false);
        setShowUploadQR(false);
        toast.success("Đã quét QR thành công! Đang chuyển hướng...");
        setTimeout(() => {
          let urlToRedirect = processedText;
          if (
            !processedText.startsWith("http://") &&
            !processedText.startsWith("https://")
          ) {
            urlToRedirect = `https://${processedText}`;
          }
          console.log("Direct redirect to:", urlToRedirect);
          window.location.href = urlToRedirect;
        }, 800);
      }
    } else {
      console.log("QR does not contain URL, treating as tokenId");
      setTokenId(processedText);
      setShowQRScanner(false);
      setIsScanning(false);
      setShowUploadQR(false);
      toast.success("Đã quét QR thành công!");
      setTimeout(() => {
        navigate(`/track?tokenId=${encodeURIComponent(processedText)}`);
      }, 800);
    }
  };

  const handleCloseQRScanner = () => {
    setShowQRScanner(false);
    setIsScanning(false);
    setQrError(null);
  };

  const enhanceImageForQR = (imageData, options = {}) => {
    const { contrast = 1.5, threshold = 128, useBinary = true } = options;
    const data = imageData.data;
    const newData = new ImageData(
      new Uint8ClampedArray(data),
      imageData.width,
      imageData.height
    );
    const newDataArray = newData.data;

    for (let i = 0; i < newDataArray.length; i += 4) {
      const gray =
        newDataArray[i] * 0.299 +
        newDataArray[i + 1] * 0.587 +
        newDataArray[i + 2] * 0.114;

      const enhanced = (gray - 128) * contrast + 128;
      let final = Math.max(0, Math.min(255, enhanced));

      if (useBinary) {
        final = final > threshold ? 255 : 0;
      }

      newDataArray[i] = final;
      newDataArray[i + 1] = final;
      newDataArray[i + 2] = final;
    }
    return newData;
  };

  const handleUploadQRImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.warn("No file selected");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh hợp lệ");
      return;
    }

    setUploadingImage(true);
    setQrError(null);

    try {
      console.log("Starting QR decode from image:", file.name);

      const img = new Image();
      const imageUrl = URL.createObjectURL(file);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      console.log("Image loaded, dimensions:", img.width, "x", img.height);

      const maxDimension = 2000;
      let canvasWidth = img.width;
      let canvasHeight = img.height;

      if (canvasWidth > maxDimension || canvasHeight > maxDimension) {
        const ratio = Math.min(
          maxDimension / canvasWidth,
          maxDimension / canvasHeight
        );
        canvasWidth = Math.floor(canvasWidth * ratio);
        canvasHeight = Math.floor(canvasHeight * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      URL.revokeObjectURL(imageUrl);

      toast.error(
        "Tính năng upload ảnh QR tạm thời không khả dụng. Vui lòng sử dụng chức năng quét camera."
      );
    } catch (error) {
      console.error("Error decoding QR from image:", error);
      let errorMessage = "Không thể đọc mã QR từ ảnh";

      if (error.message) {
        errorMessage = error.message;
      } else if (error.name === "NotFoundException") {
        errorMessage =
          "Không tìm thấy mã QR trong ảnh. Vui lòng đảm bảo ảnh chứa mã QR rõ nét.";
      } else if (error.message?.includes("No MultiFormat Readers")) {
        errorMessage =
          "Không thể đọc mã QR. Vui lòng thử lại với ảnh rõ hơn hoặc sử dụng chức năng quét camera.";
      }

      toast.error(errorMessage);
      setQrError(errorMessage);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleOpenUploadQR = () => {
    setShowUploadQR(true);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const handleSearchDrug = () => {
    const trimmedSearch = drugSearch.trim();
    if (!trimmedSearch) {
      toast.error("Vui lòng nhập tên thuốc hoặc mã ATC");
      return;
    }
    navigate(`/drug-info?search=${encodeURIComponent(trimmedSearch)}`);
  };

  const processSteps = [
    {
      step: "Bước 1: Nhà sản xuất",
      desc: "Nhà sản xuất tạo Proof of Production và mint NFT",
      icon: <BsFillBoxSeamFill />,
      color: "text-green-600",
      bgColor: "bg-green-100",
      align: "start",
    },
    {
      step: "Bước 2: Phân phối",
      desc: "Chuyển quyền sở hữu NFT từ nhà sản xuất sang nhà phân phối",
      icon: <BsTruck />,
      color: "text-red-600",
      bgColor: "bg-red-100",
      align: "mid-start",
    },
    {
      step: "Bước 3: Bán Lẻ",
      desc: "Nhà phân phối chuyển NFT sang nhà thuốc",
      icon: <BsShop />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      align: "mid-end",
    },
    {
      step: "Bước 4: Người dùng",
      desc: "Người dùng tra cứu thông tin bằng mã QR hoặc serial",
      icon: <BsPersonFill />,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      align: "end",
    },
  ];

  const benefits = [
    "Ngăn chặn thuốc giả, thuốc kém chất lượng.",
    "Tăng niềm tin của người tiêu dùng.",
    "Theo dõi chính xác chuỗi cung ứng.",
    "Tuân thủ quy định pháp luật.",
    "Hỗ trợ thu hồi sản phẩm khi cần thiết.",
  ];

  const StepCard = ({ step, desc, icon, color, bgColor, index = 0 }) => {
    // Ensure index is a valid number
    const stepIndex = typeof index === "number" && !isNaN(index) ? index : 0;

    const colorMap = {
      green: {
        gradient: "from-emerald-500 to-teal-600",
        bg: "from-emerald-50 to-teal-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
      },
      red: {
        gradient: "from-rose-500 to-pink-600",
        bg: "from-rose-50 to-pink-50",
        border: "border-rose-200",
        text: "text-rose-700",
      },
      blue: {
        gradient: "from-blue-500 to-indigo-600",
        bg: "from-blue-50 to-indigo-50",
        border: "border-blue-200",
        text: "text-blue-700",
      },
      yellow: {
        gradient: "from-amber-500 to-orange-600",
        bg: "from-amber-50 to-orange-50",
        border: "border-amber-200",
        text: "text-amber-700",
      },
    };

    const stepColor =
      stepIndex === 0
        ? colorMap.green
        : stepIndex === 1
        ? colorMap.red
        : stepIndex === 2
        ? colorMap.blue
        : colorMap.yellow;

    const stepNumber = stepIndex + 1;

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{
          duration: 0.5,
          delay: stepIndex * 0.15,
        }}
        className="relative h-full"
      >
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 h-full flex flex-col group hover:shadow-xl transition-all duration-300 hover:border-slate-300">
          {/* Step number */}
          <div className="flex items-center justify-between mb-6">
            <div
              className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stepColor.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
            >
              <span className="text-white text-xl">{icon}</span>
            </div>
            <div
              className={`w-8 h-8 rounded-full bg-gradient-to-br ${stepColor.gradient} flex items-center justify-center text-white text-sm font-bold shadow-sm`}
            >
              {stepNumber}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3
              className={`font-bold mb-3 text-lg sm:text-xl ${stepColor.text} transition-colors`}
            >
              {step}
            </h3>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {desc}
            </p>
          </div>

          {/* Bottom accent line */}
          <div
            className={`mt-6 h-1 w-0 bg-gradient-to-r ${stepColor.gradient} group-hover:w-full transition-all duration-500 rounded-full`}
          />
        </div>
      </motion.div>
    );
  };

  const features = [
    {
      icon: <BsSearch />,
      title: "Tra cứu dễ dàng",
      description:
        "Tìm kiếm thông tin sản phẩm bằng mã lô, mã QR hoặc series number.",
      gradient: "from-blue-500 to-cyan-400",
      bgGradient: "from-blue-50 to-cyan-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      icon: <BsEye />,
      title: "Minh bạch hoàn toàn",
      description:
        "Thông tin rõ ràng, chi tiết về toàn bộ quy trình từ nhà sản xuất đến nhà thuốc.",
      gradient: "from-[#4BADD1] to-teal-400",
      bgGradient: "from-[#4BADD1]/10 to-teal-50",
      iconBg: "bg-[#4BADD1]/20",
      iconColor: "text-[#4BADD1]",
      featured: true,
    },
    {
      icon: <BsShieldLock />,
      title: "Bảo mật tuyệt đối",
      description:
        "Dữ liệu được bảo mật bằng công nghệ blockchain, không thể thay đổi hay giả mạo.",
      gradient: "from-purple-500 to-indigo-400",
      bgGradient: "from-purple-50 to-indigo-50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Wallet Modal - giữ nguyên */}
      <AnimatePresence mode="wait">
        {showWalletModal && account && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWalletModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            />

            {/* Modal */}
            <motion.div
              ref={walletModalRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none"
            >
              <div
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-6 pointer-events-auto border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Wallet Info Section */}
                <div className="flex items-start gap-4">
                  {/* Profile Icon */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-10 h-10 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center border-2 border-white">
                      <span className="text-xs">🦊</span>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-base sm:text-lg font-mono text-gray-900 font-semibold break-all">
                        {formatAddress(account)}
                      </p>
                      <button
                        onClick={handleCopyAddress}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                        title="Sao chép"
                      >
                        {copied ? (
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">MetaMask</p>
                  </div>
                </div>

                {/* Chain Information */}
                <button className="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-sm sm:text-base">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-700">
                      {chainId
                        ? getNetworkName(chainId)
                        : "Mạng không xác định"}
                    </span>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* Menu Items */}
                <div className="space-y-1">
                  <button className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 rounded-lg transition-colors text-left text-sm sm:text-base">
                    <svg
                      className="w-5 h-5 text-gray-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                    <span className="text-sm text-gray-700">Giao dịch</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 rounded-lg transition-colors text-left text-sm sm:text-base">
                    <svg
                      className="w-5 h-5 text-gray-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span className="text-sm text-gray-700">Xem tài sản</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 rounded-lg transition-colors text-left text-sm sm:text-base">
                    <svg
                      className="w-5 h-5 text-gray-500 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    <span className="text-sm text-gray-700">Quản lý ví</span>
                  </button>
                </div>

                {/* Separator */}
                <div className="border-t border-gray-200"></div>

                {/* Disconnect */}
                <button
                  onClick={handleDisconnectMetaMask}
                  className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 hover:bg-red-50 rounded-lg transition-colors text-left group text-sm sm:text-base"
                >
                  <svg
                    className="w-5 h-5 text-gray-500 group-hover:text-red-600 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="text-sm text-gray-700 group-hover:text-red-600">
                    Ngắt kết nối ví
                  </span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section - HORIZONTAL LAYOUT */}
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Background Effects */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-[#4BADD1]/5 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-[#4BADD1]/5 rounded-full blur-3xl"
            animate={{
              x: [0, -50, 0],
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        <section className="pt-8 sm:pt-12 md:pt-16 pb-12 sm:pb-20 px-4 w-full relative z-10">
          <div className="max-w-7xl mx-auto w-full">
            {/* Title - Centered Above Everything */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left mt-24"
            >
              <motion.h1
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-[#2176FF] mb-3 sm:mb-4 md:mb-6 leading-tight tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-linear-to-r from-[#054f67] font-bold to-[#4298b7] bg-clip-text text-transparent block"
                >
                  Hệ Thống Truy Xuất Nguồn Gốc Thuốc
                </motion.span>
                <motion.div
                  className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 w-full font-medium leading-relaxed px-2 sm:px-0 text-left tracking-wide"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <span className="text-left">
                    Tra cứu thông tin sản phẩm, theo dõi lộ trình phân phối an
                    toàn với công nghệ{" "}
                  </span>
                  <motion.strong
                    className="text-[#054f67] font-bold relative"
                    animate={{
                      textShadow: [
                        "0 0 0px rgba(75, 173, 209, 0)",
                        "0 0 10px rgba(75, 173, 209, 0.5)",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    }}
                  >
                    Blockchain
                  </motion.strong>
                  .
                </motion.div>
              </motion.h1>
            </motion.div>

            {/* HORIZONTAL LAYOUT: Form Left + Map Right */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_0.5fr] gap-8 lg:gap-12 items-center">
              {/* LEFT COLUMN: Search Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="w-full px-2 sm:px-0 order-2 lg:order-1 lg:max-w-[750px]"
              >
                {/* Tabs */}

                <div className="bg-white rounded-2xl mt-16 shadow-xl border-2 border-[#077CA3] p-4 sm:p-6 md:p-8">
                  <div className="flex gap-2 mb-4 justify-center lg:justify-start flex-wrap">
                    <button
                      onClick={() => setSearchMode("nft")}
                      className={`px-3 sm:px-6 py-2 text-xs sm:text-sm md:text-base rounded-lg font-semibold transition whitespace-nowrap ${
                        searchMode === "nft"
                          ? "bg-[#077CA3] !text-white shadow-lg"
                          : "bg-white text-slate-700 border-2 border-slate-200 hover:border-[#077CA3]"
                      }`}
                    >
                      Tra cứu NFT
                    </button>
                    <button
                      onClick={() => setSearchMode("drug")}
                      className={`px-3 sm:px-6 py-2 text-xs sm:text-sm md:text-base rounded-lg font-semibold transition whitespace-nowrap ${
                        searchMode === "drug"
                          ? "bg-[#077CA3] !text-white shadow-lg"
                          : "bg-white text-slate-700 border-2 border-slate-200 hover:border-[#077CA3]"
                      }`}
                    >
                      Thông tin thuốc
                    </button>
                  </div>
                  {searchMode === "nft" ? (
                    <>
                      <p className="text-slate-700 mb-4 sm:mb-5 text-left text-xs sm:text-sm font-semibold flex items-center gap-2">
                        <svg
                          className="w-3 sm:w-4 h-3 sm:h-4 text-[#077CA3] flex-shrink-0"
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
                        Nhập mã lô, mã serial hoặc NFT ID
                      </p>

                      <div className="space-y-3">
                        {/* Input Field */}
                        {/* <div className="relative">
                          <svg
                            className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          <input
                            type="text"
                            value={tokenId}
                            onChange={(e) => setTokenId(e.target.value)}
                            onKeyPress={(e) =>
                              e.key === "Enter" && handleTrackDrug()
                            }
                            placeholder="Nhập mã để tra cứu..."
                            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4BADD1]/50 focus:border-[#4BADD1] transition text-sm sm:text-base placeholder:text-slate-400"
                          />
                        </div> */}

                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={handleScanQR}
                            className="px-3 py-3 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl transition-all flex flex-col items-center justify-center gap-1 text-xs hover:border-[#077CA3] hover:shadow-md active:scale-95"
                          >
                            <svg
                              className="w-5 h-5 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zM14 13h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2zm0-4h2v2h-2v-2zm2 2h3v2h-3v-2z" />
                            </svg>
                            <span className="font-semibold">Quét QR</span>
                          </button>

                          <button
                            onClick={handleOpenUploadQR}
                            className="px-3 py-3 bg-white border-2 border-[#077CA3] text-slate-700 font-semibold rounded-xl transition-all flex flex-col items-center justify-center gap-1 text-xs hover:border-[#077CA3] hover:shadow-md active:scale-95"
                          >
                            <svg
                              className="w-5 h-5 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="font-semibold">Upload</span>
                          </button>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleUploadQRImage}
                          className="hidden"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-slate-700 mb-4 sm:mb-5 text-left text-xs sm:text-sm font-semibold flex items-center gap-2">
                        <svg
                          className="w-3 sm:w-4 h-3 sm:h-4 text-[#077CA3] flex-shrink-0"
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
                        Tìm kiếm thông tin thuốc theo tên hoặc mã ATC
                      </p>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                          <svg
                            className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          <input
                            type="text"
                            value={drugSearch}
                            onChange={(e) => setDrugSearch(e.target.value)}
                            onKeyPress={(e) =>
                              e.key === "Enter" && handleSearchDrug()
                            }
                            placeholder="Nhập tên thuốc hoặc mã ATC..."
                            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4BADD1]/50 focus:border-[#4BADD1] transition text-sm sm:text-base placeholder:text-slate-400"
                          />
                        </div>

                        <button
                          onClick={handleSearchDrug}
                          className="px-6 py-3 sm:py-3.5 bg-[#077CA3] !text-white font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2 hover:opacity-90 hover:shadow-md active:scale-95"
                        >
                          <svg
                            className="w-5 h-5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          <span className="font-semibold">Tìm kiếm</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>

              {/* RIGHT COLUMN: Vietnam Delivery Map */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="w-full flex items-center justify-center lg:justify-end order-1 lg:order-2"
              >
                <div className="w-full max-w-[200px] lg:max-w-[250px] lg:ml-6 mt-16">
                  <VietnamDeliveryMapAdvanced
                    duration={12}
                    showTrail={true}
                    animationSpeed={1}
                    maxWidth="100%"
                    vehicleSize="clamp(20px, 4vw, 30px)"
                    onComplete={() =>
                      console.log("Vietnam delivery animation completed!")
                    }
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      {/* Features Section - Redesigned */}
      <section className="py-16 sm:py-20 md:py-24 px-4 bg-gradient-to-b from-white via-slate-50/50 to-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-[#4BADD1]/5 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
            animate={{
              x: [0, -50, 0],
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 sm:mb-20"
          >
            <motion.span
              className="inline-block px-4 py-2 bg-gradient-to-r from-[#4BADD1]/10 to-blue-500/10 text-[#4BADD1] text-sm font-semibold rounded-full mb-4 sm:mb-6 border border-[#4BADD1]/20"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              ✨ Tính năng nổi bật
            </motion.span>
            <motion.h2
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 sm:mb-6 px-2 sm:px-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Tại sao chọn hệ thống của chúng tôi
            </motion.h2>
            <motion.p
              className="text-slate-600 text-base sm:text-lg md:text-xl max-w-3xl mx-auto px-2 sm:px-0 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Giải pháp toàn diện cho việc quản lý và truy xuất nguồn gốc dược
              phẩm với công nghệ tiên tiến
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 items-stretch">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{
                  y: -12,
                  scale: 1.02,
                  transition: { duration: 0.3 },
                }}
                className={`group relative rounded-3xl p-8 sm:p-10 transition-all duration-500 bg-white shadow-xl border-2 hover:shadow-2xl overflow-hidden
                  ${
                    feature.featured
                      ? "border-[#4BADD1] md:col-span-2 lg:col-span-1 bg-gradient-to-br from-white via-[#4BADD1]/5 to-teal-50/30"
                      : "border-slate-200/60 hover:border-[#4BADD1]/40"
                  }
                `}
              >
                {/* Animated background gradient for featured card */}
                {feature.featured && (
                  <>
                    <motion.div
                      className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${feature.gradient} opacity-20 rounded-full blur-3xl -mr-20 -mt-20`}
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.3, 0.2],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <motion.div
                      className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4BADD1] via-teal-400 to-[#4BADD1]"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    />
                  </>
                )}

                {/* Icon container */}
                <motion.div
                  className={`relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl mx-auto mb-6 sm:mb-8
                    bg-gradient-to-br ${feature.gradient} shadow-lg
                    group-hover:scale-110 group-hover:rotate-3
                  `}
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: index * 0.15 + 0.2,
                  }}
                >
                  <div className="absolute inset-0 bg-white/20 rounded-2xl backdrop-blur-sm" />
                  <div className="relative z-10 text-white text-3xl sm:text-4xl">
                    {feature.icon}
                  </div>
                  {feature.featured && (
                    <motion.div
                      className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <span className="text-xs">⭐</span>
                    </motion.div>
                  )}
                </motion.div>

                {/* Content */}
                <div className="relative z-10">
                  <motion.h3
                    className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4 group-hover:text-[#4BADD1] transition-colors duration-300"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 + 0.3 }}
                  >
                    {feature.title}
                  </motion.h3>
                  <motion.p
                    className="text-slate-600 text-sm sm:text-base leading-relaxed"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 + 0.4 }}
                  >
                    {feature.description}
                  </motion.p>
                </div>

                {/* Decorative corner element */}
                <div
                  className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl ${feature.gradient} opacity-5 rounded-tl-full transform translate-x-1/2 translate-y-1/2 group-hover:opacity-10 transition-opacity duration-500`}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Truck Transfer Visualization - giữ nguyên từ code gốc */}
      <section className="py-12 sm:py-16s md:py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <motion.span
              className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 bg-[#4BADD1]/10 text-[#4BADD1] text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Trực quan chuỗi cung ứng
            </motion.span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-3 sm:mb-4 px-2 sm:px-0">
              Quy trình sản xuất thuốc
            </h2>
            <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2 sm:px-0">
              Mô phỏng quy trình sản xuất thuốc từ nhà sản xuất đến nhà thuốc.
            </p>
          </motion.div>
          <div className="flex justify-center">
            <TruckTransfer duration={10} showTrail animationSpeed={1.1} />
          </div>
        </div>
      </section>

      {/* Process Steps Section - Professional Design */}
      <section className="py-20 sm:py-24 md:py-28 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 sm:mb-20"
          >
            <motion.span
              className="inline-block px-4 py-1.5 bg-[#4BADD1]/10 text-[#4BADD1] text-sm font-semibold rounded-full mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Quy trình
            </motion.span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-4 sm:mb-6">
              Quy trình hoạt động
            </h2>
            <p className="text-slate-600 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
              Từ nhà sản xuất đến người tiêu dùng, mọi bước đều được ghi lại
              minh bạch trên blockchain
            </p>
          </motion.div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {processSteps.map((item, index) => (
              <StepCard key={index} {...item} index={index} />
            ))}
          </div>

          {/* Connecting arrows (desktop only) */}
          <div className="hidden lg:flex items-center justify-between max-w-5xl mx-auto mt-8 -mb-8 px-8">
            {processSteps.slice(0, -1).map((_, idx) => {
              const arrowIndex =
                typeof idx === "number" && !isNaN(idx) ? idx : 0;
              return (
                <motion.div
                  key={arrowIndex}
                  className="flex-1 flex items-center"
                  initial={{ opacity: 0, scaleX: 0 }}
                  whileInView={{ opacity: 1, scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: arrowIndex * 0.15 + 0.5,
                  }}
                >
                  <div className="flex-1 h-0.5 bg-slate-300" />
                  <svg
                    className="w-6 h-6 text-slate-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  <div className="flex-1 h-0.5 bg-slate-300" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Blockchain Section - giữ nguyên từ code gốc */}
      <section className="py-12 sm:py-16 md:py-24 px-4 bg-linear-to-b from-white via-slate-50/30 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            {/* Left Column */}
            <motion.div
              className="w-full"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="border-2 border-[#4BADD1] rounded-3xl p-6 sm:p-8 h-full flex flex-col justify-between bg-linear-to-br from-white to-[#4BADD1]/5 relative overflow-hidden shadow-xl">
                <motion.div
                  className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-[#4BADD1]/10 rounded-full blur-3xl -mr-16 sm:-mr-20 -mt-16 sm:-mt-20"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <div className="relative z-10">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 sm:mb-4">
                    Công nghệ blockchain
                  </h2>
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                    Mỗi sản phẩm được gắn với một NFT duy nhất trên blockchain,
                    đảm bảo tính xác thực và không thể thay đổi. Mọi giao dịch
                    đều được ghi lại và minh bạch.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8 relative z-10">
                  <motion.div
                    className="bg-[#4BADD1]/10 rounded-2xl p-4 sm:p-6 text-center border border-[#4BADD1]/20"
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "rgba(75, 173, 209, 0.15)",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-2xl sm:text-4xl font-extrabold text-[#4BADD1] mb-1">
                      100%
                    </h3>
                    <p className="text-slate-600 font-medium text-xs sm:text-sm">
                      Minh bạch
                    </p>
                  </motion.div>
                  <motion.div
                    className="bg-[#4BADD1]/10 rounded-2xl p-4 sm:p-6 text-center border border-[#4BADD1]/20"
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "rgba(75, 173, 209, 0.15)",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-2xl sm:text-4xl font-extrabold text-[#4BADD1] mb-1">
                      0
                    </h3>
                    <p className="text-slate-600 font-medium text-xs sm:text-sm">
                      Giả mạo
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Right Column */}
            <motion.div
              className="w-full lg:pl-10"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 sm:mb-8">
                Lợi ích Của Hệ Thống
              </h2>

              <div className="flex flex-col gap-3 sm:gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 transition-colors"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 5, transition: { duration: 0.2 } }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      ease: "easeOut",
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                    >
                      <BsCheckCircleFill className="text-xl sm:text-2xl text-[#4BADD1] flex-shrink-0 mt-0.5" />
                    </motion.div>
                    <span className="text-sm sm:text-base font-medium text-slate-700 leading-relaxed">
                      {benefit}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer - giữ nguyên từ code gốc */}
      <footer className="py-12 sm:py-16 px-4 bg-linear-to-b from-slate-800 to-slate-900 !text-white relative overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-full h-full opacity-10"
          style={{
            backgroundImage:
              "radial-linear(circle at 20% 30%, rgba(75, 173, 209, 0.3) 0%, transparent 50%)",
          }}
        />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-8 sm:mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 !text-white flex items-center gap-2">
                <span className="w-1 h-5 sm:h-6 bg-[#4BADD1] rounded-full"></span>
                Về chúng tôi
              </h3>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                Hệ thống truy xuất nguồn gốc thuốc sử dụng công nghệ Blockchain
                để đảm bảo tính minh bạch và an toàn.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 !text-white flex items-center gap-2">
                <span className="w-1 h-5 sm:h-6 bg-[#4BADD1] rounded-full"></span>
                Liên kết
              </h3>
              <ul className="space-y-2 sm:space-y-3 text-slate-300">
                <li>
                  <Link
                    to="/login"
                    className="text-sm sm:text-base hover:text-[#4BADD1] transition flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full group-hover:bg-[#4BADD1] transition"></span>
                    Đăng nhập
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register-business"
                    className="text-sm sm:text-base hover:text-[#4BADD1] transition flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full group-hover:bg-[#4BADD1] transition"></span>
                    Doanh nghiệp
                  </Link>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 !text-white flex items-center gap-2">
                <span className="w-1 h-5 sm:h-6 bg-[#4BADD1] rounded-full"></span>
                Liên hệ
              </h3>
              <ul className="space-y-2 sm:space-y-3 text-slate-300">
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <svg
                    className="w-4 sm:w-5 h-4 sm:h-5 text-[#4BADD1] flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  phamthianhthu30092004@gmail.com
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <svg
                    className="w-4 sm:w-5 h-4 sm:h-5 text-[#4BADD1] flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  0868322170
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base">
                  <svg
                    className="w-4 sm:w-5 h-4 sm:h-5 text-[#4BADD1] flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  TPHCM, Việt Nam
                </li>
              </ul>
            </motion.div>
          </div>

          <div className="border-t border-slate-700/50 pt-6 sm:pt-8 text-center">
            <p className="text-slate-400 text-xs sm:text-sm">
              &copy; 2025 Drug Traceability System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* QR Scanner Modal - giữ nguyên */}
      <AnimatePresence>
        {showQRScanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={handleCloseQRScanner}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between mb-4 p-4 sm:p-6 bg-primary rounded-t-2xl gap-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold !text-white">
                    Quét QR Code
                  </h3>
                  <h3 className="text-xs sm:text-sm font-bold !text-white mt-1">
                    Đưa mã vào khung hình để quét
                  </h3>
                </div>
                <button
                  onClick={handleCloseQRScanner}
                  className="!text-white hover:text-slate-700 transition flex-shrink-0"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="white"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div
                className="relative rounded-xl overflow-hidden bg-slate-100 p-4 sm:p-6"
                style={{
                  minHeight: "300px",
                  width: "100%",
                  position: "relative",
                }}
              >
                {showQRScanner ? (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      minHeight: "300px",
                      position: "relative",
                    }}
                  >
                    <Scanner
                      onScan={handleQRResult}
                      onError={handleQRError}
                      constraints={{
                        facingMode: "environment",
                      }}
                      styles={{
                        container: {
                          width: "100%",
                          height: "100%",
                          minHeight: "300px",
                        },
                      }}
                    />
                    {qrError && (
                      <div className="absolute bottom-2 left-2 right-2 bg-red-500/90 !text-white text-xs p-2 rounded z-10">
                        {qrError}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-slate-500">
                    <div className="text-center">
                      {uploadingImage ? (
                        <>
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4BADD1] mx-auto mb-2"></div>
                          <p className="text-sm sm:text-base">
                            Đang xử lý ảnh QR...
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm sm:text-base">
                            Nhấn &quot;Quét QR&quot; để bắt đầu
                          </p>
                        </>
                      )}
                      {qrError && (
                        <p className="text-red-500 text-xs sm:text-sm mt-2">
                          {qrError}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-secondary/20 p-4 sm:p-6 flex items-start gap-2 sm:gap-3">
                <div className="p-2 bg-third/20 rounded-lg w-fit flex-shrink-0">
                  <BsInfoCircle className="w-4 sm:w-5 h-4 sm:h-5 text-slate-600" />
                </div>
                <div>
                  <span className="text-base sm:text-lg text-primary font-bold">
                    Lưu ý khi quét QR
                  </span>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li className="text-xs sm:text-sm text-slate-700">
                      Đảm bảo đủ ánh sáng.
                    </li>
                    <li className="text-xs sm:text-sm text-slate-700">
                      Giữ camera ổn định và cách mã QR khoảng 10-20cm.
                    </li>
                    <li className="text-xs sm:text-sm text-slate-700">
                      Đảm bảo mã QR được rõ ràng và không bị mờ hoặc bị che
                      khuất.
                    </li>
                  </ul>
                </div>
              </div>
              {qrError && !isScanning && (
                <p className="text-xs text-red-500 mt-2 text-center">
                  {qrError}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
