export const useManufactorDrugCard = () => {
  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("vi-VN") : "N/A";

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

  return {
    formatDate,
    getStatusColor,
    getIcon,
  };
};
