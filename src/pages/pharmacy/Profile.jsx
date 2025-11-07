import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import TruckLoader from "../../components/TruckLoader";
import pharmacyService from "../../services/pharmacy/pharmacyService";

export default function PharmacyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);

  const navigationItems = [
    { path: "/pharmacy", label: "Tổng quan", active: false },
    { path: "/pharmacy/invoices", label: "Đơn từ NPP", active: false },
    {
      path: "/pharmacy/distribution-history",
      label: "Lịch sử phân phối",
      active: false,
    },
    { path: "/pharmacy/drugs", label: "Quản lý thuốc", active: false },
    { path: "/pharmacy/nft-tracking", label: "Tra cứu NFT", active: false },
    { path: "/pharmacy/profile", label: "Hồ sơ", active: true },
  ];

  useEffect(() => {
    loadProfile();

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      progressIntervalRef.current = setInterval(() => {
        setLoadingProgress((prev) => Math.min(prev + 0.02, 0.9));
      }, 50);

      const response = await pharmacyService.getProfile();

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      if (response.data.success) {
        setProfile(response.data.data);
      }

      setLoadingProgress(1);
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      console.error("Lỗi khi tải thông tin:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setLoadingProgress(0), 500);
    }
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={loadingProgress} showTrack />
          </div>
          <div className="text-lg text-slate-600 mt-6">Đang tải dữ liệu...</div>
        </div>
      ) : !profile ? (
        <div className="space-y-6">
          {/* Banner */}
          <div className="bg-white rounded-xl border border-card-primary shadow-sm p-5">
            <h1 className="text-xl font-semibold text-[#007b91] flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7h18M5 10h14M4 14h16M6 18h12"
                />
              </svg>
              Thông tin cá nhân
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Xem thông tin tài khoản và nhà thuốc (chỉ đọc)
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-card-primary p-10 text-center text-red-600">
            Không thể tải thông tin
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Banner */}
          <div className="bg-white rounded-xl border border-card-primary shadow-sm p-5">
            <h1 className="text-xl font-semibold text-[#007b91] flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7h18M5 10h14M4 14h16M6 18h12"
                />
              </svg>
              Thông tin cá nhân
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Xem thông tin tài khoản và nhà thuốc (chỉ đọc)
            </p>
          </div>

          <div className="space-y-5">
            {/* User Info */}
            <div className="bg-white rounded-2xl border border-cyan-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-linear-to-r from-secondary to-primary">
                <h2 className="text-xl font-bold text-white">
                  Thông tin tài khoản
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">
                      Tên đầy đủ
                    </div>
                    <div className="font-semibold text-slate-800">
                      {profile.fullName || "N/A"}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">Email</div>
                    <div className="font-semibold text-slate-800">
                      {profile.email || "N/A"}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">Vai trò</div>
                    <div className="font-semibold text-slate-800">
                      <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm">
                        Pharmacy (Nhà thuốc)
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">
                      Trạng thái
                    </div>
                    <div className="font-semibold text-slate-800">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          profile.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {profile.status || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                  <div className="text-xs text-cyan-700 mb-1">
                    Wallet Address
                  </div>
                  <div className="font-mono text-sm text-cyan-800 break-all">
                    {profile.walletAddress || "Chưa có"}
                  </div>
                </div>
              </div>
            </div>

            {/* Pharmacy Info */}
            {profile.pharmacy && (
              <div className="bg-white rounded-2xl border border-cyan-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-linear-to-r from-secondary to-primary">
                  <h2 className="text-xl font-bold text-white">
                    Thông tin nhà thuốc
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                      <div className="text-xs text-cyan-700 mb-1">
                        Tên nhà thuốc
                      </div>
                      <div className="font-bold text-cyan-900 text-lg">
                        {profile.pharmacy.name || "N/A"}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="text-xs text-slate-500 mb-1">
                        Mã số thuế
                      </div>
                      <div className="font-mono font-semibold text-slate-800">
                        {profile.pharmacy.taxCode || "N/A"}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="text-xs text-slate-500 mb-1">
                        Giấy phép kinh doanh
                      </div>
                      <div className="font-mono font-semibold text-slate-800">
                        {profile.pharmacy.licenseNo || "N/A"}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="text-xs text-slate-500 mb-1">
                        Trạng thái
                      </div>
                      <div className="font-semibold text-slate-800">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            profile.pharmacy.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {profile.pharmacy.status || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1">Địa chỉ</div>
                    <div className="font-medium text-slate-800">
                      {profile.pharmacy.address || "N/A"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="text-xs text-slate-500 mb-1">
                        Số điện thoại
                      </div>
                      <div className="font-medium text-slate-800">
                        {profile.pharmacy.contactPhone || "N/A"}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="text-xs text-slate-500 mb-1">
                        Email liên hệ
                      </div>
                      <div className="font-medium text-slate-800">
                        {profile.pharmacy.contactEmail || "N/A"}
                      </div>
                    </div>
                  </div>

                  {profile.pharmacy.walletAddress && (
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                      <div className="text-xs text-emerald-700 mb-1">
                        Wallet Address
                      </div>
                      <div className="font-mono text-sm text-emerald-800 break-all">
                        {profile.pharmacy.walletAddress}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notice */}
            <div className="bg-yellow-50 rounded-2xl border border-yellow-200 p-5">
              <div className="font-semibold text-yellow-800 mb-1">
                Lưu ý quan trọng
              </div>
              <div className="text-sm text-yellow-700">
                Thông tin này chỉ được xem và{" "}
                <strong>không thể chỉnh sửa</strong>. Nếu cần thay đổi thông tin
                nhà thuốc, vui lòng liên hệ với quản trị viên hệ thống.
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
