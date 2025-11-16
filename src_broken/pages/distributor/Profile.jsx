import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import TruckLoader from "../../components/TruckLoader";
import { useAuth } from "../../context/AuthContext";
import { useDistributorGetProfile } from "../../hooks/react-query/distributor/use.distributor";
import { Profile as ProfileComponent } from "../../components/ui/profile";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const { mutateAsync: fetchProfile } = useDistributorGetProfile();

  const navigationItems = [
    {
      path: "/distributor",
      label: "Tổng quan",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/invoices",
      label: "Đơn từ nhà SX",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/transfer-pharmacy",
      label: "Chuyển cho NT",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/distribution-history",
      label: "Lịch sử phân phối",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/transfer-history",
      label: "Lịch sử chuyển NT",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/drugs",
      label: "Quản lý thuốc",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/nft-tracking",
      label: "Tra cứu NFT",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      active: false,
    },
    {
      path: "/distributor/profile",
      label: "Hồ sơ",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      active: true,
    },
  ];

  useEffect(() => {
    loadProfile();

    return () => {
      // Cleanup progress interval nếu có
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);

      // Clear interval cũ nếu có
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      // Simulate progress từ 0 đến 90% trong khi đang load
      progressIntervalRef.current = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev < 0.9) {
            return Math.min(prev + 0.02, 0.9);
          }
          return prev;
        });
      }, 50);

      const response = await fetchProfile();

      // Clear interval khi có response
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      // Xử lý data trước
      if (response.data.success) {
        setProfile(response.data.data);
      }

      let currentProgress = 0;
      setLoadingProgress((prev) => {
        currentProgress = prev;
        return prev;
      });

      if (currentProgress < 0.9) {
        await new Promise((resolve) => {
          const speedUpInterval = setInterval(() => {
            setLoadingProgress((prev) => {
              if (prev < 1) {
                const newProgress = Math.min(prev + 0.15, 1);
                if (newProgress >= 1) {
                  clearInterval(speedUpInterval);
                  resolve();
                }
                return newProgress;
              }
              clearInterval(speedUpInterval);
              resolve();
              return 1;
            });
          }, 30);

          setTimeout(() => {
            clearInterval(speedUpInterval);
            setLoadingProgress(1);
            resolve();
          }, 500);
        });
      } else {
        setLoadingProgress(1);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      console.error("Lỗi khi tải thông tin:", error);
      setLoadingProgress(0);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setLoadingProgress(0);
      }, 500);
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
          <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-5 mb-6">
            <h1 className="text-xl font-semibold text-[#007b91]">
              Thông tin cá nhân
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Xem thông tin tài khoản và công ty (chỉ đọc)
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-cyan-200 p-10 text-center text-red-600">
            Không thể tải thông tin
          </div>
        </div>
      ) : (
        <ProfileComponent
          title="Thông tin cá nhân"
          subtitle="Xem thông tin tài khoản và công ty (chỉ đọc)"
          user={profile.user}
          company={profile.company}
          roleLabel="Distributor (Nhà phân phối)"
        />
      )}
    </DashboardLayout>
  );
}
