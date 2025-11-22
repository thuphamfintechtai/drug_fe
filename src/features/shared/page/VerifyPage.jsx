/* eslint-disable no-empty */
/* eslint-disable no-undef */
// src/pages/VerifyPage.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

// --- HÀM HELPER ---

function decodeBase64Url(base64Url) {
  try {
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
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
  if (!isoString) {return "N/A";}
  return new Date(isoString).toLocaleString("vi-VN");
}

// 3. Icon cho từng giai đoạn
function getStageIcon(stage = "") {
  const value = String(stage).toLowerCase();
  if (value.includes("manufacturing")) {return "🏭";}
  if (value.includes("distributor")) {return "🚚";}
  if (value.includes("pharmacy")) {return "🏥";}
  return "📦";
}

function StatusBadge({ isVerified }) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium shadow-sm ${
        isVerified ? "bg-[#66b9d8] !text-white" : "bg-[#ff7a59] !text-white"
      }`}
    >
      <span
        className={`inline-block h-2.5 w-2.5 rounded-full ${
          isVerified ? "bg-white" : "bg-white"
        }`}
      />
      {isVerified ? "Đã xác thực" : "Chưa hoàn tất"}
    </span>
  );
}

function LabelValue({ label, children, withCopy = false, copyText = "" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(String(copyText));
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <div className="grid grid-cols-[160px_1fr] items-start gap-3 py-2">
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="flex items-center gap-2">
        <div className="text-slate-800 font-medium break-all">{children}</div>
        {withCopy && copyText ? (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200"
            aria-label="Sao chép"
            title="Sao chép"
          >
            {copied ? "Đã chép" : "Sao chép"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

// --- COMPONENT CHÍNH ---

function VerifyPage() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const dataParam = searchParams.get("data");
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
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="px-6 py-4 text-slate-700 text-sm bg-white rounded-md shadow-sm ring-1 ring-slate-200">
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="px-6 py-4 text-sm font-semibold text-red-700 bg-white rounded-md shadow-sm ring-1 ring-red-200">
          {error}
        </div>
      </div>
    );
  }

  if (!data) {return null;}

  const journey = Array.isArray(data.journey) ? data.journey : [];
  const lastJourneyStep = journey[journey.length - 1] || {};
  const isVerified = lastJourneyStep?.supplyChainCompleted === true;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 mt-16 to-slate-100">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header */}
        <div
          className={`relative overflow-hidden rounded-2xl border ${
            isVerified
              ? "bg-[#66b9d8] border-[#66b9d8]"
              : "bg-[#ff7a59] border-[#ff7a59]"
          } shadow-lg`}
        >
          <div className="p-6 sm:p-8 !text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {isVerified
                    ? "Xác thực thành công"
                    : "Đang trong chuỗi cung ứng"}
                </h1>
                <p className="opacity-90 mt-1">
                  {isVerified
                    ? "Sản phẩm này đã hoàn thành chuỗi cung ứng."
                    : "Sản phẩm này chưa được ghi nhận tại điểm cuối."}
                </p>
              </div>
              <StatusBadge isVerified={isVerified} />
            </div>
          </div>
        </div>

        {/* Product card */}
        <section className="mt-6">
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                Thông tin Sản phẩm (NFT)
              </h2>
              <span className="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-600">
                {data.nft?.status
                  ? String(data.nft.status).toUpperCase()
                  : "N/A"}
              </span>
            </div>
            <div className="px-6 py-4 divide-y divide-slate-100">
              <LabelValue label="Tên thuốc">
                {data.nft?.drug?.tradeName || "N/A"}
              </LabelValue>
              <LabelValue label="Số lô">
                {data.nft?.batchNumber || "N/A"}
              </LabelValue>
              <LabelValue label="Số sê-ri">
                {data.nft?.serialNumber || "N/A"}
              </LabelValue>
              <LabelValue
                label="Token ID"
                withCopy
                copyText={data.nft?.tokenId}
              >
                {data.nft?.tokenId || "N/A"}
              </LabelValue>
              <LabelValue label="Chủ sở hữu">
                {data.nft?.currentOwner?.fullName || "N/A"}
              </LabelValue>
              <LabelValue label="Ngày sản xuất">
                {formatDate(data.nft?.mfgDate)}
              </LabelValue>
              <LabelValue label="Hạn sử dụng">
                {formatDate(data.nft?.expDate)}
              </LabelValue>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="mt-6">
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                Hành trình Chuỗi cung ứng
              </h2>
            </div>
            <div className="px-6 py-6">
              {journey.length === 0 ? (
                <div className="text-sm text-slate-500">
                  Chưa có dữ liệu hành trình.
                </div>
              ) : (
                <ol className="relative ml-5 border-s-l border-slate-200">
                  {journey.map((step, index) => {
                    const active = index === journey.length - 1;
                    const icon = getStageIcon(step?.stage || "");
                    return (
                      <li key={index} className="relative pl-6 pb-8 last:pb-0">
                        <span
                          className={`absolute -left-3 top-0 inline-flex items-center justify-center h-6 w-6 rounded-full ring-2 ${
                            active
                              ? "bg-blue-600 !text-white ring-blue-100"
                              : "bg-slate-200 text-slate-700 ring-white"
                          } shadow`}
                        >
                          <span className="text-[13px] leading-none">
                            {icon}
                          </span>
                        </span>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-slate-800 m-0">
                              {step?.description || "Sự kiện"}
                            </h3>
                            {step?.status ? (
                              <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 capitalize">
                                {step.status}
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {formatDate(step?.date)}
                          </div>
                          {step?.manufacturer ? (
                            <div className="mt-2 text-sm text-slate-700">
                              Bởi: {step.manufacturer}
                            </div>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </div>
        </section>

        {/* Blockchain history */}
        {Array.isArray(data.blockchainHistory) &&
        data.blockchainHistory.length > 0 ? (
          <section className="mt-6">
            <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                  Lịch sử Blockchain
                </h2>
                <button
                  type="button"
                  onClick={() => setShowHistory((v) => !v)}
                  className="text-sm px-3 py-1.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                >
                  {showHistory ? "Ẩn" : "Hiện"}
                </button>
              </div>
              {showHistory ? (
                <div className="px-6 py-6">
                  <pre className="p-4 text-[13px] !text-white bg-slate-800 rounded-md overflow-x-auto">
                    {JSON.stringify(data.blockchainHistory, null, 2)}
                  </pre>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

export default VerifyPage;
