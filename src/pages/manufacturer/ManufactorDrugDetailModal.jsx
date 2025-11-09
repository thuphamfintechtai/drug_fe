import React, { useState, useEffect } from "react";
import { drugAPI } from "../../services/api";

const ManufactorDrugDetailModal = ({ isOpen, onClose, drugId }) => {
  const [drug, setDrug] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && drugId) {
      loadDrugDetails();
    }
  }, [isOpen, drugId]);

  const loadDrugDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await drugAPI.getDrugById(drugId);
      if (response.success) {
        setDrug(response.data);
      } else {
        setError(response.message || "Không thể tải thông tin thuốc");
      }
    } catch (err) {
      setError(err.message || "Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString("vi-VN") : "N/A";
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-lg border border-slate-200 overflow-y-auto max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-cyan-500/10 to-teal-600/10">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            👁️ Chi tiết thuốc
          </h2>
          <button
            onClick={onClose}
            className="text-lg text-slate-500 hover:text-red-500 transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {loading && (
            <div className="text-center py-8">
              <div className="text-2xl mb-2">⏳</div>
              <p className="text-slate-600">Đang tải thông tin...</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-sm">
              ❌ {error}
            </div>
          )}

          {drug && !loading && (
            <div className="space-y-6">
              {/* Thông tin cơ bản */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  📋 Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-600 font-medium">
                      Tên thương mại
                    </label>
                    <p className="mt-1 text-slate-800 font-medium">
                      {drug.tradeName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 font-medium">
                      Tên gốc
                    </label>
                    <p className="mt-1 text-slate-800 font-medium">
                      {drug.genericName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 font-medium">
                      Mã ATC
                    </label>
                    <p className="mt-1 text-slate-800 font-medium">
                      {drug.atcCode || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 font-medium">
                      Trạng thái
                    </label>
                    <span
                      className={`mt-1 inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        drug.status === "active"
                          ? "bg-green-100 text-green-700"
                          : drug.status === "inactive"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {drug.status === "active"
                        ? "Hoạt động"
                        : drug.status === "inactive"
                        ? "Ngừng hoạt động"
                        : drug.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thông tin kỹ thuật */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  🔬 Thông tin kỹ thuật
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-600 font-medium">
                      Dạng bào chế
                    </label>
                    <p className="mt-1 text-slate-800">
                      {drug.dosageForm || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 font-medium">
                      Hàm lượng
                    </label>
                    <p className="mt-1 text-slate-800">
                      {drug.strength || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 font-medium">
                      Cách dùng
                    </label>
                    <p className="mt-1 text-slate-800">{drug.route || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 font-medium">
                      Đóng gói
                    </label>
                    <p className="mt-1 text-slate-800">
                      {drug.packaging || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Thành phần và bảo quản */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  📦 Thành phần & Bảo quản
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-600 font-medium">
                      Thành phần hoạt chất
                    </label>
                    <div className="mt-1">
                      {drug.activeIngredients &&
                      drug.activeIngredients.length > 0 ? (
                        <ul className="list-disc list-inside text-slate-800">
                          {drug.activeIngredients.map((ingredient, index) => (
                            <li key={index}>
                              {ingredient.name}{" "}
                              {ingredient.concentration &&
                                `(${ingredient.concentration})`}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-500">Không có thông tin</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 font-medium">
                      Cách bảo quản
                    </label>
                    <p className="mt-1 text-slate-800">
                      {drug.storage || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 font-medium">
                      Cảnh báo
                    </label>
                    <p className="mt-1 text-slate-800">
                      {drug.warnings || "Không có"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Thông tin thời gian */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  📅 Thông tin thời gian
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-600 font-medium">
                      Ngày tạo
                    </label>
                    <p className="mt-1 text-slate-800">
                      {formatDate(drug.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 font-medium">
                      Cập nhật lần cuối
                    </label>
                    <p className="mt-1 text-slate-800">
                      {formatDate(drug.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManufactorDrugDetailModal;
