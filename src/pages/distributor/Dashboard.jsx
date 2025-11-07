import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import TruckLoader from "../../components/TruckLoader";
import { getStatistics } from "../../services/distributor/distributorService";

export default function DistributorDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    loadStats();

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // FIX: Simplified loading logic
  const loadStats = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      progressIntervalRef.current = setInterval(() => {
        setLoadingProgress((prev) => Math.min(prev + 0.02, 0.9));
      }, 50);

      const response = await getStatistics();

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      if (response.data.success) {
        setStats(response.data.data);
      }

      setLoadingProgress(1);
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      console.error("Lỗi khi tải thống kê:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setLoadingProgress(0), 500);
    }
  };

  const navigationItems = [
    {
      path: "/distributor",
      label: "Tổng quan",
      icon: null,
      active: true,
    },
    {
      path: "/distributor/invoices",
      label: "Đơn từ nhà SX",
      icon: null,
      active: false,
    },
    {
      path: "/distributor/transfer-pharmacy",
      label: "Chuyển cho NT",
      icon: null,
      active: false,
    },
    {
      path: "/distributor/distribution-history",
      label: "Lịch sử phân phối",
      icon: null,
      active: false,
    },
    {
      path: "/distributor/transfer-history",
      label: "Lịch sử chuyển NT",
      icon: null,
      active: false,
    },
    {
      path: "/distributor/drugs",
      label: "Quản lý thuốc",
      icon: null,
      active: false,
    },
    {
      path: "/distributor/nft-tracking",
      label: "Tra cứu NFT",
      icon: null,
      active: false,
    },
    {
      path: "/distributor/profile",
      label: "Hồ sơ",
      icon: null,
      active: false,
    },
  ];

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={loadingProgress} showTrack />
          </div>
          <div className="text-lg text-slate-600 mt-6">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Banner */}
          <div className="bg-white rounded-xl border border-secondary border-b-4 shadow-sm p-5">
            <h1 className="text-xl font-semibold text-[#007b91]">
              Quản lý nhà phân phối
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Tổng quan hệ thống và các chức năng chính
            </p>
          </div>

          {/* Statistics Cards - Invoices from Manufacturer */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/distributor/invoices"
              className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
            >
              <div className="absolute top-0 left-0 w-full h-[5px] bg-linear-to-r from-sky-400 to-cyan-400 rounded-t-2xl" />
              <div className="p-5 pt-7 text-center">
                <div className="text-sm text-slate-600 mb-1">Tổng đơn nhận</div>
                <div className="text-3xl font-bold text-sky-600">
                  {stats?.invoices?.total || 0}
                </div>
              </div>
            </Link>

            <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[5px] bg-linear-to-r from-amber-400 to-yellow-400 rounded-t-2xl" />
              <div className="p-5 pt-7 text-center">
                <div className="text-sm text-slate-600 mb-1">Chờ nhận</div>
                <div className="text-3xl font-bold text-amber-600">
                  {stats?.invoices?.byStatus.pending || 0}
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[5px] bg-linear-to-r from-emerald-400 to-green-400 rounded-t-2xl" />
              <div className="p-5 pt-7 text-center">
                <div className="text-sm text-slate-600 mb-1">Đã nhận</div>
                <div className="text-3xl font-bold text-emerald-600">
                  {stats?.invoices?.byStatus.sent || 0}
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[5px] bg-linear-to-r from-rose-400 to-red-400 rounded-t-2xl" />
              <div className="p-5 pt-7 text-center">
                <div className="text-sm text-slate-600 mb-1">Đã thanh toán</div>
                <div className="text-3xl font-bold text-rose-600">
                  {stats?.invoices?.byStatus.paid || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Distribution & NFT Statistics */}
          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Phân phối & NFT
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link
                to="/distributor/distribution-history"
                className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
              >
                <div className="absolute top-0 left-0 w-full h-[5px] bg-linear-to-r from-fuchsia-400 to-purple-400 rounded-t-2xl" />
                <div className="p-5 pt-7 text-center">
                  <div className="text-sm text-slate-600 mb-1">
                    Tổng phân phối
                  </div>
                  <div className="text-3xl font-bold text-fuchsia-600">
                    {stats?.distributions?.total || 0}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    Lượt phân phối
                  </div>
                </div>
              </Link>

              <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[5px] bg-linear-to-r from-cyan-400 to-sky-400 rounded-t-2xl" />
                <div className="p-5 pt-7 text-center">
                  <div className="text-sm text-slate-600 mb-1">Tổng NFT</div>
                  <div className="text-3xl font-bold text-cyan-600">
                    {stats?.nfts?.total || 0}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    Token đang giữ
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pharmacy Transfers Statistics */}
          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Chuyển giao cho nhà thuốc
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link
                to="/distributor/transfer-history"
                className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-transform hover:scale-[1.02]"
              >
                <div className="absolute top-0 left-0 w-full h-[5px] bg-linear-to-r from-amber-400 to-orange-400 rounded-t-2xl" />
                <div className="p-5 pt-7 text-center">
                  <div className="text-sm text-slate-600 mb-1">
                    Tổng chuyển NT
                  </div>
                  <div className="text-3xl font-bold text-orange-600">
                    {stats?.transfersToPharmacy?.total || 0}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">Lượt chuyển</div>
                </div>
              </Link>

              <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[5px] bg-linear-to-r from-amber-400 to-yellow-400 rounded-t-2xl" />
                <div className="p-5 pt-7 text-center">
                  <div className="text-sm text-slate-600 mb-1">Đang chờ</div>
                  <div className="text-3xl font-bold text-amber-600">
                    {stats?.transfersToPharmacy?.byStatus.draft || 0}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">Pending</div>
                </div>
              </div>

              <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[5px] bg-linear-to-r from-sky-400 to-cyan-400 rounded-t-2xl" />
                <div className="p-5 pt-7 text-center">
                  <div className="text-sm text-slate-600 mb-1">Đã gửi</div>
                  <div className="text-3xl font-bold text-cyan-600">
                    {stats?.transfersToPharmacy?.byStatus.sent || 0}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">Sent</div>
                </div>
              </div>

              <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[5px] bg-linear-to-r from-emerald-400 to-green-400 rounded-t-2xl" />
                <div className="p-5 pt-7 text-center">
                  <div className="text-sm text-slate-600 mb-1">
                    Đã thanh toán
                  </div>
                  <div className="text-3xl font-bold text-emerald-600">
                    {stats?.transfersToPharmacy?.byStatus.paid || 0}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">Paid</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className=" rounded-2xl border border-secondary p-6">
            <h3 className="text-lg font-semibold text-cyan-800 mb-4">
              Hành động nhanh
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link
                to="/distributor/invoices"
                className="p-4 bg-white rounded-xl border border-secondary hover:border-primary hover:shadow-md transition text-center"
              >
                <div className="text-sm font-text-primary">Xem đơn hàng</div>
              </Link>
              <Link
                to="/distributor/transfer-pharmacy"
                className="p-4 bg-white rounded-xl border border-secondary hover:border-primary hover:shadow-md transition text-center"
              >
                <div className="text-sm font-text-primary">
                  Chuyển cho nhà thuốc
                </div>
              </Link>
              <Link
                to="/distributor/nft-tracking"
                className="p-4 bg-white rounded-xl border border-secondary font hover:border-primary hover:shadow-md transition text-center"
              >
                <div className="text-sm font-text-primary">Tra cứu NFT</div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
