import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsFillBoxSeamFill,
  BsTruck,
  BsShop,
  BsPersonFill,
} from "react-icons/bs";
import { BsCheckCircleFill } from "react-icons/bs";
import { Scanner } from "@yudiel/react-qr-scanner";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useMetaMask } from "../../hooks/useMetaMask";
import { formatWalletAddress } from "../../utils/walletUtils";

export default function UserHome() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { account, isConnected, isInstalled, connect, isConnecting, disconnect, chainId } = useMetaMask();
  const [tokenId, setTokenId] = useState("");
  const [drugSearch, setDrugSearch] = useState("");
  const [searchMode, setSearchMode] = useState("nft"); // 'nft' or 'drug'
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [qrError, setQrError] = useState(null);
  const [showUploadQR, setShowUploadQR] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const dropdownRef = useRef(null);
  const walletModalRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
      if (walletModalRef.current && !walletModalRef.current.contains(event.target)) {
        setShowWalletModal(false);
      }
    };

    if (showUserDropdown || showWalletModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserDropdown, showWalletModal]);

  const handleConnectMetaMask = async () => {
    if (!isInstalled) {
      toast.error("MetaMask chưa được cài đặt. Vui lòng cài đặt MetaMask extension.");
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
    await logout();
    setShowUserDropdown(false);
    navigate("/");
    toast.success("Đã đăng xuất thành công!");
  };

  const walletAddress = account || user?.walletAddress || "";
  const displayWalletAddress = walletAddress ? formatWalletAddress(walletAddress, 6, 4) : "";

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
      // Kiểm tra quyền truy cập camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Nếu có quyền, đóng stream và mở scanner
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
    // Bỏ qua lỗi không tìm thấy QR (sẽ tiếp tục quét)
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

    // Convert to string and trim
    const trimmedText = String(scannedText).trim();
    if (!trimmedText) {
      console.warn("processQRResult: trimmedText is empty");
      return;
    }

    console.log("QR Code scanned (original):", trimmedText);

    // Kiểm tra xem có phải là URL không
    // URL có thể bắt đầu bằng http://, https://, hoặc localhost
    const isUrl =
      /^(https?:\/\/|localhost|http:\/\/localhost|https:\/\/localhost)/i.test(
        trimmedText
      ) ||
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}/.test(
        trimmedText
      );

    if (isUrl) {
      try {
        let urlToNavigate = trimmedText;

        // Nếu URL không có protocol, thêm http://
        if (
          !trimmedText.startsWith("http://") &&
          !trimmedText.startsWith("https://")
        ) {
          // Nếu bắt đầu bằng localhost, thêm http://
          if (trimmedText.startsWith("localhost")) {
            urlToNavigate = `http://${trimmedText}`;
          } else {
            // Thử parse để kiểm tra xem có phải domain không
            urlToNavigate = `http://${trimmedText}`;
          }
        }

        // Validate URL
        const url = new URL(urlToNavigate);
        console.log("QR contains URL, redirecting to:", url.href);

        setShowQRScanner(false);
        setIsScanning(false);
        setShowUploadQR(false);
        toast.success("Đã quét QR thành công! Đang chuyển hướng...");

        // Chuyển hướng đến URL từ QR code (giữ nguyên URL gốc nếu có protocol)
        setTimeout(() => {
          // Sử dụng URL gốc nếu đã có protocol, nếu không dùng URL đã thêm protocol
          const finalUrl =
            trimmedText.startsWith("http://") ||
            trimmedText.startsWith("https://")
              ? trimmedText
              : url.href;
          console.log("Final redirect URL:", finalUrl);
          window.location.href = finalUrl;
        }, 500);
      } catch (e) {
        console.error("Error parsing URL:", e);
        // Nếu parse URL thất bại, vẫn thử chuyển hướng với URL gốc
        console.log("Failed to parse URL, trying direct redirect");
        setShowQRScanner(false);
        setIsScanning(false);
        setShowUploadQR(false);
        toast.success("Đã quét QR thành công! Đang chuyển hướng...");
        setTimeout(() => {
          // Thử chuyển hướng trực tiếp với URL gốc
          let urlToRedirect = trimmedText;
          if (
            !trimmedText.startsWith("http://") &&
            !trimmedText.startsWith("https://")
          ) {
            urlToRedirect = `http://${trimmedText}`;
          }
          console.log("Direct redirect to:", urlToRedirect);
          window.location.href = urlToRedirect;
        }, 500);
      }
    } else {
      // Nếu không phải URL hợp lệ, xử lý như tokenId và điều hướng đến track
      console.log("QR does not contain URL, treating as tokenId");
      setTokenId(trimmedText);
      setShowQRScanner(false);
      setIsScanning(false);
      setShowUploadQR(false);
      toast.success("Đã quét QR thành công!");
      // Tự động tra cứu sau khi quét
      setTimeout(() => {
        navigate(`/track?tokenId=${encodeURIComponent(trimmedText)}`);
      }, 500);
    }
  };

  const handleCloseQRScanner = () => {
    setShowQRScanner(false);
    setIsScanning(false);
    setQrError(null);
  };

  // Hàm xử lý ảnh để tăng contrast và chuyển sang grayscale
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
      // Chuyển sang grayscale
      const gray =
        newDataArray[i] * 0.299 +
        newDataArray[i + 1] * 0.587 +
        newDataArray[i + 2] * 0.114;

      // Tăng contrast
      const enhanced = (gray - 128) * contrast + 128;
      let final = Math.max(0, Math.min(255, enhanced));

      if (useBinary) {
        // Áp dụng threshold để tạo ảnh đen trắng rõ ràng
        final = final > threshold ? 255 : 0;
      }

      newDataArray[i] = final; // R
      newDataArray[i + 1] = final; // G
      newDataArray[i + 2] = final; // B
      // newDataArray[i + 3] giữ nguyên alpha
    }
    return newData;
  };

  const handleUploadQRImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.warn("No file selected");
      return;
    }

    // Kiểm tra định dạng file
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh hợp lệ");
      return;
    }

    setUploadingImage(true);
    setQrError(null);

    try {
      console.log("Starting QR decode from image:", file.name);

      // Tạo Image element để load ảnh
      const img = new Image();
      const imageUrl = URL.createObjectURL(file);

      // Đợi ảnh load xong
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      console.log("Image loaded, dimensions:", img.width, "x", img.height);

      // Tạo canvas để vẽ ảnh
      // Giới hạn kích thước tối đa để tăng hiệu suất (max 2000px)
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

      // Vẽ ảnh với kích thước mới
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

      // Lấy ImageData từ canvas
      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Giải phóng URL
      URL.revokeObjectURL(imageUrl);

      // Tính năng upload ảnh QR tạm thời không khả dụng
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
      } else if (
        error.message &&
        error.message.includes("No MultiFormat Readers")
      ) {
        errorMessage =
          "Không thể đọc mã QR. Vui lòng thử lại với ảnh rõ hơn hoặc sử dụng chức năng quét camera.";
      }

      toast.error(errorMessage);
      setQrError(errorMessage);
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleOpenUploadQR = () => {
    setShowUploadQR(true);
    // Trigger file input click
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

  const StepCard = ({ step, desc, icon, color, bgColor }) => (
    <motion.div
      className="flex items-center gap-5 p-6 bg-white rounded-2xl shadow-lg border border-slate-200/50 max-w-md hover:border-[#4BADD1]/50 transition-all relative overflow-hidden group"
      whileHover={{
        scale: 1.03,
        boxShadow: "0 12px 40px rgba(75, 173, 209, 0.25)",
        y: -4,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div
        className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#4BADD1] to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
      />
      <motion.div
        className={`flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center ${bgColor} transition-all shadow-md`}
        whileHover={{ scale: 1.1, rotate: 360 }}
        transition={{ duration: 0.5 }}
      >
        <span className={`text-3xl ${color}`}>{icon}</span>
      </motion.div>
      <div className="flex-1">
        <h3 className="font-bold text-slate-800 mb-2 text-base">{step}</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );

  const features = [
    {
      number: 1,
      title: "Tra cứu dễ dàng",
      description:
        "Tìm kiếm thông tin sản phẩm bằng mã lô, mã QR hoặc series number.",
    },
    {
      number: 2,
      title: "Minh bạch hoàn toàn",
      description:
        "Thông tin rõ ràng, chi tiết về toàn bộ quy trình từ nhà sản xuất đến nhà thuốc.",
    },
    {
      number: 3,
      title: "Bảo mật tuyệt đối",
      description:
        "Dữ liệu được bảo mật bằng công nghệ blockchain, không thể thay đổi hay giả mạo.",
    },
  ];
  const stats = [
    { value: "10,000+", label: "Sản phẩm" },
    { value: "500+", label: "Doanh nghiệp" },
    { value: "50,000+", label: "Người dùng" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#00b4d8] to-[#48cae4] px-4 py-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center">
            <span className="text-white text-xl font-bold">DrugTrace</span>
          </Link>

          {/* Right side - Buttons or User Icon */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                {/* Kết nối MetaMask Button */}
                <button
                  onClick={handleConnectMetaMask}
                  disabled={isConnecting || !isInstalled}
                  className="px-5 py-2.5 bg-white text-slate-900 font-semibold rounded-lg shadow-md hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isConnecting ? "Đang kết nối..." : "Kết nối MetaMask"}
                </button>

                {/* Đăng nhập Button */}
                <Link
                  to="/login"
                  className="px-6 py-2.5 bg-white text-[#00b4d8] font-semibold rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                >
                  Đăng nhập
                </Link>
              </>
            ) : (
              <>
                {/* User Icon - Golden Circle */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="w-10 h-10 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-cyan-500"
                    style={{
                      background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
                      boxShadow: "0 4px 14px 0 rgba(251, 191, 36, 0.4)"
                    }}
                  >
                    <div className="w-full h-full rounded-full flex items-center justify-center" style={{
                      background: "linear-gradient(135deg, rgba(251, 191, 36, 0.9) 0%, rgba(217, 119, 6, 0.9) 100%)",
                    }}>
                      <span className="text-white font-bold text-lg drop-shadow-md">
                        {user?.email?.charAt(0)?.toUpperCase() || user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {showUserDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border-2 border-gray-200 overflow-hidden z-50"
                      >
                        {/* User Info Section */}
                        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#00b4d8]/5 to-[#48cae4]/5">
                          <div className="text-slate-700 text-sm font-medium mb-3">
                            {user?.email || "N/A"}
                          </div>
                          {walletAddress && (
                            <div 
                              onClick={() => setShowWalletModal(true)}
                              className="flex items-center gap-2 px-3 py-2.5 bg-white rounded-lg border-2 border-gray-200 shadow-sm cursor-pointer hover:border-[#00b4d8] hover:shadow-md transition-all"
                            >
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00b4d8] to-[#48cae4] flex items-center justify-center flex-shrink-0 shadow-md">
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
                                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                  />
                                </svg>
                              </div>
                              <span className="text-slate-700 text-sm font-mono flex-1 truncate font-medium">
                                {displayWalletAddress}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(walletAddress);
                                  toast.success("Đã sao chép địa chỉ ví!");
                                }}
                                className="text-slate-400 hover:text-[#00b4d8] transition-colors p-1.5 rounded-lg hover:bg-[#00b4d8]/10"
                                title="Sao chép"
                              >
                                <svg
                                  className="w-4 h-4"
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
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Menu Items */}
                        <div className="py-2 bg-white">
                          <button
                            onClick={() => {
                              setShowUserDropdown(false);
                              // Navigate to account page
                            }}
                            className="w-full px-4 py-3 text-left text-slate-700 hover:bg-[#00b4d8]/10 hover:text-[#007b91] transition-colors flex items-center gap-3 font-medium"
                          >
                            <span>Tài khoản của tôi</span>
                          </button>
                          <button
                            onClick={() => {
                              setShowUserDropdown(false);
                              setShowWalletModal(true);
                            }}
                            className="w-full px-4 py-3 text-left text-slate-700 hover:bg-[#00b4d8]/10 hover:text-[#007b91] transition-colors flex items-center gap-3 font-medium"
                          >
                            <span>Ví của tôi</span>
                          </button>
                          <button
                            onClick={handleLogout}
                            className="w-full px-4 py-3 text-left text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-between font-medium"
                          >
                            <span>Đăng xuất</span>
                            <svg
                              className="w-4 h-4"
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
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Wallet Modal */}
      <AnimatePresence>
        {showWalletModal && walletAddress && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
              ref={walletModalRef}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border-2 border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-[#00b4d8] to-[#48cae4] px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white text-lg font-semibold">Ví điện tử</h3>
                  <button
                    onClick={() => setShowWalletModal(false)}
                    className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Account Info Section */}
              <div className="px-6 py-4 bg-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00b4d8] to-[#48cae4] flex items-center justify-center shadow-lg">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00b4d8]/90 to-[#48cae4]/90 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          {user?.email?.charAt(0)?.toUpperCase() || user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                    </div>
                    {/* MetaMask Fox Icon - Small badge */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#E27625"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#E27625"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#E27625"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#E27625"/>
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-700 font-mono text-lg font-semibold">
                        {displayWalletAddress}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(walletAddress);
                          toast.success("Đã sao chép địa chỉ ví!");
                        }}
                        className="text-slate-400 hover:text-[#00b4d8] transition-colors p-1 hover:bg-[#00b4d8]/10 rounded"
                        title="Sao chép"
                      >
                        <svg
                          className="w-4 h-4"
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
                      </button>
                    </div>
                    <div className="text-slate-500 text-sm font-medium">MetaMask</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <button className="flex flex-col items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl hover:bg-[#00b4d8]/10 border border-gray-200 hover:border-[#00b4d8] transition-colors">
                    <svg
                      className="w-6 h-6 text-[#00b4d8]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    <span className="text-slate-700 text-sm font-medium">Gửi</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl hover:bg-[#00b4d8]/10 border border-gray-200 hover:border-[#00b4d8] transition-colors">
                    <svg
                      className="w-6 h-6 text-[#00b4d8]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                    <span className="text-slate-700 text-sm font-medium">Nhận</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl hover:bg-[#00b4d8]/10 border border-gray-200 hover:border-[#00b4d8] transition-colors">
                    <svg
                      className="w-6 h-6 text-[#00b4d8]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span className="text-slate-700 text-sm font-medium">Mua</span>
                  </button>
                </div>

                {/* Chain Information */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl mb-4 cursor-pointer hover:bg-[#00b4d8]/10 border border-gray-200 hover:border-[#00b4d8] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-slate-700 text-sm font-medium">
                      {chainId 
                        ? `Chuỗi #${parseInt(chainId, 16) || chainId}` 
                        : "Chuỗi không xác định"}
                    </span>
                  </div>
                  <svg
                    className="w-5 h-5 text-slate-400"
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
                </div>

                {/* Menu Items */}
                <div className="space-y-1 mb-4">
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-[#00b4d8]/10 rounded-xl transition-colors border border-transparent hover:border-[#00b4d8]/20">
                    <svg
                      className="w-5 h-5 text-[#00b4d8]"
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
                    <span className="text-sm font-medium">Giao dịch</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-[#00b4d8]/10 rounded-xl transition-colors border border-transparent hover:border-[#00b4d8]/20">
                    <svg
                      className="w-5 h-5 text-[#00b4d8]"
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
                    <span className="text-sm font-medium">Xem tài sản</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-[#00b4d8]/10 rounded-xl transition-colors border border-transparent hover:border-[#00b4d8]/20">
                    <svg
                      className="w-5 h-5 text-[#00b4d8]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium">Quản lý ví</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Disconnect Button */}
                <button
                  onClick={async () => {
                    // Disconnect MetaMask
                    if (isConnected) {
                      await disconnect();
                    }
                    // Logout khỏi hệ thống
                    await logout();
                    setShowWalletModal(false);
                    navigate("/");
                    toast.success("Đã đăng xuất thành công!");
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-200 hover:border-red-300"
                >
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="text-sm font-medium">Ngắt kết nối ví</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section - Banner với nền trắng */}
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
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
            className="absolute bottom-20 right-10 w-96 h-96 bg-[#4BADD1]/5 rounded-full blur-3xl"
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

        <section className="pt-32 pb-20 px-4 w-full flex flex-col items-center justify-center relative z-10">
          <div className="max-w-5xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <motion.h1
                className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#2176FF] mb-6 leading-tight tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-linear-to-r from-[#054f67] font-bold to-[#4298b7] bg-clip-text text-transparent"
                >
                  Hệ Thống Truy Xuất Nguồn Gốc Thuốc
                </motion.span>
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Tra cứu thông tin sản phẩm, theo dõi lộ trình phân phối an toàn
                với công nghệ{" "}
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
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="max-w-4xl mx-auto w-full"
            >
              {/* Tabs */}
              <div className="flex gap-2 mb-4 justify-center">
                <button
                  onClick={() => setSearchMode("nft")}
                  className={`px-6 py-2 rounded-lg font-semibold transition ${
                    searchMode === "nft"
                      ? "bg-white border-b-4 border-1 border-[#077CA3] text-[#4BADD1] shadow-md"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  Tra cứu NFT
                </button>
                <button
                  onClick={() => setSearchMode("drug")}
                  className={`px-6 py-2 rounded-lg font-semibold transition ${
                    searchMode === "drug"
                      ? "bg-white text-[#4BADD1] shadow-md border-b-4 border-1 border-[#077CA3]"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  Thông tin thuốc
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border-b-8 border-1 border-[#077CA3] p-8 ">
                {searchMode === "nft" ? (
                  <>
                    <p className="text-slate-700 mb-5 text-left text-sm font-semibold flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-[#054f67]"
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

                    <div className="flex gap-3 items-stretch">
                      <div className="flex-1 relative">
                        <svg
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
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
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4BADD1]/50 focus:border-[#4BADD1] transition text-base placeholder:text-slate-400"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleScanQR}
                          className="px-6 py-3.5 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl transition-all flex items-center gap-2 text-sm hover:border-[#54b1d3] active:scale-95"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zM14 13h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2zm0-4h2v2h-2v-2zm2 2h3v2h-3v-2z" />
                          </svg>
                          <span className="font-semibold">Quét QR</span>
                        </button>
                        <button
                          onClick={handleOpenUploadQR}
                          className="px-6 py-3.5 bg-white border-2 border-[#077CA3] text-slate-700 font-semibold rounded-xl transition-all flex items-center gap-2 text-sm hover:border-[#54b1d3] active:scale-95"
                          title="Tải ảnh QR lên"
                        >
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
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="font-semibold">Upload QR</span>
                        </button>
                      </div>
                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleUploadQRImage}
                        className="hidden"
                      />

                      <button
                        onClick={handleTrackDrug}
                        className="px-6 bg-[#077CA3] py-3.5 font-semibold rounded-xl transition text-sm flex items-center gap-2 hover:opacity-90 active:scale-95"
                      >
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
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="font-semibold text-white">
                          Xác thực
                        </span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-slate-700 mb-5 text-left text-sm font-semibold flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-[#4BADD1]"
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

                    <div className="flex gap-3 items-stretch">
                      <div className="flex-1 relative">
                        <svg
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
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
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4BADD1]/50 focus:border-[#4BADD1] transition text-base placeholder:text-slate-400"
                        />
                      </div>

                      <button
                        onClick={handleSearchDrug}
                        className="px-6 py-3.5 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl transition-all text-sm flex items-center gap-2 hover:border-[#54b1d3] active:scale-95"
                      >
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
          </div>
        </section>
      </div>

      {/* Features Section */}
      <section className="py-20 px-4 bg-linear-to-b from-white to-slate-50/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.span
              className="inline-block px-4 py-1.5 bg-[#4BADD1]/10 text-[#4BADD1] text-sm font-semibold rounded-full mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Tính năng nổi bật
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-primary font-bold mb-4">
              Tại sao chọn hệ thống của chúng tôi
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Giải pháp toàn diện cho việc quản lý và truy xuất nguồn gốc dược
              phẩm
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 items-stretch">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className={`rounded-2xl p-8 text-center transition-all duration-300 bg-white shadow-lg border border-slate-200/50 hover:shadow-2xl relative overflow-hidden
                ${
                  index === 1
                    ? "border-2 border-[#4BADD1] lg:scale-105 bg-linear-to-br from-white to-[#4BADD1]/5"
                    : "hover:border-[#4BADD1]/50"
                }
              `}
              >
                {index === 1 && (
                  <motion.div
                    className="absolute top-0 right-0 w-32 h-32 bg-[#4BADD1]/10 rounded-full blur-2xl -mr-16 -mt-16"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
                <div
                  className={`flex items-center justify-center w-20 h-20 rounded-2xl mx-auto mb-6 relative
                ${
                  index === 1
                    ? "bg-linear-to-br from-[#4BADD1]/20 to-cyan-100/50"
                    : "bg-linear-to-br from-[#4BADD1]/10 to-blue-50/50"
                }
              `}
                >
                  <motion.span
                    className={`text-4xl font-bold
                    ${index === 1 ? "font-text-primary " : "font-text-primary"}
                  `}
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    {feature.number}
                  </motion.span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-base leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quy trình hoạt động */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.span
              className="inline-block px-4 py-1.5 bg-[#4BADD1]/10 text-[#4BADD1] text-sm font-semibold rounded-full mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Quy trình
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-extrabold font-text-primary  mb-4">
              Quy trình hoạt động
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Từ nhà sản xuất đến người tiêu dùng, mọi bước đều được ghi lại
              minh bạch
            </p>
          </motion.div>

          {/* Container cho các bước */}
          <div className="relative max-w-4xl mx-auto flex flex-col gap-6 md:gap-5">
            {processSteps.map((item, index) => {
              // Logic căn lề:
              // - start: Luôn bên trái
              // - mid-start: Trái, nhưng lùi vào 1 chút trên desktop
              // - mid-end: Phải, lùi vào 1 chút trên desktop (trên mobile là trái)
              // - end: Luôn bên phải (trên mobile là trái)
              let alignmentClass = "justify-start"; // Mặc định trên mobile
              if (item.align === "start") alignmentClass = "justify-start";
              if (item.align === "mid-start")
                alignmentClass = "justify-start md:pl-20 lg:pl-32";
              if (item.align === "mid-end")
                alignmentClass =
                  "justify-start md:justify-end md:pr-20 lg:pr-32";
              if (item.align === "end")
                alignmentClass = "justify-start md:justify-end";

              // Xác định hướng animation:
              // - Trên mobile: tất cả slide từ trái (-50)
              // - Trên desktop: bước chẵn (0,2) slide từ trái, bước lẻ (1,3) slide từ phải
              const isRightAligned =
                item.align === "end" || item.align === "mid-end";
              const animationX = isRightAligned ? 100 : -100; // Tăng khoảng cách để animation rõ ràng hơn

              return (
                <motion.div
                  key={index}
                  className={`w-full flex ${alignmentClass}`}
                  initial={{ opacity: 0, x: animationX }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    delay: index * 0.2,
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                    mass: 0.8,
                  }}
                >
                  <StepCard {...item} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Công nghệ blockchain */}
      <section className="py-24 px-4 bg-linear-to-b from-white via-slate-50/30 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Cột Trái - Công nghệ blockchain */}
            <motion.div
              className="w-full"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="border-2 border-[#4BADD1] rounded-3xl p-8 h-full flex flex-col justify-between bg-linear-to-br from-white to-[#4BADD1]/5 relative overflow-hidden shadow-xl">
                <motion.div
                  className="absolute top-0 right-0 w-40 h-40 bg-[#4BADD1]/10 rounded-full blur-3xl -mr-20 -mt-20"
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
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">
                    Công nghệ blockchain
                  </h2>
                  <p className="text-slate-600 leading-relaxed text-base">
                    Mỗi sản phẩm được gắn với một NFT duy nhất trên blockchain,
                    đảm bảo tính xác thực và không thể thay đổi. Mọi giao dịch
                    đều được ghi lại và minh bạch.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <motion.div
                    className="bg-[#4BADD1]/10 rounded-2xl p-6 text-center border border-[#4BADD1]/20"
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "rgba(75, 173, 209, 0.15)",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-4xl font-extrabold text-[#4BADD1] mb-1">
                      100%
                    </h3>
                    <p className="text-slate-600 font-medium">Minh bạch</p>
                  </motion.div>
                  <motion.div
                    className="bg-[#4BADD1]/10 rounded-2xl p-6 text-center border border-[#4BADD1]/20"
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "rgba(75, 173, 209, 0.15)",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-4xl font-extrabold text-[#4BADD1] mb-1">
                      0
                    </h3>
                    <p className="text-slate-600 font-medium">Giả mạo</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Cột Phải - Lợi ích */}
            <motion.div
              className="w-full lg:pl-10"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <h2 className="text-4xl font-extrabold text-slate-900 mb-8">
                Lợi ích Của Hệ Thống
              </h2>

              <div className="flex flex-col gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 transition-colors"
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
                      <BsCheckCircleFill className="text-2xl text-[#4BADD1] flex-shrink-0 mt-0.5" />
                    </motion.div>
                    <span className="text-base font-medium text-slate-700 leading-relaxed">
                      {benefit}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-linear-to-b from-slate-800 to-slate-900 text-white relative overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-full h-full opacity-10"
          style={{
            backgroundImage:
              "radial-linear(circle at 20% 30%, rgba(75, 173, 209, 0.3) 0%, transparent 50%)",
          }}
        />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-[#4BADD1] rounded-full"></span>
                Về chúng tôi
              </h3>
              <p className="text-slate-300 leading-relaxed">
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
              <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-[#4BADD1] rounded-full"></span>
                Liên kết
              </h3>
              <ul className="space-y-3 text-slate-300">
                <li>
                  <Link
                    to="/login"
                    className="hover:text-[#4BADD1] transition flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full group-hover:bg-[#4BADD1] transition"></span>
                    Đăng nhập
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register-business"
                    className="hover:text-[#4BADD1] transition flex items-center gap-2 group"
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
              <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-[#4BADD1] rounded-full"></span>
                Liên hệ
              </h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-[#4BADD1]"
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
                  info@drugchain.vn
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-[#4BADD1]"
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
                  1900 xxxx
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-[#4BADD1]"
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
                  Hà Nội, Việt Nam
                </li>
              </ul>
            </motion.div>
          </div>

          <div className="border-t border-slate-700/50 pt-8 text-center">
            <p className="text-slate-400">
              &copy; 2025 Drug Traceability System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showQRScanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={handleCloseQRScanner}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800">
                  Quét QR Code
                </h3>
                <button
                  onClick={handleCloseQRScanner}
                  className="text-slate-500 hover:text-slate-700 transition"
                >
                  <svg
                    className="w-6 h-6"
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
              </div>

              <div
                className="relative rounded-xl overflow-hidden bg-slate-100"
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
                      <div className="absolute bottom-2 left-2 right-2 bg-red-500/90 text-white text-xs p-2 rounded z-10">
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
                          <p>Đang xử lý ảnh QR...</p>
                        </>
                      ) : (
                        <>
                          <div className="text-4xl mb-2">📷</div>
                          <p>Nhấn "Quét QR" để bắt đầu</p>
                        </>
                      )}
                      {qrError && (
                        <p className="text-red-500 text-sm mt-2">{qrError}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <p className="text-sm text-slate-600 mt-4 text-center">
                Đưa camera vào mã QR để quét
              </p>
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
