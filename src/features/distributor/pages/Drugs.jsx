import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { Card } from "../../shared/components/ui/cardUI";
import { Search } from "../../shared/components/ui/search";
import { useDrugs } from "../hooks/useDrugs";
import { getDistributorNavigationItems } from "../components/distributorNavigation";

export default function Drugs() {
  const {
    drugs,
    allDrugs,
    loading,
    searchAtc,
    setSearchAtc,
    loadingProgress,
    handleSearch,
    handleClearSearch,
  } = useDrugs();
  const safeDrugs = Array.isArray(drugs) ? drugs : [];
  const navigationItems = getDistributorNavigationItems();

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
