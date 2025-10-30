import React, { useState } from "react";

const ManufactorSearchPage = () => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Mock data
  const mockManufacturers = [
    { _id: '1', name: 'BIDIPHAR', contactEmail: 'contact@bidiphar.com', country: 'Việt Nam' },
    { _id: '2', name: 'Traphaco', contactEmail: 'info@traphaco.com', country: 'Việt Nam' },
    { _id: '3', name: 'Imexpharm', contactEmail: 'sales@imexpharm.com', country: 'Việt Nam' },
    { _id: '4', name: 'Pharmedic', contactEmail: 'contact@pharmedic.vn', country: 'Việt Nam' },
    { _id: '5', name: 'Hậu Giang Pharma', contactEmail: 'info@hgp.com.vn', country: 'Việt Nam' }
  ];

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError('Vui lòng nhập từ khóa tìm kiếm');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      // TODO: Replace with actual API call
      // const res = await getManufactorsByName(keyword);
      // if (res.success) {
      //   setResults(res.data.manufactors || []);
      // } else {
      //   setError('Không thể tìm kiếm nhà sản xuất');
      //   setResults([]);
      // }
      
      // Using mock data for now - filter by keyword
      setTimeout(() => {
        const filteredResults = mockManufacturers.filter(m => 
          m.name.toLowerCase().includes(keyword.toLowerCase()) ||
          m.contactEmail.toLowerCase().includes(keyword.toLowerCase())
        );
        setResults(filteredResults);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError('Lỗi khi tìm kiếm');
      setResults([]);
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-cyan-100 p-6">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-white opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <i className="fas fa-search text-white text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">🔍 Tra cứu nhà sản xuất</h1>
                <p className="text-cyan-100 text-base mt-1">Tìm kiếm và xem thông tin nhà sản xuất</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mt-6">
          {/* Search Section */}
          <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-2xl p-6 border border-cyan-200">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-600"></i>
                <input
                  type="text"
                  placeholder="Nhập tên nhà sản xuất để tìm kiếm..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-4 border-2 border-cyan-300 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all text-gray-700"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>Đang tìm...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-search"></i>
                    <span>Tìm kiếm</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
              <div className="flex items-center">
                <i className="fas fa-exclamation-circle text-red-600 mr-2"></i>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Results Count */}
          {hasSearched && !loading && (
            <div className="mt-6 p-4 bg-cyan-50 border border-cyan-200 rounded-xl flex items-center space-x-3">
              <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center">
                <i className="fas fa-info-circle text-white"></i>
              </div>
              <div>
                <p className="text-gray-800 font-semibold">
                  Tìm thấy <span className="text-cyan-600 text-lg">{results.length}</span> nhà sản xuất
                </p>
                <p className="text-gray-600 text-sm">Với từ khóa: "{keyword}"</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Loading State */}
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-600 mb-4"></div>
              <p className="text-gray-700 font-medium text-lg">Đang tìm kiếm nhà sản xuất...</p>
            </div>
          ) : !hasSearched ? (
            /* Initial State */
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <i className="fas fa-industry text-cyan-600 text-4xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Bắt đầu tìm kiếm</h3>
              <p className="text-gray-600">Nhập từ khóa vào ô tìm kiếm để tìm nhà sản xuất</p>
            </div>
          ) : results.length === 0 ? (
            /* Empty State */
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-search text-gray-400 text-4xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Không tìm thấy</h3>
              <p className="text-gray-600">Không có nhà sản xuất nào khớp với từ khóa "{keyword}"</p>
            </div>
          ) : (
            /* Table with Results */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                      <i className="fas fa-industry mr-2"></i>
                      Tên nhà sản xuất
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                      <i className="fas fa-envelope mr-2"></i>
                      Email liên hệ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                      <i className="fas fa-globe mr-2"></i>
                      Quốc gia
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {results.map((m, index) => (
                    <tr 
                      key={m._id} 
                      className="transition-all duration-200 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-teal-50 hover:shadow-md group cursor-pointer"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg mr-3 group-hover:scale-110 transition-transform">
                            <i className="fas fa-industry text-white"></i>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors">
                            {m.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-700">
                          <i className="fas fa-envelope mr-2 text-cyan-500 group-hover:text-teal-600 transition-colors"></i>
                          <span className="font-medium">{m.contactEmail}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-800 group-hover:bg-cyan-200 transition-colors">
                            <i className="fas fa-flag mr-1"></i>
                            {m.country}
                          </span>
                        </div>
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
  );
};

export default ManufactorSearchPage;

