import React, { useState, useEffect } from "react";
import { drugAPI } from "../../services/api";

const ManufactorDrugCodesModal = ({ isOpen, onClose }) => {
  const [codes, setCodes] = useState([]);
  const [filteredCodes, setFilteredCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) loadDrugCodes();
  }, [isOpen]);

  useEffect(() => {
    filterCodes();
  }, [searchTerm, codes]);

  const loadDrugCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await drugAPI.getDrugCodes();
      if (response.success) {
        setCodes(response.data || []);
      } else setError(response.message || "Không thể tải danh sách mã ATC");
    } catch (err) {
      setError(err.message || "Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const filterCodes = () => {
    if (!searchTerm.trim()) return setFilteredCodes(codes);
    const filtered = codes.filter(
      (code) =>
        code.atcCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.tradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.genericName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCodes(filtered);
  };

  const formatATCCode = (atcCode) => {
    if (!atcCode) return "N/A";
    if (atcCode.length >= 7)
      return `${atcCode.substring(0, 3)}.${atcCode.substring(
        3,
        5
      )}.${atcCode.substring(5)}`;
    return atcCode;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden animate-fadeIn"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-cyan-500/10 to-teal-600/10">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            📋 Danh sách mã ATC
          </h2>
          <div className="flex gap-3">
            <button
              onClick={loadDrugCodes}
              disabled={loading}
              className="text-sm font-medium text-cyan-600 hover:text-teal-600 transition disabled:opacity-50"
            >
              🔄 Làm mới
            </button>
            <button
              onClick={onClose}
              className="text-lg text-slate-500 hover:text-red-500 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 bg-white">
          {/* Search Bar */}
          <div className="mb-5">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Tìm kiếm theo mã ATC, tên thương mại hoặc tên gốc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500 transition"
              />
              <span className="absolute left-3 top-2.5 text-slate-400 text-lg">🔍</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {loading
                ? "Đang tải dữ liệu..."
                : `Hiển thị ${filteredCodes.length} / ${codes.length} mã ATC`}
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-10 text-slate-500">
              <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-3"></div>
              <p>Đang tải danh sách mã ATC...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-sm">
              ❌ {error}
            </div>
          )}

          {/* List */}
          {!loading && !error && (
            <>
              {filteredCodes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                  <div className="text-4xl mb-2">🔍</div>
                  <h3 className="font-semibold text-slate-700 mb-1">
                    Không tìm thấy mã ATC
                  </h3>
                  <p className="text-sm text-slate-500">
                    {searchTerm
                      ? `Không có mã nào phù hợp với "${searchTerm}"`
                      : "Chưa có mã ATC nào trong danh sách"}
                  </p>
                </div>
              ) : (
                <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3">
                  {filteredCodes.map((code, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-cyan-500/40 transition p-4 bg-white"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500">Mã ATC:</span>
                          <span className="font-semibold text-cyan-600">
                            {formatATCCode(code.atcCode)}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">
                          #{index + 1}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-slate-500">Tên thương mại:</span>
                          <div className="font-medium text-slate-700 truncate">
                            {code.tradeName || "N/A"}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500">Tên gốc:</span>
                          <div className="font-medium text-slate-700 truncate">
                            {code.genericName || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManufactorDrugCodesModal;

