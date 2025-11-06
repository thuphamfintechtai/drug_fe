// src/pages/VerifyPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
// Xóa: import './VerifyPage.css';

// --- HÀM HELPER (Không thay đổi) ---

// 1. Giải mã Base64URL (an toàn cho trình duyệt)
function decodeBase64Url(base64Url) {
  try {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const decodedString = new TextDecoder().decode(bytes);
    return decodedString;
  } catch (error) {
    console.error("Lỗi giải mã Base64URL:", error);
    throw new Error("Dữ liệu Base64URL không hợp lệ");
  }
}

// 2. Format ngày giờ
function formatDate(isoString) {
  if (!isoString) return "N/A";
  return new Date(isoString).toLocaleString('vi-VN');
}

// 3. Icon cho từng giai đoạn
function getStageIcon(stage) {
  if (stage.includes('manufacturing')) return '🏭';
  if (stage.includes('distributor')) return '🚚';
  if (stage.includes('pharmacy')) return '🏥';
  return '📦';
}

// --- COMPONENT CHÍNH ---

function VerifyPage() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (!dataParam) {
      setError("Không tìm thấy dữ liệu (data) trên URL.");
      setLoading(false);
      return;
    }

    try {
      const decodedJson = decodeBase64Url(dataParam);
      const parsedData = JSON.parse(decodedJson);
      setData(parsedData);
    } catch (err) {
      console.error("Lỗi khi xử lý dữ liệu:", err);
      setError("Dữ liệu xác thực không hợp lệ hoặc bị hỏng.");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // --- RENDER ---

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-10 text-lg text-center bg-white rounded-lg shadow-md">
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-10 text-lg font-bold text-center text-red-600 bg-white rounded-lg shadow-md">
          ❌ {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const lastJourneyStep = data.journey[data.journey.length - 1];
  const isVerified = lastJourneyStep?.supplyChainCompleted === true;

  return (
    // Thêm bg-gray-100 để có nền xám cho toàn trang
    <div className="max-w-4xl min-h-screen p-4 mx-auto sm:p-8 bg-gray-50">
      <div className="flex flex-col gap-6">
        {/* 1. Banner Trạng Thái */}
        <div
          className={`p-6 rounded-lg text-center text-white shadow-lg ${
            isVerified ? 'bg-green-600' : 'bg-yellow-500'
          }`}
        >
          <h1 className="mb-1 text-3xl font-bold">
            {isVerified ? '✅ Xác thực Thành công' : '⏳ Đang trong chuỗi cung ứng'}
          </h1>
          <p className="text-lg opacity-90">
            {isVerified
              ? 'Sản phẩm này đã hoàn thành chuỗi cung ứng.'
              : 'Sản phẩm này chưa được ghi nhận tại điểm cuối.'}
          </p>
        </div>

        {/* 2. Thẻ Thông tin Thuốc/NFT */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="pb-3 mb-5 text-2xl font-semibold text-blue-700 border-b border-gray-200">
            Thông tin Sản phẩm (NFT)
          </h2>
          <div className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3">
            <strong className="font-semibold text-gray-600">Tên thuốc:</strong>
            <span className="font-medium">{data.nft.drug.tradeName}</span>
            <strong className="font-semibold text-gray-600">Số lô:</strong>
            <span className="font-medium">{data.nft.batchNumber}</span>
            <strong className="font-semibold text-gray-600">Số Sê-ri:</strong>
            <span className="font-medium">{data.nft.serialNumber}</span>
            <strong className="font-semibold text-gray-600">Token ID:</strong>
            <span className="font-medium">{data.nft.tokenId}</span>
            <strong className="font-semibold text-gray-600">Trạng thái:</strong>
            <span className="font-medium capitalize">{data.nft.status}</span>
            <strong className="font-semibold text-gray-600">Chủ sở hữu:</strong>
            <span className="font-medium">
              {data.nft.currentOwner?.fullName || 'N/A'}
            </span>
            <strong className="font-semibold text-gray-600">Ngày sản xuất:</strong>
            <span className="font-medium">{formatDate(data.nft.mfgDate)}</span>
            <strong className="font-semibold text-gray-600">Hạn sử dụng:</strong>
            <span className="font-medium">{formatDate(data.nft.expDate)}</span>
          </div>
        </div>

        {/* 3. Dòng thời gian (Timeline) */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="pb-3 mb-5 text-2xl font-semibold text-blue-700 border-b border-gray-200">
            Hành trình Chuỗi cung ứng
          </h2>
          <ul className="relative m-0 p-0 list-none">
            {/* Đây là đường kẻ dọc của timeline */}
            <div className="absolute top-0 bottom-0 w-1 bg-gray-200 rounded-full left-5"></div>

            {data.journey.map((step, index) => (
              <li key={index} className="relative pl-14 mb-7 last:mb-0">
                <div className="absolute top-0 flex items-center justify-center w-10 h-10 text-2xl text-white bg-blue-600 rounded-full left-0 ring-4 ring-white shadow-lg">
                  {getStageIcon(step.stage)}
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="block mb-1 text-sm text-gray-500">
                    {formatDate(step.date)}
                  </span>
                  <h3 className="mb-2 text-lg font-semibold">
                    {step.description}
                  </h3>
                  {step.manufacturer && (
                    <p className="m-0 text-sm text-gray-700">Bởi: {step.manufacturer}</p>
                  )}
                  {step.status && (
                    <p className="m-0 text-sm font-medium text-gray-700">Trạng thái: <span className="capitalize">{step.status}</span></p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. Thông tin Lịch sử Blockchain (Nếu có) */}
        {data.blockchainHistory && data.blockchainHistory.length > 0 && (
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="pb-3 mb-5 text-2xl font-semibold text-blue-700 border-b border-gray-200">
              Lịch sử Blockchain
            </h2>
            <pre className="p-4 text-sm text-white bg-gray-800 rounded-md overflow-x-auto">
              {JSON.stringify(data.blockchainHistory, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyPage;