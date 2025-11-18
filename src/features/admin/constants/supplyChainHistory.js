export const supplyChainHistory = {
  statusMeta: {
    produced: {
      label: "Đã sản xuất",
      badgeClass: "bg-blue-100 text-blue-700 border border-blue-200",
    },
    in_transit: {
      label: "Đang vận chuyển",
      badgeClass: "bg-amber-100 text-amber-700 border border-amber-200",
    },
    completed: {
      label: "Hoàn tất",
      badgeClass: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    },
    default: {
      label: "Chưa xác định",
      badgeClass: "bg-slate-100 text-slate-600 border border-slate-200",
    },
  },

  stageMeta: {
    production: {
      label: "Sản xuất",
      icon: "🏭",
      color: "bg-blue-100 text-blue-700 border-blue-200",
    },
    transfer_to_distributor: {
      label: "Chuyển cho NPP",
      icon: "🚚",
      color: "bg-cyan-100 text-cyan-700 border-cyan-200",
    },
    transfer_to_pharmacy: {
      label: "Chuyển cho Nhà thuốc",
      icon: "🏥",
      color: "bg-purple-100 text-purple-700 border-purple-200",
    },
    default: {
      label: "Khác",
      icon: "📦",
      color: "bg-slate-100 text-slate-600 border-slate-200",
    },
  },
};
