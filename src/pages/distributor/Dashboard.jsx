import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { getDistributions } from "../../services/distributor/proofService";

export default function DistributorDashboard() {
  const [stats, setStats] = useState({
    totalDistributions: 0,
    confirmedDistributions: 0,
    pendingDistributions: 0,
    totalQuantity: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await getDistributions();
        if (response.success) {
          const data = response.data;
          setStats({
            totalDistributions: data.totalDistributions || 0,
            confirmedDistributions:
              data.statusBreakdown?.find((s) => s._id === "confirmed")?.count ||
              0,
            pendingDistributions:
              data.statusBreakdown?.find((s) => s._id === "pending")?.count || 0,
            totalQuantity: data.totalQuantity || 0,
          });
        }
      } catch (error) {
        console.error("Error loading distributor stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const metrics = [
    {
      title: "Tổng phân phối",
      value: loading ? "..." : stats.totalDistributions,
      subtitle: "Đã tạo",
      detail: `Đã xác nhận: ${stats.confirmedDistributions}`,
      color: "cyan",
    },
    {
      title: "Chờ xử lý",
      value: loading ? "..." : stats.pendingDistributions,
      subtitle: "Lô hàng",
      detail: "Cần xác nhận",
      color: "orange",
    },
    {
      title: "Đã xác nhận",
      value: loading ? "..." : stats.confirmedDistributions,
      subtitle: "Lô hàng",
      detail: "Hoàn tất",
      color: "green",
    },
    {
      title: "Tổng số lượng",
      value: loading ? "..." : stats.totalQuantity,
      subtitle: "Sản phẩm",
      detail: "Đã phân phối",
      color: "blue",
    },
  ];

  const navigationItems = [
    {
      path: "/distributor",
      label: "Trang chủ",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l9-9 9 9M4 10v10h16V10"
          />
        </svg>
      ),
      active: true,
    },
    {
      path: "/distributor/distributions",
      label: "Proof of Distribution",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      path: "/distributor/nft-tracking",
      label: "Theo dõi vận chuyển",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4l3 3m-9 6h12a2 2 0 002-2V5a2 2 0 00-2-2H9.828a2 2 0 00-1.414.586L4 8v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      path: "/distributor/create-proof",
      label: "Tạo minh chứng giao",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      path: "/distributor/invoices",
      label: "Hóa đơn",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6M5 4h14a2 2 0 012 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 012-2z"
          />
        </svg>
      ),
    },
    {
      path: "/distributor/stats",
      label: "Thống kê",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h10M4 14h6m-2 4h12" />
        </svg>
      ),
    },
  ];

  return (
    <DashboardLayout metrics={metrics} navigationItems={navigationItems}>
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-bold mb-6 text-gray-800">
          Quản lý phân phối
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-xl hover:shadow-md transition-all">
            <h3 className="font-semibold mb-2 text-gray-800">
              Proof of Distribution
            </h3>
            <p className="text-sm text-gray-600">
              Nhận và chuyển giao lô hàng từ nhà sản xuất đến nhà thuốc.
            </p>
          </div>

          <div className="p-4 border rounded-xl hover:shadow-md transition-all">
            <h3 className="font-semibold mb-2 text-gray-800">
              Theo dõi vận chuyển
            </h3>
            <p className="text-sm text-gray-600">
              Cập nhật trạng thái và tracking lô hàng trong quá trình vận
              chuyển.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
