import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import TruckLoader from "../../components/TruckLoader";
import pharmacyService from "../../services/pharmacy/pharmacyService";

export default function Drugs() {
  const [drugs, setDrugs] = useState([]);
  const [allDrugs, setAllDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchAtc, setSearchAtc] = useState("");
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
    { path: "/pharmacy/drugs", label: "Quản lý thuốc", active: true },
    { path: "/pharmacy/nft-tracking", label: "Tra cứu NFT", active: false },
    { path: "/pharmacy/profile", label: "Hồ sơ", active: false },
  ];

  useEffect(() => {
    loadDrugs();
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, []);

  const startProgress = () => {
    setLoadingProgress(0);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    progressIntervalRef.current = setInterval(() => {
      setLoadingProgress((prev) =>
        prev < 0.9 ? Math.min(prev + 0.02, 0.9) : prev
      );
    }, 50);
  };

  const finishProgress = async () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    let current = 0;
    setLoadingProgress((prev) => {
      current = prev;
      return prev;
    });
    if (current < 0.9) {
      await new Promise((resolve) => {
        const speedUp = setInterval(() => {
          setLoadingProgress((prev) => {
            if (prev < 1) {
              const np = Math.min(prev + 0.15, 1);
              if (np >= 1) {
                clearInterval(speedUp);
                resolve();
              }
              return np;
            }
            clearInterval(speedUp);
            resolve();
            return 1;
          });
        }, 30);
        setTimeout(() => {
          clearInterval(speedUp);
          setLoadingProgress(1);
          resolve();
        }, 500);
      });
    } else {
      setLoadingProgress(1);
      await new Promise((r) => setTimeout(r, 200));
    }
    await new Promise((r) => setTimeout(r, 100));
  };

  const loadDrugs = async () => {
    try {
      setLoading(true);
      startProgress();
      const response = await pharmacyService.getDrugs();
      if (response.data.success && response.data.data) {
        const list = Array.isArray(response.data.data.drugs)
          ? response.data.data.drugs
          : [];
        setDrugs(list);
        setAllDrugs(list);
      } else {
        setDrugs([]);
        setAllDrugs([]);
      }
      await finishProgress();
    } catch (error) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      console.error("Lỗi khi tải danh sách thuốc:", error);
      setDrugs([]);
      setAllDrugs([]);
      setLoadingProgress(0);
    } finally {
      setLoading(false);
      setTimeout(() => setLoadingProgress(0), 500);
    }
  };

  const handleSearch = () => {
    const term = searchAtc.trim().toLowerCase();
    if (!term) {
      setDrugs(allDrugs);
      return;
    }
    // Lọc client theo Tên thương mại | Tên hoạt chất | Mã ATC
    const filtered = (allDrugs || []).filter((d) => {
      const trade = (d.tradeName || "").toLowerCase();
      const generic = (d.genericName || "").toLowerCase();
      const atc = (d.atcCode || "").toLowerCase();
      return (
        trade.includes(term) || generic.includes(term) || atc.includes(term)
      );
    });
    setDrugs(filtered);
  };

  const safeDrugs = Array.isArray(drugs) ? drugs : [];

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
          <div className="bg-white rounded-2xl border border-card-primary shadow-sm p-6">
            <h1 className="text-xl md:text-2xl font-semibold text-[#007b91] flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-[#00a3c4]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
              Quản lý thuốc
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Xem thông tin thuốc và tìm kiếm theo tên thương mại, tên hoạt
              chất, mã ATC
            </p>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
                  />
                </svg>
              </span>

              <input
                type="text"
                value={searchAtc}
                onChange={(e) => setSearchAtc(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Tìm theo tên thương mại, tên hoạt chất, mã ATC..."
                className="w-full h-12 pl-11 pr-32 rounded-full border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
              />

              <button
                onClick={handleSearch}
                className="absolute right-1 top-1 bottom-1 px-6 rounded-full bg-secondary hover:bg-primary !text-white font-medium transition"
              >
                Tìm kiếm
              </button>
            </div>

            <button
              onClick={() => {
                setSearchAtc("");
                loadDrugs();
              }}
              className="px-4 py-2.5 rounded-full border border-gray-300 text-slate-700 hover:bg-gray-50 transition"
            >
              Reset
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-card-primary shadow-sm overflow-hidden">
            {safeDrugs.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 mb-3 opacity-60"
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
                <p className="text-gray-500 text-sm">Không có dữ liệu</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Tên thương mại
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Tên hoạt chất
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Mã ATC
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Dạng bào chế
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Hàm lượng
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {safeDrugs.map((drug, index) => (
                      <tr
                        key={drug._id || index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-gray-800">
                          {drug.tradeName}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {drug.genericName}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100">
                            {drug.atcCode}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {drug.dosageForm}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {drug.strength}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              drug.status === "active"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-rose-50 text-rose-600 border border-rose-100"
                            }`}
                          >
                            {drug.status === "active"
                              ? "Hoạt động"
                              : "Không hoạt động"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
