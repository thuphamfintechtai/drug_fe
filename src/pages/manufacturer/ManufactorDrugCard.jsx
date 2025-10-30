import React from "react";

const ManufactorDrugCard = ({ drug, onClick }) => {
  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "N/A");

  // Màu của trạng thái (chỉ để tô chấm tròn)
  const getStatusColor = (status) => {
    const map = {
      active: "bg-green-500",
      inactive: "bg-red-500",
      pending: "bg-yellow-400",
      approved: "bg-emerald-500",
      rejected: "bg-rose-500",
      default: "bg-gray-400",
    };
    return map[status] || map.default;
  };

  // Icon theo loại thuốc
  const getIcon = (category) => {
    const icons = {
      antibiotic: "💊",
      painkiller: "🩹",
      vitamin: "💊",
      supplement: "🌿",
      prescription: "📋",
      otc: "🏪",
      default: "💊",
    };
    return icons[category] || icons.default;
  };

  return (
    <div
      onClick={onClick}
      className="
        relative bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl
        shadow-md hover:shadow-[0_0_40px_rgba(6,182,212,0.25)]
        hover:border-cyan-500/50 transition-all duration-500
        w-full min-w-[300px] max-w-[380px] mx-auto
        cursor-pointer overflow-hidden group
        hover:-translate-y-1 hover:scale-[1.02]
      "
    >
      {/* Hiệu ứng viền sáng */}
      <div
        className="
          absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-teal-500/20 to-transparent
          opacity-0 group-hover:opacity-100 blur-2xl transition duration-700
        "
      />

      {/* Hiệu ứng ánh sáng mờ */}
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-cyan-500/20 blur-[80px] group-hover:opacity-80 opacity-0 transition-all duration-700" />

      <div className="relative z-10 flex flex-col justify-between p-6 h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div
              className="
                w-12 h-12 flex items-center justify-center rounded-xl text-2xl
                bg-gradient-to-tr from-cyan-500/15 to-teal-600/10
                shadow-inner group-hover:scale-110 transition-transform duration-300
              "
            >
              {getIcon(drug.category)}
            </div>
            <div className="max-w-[200px]">
              <h3 className="text-gray-800 font-semibold text-lg leading-tight truncate group-hover:text-cyan-600 transition-colors duration-300">
                {drug.tradeName || drug.genericName || "Tên thuốc không xác định"}
              </h3>
              <p className="text-slate-500 text-sm truncate">
                {drug.atcCode || "ATC Code không có"}
              </p>
            </div>
          </div>

          {/* Dot trạng thái */}
          <span
            className={`w-3 h-3 rounded-full border border-white shadow-inner 
              ${getStatusColor(drug.status)} 
              ${
                drug.status === "active"
                  ? "animate-pulse ring-2 ring-green-300/40"
                  : ""
              }`}
            title={drug.status}
          />
        </div>

        {/* Thông tin thuốc */}
        <div className="space-y-2 text-sm flex-grow">
          {[
            ["Nhà sản xuất", drug.manufacturerName || drug.manufacturer],
            ["Đường dùng", drug.route],
            ["Dạng bào chế", drug.dosageForm],
            ["Hàm lượng", drug.strength],
          ].map(
            ([label, value]) =>
              value && (
                <div
                  key={label}
                  className="flex justify-between border-b border-slate-100 pb-1 text-slate-600 text-sm"
                >
                  <span>{label}:</span>
                  <span className="font-medium text-slate-800 max-w-[60%] truncate text-right">
                    {value}
                  </span>
                </div>
              )
          )}

          <div className="flex justify-between text-sm mt-1">
            <span className="text-slate-500">Cảnh báo:</span>
            <span className="font-medium text-slate-800 max-w-[60%] truncate text-right">
              {drug.warnings || "Không có"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between items-end">
          <div className="text-xs text-slate-400 flex flex-col leading-tight">
            <span>📅 {formatDate(drug.createdAt)}</span>
            {drug.updatedAt && (
              <span className="text-slate-400">🔄 {formatDate(drug.updatedAt)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManufactorDrugCard;

