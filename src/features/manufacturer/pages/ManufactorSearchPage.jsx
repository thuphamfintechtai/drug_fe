import React from "react";
import DashboardLayout from "../../shared/components/DashboardLayout";
import { getManufacturerNavigationItems } from "../components/manufacturerNavigation";
import { useManufactorSearchPage } from "../hooks/useManufactorSearchPage";

const ManufactorSearchPage = () => {
  const navigationItems = getManufacturerNavigationItems();
  const {
    keyword,
    setKeyword,
    results,
    loading,
    error,
    hasSearched,
    handleSearch,
    handleKeyPress,
  } = useManufactorSearchPage();

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🔍</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Tìm kiếm Manufacturer
              </h1>
              <p className="text-sm text-gray-500">
                Tra cứu thông tin nhà sản xuất
              </p>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl p-4 border border-cyan-200">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Nhập tên nhà sản xuất để tìm kiếm..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 border-2 border-cyan-300 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 !text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>Đang tìm...</span>
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    <span>Tìm kiếm</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Results Count */}
          {hasSearched && !loading && (
            <div className="mt-4 p-4 bg-cyan-50 border border-cyan-200 rounded-xl">
              <p className="text-gray-800 font-semibold">
                Tìm thấy{" "}
                <span className="text-cyan-600 text-lg">{results.length}</span>{" "}
                nhà sản xuất
                {keyword && (
                  <span className="text-gray-600 ml-2">
                    với từ khóa: &quot;{keyword}&quot;
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Loading State */}
            {loading ? (
              <div className="p-12 flex flex-col items-center">
                <div className="h-10 w-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Đang tìm kiếm...</p>
              </div>
            ) : !hasSearched ? (
              /* Initial State */
              <div className="p-12 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-5xl">🔍</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Bắt đầu tìm kiếm
                </h3>
                <p className="text-gray-600">
                  Nhập tên nhà sản xuất để tìm kiếm
                </p>
              </div>
            ) : results.length === 0 ? (
              /* Empty State */
              <div className="p-12 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-5xl">❌</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Không tìm thấy
                </h3>
                <p className="text-gray-600">
                  Không có nhà sản xuất nào với từ khóa &quot;{keyword}&quot;
                </p>
              </div>
            ) : (
              /* Table with Results */
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-cyan-600 to-teal-600">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold !text-white uppercase">
                        Tên nhà sản xuất
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold !text-white uppercase">
                        Email liên hệ
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold !text-white uppercase">
                        Quốc gia
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {results.map((m, index) => (
                      <tr
                        key={m._id}
                        className="hover:bg-gradient-to-r hover:from-cyan-50 hover:to-teal-50 transition-all duration-200 group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                              <span className="text-xl">🏭</span>
                            </div>
                            <span className="font-semibold text-gray-800 group-hover:text-cyan-700">
                              {m.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-700">
                            {m.contactEmail}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-800">
                            {m.country}
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
      </div>
    </DashboardLayout>
  );
};

export default ManufactorSearchPage;
