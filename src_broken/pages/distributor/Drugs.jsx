import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "../../components/DashboardLayout";
import TruckLoader from "../../components/TruckLoader";
import { useDistributorGetDrugs } from "../../hooks/react-query/distributor/use.distributor";
import { Card } from "../../components/ui/card";
import { Search } from "../../components/ui/search";

export default function Drugs() {
  const queryClient = useQueryClient();
  const DRUGS_CACHE_KEY = ["distributor", "drugs", "list"];
  const [drugs, setDrugs] = useState([]);
  const [allDrugs, setAllDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchAtc, setSearchAtc] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const { mutateAsync: fetchDrugs } = useDistributorGetDrugs();

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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
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
      active: true,
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
      active: false,
    },
  ];

  useEffect(() => {
    const cached = queryClient.getQueryData(DRUGS_CACHE_KEY);
    if (cached?.drugs?.length) {
      setDrugs(cached.drugs);
      setAllDrugs(cached.drugs);
      setLoading(false);
      setLoadingProgress(0);
    }
    loadDrugs(!cached?.drugs?.length);
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

  const loadDrugs = async (showLoader = allDrugs.length === 0) => {
    const shouldShowLoader = showLoader;
    try {
      if (shouldShowLoader) {
        setLoading(true);
        startProgress();
      }
      const response = await fetchDrugs();
      if (response.data.success && response.data.data) {
        const list = Array.isArray(response.data.data.drugs)
          ? response.data.data.drugs
          : [];
        setDrugs(list);
        setAllDrugs(list);
        queryClient.setQueryData(DRUGS_CACHE_KEY, { drugs: list });
      } else {
        setDrugs([]);
        setAllDrugs([]);
      }
      if (shouldShowLoader) {
        await finishProgress();
      }
    } catch (error) {
      if (shouldShowLoader && progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      console.error("Lỗi khi tải danh sách thuốc:", error);
      setDrugs([]);
      setAllDrugs([]);
      if (shouldShowLoader) {
        setLoadingProgress(0);
      }
    } finally {
      if (shouldShowLoader) {
        setLoading(false);
        setTimeout(() => setLoadingProgress(0), 500);
      }
    }
  };

  const handleSearch = (searchValue = null) => {
    const term = (searchValue !== null ? searchValue : searchAtc)
      .trim()
      .toLowerCase();
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

  const handleClearSearch = () => {
    setSearchAtc("");
    setDrugs(allDrugs);
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
          <Card
            title="Quản lý thuốc"
            subtitle="Quản lý toàn bộ thuốc trong hệ thống"
            icon={
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
            }
          />

          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Search
                searchInput={searchAtc}
                setSearchInput={setSearchAtc}
                handleSearch={handleSearch}
                handleClearSearch={handleClearSearch}
                placeholder="Tìm theo tên thương mại, tên hoạt chất, mã ATC..."
                data={allDrugs}
                getSearchText={(item) => {
                  const tradeName = item.tradeName || "";
                  const genericName = item.genericName || "";
                  const atcCode = item.atcCode || "";
                  return tradeName || genericName || atcCode;
                }}
                matchFunction={(item, searchLower) => {
                  const tradeName = (item.tradeName || "").toLowerCase();
                  const genericName = (item.genericName || "").toLowerCase();
                  const atcCode = (item.atcCode || "").toLowerCase();
                  return (
                    tradeName.includes(searchLower) ||
                    genericName.includes(searchLower) ||
                    atcCode.includes(searchLower)
                  );
                }}
                getDisplayText={(item, searchLower) => {
                  const tradeName = (item.tradeName || "").toLowerCase();
                  const genericName = (item.genericName || "").toLowerCase();
                  const atcCode = (item.atcCode || "").toLowerCase();
                  if (tradeName.includes(searchLower)) {
                    return item.tradeName || "";
                  }
                  if (genericName.includes(searchLower)) {
                    return item.genericName || "";
                  }
                  if (atcCode.includes(searchLower)) {
                    return item.atcCode || "";
                  }
                  return (
                    item.tradeName || item.genericName || item.atcCode || ""
                  );
                }}
                enableAutoSearch={false}
              />
            </div>

            {/* <button
              onClick={() => {
                setSearchAtc("");
                loadDrugs();
              }}
              className="px-4 py-2.5 rounded-full border border-gray-300 text-slate-700 hover:bg-gray-50 transition"
            >
              ↻ Reset
            </button> */}
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
