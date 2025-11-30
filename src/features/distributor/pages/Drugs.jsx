import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { CardUI } from "../../shared/components/ui/cardUI";
import { Search } from "../../shared/components/ui/search";
import { useDrugs } from "../hooks/useDrugs";
import { navigationItems } from "../constants/navigationItems";

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
  const navigate = useNavigate();
  const safeDrugs = Array.isArray(drugs) ? drugs : [];

  const getStatusBadge = (status) => {
    const configs = {
      active: "bg-emerald-50 text-emerald-700 border-emerald-200",
      inactive: "bg-rose-50 text-rose-700 border-rose-200",
      recalled: "bg-gray-50 text-gray-700 border-gray-200",
    };
    const labels = {
      active: "Hoạt động",
      inactive: "Ngừng HĐ",
      recalled: "Thu hồi",
    };
    return (
      <span
        className={`px-2 py-0.5 text-xs font-medium rounded border ${
          configs[status] || "bg-gray-50 text-gray-600 border-gray-200"
        }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const handleViewDetail = (drugId) => {
    navigate(`/distributor/drugs/${drugId}`);
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
      ) : (
        <div className="space-y-6">
          <CardUI
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
                  const drug = item.drug || item;
                  return (
                    drug.tradeName || drug.genericName || drug.atcCode || ""
                  );
                }}
                matchFunction={(item, searchLower) => {
                  const drug = item.drug || item;
                  const tradeName = (drug.tradeName || "").toLowerCase();
                  const genericName = (drug.genericName || "").toLowerCase();
                  const atcCode = (drug.atcCode || "").toLowerCase();
                  return (
                    tradeName.includes(searchLower) ||
                    genericName.includes(searchLower) ||
                    atcCode.includes(searchLower)
                  );
                }}
                getDisplayText={(item) => {
                  const drug = item.drug || item;
                  return (
                    drug.tradeName || drug.genericName || drug.atcCode || ""
                  );
                }}
                enableAutoSearch={false}
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {safeDrugs.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                Không có dữ liệu thuốc
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Tên thuốc
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Mã ATC
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Nhà sản xuất
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {safeDrugs.map((item, index) => {
                    const drug = item.drug || item;
                    const drugId = drug._id || index;

                    return (
                      <tr
                        key={drugId}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">
                            {drug.tradeName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {drug.genericName}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <code className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {drug.atcCode}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {drug.manufacturer?.name || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(drug.status)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <td className="px-3 sm:px-6 py-4">
                            <Link
                              to={`/distributor/drugs/${drugId}`}
                              className="inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 border-2 border-primary rounded-full font-semibold text-primary hover:text-white hover:bg-primary transition-all duration-200 text-xs sm:text-sm"
                            >
                              Chi tiết
                            </Link>
                          </td>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
