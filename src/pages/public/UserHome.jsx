import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BsFillBoxSeamFill, BsTruck, BsShop, BsPersonFill } from 'react-icons/bs';
import { BsCheckCircleFill } from 'react-icons/bs';
import { Html5Qrcode } from 'html5-qrcode';
import { BrowserMultiFormatReader } from '@zxing/library';
import toast from 'react-hot-toast';

export default function UserHome() {
  const navigate = useNavigate();
  const [tokenId, setTokenId] = useState('');
  const [drugSearch, setDrugSearch] = useState('');
  const [searchMode, setSearchMode] = useState('nft'); // 'nft' or 'drug'
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [qrError, setQrError] = useState(null);
  const [showUploadQR, setShowUploadQR] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const qrReaderRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const scannerContainerRef = useRef(null);

  const handleTrackDrug = () => {
    const trimmedTokenId = tokenId.trim();
    if (!trimmedTokenId) {
      toast.error('Vui lòng nhập mã lô, mã serial hoặc NFT ID');
      return;
    }
    navigate(`/track?tokenId=${trimmedTokenId}`);
  };

  const handleScanQR = async () => {
    try {
      // Kiểm tra quyền truy cập camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Nếu có quyền, đóng stream và mở scanner
      stream.getTracks().forEach(track => track.stop());
      setShowQRScanner(true);
      // Delay một chút để đảm bảo modal đã render
      setTimeout(() => {
        startQRScanner();
      }, 300);
    } catch (error) {
      console.error('Camera permission error:', error);
      toast.error('Không thể truy cập camera. Vui lòng cấp quyền truy cập camera.');
    }
  };

  const startQRScanner = async () => {
    if (!scannerContainerRef.current) {
      console.warn('Scanner container not ready');
      return;
    }
    
    // Dọn dẹp scanner cũ nếu có
    if (html5QrCodeRef.current) {
      await stopQRScanner();
    }

    try {
      const html5QrCode = new Html5Qrcode(scannerContainerRef.current.id);
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText, decodedResult) => {
          console.log('QR Code scanned:', decodedText);
          // Dừng scanner ngay khi quét được
          stopQRScanner().then(() => {
            processQRResult(decodedText);
          });
        },
        (errorMessage) => {
          // Bỏ qua lỗi không tìm thấy QR (sẽ tiếp tục quét)
          // Chỉ log các lỗi quan trọng
          if (errorMessage && 
              !errorMessage.includes('No QR code found') && 
              !errorMessage.includes('NotFoundException')) {
            console.log('QR scan error:', errorMessage);
          }
        }
      );
      
      setIsScanning(true);
      setQrError(null);
    } catch (error) {
      console.error('Error starting QR scanner:', error);
      const errorMsg = error.message || 'Không thể khởi động camera';
      setQrError(errorMsg);
      toast.error(errorMsg + '. Vui lòng thử lại.');
      setIsScanning(false);
    }
  };

  const stopQRScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping QR scanner:', err);
        // Force cleanup
        html5QrCodeRef.current = null;
        setIsScanning(false);
      }
    }
  };

  const processQRResult = (scannedText) => {
    if (!scannedText) {
      console.warn('processQRResult: scannedText is empty');
      return;
    }
    
    // Convert to string and trim
    const trimmedText = String(scannedText).trim();
    if (!trimmedText) {
      console.warn('processQRResult: trimmedText is empty');
      return;
    }
    
    console.log('QR Code scanned (original):', trimmedText);
    
    // Kiểm tra xem có phải là URL không
    // URL có thể bắt đầu bằng http://, https://, hoặc localhost
    const isUrl = /^(https?:\/\/|localhost|http:\/\/localhost|https:\/\/localhost)/i.test(trimmedText) ||
                  /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}/.test(trimmedText);
    
    if (isUrl) {
        try {
          let urlToNavigate = trimmedText;
          
          // Nếu URL không có protocol, thêm http://
          if (!trimmedText.startsWith('http://') && !trimmedText.startsWith('https://')) {
            // Nếu bắt đầu bằng localhost, thêm http://
            if (trimmedText.startsWith('localhost')) {
              urlToNavigate = `http://${trimmedText}`;
            } else {
              // Thử parse để kiểm tra xem có phải domain không
              urlToNavigate = `http://${trimmedText}`;
            }
          }
          
          // Validate URL
          const url = new URL(urlToNavigate);
          console.log('QR contains URL, redirecting to:', url.href);
          
          setShowQRScanner(false);
          setIsScanning(false);
          setShowUploadQR(false);
          toast.success('Đã quét QR thành công! Đang chuyển hướng...');
          
          // Chuyển hướng đến URL từ QR code (giữ nguyên URL gốc nếu có protocol)
          setTimeout(() => {
            // Sử dụng URL gốc nếu đã có protocol, nếu không dùng URL đã thêm protocol
            const finalUrl = trimmedText.startsWith('http://') || trimmedText.startsWith('https://') 
              ? trimmedText 
              : url.href;
            console.log('Final redirect URL:', finalUrl);
            window.location.href = finalUrl;
          }, 500);
      } catch (e) {
        console.error('Error parsing URL:', e);
        // Nếu parse URL thất bại, vẫn thử chuyển hướng với URL gốc
        console.log('Failed to parse URL, trying direct redirect');
        setShowQRScanner(false);
        setIsScanning(false);
        setShowUploadQR(false);
        toast.success('Đã quét QR thành công! Đang chuyển hướng...');
        setTimeout(() => {
          // Thử chuyển hướng trực tiếp với URL gốc
          let urlToRedirect = trimmedText;
          if (!trimmedText.startsWith('http://') && !trimmedText.startsWith('https://')) {
            urlToRedirect = `http://${trimmedText}`;
          }
          console.log('Direct redirect to:', urlToRedirect);
          window.location.href = urlToRedirect;
        }, 500);
      }
    } else {
      // Nếu không phải URL hợp lệ, xử lý như tokenId và điều hướng đến track
      console.log('QR does not contain URL, treating as tokenId');
      setTokenId(trimmedText);
      setShowQRScanner(false);
      setIsScanning(false);
      setShowUploadQR(false);
      toast.success('Đã quét QR thành công!');
      // Tự động tra cứu sau khi quét
      setTimeout(() => {
        navigate(`/track?tokenId=${encodeURIComponent(trimmedText)}`);
      }, 500);
    }
  };


  const handleCloseQRScanner = () => {
    stopQRScanner();
    setShowQRScanner(false);
    setIsScanning(false);
    setQrError(null);
  };

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      stopQRScanner();
    };
  }, []);

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
      const gray = newDataArray[i] * 0.299 + newDataArray[i + 1] * 0.587 + newDataArray[i + 2] * 0.114;
      
      // Tăng contrast
      const enhanced = ((gray - 128) * contrast) + 128;
      let final = Math.max(0, Math.min(255, enhanced));
      
      if (useBinary) {
        // Áp dụng threshold để tạo ảnh đen trắng rõ ràng
        final = final > threshold ? 255 : 0;
      }
      
      newDataArray[i] = final;     // R
      newDataArray[i + 1] = final; // G
      newDataArray[i + 2] = final; // B
      // newDataArray[i + 3] giữ nguyên alpha
    }
    return newData;
  };

  const handleUploadQRImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.warn('No file selected');
      return;
    }

    // Kiểm tra định dạng file
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh hợp lệ');
      return;
    }

    setUploadingImage(true);
    setQrError(null);

    try {
      console.log('Starting QR decode from image:', file.name);
      
      // Tạo Image element để load ảnh
      const img = new Image();
      const imageUrl = URL.createObjectURL(file);
      
      // Đợi ảnh load xong
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      console.log('Image loaded, dimensions:', img.width, 'x', img.height);

      // Tạo canvas để vẽ ảnh
      // Giới hạn kích thước tối đa để tăng hiệu suất (max 2000px)
      const maxDimension = 2000;
      let canvasWidth = img.width;
      let canvasHeight = img.height;
      
      if (canvasWidth > maxDimension || canvasHeight > maxDimension) {
        const ratio = Math.min(maxDimension / canvasWidth, maxDimension / canvasHeight);
        canvasWidth = Math.floor(canvasWidth * ratio);
        canvasHeight = Math.floor(canvasHeight * ratio);
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      // Vẽ ảnh với kích thước mới
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      
      // Lấy ImageData từ canvas
      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Giải phóng URL
      URL.revokeObjectURL(imageUrl);
      
      // Sử dụng BrowserMultiFormatReader để decode
      const codeReader = new BrowserMultiFormatReader();
      
      let result = null;
      let scannedText = '';
      let decodeSuccess = false;
      
      // Helper function để tạo HTMLImageElement từ canvas
      const createImageFromCanvas = (canvasElement) => {
        return new Promise((resolve, reject) => {
          const imgElement = new Image();
          imgElement.onload = () => resolve(imgElement);
          imgElement.onerror = reject;
          imgElement.src = canvasElement.toDataURL('image/png');
        });
      };
      
      // Helper function để tạo canvas từ ImageData đã enhance
      const createCanvasFromImageData = (imageData) => {
        const newCanvas = document.createElement('canvas');
        newCanvas.width = imageData.width;
        newCanvas.height = imageData.height;
        const newCtx = newCanvas.getContext('2d');
        newCtx.putImageData(imageData, 0, 0);
        return newCanvas;
      };
      
      // Thử nhiều phương pháp decode với các cấu hình khác nhau
      const decodeMethods = [
        // Phương pháp 1: Decode từ HTMLImageElement gốc
        {
          name: 'ImageElement (original)',
          fn: async () => {
            return await codeReader.decodeFromImageElement(img);
          }
        },
        // Phương pháp 2: Canvas toDataURL PNG với ZXing
        {
          name: 'ZXing from DataURL (PNG)',
          fn: async () => {
            const dataUrl = canvas.toDataURL('image/png');
            return await codeReader.decodeFromImageUrl(dataUrl);
          }
        },
        // Phương pháp 3: Canvas toDataURL JPEG với ZXing
        {
          name: 'ZXing from DataURL (JPEG)',
          fn: async () => {
            const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
            return await codeReader.decodeFromImageUrl(dataUrl);
          }
        },
        // Phương pháp 4: ImageElement từ canvas
        {
          name: 'ImageElement from Canvas',
          fn: async () => {
            const imgElement = await createImageFromCanvas(canvas);
            return await codeReader.decodeFromImageElement(imgElement);
          }
        },
        // Phương pháp 5: Enhanced binary ImageData -> Canvas -> ImageElement
        {
          name: 'Enhanced Binary -> ImageElement',
          fn: async () => {
            const enhancedData = enhanceImageForQR(ctx.getImageData(0, 0, canvas.width, canvas.height), {
              contrast: 1.5,
              threshold: 128,
              useBinary: true
            });
            const enhancedCanvas = createCanvasFromImageData(enhancedData);
            const imgElement = await createImageFromCanvas(enhancedCanvas);
            return await codeReader.decodeFromImageElement(imgElement);
          }
        },
        // Phương pháp 6: Enhanced grayscale ImageData -> Canvas -> ImageElement
        {
          name: 'Enhanced Grayscale -> ImageElement',
          fn: async () => {
            const enhancedData = enhanceImageForQR(ctx.getImageData(0, 0, canvas.width, canvas.height), {
              contrast: 2.0,
              threshold: 128,
              useBinary: false
            });
            const enhancedCanvas = createCanvasFromImageData(enhancedData);
            const imgElement = await createImageFromCanvas(enhancedCanvas);
            return await codeReader.decodeFromImageElement(imgElement);
          }
        },
        // Phương pháp 7: High contrast enhanced -> ImageElement
        {
          name: 'High Contrast -> ImageElement',
          fn: async () => {
            const enhancedData = enhanceImageForQR(ctx.getImageData(0, 0, canvas.width, canvas.height), {
              contrast: 2.5,
              threshold: 120,
              useBinary: true
            });
            const enhancedCanvas = createCanvasFromImageData(enhancedData);
            const imgElement = await createImageFromCanvas(enhancedCanvas);
            return await codeReader.decodeFromImageElement(imgElement);
          }
        },
        // Phương pháp 8: html5-qrcode với file trực tiếp
        {
          name: 'html5-qrcode (file)',
          fn: async () => {
            const { Html5Qrcode } = await import('html5-qrcode');
            const html5QrCode = new Html5Qrcode();
            const result = await html5QrCode.scanFile(file, true);
            return { getText: () => result, text: result };
          }
        },
        // Phương pháp 9: html5-qrcode với DataURL PNG
        {
          name: 'html5-qrcode (PNG DataURL)',
          fn: async () => {
            const { Html5Qrcode } = await import('html5-qrcode');
            const html5QrCode = new Html5Qrcode();
            const dataUrl = canvas.toDataURL('image/png');
            // Convert data URL to blob
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const result = await html5QrCode.scanFile(blob, true);
            return { getText: () => result, text: result };
          }
        },
        // Phương pháp 10: html5-qrcode với DataURL JPEG
        {
          name: 'html5-qrcode (JPEG DataURL)',
          fn: async () => {
            const { Html5Qrcode } = await import('html5-qrcode');
            const html5QrCode = new Html5Qrcode();
            const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const result = await html5QrCode.scanFile(blob, true);
            return { getText: () => result, text: result };
          }
        }
      ];
      
      // Thử từng phương pháp
      for (const method of decodeMethods) {
        try {
          console.log(`Trying decode method: ${method.name}`);
          result = await method.fn();
          scannedText = result.getText ? result.getText() : (result.text || result.toString() || '');
          
          if (scannedText && scannedText.trim()) {
            console.log(`✅ Successfully decoded using ${method.name}:`, scannedText);
            decodeSuccess = true;
            break;
          }
        } catch (methodError) {
          console.log(`❌ Method ${method.name} failed:`, methodError.message || methodError);
          continue;
        }
      }
      
      // Nếu vẫn không thành công, thử với URL trực tiếp từ file
      if (!decodeSuccess) {
        try {
          console.log('Trying direct file URL method...');
          const imageUrl2 = URL.createObjectURL(file);
          result = await codeReader.decodeFromImageUrl(imageUrl2);
          scannedText = result.getText ? result.getText() : (result.text || '');
          URL.revokeObjectURL(imageUrl2);
          if (scannedText && scannedText.trim()) {
            console.log('✅ Decoded from direct file URL:', scannedText);
            decodeSuccess = true;
          }
        } catch (urlError) {
          console.log('❌ Direct file URL method also failed:', urlError.message || urlError);
        }
      }
      
      // Nếu vẫn không thành công, thử với ảnh đã resize nhỏ hơn
      if (!decodeSuccess && (canvasWidth > 500 || canvasHeight > 500)) {
        console.log('Trying with smaller image size...');
        const smallCanvas = document.createElement('canvas');
        smallCanvas.width = 500;
        smallCanvas.height = 500;
        const smallCtx = smallCanvas.getContext('2d', { willReadFrequently: true });
        smallCtx.drawImage(img, 0, 0, 500, 500);
        
        try {
          const smallImgElement = await createImageFromCanvas(smallCanvas);
          result = await codeReader.decodeFromImageElement(smallImgElement);
          scannedText = result.getText ? result.getText() : (result.text || '');
          if (scannedText && scannedText.trim()) {
            console.log('✅ Decoded from smaller image:', scannedText);
            decodeSuccess = true;
          }
        } catch (smallError) {
          console.log('Small image method failed:', smallError.message);
        }
      }
      
      // Thử với ảnh lớn hơn nếu ảnh hiện tại quá nhỏ
      if (!decodeSuccess && (canvasWidth < 800 || canvasHeight < 800)) {
        console.log('Trying with larger image size...');
        const largeCanvas = document.createElement('canvas');
        const scale = Math.min(2000 / canvasWidth, 2000 / canvasHeight);
        largeCanvas.width = Math.floor(canvasWidth * scale);
        largeCanvas.height = Math.floor(canvasHeight * scale);
        const largeCtx = largeCanvas.getContext('2d', { willReadFrequently: true });
        largeCtx.drawImage(img, 0, 0, largeCanvas.width, largeCanvas.height);
        
        try {
          const largeImgElement = await createImageFromCanvas(largeCanvas);
          result = await codeReader.decodeFromImageElement(largeImgElement);
          scannedText = result.getText ? result.getText() : (result.text || '');
          if (scannedText && scannedText.trim()) {
            console.log('✅ Decoded from larger image:', scannedText);
            decodeSuccess = true;
          }
        } catch (largeError) {
          console.log('Large image method failed:', largeError.message);
        }
      }
      
      if (decodeSuccess && scannedText && scannedText.trim()) {
        console.log('Successfully decoded QR text:', scannedText);
        processQRResult(scannedText);
      } else {
        throw new Error('Không thể đọc mã QR từ ảnh. Vui lòng thử lại với ảnh khác hoặc sử dụng chức năng quét camera.');
      }
    } catch (error) {
      console.error('Error decoding QR from image:', error);
      let errorMessage = 'Không thể đọc mã QR từ ảnh';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.name === 'NotFoundException') {
        errorMessage = 'Không tìm thấy mã QR trong ảnh. Vui lòng đảm bảo ảnh chứa mã QR rõ nét.';
      } else if (error.message && error.message.includes('No MultiFormat Readers')) {
        errorMessage = 'Không thể đọc mã QR. Vui lòng thử lại với ảnh rõ hơn hoặc sử dụng chức năng quét camera.';
      }
      
      toast.error(errorMessage);
      setQrError(errorMessage);
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
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
      toast.error('Vui lòng nhập tên thuốc hoặc mã ATC');
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
      align: "start"
    },
    {
      step: "Bước 2: Phân phối",
      desc: "Chuyển quyền sở hữu NFT từ nhà sản xuất sang nhà phân phối",
      icon: <BsTruck />,
      color: "text-red-600",
      bgColor: "bg-red-100",
      align: "mid-start" 
    },
    {
      step: "Bước 3: Bán Lẻ",
      desc: "Nhà phân phối chuyển NFT sang nhà thuốc",
      icon: <BsShop />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      align: "mid-end"
    },
    {
      step: "Bước 4: Người dùng",
      desc: "Người dùng tra cứu thông tin bằng mã QR hoặc serial",
      icon: <BsPersonFill />,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      align: "end"
    }
  ];

  const benefits = [
    "Ngăn chặn thuốc giả, thuốc kém chất lượng.",
    "Tăng niềm tin của người tiêu dùng.",
    "Theo dõi chính xác chuỗi cung ứng.",
    "Tuân thủ quy định pháp luật.",
    "Hỗ trợ thu hồi sản phẩm khi cần thiết."
  ];

  const StepCard = ({ step, desc, icon, color, bgColor }) => (
    <motion.div 
      className="flex items-center gap-5 p-6 bg-white rounded-2xl shadow-lg border border-slate-200/50 max-w-md hover:border-[#4BADD1]/50 transition-all relative overflow-hidden group"
      whileHover={{ 
        scale: 1.03, 
        boxShadow: "0 12px 40px rgba(75, 173, 209, 0.25)",
        y: -4
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div
        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4BADD1] to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"
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
      description: "Tìm kiếm thông tin sản phẩm bằng mã lô, mã QR hoặc series number."
    },
    {
      number: 2,
      title: "Minh bạch hoàn toàn",
      description: "Thông tin rõ ràng, chi tiết về toàn bộ quy trình từ nhà sản xuất đến nhà thuốc."
    },
    {
      number: 3,
      title: "Bảo mật tuyệt đối",
      description: "Dữ liệu được bảo mật bằng công nghệ blockchain, không thể thay đổi hay giả mạo."
    }
  ];
  const stats = [
    { value: '10,000+', label: 'Sản phẩm' },
    { value: '500+', label: 'Doanh nghiệp' },
    { value: '50,000+', label: 'Người dùng' },
  ];

  return (
    <div className="min-h-screen bg-white">
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
              ease: "easeInOut"
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
              ease: "easeInOut"
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
                className="bg-gradient-to-r from-[#2176FF] to-[#4BADD1] bg-clip-text text-transparent"
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
              Tra cứu thông tin sản phẩm, theo dõi lộ trình phân phối an toàn với công nghệ <motion.strong 
                className="text-[#4BADD1] font-bold relative"
                animate={{ 
                  textShadow: [
                    "0 0 0px rgba(75, 173, 209, 0)",
                    "0 0 10px rgba(75, 173, 209, 0.5)"
                  ]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              >Blockchain</motion.strong>.
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
                onClick={() => setSearchMode('nft')}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  searchMode === 'nft'
                    ? 'bg-white text-[#4BADD1] shadow-md'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Tra cứu NFT
              </button>
              <button
                onClick={() => setSearchMode('drug')}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  searchMode === 'drug'
                    ? 'bg-white text-[#4BADD1] shadow-md'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Thông tin thuốc
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              {searchMode === 'nft' ? (
                <>
                  <p className="text-slate-700 mb-5 text-left text-sm font-semibold flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#4BADD1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Nhập mã lô, mã serial hoặc NFT ID
                  </p>

                  <div className="flex gap-3 items-stretch">
                    <div className="flex-1 relative">
                      <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                <input
                  type="text"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTrackDrug()}
                        placeholder="Nhập mã để tra cứu..."
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4BADD1]/50 focus:border-[#4BADD1] transition text-base placeholder:text-slate-400"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={handleScanQR}
                        className="px-6 py-3.5 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl transition-all flex items-center gap-2 text-sm hover:border-[#54b1d3] active:scale-95"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zM14 13h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2zm0-4h2v2h-2v-2zm2 2h3v2h-3v-2z"/>
                        </svg>
                        <span className="font-semibold">Quét QR</span>
                      </button>
                      <button
                        onClick={handleOpenUploadQR}
                        className="px-6 py-3.5 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl transition-all flex items-center gap-2 text-sm hover:border-[#54b1d3] active:scale-95"
                        title="Tải ảnh QR lên"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
                      className="px-6 py-3.5 text-white font-semibold rounded-xl transition text-sm flex items-center gap-2 hover:opacity-90 active:scale-95"
                      style={{ backgroundColor: '#2176FF' }}
                >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold">Xác thực</span>
                </button>
              </div>
                </>
              ) : (
                <>
                  <p className="text-slate-700 mb-5 text-left text-sm font-semibold flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#4BADD1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Tìm kiếm thông tin thuốc theo tên hoặc mã ATC
                  </p>
                  
                  <div className="flex gap-3 items-stretch">
                    <div className="flex-1 relative">
                      <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        value={drugSearch}
                        onChange={(e) => setDrugSearch(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearchDrug()}
                        placeholder="Nhập tên thuốc hoặc mã ATC..."
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4BADD1]/50 focus:border-[#4BADD1] transition text-base placeholder:text-slate-400"
                      />
                    </div>
                    
                    <button
                      onClick={handleSearchDrug}
                      className="px-6 py-3.5 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl transition-all text-sm flex items-center gap-2 hover:border-[#54b1d3] active:scale-95"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
      <section className="py-20 px-4 bg-gradient-to-b from-white to-slate-50/30">
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
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#2176FF] mb-4">
            Tại sao chọn hệ thống của chúng tôi
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Giải pháp toàn diện cho việc quản lý và truy xuất nguồn gốc dược phẩm
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
                  ? 'border-2 border-[#4BADD1] lg:scale-105 bg-gradient-to-br from-white to-[#4BADD1]/5' 
                  : 'hover:border-[#4BADD1]/50'
                }
              `}
            >
              {index === 1 && (
                <motion.div
                  className="absolute top-0 right-0 w-32 h-32 bg-[#4BADD1]/10 rounded-full blur-2xl -mr-16 -mt-16"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
              <div className={`flex items-center justify-center w-20 h-20 rounded-2xl mx-auto mb-6 relative
                ${index === 1 ? 'bg-gradient-to-br from-[#4BADD1]/20 to-cyan-100/50' : 'bg-gradient-to-br from-[#4BADD1]/10 to-blue-50/50'}
              `}>
                <motion.span 
                  className={`text-4xl font-bold
                    ${index === 1 ? 'text-[#4BADD1]' : 'text-[#2176FF]'}
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
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#2176FF] mb-4">
            Quy trình hoạt động
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Từ nhà sản xuất đến người tiêu dùng, mọi bước đều được ghi lại minh bạch
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
            if (item.align === "mid-start") alignmentClass = "justify-start md:pl-20 lg:pl-32";
            if (item.align === "mid-end") alignmentClass = "justify-start md:justify-end md:pr-20 lg:pr-32";
            if (item.align === "end") alignmentClass = "justify-start md:justify-end";

            // Xác định hướng animation:
            // - Trên mobile: tất cả slide từ trái (-50)
            // - Trên desktop: bước chẵn (0,2) slide từ trái, bước lẻ (1,3) slide từ phải
            const isRightAligned = item.align === "end" || item.align === "mid-end";
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
                  mass: 0.8
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
      <section className="py-24 px-4 bg-gradient-to-b from-white via-slate-50/30 to-white">
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
            <div className="border-2 border-[#4BADD1] rounded-3xl p-8 h-full flex flex-col justify-between bg-gradient-to-br from-white to-[#4BADD1]/5 relative overflow-hidden shadow-xl">
              <motion.div
                className="absolute top-0 right-0 w-40 h-40 bg-[#4BADD1]/10 rounded-full blur-3xl -mr-20 -mt-20"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  Công nghệ blockchain
                </h2>
                <p className="text-slate-600 leading-relaxed text-base">
                  Mỗi sản phẩm được gắn với một NFT duy nhất trên blockchain, đảm bảo tính xác thực và không thể thay đổi. Mọi giao dịch đều được ghi lại và minh bạch.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                <motion.div 
                  className="bg-[#4BADD1]/10 rounded-2xl p-6 text-center border border-[#4BADD1]/20"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(75, 173, 209, 0.15)" }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-4xl font-extrabold text-[#4BADD1] mb-1">
                    100%
                  </h3>
                  <p className="text-slate-600 font-medium">Minh bạch</p>
                </motion.div>
                <motion.div 
                  className="bg-[#4BADD1]/10 rounded-2xl p-6 text-center border border-[#4BADD1]/20"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(75, 173, 209, 0.15)" }}
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
                    ease: "easeOut" 
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
      <footer className="py-16 px-4 bg-gradient-to-b from-slate-800 to-slate-900 text-white relative overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-full h-full opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 30%, rgba(75, 173, 209, 0.3) 0%, transparent 50%)"
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
                  <Link to="/login" className="hover:text-[#4BADD1] transition flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full group-hover:bg-[#4BADD1] transition"></span>
                    Đăng nhập
                  </Link>
                </li>
                <li>
                  <Link to="/register-business" className="hover:text-[#4BADD1] transition flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full group-hover:bg-[#4BADD1] transition"></span>
                    Đăng ký
                  </Link>
                </li>
                <li>
                  <Link to="/register-business" className="hover:text-[#4BADD1] transition flex items-center gap-2 group">
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
                  <svg className="w-5 h-5 text-[#4BADD1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  info@drugchain.vn
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#4BADD1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  1900 xxxx
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#4BADD1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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
                <h3 className="text-xl font-bold text-slate-800">Quét QR Code</h3>
                <button
                  onClick={handleCloseQRScanner}
                  className="text-slate-500 hover:text-slate-700 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="relative rounded-xl overflow-hidden bg-slate-100" style={{ minHeight: '300px', width: '100%', position: 'relative' }}>
                {showQRScanner ? (
                  <div style={{ width: '100%', height: '100%', minHeight: '300px', position: 'relative' }}>
                    <div 
                      id="qr-reader"
                      ref={scannerContainerRef}
                      style={{ width: '100%', height: '100%', minHeight: '300px' }}
                      className="qr-scanner-container"
                    />
                    <style>{`
                      #qr-reader {
                        width: 100% !important;
                        height: 100% !important;
                      }
                      #qr-reader__dashboard {
                        display: none !important;
                      }
                      #qr-reader__camera_selection {
                        display: none !important;
                      }
                      #qr-reader__scan_region {
                        border-radius: 12px;
                        overflow: hidden;
                      }
                      #qr-reader__scan_region video {
                        width: 100% !important;
                        height: 100% !important;
                        object-fit: cover;
                      }
                    `}</style>
                    {qrError && (
                      <div className="absolute bottom-2 left-2 right-2 bg-red-500/90 text-white text-xs p-2 rounded z-10">
                        {qrError}
                      </div>
                    )}
                    {!isScanning && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-20">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4BADD1] mx-auto mb-2"></div>
                          <p className="text-slate-600">Đang khởi động camera...</p>
                        </div>
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
